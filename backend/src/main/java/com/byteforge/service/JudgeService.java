package com.byteforge.service;

import com.byteforge.dto.CompilerResponse;
import com.byteforge.entity.Language;
import com.byteforge.entity.Submission;
import com.byteforge.entity.TestCase;
import com.byteforge.entity.Verdict;
import com.byteforge.judge.*;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The core judging engine — compiles and executes user-submitted code against test cases
 * with strict process isolation, timeout enforcement, process tree cleanup,
 * and comprehensive verdict attribution.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JudgeService {

    private final SubmissionRepository submissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final OutputChecker outputChecker;

    private static final int MAX_OUTPUT_BYTES = 1024 * 1024; // 1MB output capture cap
    private static final int MAX_ERROR_LEN = 2000;

    // ─── Internal result records ─────────────────────────────────────────────

    private record CompileResult(boolean success, boolean isInfrastructureError, String errorOutput) {}
    private record RunResult(Verdict verdict, String stdout, String stderr, long executionTimeMs, boolean isInfrastructureError) {}

    // ─── Entry Point for Practice Submissions ─────────────────────────────────

    /**
     * Called by SubmissionService after saving a PENDING submission.
     * Runs asynchronously in the judgeExecutor thread pool.
     */
    @Async("judgeExecutor")
    public CompletableFuture<Void> judge(Long submissionId) {
        log.info("[Judge] Starting judging for submissionId={}", submissionId);

        Submission submission = submissionRepository.findByIdWithDetails(submissionId)
                .orElseThrow(() -> new IllegalStateException("Submission not found: " + submissionId));

        // State transition: PENDING -> RUNNING
        submission.setVerdict(Verdict.RUNNING);
        submissionRepository.save(submission);

        List<TestCase> testCases = testCaseRepository
                .findByProblemIdOrderByOrderIndexAsc(submission.getProblem().getId());

        if (testCases == null || testCases.isEmpty()) {
            log.error("[Judge] No test cases found for problemId={} — setting INTERNAL_ERROR (never false AC)",
                    submission.getProblem().getId());
            submission.setVerdict(Verdict.INTERNAL_ERROR);
            submission.setErrorMessage("Internal judge error: No test cases configured for this problem");
            submission.setExecutionTimeMs(0L);
            submissionRepository.save(submission);
            return CompletableFuture.completedFuture(null);
        }

        List<TestCasePair> pairs = new ArrayList<>(testCases.size());
        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            pairs.add(new TestCasePair(i + 1, tc.getInputData(), tc.getExpectedOutput(), tc.isSample()));
        }

        int timeLimitMs = submission.getProblem().getTimeLimitMs() > 0
                ? submission.getProblem().getTimeLimitMs() : 2000;

        SubmissionEvaluation evaluation = evaluateCode(
                submission.getCode(),
                submission.getLanguage(),
                pairs,
                timeLimitMs,
                100,
                ComparisonPolicy.NORMALIZED_WHITESPACE,
                true // fail-fast on first error for standard competitive programming practice
        );

        submission.setVerdict(evaluation.verdict());
        submission.setExecutionTimeMs(evaluation.maxExecutionTimeMs());
        submission.setErrorMessage(evaluation.errorMessage());
        submissionRepository.save(submission);

        log.info("[Judge] Completed submissionId={}, verdict={}, timeMs={}",
                submissionId, evaluation.verdict(), evaluation.maxExecutionTimeMs());

        return CompletableFuture.completedFuture(null);
    }

    // ─── General Code Evaluation Suite (Used by Practice & Assessments) ───────

    /**
     * Evaluates code against a suite of test cases.
     *
     * @param code source code
     * @param language programming language
     * @param testCases test cases to execute
     * @param timeLimitMs time limit per test case in milliseconds
     * @param maxPoints maximum marks available for this problem
     * @param policy output comparison policy
     * @param failFast if true, stops execution upon encountering first failing test
     * @return comprehensive SubmissionEvaluation
     */
    public SubmissionEvaluation evaluateCode(
            String code,
            Language language,
            List<TestCasePair> testCases,
            int timeLimitMs,
            int maxPoints,
            ComparisonPolicy policy,
            boolean failFast
    ) {
        if (testCases == null || testCases.isEmpty()) {
            return new SubmissionEvaluation(
                    Verdict.INTERNAL_ERROR,
                    "INTERNAL_ERROR (No Test Cases)",
                    0,
                    maxPoints,
                    0,
                    0,
                    0L,
                    "No test cases available for evaluation",
                    List.of()
            );
        }

        Path tempDir = null;
        try {
            tempDir = createTempDir(System.nanoTime());

            // 1. Write Code to Source File
            String sourceFilename = writeCodeFile(tempDir, code, language);

            // 2. Compile (Java, C, C++)
            CompileResult compileResult = compile(tempDir, language, sourceFilename);
            if (!compileResult.success()) {
                if (compileResult.isInfrastructureError()) {
                    return new SubmissionEvaluation(
                            Verdict.INTERNAL_ERROR,
                            "INTERNAL_ERROR (Compiler Unavailable)",
                            0,
                            maxPoints,
                            testCases.size(),
                            0,
                            0L,
                            compileResult.errorOutput(),
                            List.of()
                    );
                }

                String cleanError = sanitizeErrorMessage(compileResult.errorOutput(), tempDir);
                return new SubmissionEvaluation(
                        Verdict.COMPILATION_ERROR,
                        "COMPILATION_ERROR (0/" + testCases.size() + " Passed)",
                        0,
                        maxPoints,
                        testCases.size(),
                        0,
                        0L,
                        truncate(cleanError, MAX_ERROR_LEN),
                        List.of()
                );
            }

            // 3. Execute Against Test Cases
            List<TestCaseResult> results = new ArrayList<>();
            long maxTimeMs = 0L;
            Verdict firstFailureVerdict = null;
            String failureMessage = null;
            int passedCount = 0;

            for (TestCasePair tc : testCases) {
                RunResult runResult = runTestCase(tempDir, language, sourceFilename, tc.inputData(), timeLimitMs);
                maxTimeMs = Math.max(maxTimeMs, runResult.executionTimeMs());

                if (runResult.isInfrastructureError()) {
                    firstFailureVerdict = Verdict.INTERNAL_ERROR;
                    failureMessage = runResult.stderr();
                    results.add(TestCaseResult.fail(tc.index(), Verdict.INTERNAL_ERROR, runResult.executionTimeMs(), runResult.stderr()));
                    if (failFast) break;
                    continue;
                }

                if (runResult.verdict() == Verdict.TIME_LIMIT_EXCEEDED) {
                    if (firstFailureVerdict == null) {
                        firstFailureVerdict = Verdict.TIME_LIMIT_EXCEEDED;
                        failureMessage = "Time Limit Exceeded (" + runResult.executionTimeMs() + "ms > " + timeLimitMs + "ms)";
                    }
                    results.add(TestCaseResult.fail(tc.index(), Verdict.TIME_LIMIT_EXCEEDED, runResult.executionTimeMs(), "Time Limit Exceeded"));
                    if (failFast) break;
                    continue;
                }

                if (runResult.verdict() == Verdict.RUNTIME_ERROR) {
                    if (firstFailureVerdict == null) {
                        firstFailureVerdict = Verdict.RUNTIME_ERROR;
                        failureMessage = runResult.stderr();
                    }
                    results.add(TestCaseResult.fail(tc.index(), Verdict.RUNTIME_ERROR, runResult.executionTimeMs(), runResult.stderr()));
                    if (failFast) break;
                    continue;
                }

                // Check output matching
                ComparisonResult comp = outputChecker.compare(runResult.stdout(), tc.expectedOutput(), policy);
                if (comp.matched()) {
                    passedCount++;
                    results.add(TestCaseResult.pass(tc.index(), runResult.executionTimeMs()));
                } else {
                    if (firstFailureVerdict == null) {
                        firstFailureVerdict = Verdict.WRONG_ANSWER;
                        failureMessage = comp.diffMessage();
                    }
                    results.add(TestCaseResult.fail(tc.index(), Verdict.WRONG_ANSWER, runResult.executionTimeMs(), comp.diffMessage()));
                    if (failFast) break;
                }
            }

            // 4. Calculate Final Score & Verdict
            int total = testCases.size();
            Verdict finalVerdict = (passedCount == total) ? Verdict.ACCEPTED : (firstFailureVerdict != null ? firstFailureVerdict : Verdict.WRONG_ANSWER);

            // Deterministic score computation
            int calculatedScore;
            if (passedCount == total) {
                calculatedScore = maxPoints;
            } else if (passedCount == 0) {
                calculatedScore = 0;
            } else {
                calculatedScore = (int) Math.round(((double) passedCount / total) * maxPoints);
            }

            String detailedVerdict = String.format("%s (%d/%d Testcases Passed)", finalVerdict.name(), passedCount, total);

            return new SubmissionEvaluation(
                    finalVerdict,
                    detailedVerdict,
                    calculatedScore,
                    maxPoints,
                    total,
                    passedCount,
                    maxTimeMs,
                    truncate(failureMessage, MAX_ERROR_LEN),
                    results
            );

        } catch (Exception e) {
            log.error("[Judge] Unexpected execution error", e);
            return new SubmissionEvaluation(
                    Verdict.INTERNAL_ERROR,
                    "INTERNAL_ERROR (Evaluation Fault)",
                    0,
                    maxPoints,
                    testCases.size(),
                    0,
                    0L,
                    "Internal judge evaluation error: " + e.getMessage(),
                    List.of()
            );
        } finally {
            deleteDir(tempDir);
        }
    }

    // ─── Online Compiler / Sandbox Runner ─────────────────────────────────────

    /**
     * Executes arbitrary code against custom input for the Online Compiler / IDE.
     * Synchronous and standalone — does not modify database.
     */
    public CompilerResponse runCustomCode(String code, Language language, String input) {
        Path tempDir = null;
        try {
            tempDir = createTempDir(System.nanoTime());

            String sourceFilename = writeCodeFile(tempDir, code, language);

            CompileResult compileResult = compile(tempDir, language, sourceFilename);
            if (!compileResult.success()) {
                return new CompilerResponse(
                        "",
                        sanitizeErrorMessage(compileResult.errorOutput(), tempDir),
                        compileResult.isInfrastructureError() ? "INTERNAL_ERROR" : "COMPILATION_ERROR",
                        0L
                );
            }

            RunResult result = runTestCase(tempDir, language, sourceFilename, input != null ? input : "", 5000);

            // For custom execution without test case verification, exitCode 0 is SUCCESS (not AC)
            String status = result.verdict() == Verdict.ACCEPTED ? "SUCCESS" : result.verdict().name();

            return new CompilerResponse(
                    result.stdout(),
                    result.stderr(),
                    status,
                    result.executionTimeMs()
            );

        } catch (Exception e) {
            log.error("[Compiler] Error executing custom code", e);
            return new CompilerResponse(
                    "",
                    "Execution error: " + e.getMessage(),
                    "INTERNAL_ERROR",
                    0L
            );
        } finally {
            deleteDir(tempDir);
        }
    }

    // ─── Compilation & Execution Helpers ─────────────────────────────────────

    private Path createTempDir(long identifier) throws IOException {
        String name = "byteforge_" + identifier + "_" + UUID.randomUUID();
        Path dir = Path.of(System.getProperty("java.io.tmpdir"), name);
        Files.createDirectories(dir);
        return dir;
    }

    private String detectJavaClassName(String code) {
        if (code != null) {
            Matcher m = Pattern.compile("(?:public\\s+)?class\\s+([A-Za-z0-9_]+)").matcher(code);
            if (m.find()) {
                return m.group(1);
            }
        }
        return "Solution";
    }

    private String getBinaryName(String baseName) {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return baseName + ".exe";
        }
        return baseName;
    }

    private String writeCodeFile(Path dir, String code, Language language) throws IOException {
        String filename;
        if (language == Language.JAVA) {
            String className = detectJavaClassName(code);
            filename = className + ".java";
        } else {
            filename = switch (language) {
                case C      -> "solution.c";
                case CPP    -> "solution.cpp";
                case PYTHON -> "solution.py";
                default     -> "Solution.java";
            };
        }
        Files.writeString(dir.resolve(filename), code != null ? code : "", StandardCharsets.UTF_8);
        return filename;
    }

    private CompileResult compile(Path dir, Language language, String sourceFilename) throws InterruptedException {
        String binaryName = getBinaryName("solution");
        List<String> command = switch (language) {
            case JAVA   -> List.of("javac", dir.resolve(sourceFilename).toString());
            case CPP    -> List.of("g++", "-O2", "-o", dir.resolve(binaryName).toString(), dir.resolve(sourceFilename).toString());
            case C      -> List.of("gcc", "-O2", "-o", dir.resolve(binaryName).toString(), dir.resolve(sourceFilename).toString());
            case PYTHON -> List.of(); // Interpreted — no compile step
        };

        if (command.isEmpty()) {
            return new CompileResult(true, false, "");
        }

        try {
            Process process = new ProcessBuilder(command)
                    .directory(dir.toFile())
                    .redirectErrorStream(true)
                    .start();

            boolean finished = process.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                terminateProcessTree(process);
                return new CompileResult(false, false, "Compilation timed out after 15 seconds.");
            }

            String output = readLimitedOutput(process.getInputStream());
            int exitCode = process.exitValue();

            return new CompileResult(exitCode == 0, false, sanitizeErrorMessage(output, dir));
        } catch (IOException e) {
            log.warn("[Judge] Compiler executable not accessible for command {}: {}", command.get(0), e.getMessage());
            return new CompileResult(false, true,
                    "Judge Infrastructure Warning: Compiler binary '" + command.get(0) + "' was not found or could not be invoked.\n"
                    + "Diagnostic details: " + e.getMessage());
        }
    }

    private RunResult runTestCase(
            Path dir,
            Language language,
            String sourceFilename,
            String input,
            int timeLimitMs
    ) throws IOException, InterruptedException {

        Path inputFile  = dir.resolve("input.txt");
        Path outputFile = dir.resolve("output.txt");
        Path errorFile  = dir.resolve("error.txt");

        Files.writeString(inputFile, input != null ? input : "", StandardCharsets.UTF_8);

        List<String> command;
        if (language == Language.JAVA) {
            String javaClass = sourceFilename.endsWith(".java")
                    ? sourceFilename.substring(0, sourceFilename.length() - 5)
                    : "Solution";
            command = List.of("java", "-cp", dir.toString(), javaClass);
        } else if (language == Language.CPP || language == Language.C) {
            Path binPath = dir.resolve(getBinaryName("solution"));
            command = List.of(binPath.toString());
        } else if (language == Language.PYTHON) {
            String pyCmd = resolvePythonCommand();
            command = List.of(pyCmd, dir.resolve(sourceFilename).toString());
        } else {
            return new RunResult(Verdict.INTERNAL_ERROR, "", "Unsupported language: " + language, 0L, true);
        }

        ProcessBuilder pb = new ProcessBuilder(command)
                .directory(dir.toFile())
                .redirectInput(inputFile.toFile())
                .redirectOutput(outputFile.toFile())
                .redirectError(errorFile.toFile());

        long startTime = System.currentTimeMillis();
        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            log.warn("[Judge] Failed to launch execution process for {}: {}", command.get(0), e.getMessage());
            return new RunResult(Verdict.INTERNAL_ERROR, "",
                    "Judge Infrastructure Error: Cannot execute runtime program '" + command.get(0) + "': " + e.getMessage(),
                    0L, true);
        }

        boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
        long elapsedMs = System.currentTimeMillis() - startTime;

        if (!finished) {
            terminateProcessTree(process);
            return new RunResult(Verdict.TIME_LIMIT_EXCEEDED, "", "", elapsedMs, false);
        }

        String stdout = readLimitedOutput(outputFile);
        String stderr = readLimitedOutput(errorFile);

        stderr = sanitizeErrorMessage(stderr, dir);

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            return new RunResult(Verdict.RUNTIME_ERROR, stdout, stderr, elapsedMs, false);
        }

        return new RunResult(Verdict.ACCEPTED, stdout, stderr, elapsedMs, false);
    }

    // ─── Process & Resource Safety Helpers ────────────────────────────────────

    private void terminateProcessTree(Process process) {
        if (process == null) return;
        try {
            process.descendants().forEach(ProcessHandle::destroyForcibly);
        } catch (Exception ignored) {}
        process.destroyForcibly();
        try {
            process.waitFor(500, TimeUnit.MILLISECONDS);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    private String readLimitedOutput(Path file) throws IOException {
        if (!Files.exists(file)) return "";
        long size = Files.size(file);
        if (size > MAX_OUTPUT_BYTES) {
            try (var is = Files.newInputStream(file)) {
                byte[] bytes = is.readNBytes(MAX_OUTPUT_BYTES);
                return new String(bytes, StandardCharsets.UTF_8) + "\n...[Output Truncated: Exceeded 1MB Limit]";
            }
        }
        return Files.readString(file, StandardCharsets.UTF_8);
    }

    private String readLimitedOutput(java.io.InputStream stream) throws IOException {
        byte[] bytes = stream.readNBytes(MAX_OUTPUT_BYTES);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private String resolvePythonCommand() {
        boolean isWin = System.getProperty("os.name").toLowerCase().contains("win");
        String[] candidates = isWin
                ? new String[]{"python", "python3", "py"}
                : new String[]{"python3", "python"};

        for (String cmd : candidates) {
            try {
                Process p = new ProcessBuilder(cmd, "--version").start();
                if (p.waitFor(1200, TimeUnit.MILLISECONDS) && p.exitValue() == 0) {
                    return cmd;
                }
            } catch (Exception ignored) {}
        }
        return candidates[0];
    }

    public String sanitizeErrorMessage(String output, Path dir) {
        if (output == null || output.isBlank()) return "";

        String result = output;
        if (dir != null) {
            String dirPath = dir.toString();
            result = result.replace(dirPath + "\\", "")
                           .replace(dirPath + "/", "")
                           .replace(dirPath, "");
        }

        result = result.replaceAll("(?i)[a-z]:\\\\[^\\n\\r:]*byteforge_[^\\n\\r:\\\\/]+[\\\\/]", "");
        result = result.replaceAll("/[^\\n\\r:]*byteforge_[^\\n\\r:\\\\/]+/", "");
        result = result.replaceAll("(?i)(Main\\.java|Solution\\.java|solution\\.cpp|solution\\.c):([0-9]+):([0-9]+):", "Line $2:$3:");
        result = result.replaceAll("(?i)(Main\\.java|Solution\\.java|solution\\.cpp|solution\\.c):([0-9]+):", "Line $2:");

        return result.trim();
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return null;
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...[truncated]";
    }

    private void deleteDir(Path dir) {
        if (dir == null || !Files.exists(dir)) return;
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                Files.walk(dir)
                     .sorted(Comparator.reverseOrder())
                     .forEach(p -> {
                         try { Files.deleteIfExists(p); }
                         catch (IOException ignored) {}
                     });
                if (!Files.exists(dir)) break;
            } catch (IOException ignored) {}
            try { Thread.sleep(50); } catch (InterruptedException ignored) {}
        }
    }
}
