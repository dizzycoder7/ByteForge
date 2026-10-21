package com.byteforge.service;

import com.byteforge.entity.AssessmentProblem;
import com.byteforge.entity.CollegeAssessment;
import com.byteforge.entity.Language;
import com.byteforge.entity.Verdict;
import com.byteforge.judge.ComparisonPolicy;
import com.byteforge.judge.SubmissionEvaluation;
import com.byteforge.judge.TestCasePair;
import com.byteforge.repository.AssessmentProblemRepository;
import com.byteforge.repository.CollegeAssessmentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for evaluating and scoring student submissions in College Assessments.
 *
 * Implements deterministic test-case evaluation, partial scoring,
 * robust hidden-test case loading, and anti-cheating/proctoring penalty computation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentJudgeService {

    private final JudgeService judgeService;
    private final AssessmentProblemRepository assessmentProblemRepository;
    private final CollegeAssessmentRepository collegeAssessmentRepository;
    private final ObjectMapper objectMapper;

    /**
     * Judges an assessment submission against configured problem test cases.
     *
     * @param assessmentId ID of the assessment
     * @param problemTitle title or identifier of the problem
     * @param code source code submitted by the student
     * @param languageStr programming language
     * @param tabSwitchFlags proctoring tab switches detected
     * @return complete SubmissionEvaluation with deterministic score and verdict
     */
    public SubmissionEvaluation judgeAssessmentSubmission(
            Long assessmentId,
            String problemTitle,
            String code,
            String languageStr,
            int tabSwitchFlags
    ) {
        log.info("[AssessmentJudge] Evaluating assessmentId={}, problem='{}', language='{}'",
                assessmentId, problemTitle, languageStr);

        // Parse Language safely (handles C, CPP, JAVA, PYTHON)
        Language language = parseLanguage(languageStr);

        // Find the problem within this assessment
        List<AssessmentProblem> problems = assessmentProblemRepository.findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        AssessmentProblem targetProblem = null;

        if (problemTitle != null && !problemTitle.isBlank()) {
            for (AssessmentProblem p : problems) {
                if (p.getTitle().equalsIgnoreCase(problemTitle.trim()) ||
                    problemTitle.contains(p.getTitle()) ||
                    p.getTitle().contains(problemTitle)) {
                    targetProblem = p;
                    break;
                }
            }
        }

        // If no direct title match, fallback to first problem if only one exists
        if (targetProblem == null && !problems.isEmpty()) {
            targetProblem = problems.get(0);
        }

        int maxPoints = targetProblem != null && targetProblem.getPoints() > 0 ? targetProblem.getPoints() : 50;

        if (targetProblem == null) {
            log.warn("[AssessmentJudge] No matching problem found for assessmentId={}, title='{}'", assessmentId, problemTitle);
            return new SubmissionEvaluation(
                    Verdict.INTERNAL_ERROR,
                    "INTERNAL_ERROR (Problem Not Found)",
                    0,
                    maxPoints,
                    0,
                    0,
                    0L,
                    "Assessment problem was not found in database",
                    List.of()
            );
        }

        // Extract and compile test cases from sample and hidden cases
        List<TestCasePair> testCases = extractTestCases(targetProblem);

        if (testCases.isEmpty()) {
            log.error("[AssessmentJudge] Missing test data for assessment problem id={}. Marking INTERNAL_ERROR (Never AC).",
                    targetProblem.getId());
            return new SubmissionEvaluation(
                    Verdict.INTERNAL_ERROR,
                    "INTERNAL_ERROR (Missing Test Cases)",
                    0,
                    maxPoints,
                    0,
                    0,
                    0L,
                    "No test cases configured for assessment problem: " + targetProblem.getTitle(),
                    List.of()
            );
        }

        // Run isolated evaluation across all test cases (failFast = false for partial scoring)
        SubmissionEvaluation rawEval = judgeService.evaluateCode(
                code,
                language,
                testCases,
                2000, // 2000ms time limit
                maxPoints,
                ComparisonPolicy.NORMALIZED_WHITESPACE,
                false // run all test cases to grade partial marks
        );

        // Apply proctoring integrity penalty if configured on assessment
        int finalScore = rawEval.score();
        CollegeAssessment assessment = collegeAssessmentRepository.findById(assessmentId).orElse(null);
        if (assessment != null && assessment.isBrowserRestrictions() && tabSwitchFlags > 0 && finalScore > 0) {
            // Deduct 5% per tab switch warning, capped at maximum 30% penalty
            int penaltyPercent = Math.min(tabSwitchFlags * 5, 30);
            finalScore = Math.max(0, finalScore - (finalScore * penaltyPercent / 100));
        }

        return new SubmissionEvaluation(
                rawEval.verdict(),
                rawEval.detailedVerdict(),
                finalScore,
                rawEval.maxPoints(),
                rawEval.totalTestCases(),
                rawEval.passedTestCases(),
                rawEval.maxExecutionTimeMs(),
                rawEval.errorMessage(),
                rawEval.testCaseResults()
        );
    }

    /**
     * Extracts test cases from sample input/output and hidden test case JSON.
     */
    public List<TestCasePair> extractTestCases(AssessmentProblem problem) {
        List<TestCasePair> list = new ArrayList<>();
        int index = 1;

        // 1. Add sample test case if defined
        if (problem.getSampleInput() != null && !problem.getSampleInput().isBlank()) {
            list.add(new TestCasePair(
                    index++,
                    problem.getSampleInput().trim(),
                    problem.getSampleOutput() != null ? problem.getSampleOutput().trim() : "",
                    true
            ));
        }

        // 2. Parse hidden test cases JSON
        String hiddenJson = problem.getHiddenTestCasesJson();
        if (hiddenJson != null && !hiddenJson.isBlank() && !hiddenJson.equals("[]")) {
            try {
                JsonNode root = objectMapper.readTree(hiddenJson);
                if (root.isArray()) {
                    for (JsonNode item : root) {
                        String input = null;
                        String output = null;

                        if (item.has("input")) {
                            input = item.get("input").asText();
                        } else if (item.has("inputData")) {
                            input = item.get("inputData").asText();
                        }

                        if (item.has("output")) {
                            output = item.get("output").asText();
                        } else if (item.has("expectedOutput")) {
                            output = item.get("expectedOutput").asText();
                        }

                        if (input != null) {
                            list.add(new TestCasePair(
                                    index++,
                                    input.trim(),
                                    output != null ? output.trim() : "",
                                    false
                            ));
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[AssessmentJudge] Failed to parse hidden test cases JSON for problem {}: {}",
                        problem.getId(), e.getMessage());
            }
        }

        return list;
    }

    private Language parseLanguage(String lang) {
        if (lang == null || lang.isBlank()) {
            return Language.JAVA;
        }
        String clean = lang.trim().toUpperCase();
        if (clean.equals("C++") || clean.equals("CPP")) return Language.CPP;
        if (clean.equals("C")) return Language.C;
        if (clean.startsWith("PYTH") || clean.equals("PYTHON")) return Language.PYTHON;
        if (clean.equals("JAVA")) return Language.JAVA;

        try {
            return Language.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return Language.JAVA;
        }
    }
}
