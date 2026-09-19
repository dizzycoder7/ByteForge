package com.byteforge.service;

import com.byteforge.entity.Language;
import com.byteforge.entity.Submission;
import com.byteforge.entity.TestCase;
import com.byteforge.entity.Verdict;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * The judging engine — compiles and executes user-submitted code against test cases.
 *
 * ─── How it works ────────────────────────────────────────────────────────────
 * 1. Load submission + test cases from DB (fresh transaction, avoids detached entity issues)
 * 2. Create an isolated temp directory per submission (UUID-based, thread-safe)
 * 3. Write code to file
 * 4. Compile (Java: javac, C++: g++, Python: skip)
 * 5. For each test case:
 *    a. Write input to input.txt
 *    b. Run the program with input.txt as stdin, capture output.txt + error.txt
 *    c. Compare output.txt to expectedOutput (normalized whitespace)
 *    d. Stop on first failure (fail-fast — same as real judges)
 * 6. Update submission verdict + executionTimeMs in DB
 * 7. Delete temp directory
 *
 * ─── Security note (Phase 4 TODO) ─────────────────────────────────────────
 * This implementation runs user code UNSANDBOXED on the host OS.
 * A malicious submission could: read files, make network calls, or fork-bomb.
 * Phase 4 will wrap execution in a Docker container with:
 *   - No network access
 *   - Read-only filesystem (except /tmp)
 *   - PID limits (no fork bombs)
 *   - Seccomp syscall filtering
 *
 * ─── @Async mechanics ─────────────────────────────────────────────────────
 * @Async("judgeExecutor") causes Spring to:
 *   1. Return immediately to the caller (SubmissionService)
 *   2. Submit this method body to the "judgeExecutor" thread pool
 * This works ONLY because JudgeService is a Spring-managed bean being called
 * from a DIFFERENT bean (SubmissionService) — Spring's proxy intercepts the call.
 * Calling @Async from within the same class bypasses the proxy and runs synchronously.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JudgeService {

    private final SubmissionRepository submissionRepository;
    private final TestCaseRepository   testCaseRepository;

    // ─── Internal result records (private to this class) ────────────────────

    private record CompileResult(boolean success, String errorOutput) {}
    private record RunResult(Verdict verdict, String stdout, String stderr, long executionTimeMs) {}

    // ─── Entry point ─────────────────────────────────────────────────────────

    /**
     * Called by SubmissionService after saving a PENDING submission.
     * Runs asynchronously in the judgeExecutor thread pool.
     *
     * @param submissionId the ID of the saved submission to judge
     */
    @Async("judgeExecutor")
    public CompletableFuture<Void> judge(Long submissionId) {
        log.info("[Judge] Starting — submissionId={}", submissionId);

        // Load fresh from DB (new implicit transaction per repository call)
        // JOIN FETCH ensures problem.timeLimitMs is accessible without lazy-load exception
        Submission submission = submissionRepository.findByIdWithDetails(submissionId)
                .orElseThrow(() -> new IllegalStateException("Submission not found: " + submissionId));

        List<TestCase> testCases = testCaseRepository
                .findByProblemIdOrderByOrderIndexAsc(submission.getProblem().getId());

        Verdict finalVerdict  = Verdict.ACCEPTED;
        long    maxTimeMs     = 0L;
        String  errorMessage  = null;
        Path    tempDir       = null;

        try {
            // ── Step 1: Setup temp workspace ──────────────────────────────────
            tempDir = createTempDir(submissionId);

            // ── Step 2: Write source code to file ─────────────────────────────
            writeCodeFile(tempDir, submission);

            // ── Step 3: Compile (Java / C++) ──────────────────────────────────
            CompileResult compileResult = compile(tempDir, submission.getLanguage());

            if (!compileResult.success()) {
                finalVerdict = Verdict.COMPILATION_ERROR;
                errorMessage = truncate(compileResult.errorOutput(), 2000);
                log.info("[Judge] CE — submissionId={}", submissionId);

            } else {

                // ── Step 4: Run against each test case ────────────────────────
                int timeLimitMs = submission.getProblem().getTimeLimitMs();

                if (testCases.isEmpty()) {
                    log.warn("[Judge] No test cases for problemId={} — marking AC by default",
                            submission.getProblem().getId());
                }

                for (TestCase tc : testCases) {
                    RunResult result = runTestCase(tempDir, submission.getLanguage(),
                            tc.getInputData(), timeLimitMs);
                    maxTimeMs = Math.max(maxTimeMs, result.executionTimeMs());

                    if (result.verdict() == Verdict.TIME_LIMIT_EXCEEDED) {
                        finalVerdict = Verdict.TIME_LIMIT_EXCEEDED;
                        break;
                    } else if (result.verdict() == Verdict.RUNTIME_ERROR) {
                        finalVerdict = Verdict.RUNTIME_ERROR;
                        errorMessage = truncate(result.stderr(), 2000);
                        break;
                    } else if (!outputMatches(result.stdout(), tc.getExpectedOutput())) {
                        finalVerdict = Verdict.WRONG_ANSWER;
                        break;
                    }
                    // else: this test case passed — continue to next
                }
            }

        } catch (Exception e) {
            log.error("[Judge] Unexpected error — submissionId={}", submissionId, e);
            finalVerdict = Verdict.RUNTIME_ERROR;
            errorMessage = "Internal judge error: " + e.getMessage();

        } finally {
            // ── Step 5: Cleanup temp directory ───────────────────────────────
            deleteDir(tempDir);
        }

        // ── Step 6: Persist the final verdict ────────────────────────────────
        submission.setVerdict(finalVerdict);
        submission.setExecutionTimeMs(maxTimeMs);
        submission.setErrorMessage(errorMessage);
        submissionRepository.save(submission);

        log.info("[Judge] Done — submissionId={}, verdict={}, timeMs={}",
                submissionId, finalVerdict, maxTimeMs);

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Executes arbitrary code against custom stdin input for the Online Compiler / IDE.
     * Synchronous and standalone — does not create a database submission record.
     */
    public com.byteforge.dto.CompilerResponse runCustomCode(String code, Language language, String input) {
        Path tempDir = null;
        try {
            tempDir = createTempDir(System.currentTimeMillis());

            // Write code
            String filename;
            if (language == Language.JAVA) {
                filename = (code != null && code.contains("class Main")) ? "Main.java" : "Solution.java";
            } else {
                filename = switch (language) {
                    case CPP    -> "solution.cpp";
                    case PYTHON -> "solution.py";
                    default     -> "Solution.java";
                };
            }
            Files.writeString(tempDir.resolve(filename), code, StandardCharsets.UTF_8);

            // Compile
            CompileResult compileResult = compile(tempDir, language);
            if (!compileResult.success()) {
                return new com.byteforge.dto.CompilerResponse(
                        "",
                        compileResult.errorOutput(),
                        "COMPILATION_ERROR",
                        0L
                );
            }

            // Run with 5000ms max timeout for interactive sandbox
            RunResult result = runTestCase(tempDir, language, input != null ? input : "", 5000);

            return new com.byteforge.dto.CompilerResponse(
                    result.stdout(),
                    result.stderr(),
                    result.verdict().name(),
                    result.executionTimeMs()
            );

        } catch (Exception e) {
            log.error("[Compiler] Error executing custom code", e);
            return new com.byteforge.dto.CompilerResponse(
                    "",
                    "Execution error: " + e.getMessage(),
                    "RUNTIME_ERROR",
                    0L
            );
        } finally {
            deleteDir(tempDir);
        }
    }

    // ─── Temp directory helpers ──────────────────────────────────────────────

    private Path createTempDir(Long submissionId) throws IOException {
        String name = "byteforge_" + submissionId + "_" + UUID.randomUUID();
        Path dir = Path.of(System.getProperty("java.io.tmpdir"), name);
        Files.createDirectories(dir);
        return dir;
    }

    private String detectJavaClassName(Path dir) {
        if (Files.exists(dir.resolve("Main.java"))) return "Main";
        return "Solution";
    }

    private void writeCodeFile(Path dir, Submission submission) throws IOException {
        String filename;
        if (submission.getLanguage() == Language.JAVA) {
            filename = (submission.getCode() != null && submission.getCode().contains("class Main")) ? "Main.java" : "Solution.java";
        } else {
            filename = switch (submission.getLanguage()) {
                case CPP    -> "solution.cpp";
                case PYTHON -> "solution.py";
                default     -> "Solution.java";
            };
        }
        Files.writeString(dir.resolve(filename), submission.getCode(), StandardCharsets.UTF_8);
    }

    // ─── Compilation ─────────────────────────────────────────────────────────

    /**
     * Compiles the code. Python needs no compilation, so returns success immediately.
     * For Java and C++, runs the compiler and checks exit code.
     *
     * stdout+stderr are merged via redirectErrorStream(true) so compiler errors
     * (which go to stderr) are captured in the result's errorOutput field.
     */
    private CompileResult compile(Path dir, Language language) throws IOException, InterruptedException {
        String javaFile = Files.exists(dir.resolve("Main.java")) ? "Main.java" : "Solution.java";
        List<String> command = switch (language) {
            case JAVA   -> List.of("javac", dir.resolve(javaFile).toString());
            case CPP    -> List.of("g++", "-O2", "-o",
                                   dir.resolve("solution").toString(),
                                   dir.resolve("solution.cpp").toString());
            case PYTHON -> List.of(); // no compilation step
        };

        if (command.isEmpty()) {
            return new CompileResult(true, "");
        }

        try {
            Process process = new ProcessBuilder(command)
                    .directory(dir.toFile())
                    .redirectErrorStream(true) // merge stderr (compiler errors) into stdout
                    .start();

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode  = process.waitFor();

            return new CompileResult(exitCode == 0, sanitizeErrorMessage(output, dir));
        } catch (IOException e) {
            log.warn("[Judge] Compiler binary not found: {}", e.getMessage());
            return new CompileResult(false, "Compiler invocation failed: " + e.getMessage() + "\n(Please ensure 'javac' or 'g++' is installed and in your system PATH)");
        }
    }

    // ─── Execution ───────────────────────────────────────────────────────────

    /**
     * Runs the compiled program against one test case.
     *
     * I/O strategy: redirect stdin/stdout/stderr to FILES rather than streams.
     * This avoids the classic ProcessBuilder deadlock where stdout fills its OS
     * buffer while we're waiting for the process — the process blocks writing,
     * we block waiting, neither makes progress.
     *
     * Timeout: process.waitFor(timeLimitMs) returns false if time expires.
     * We then destroyForcibly() to kill the process tree and return TLE.
     */
    private RunResult runTestCase(Path dir, Language language,
                                  String input, int timeLimitMs)
            throws IOException, InterruptedException {

        // Write input to file → avoids stdin stream management entirely
        Path inputFile  = dir.resolve("input.txt");
        Path outputFile = dir.resolve("output.txt");
        Path errorFile  = dir.resolve("error.txt");
        Files.writeString(inputFile, input, StandardCharsets.UTF_8);

        String javaClass = detectJavaClassName(dir);
        List<String> command = switch (language) {
            case JAVA   -> List.of("java", "-cp", dir.toString(), javaClass);
            case CPP    -> List.of(dir.resolve("solution").toString());
            case PYTHON -> List.of("python", dir.resolve("solution.py").toString());
        };

        ProcessBuilder pb = new ProcessBuilder(command)
                .directory(dir.toFile())
                .redirectInput(inputFile.toFile())
                .redirectOutput(outputFile.toFile())
                .redirectError(errorFile.toFile());

        long startTime = System.currentTimeMillis();
        Process process = pb.start();

        boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
        long elapsedMs   = System.currentTimeMillis() - startTime;

        if (!finished) {
            process.destroyForcibly();
            return new RunResult(Verdict.TIME_LIMIT_EXCEEDED, "", "", elapsedMs);
        }

        // Read captured output files
        String stdout = Files.exists(outputFile)
                ? Files.readString(outputFile, StandardCharsets.UTF_8) : "";
        String stderr = Files.exists(errorFile)
                ? Files.readString(errorFile, StandardCharsets.UTF_8) : "";

        stderr = sanitizeErrorMessage(stderr, dir);

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            return new RunResult(Verdict.RUNTIME_ERROR, stdout, stderr, elapsedMs);
        }

        return new RunResult(Verdict.ACCEPTED, stdout, stderr, elapsedMs);
    }

    // ─── Output comparison ────────────────────────────────────────────────────

    /**
     * Normalizes and compares actual vs expected output.
     *
     * Normalization rules (standard in CP judges):
     *   1. Split by line (handles both \n and \r\n)
     *   2. Strip trailing whitespace from each line
     *   3. Remove trailing empty lines
     *
     * This means " 5 \n" matches "5\n" — a common source of WA for beginners
     * if we didn't normalize.
     */
    private boolean outputMatches(String actual, String expected) {
        return normalize(actual).equals(normalize(expected));
    }

    private String normalize(String text) {
        if (text == null || text.isBlank()) return "";
        return Arrays.stream(text.split("\\r?\\n"))
                .map(String::stripTrailing)
                .collect(Collectors.joining("\n"))
                .stripTrailing();
    }

    // ─── Utilities ───────────────────────────────────────────────────────────

    /**
     * Filters temporary OS file system paths (e.g. C:\Users\...\Temp\byteforge_123\)
     * into clean, readable LeetCode-style compiler error messages (e.g. "Line 14: error: ...").
     */
    private String sanitizeErrorMessage(String output, Path dir) {
        if (output == null || output.isBlank()) return "";

        String result = output;

        // 1. Remove the specific temp directory path
        if (dir != null) {
            String dirPath = dir.toString();
            result = result.replace(dirPath + "\\", "")
                           .replace(dirPath + "/", "")
                           .replace(dirPath, "");
        }

        // 2. Strip standard OS temp paths / UUID directory prefixes
        result = result.replaceAll("(?i)[a-z]:\\\\[^\\n\\r:]*byteforge_[^\\n\\r:\\\\/]+[\\\\/]", "");
        result = result.replaceAll("/[^\\n\\r:]*byteforge_[^\\n\\r:\\\\/]+/", "");

        // 3. Format Java / C++ file prefixes into clean "Line X:" format like LeetCode
        result = result.replaceAll("(?i)(Main\\.java|Solution\\.java|solution\\.cpp):([0-9]+):([0-9]+):", "Line $2:$3:");
        result = result.replaceAll("(?i)(Main\\.java|Solution\\.java|solution\\.cpp):([0-9]+):", "Line $2:");

        return result.trim();
    }

    /** Cap error messages stored in DB to avoid bloating the column. */
    private String truncate(String text, int maxLen) {
        if (text == null) return null;
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...[truncated]";
    }

    /** Recursively delete a directory tree — called in finally block. */
    private void deleteDir(Path dir) {
        if (dir == null) return;
        try {
            Files.walk(dir)
                 .sorted(Comparator.reverseOrder())
                 .forEach(p -> {
                     try { Files.deleteIfExists(p); }
                     catch (IOException ignored) {}
                 });
        } catch (IOException ignored) {}
    }
}
