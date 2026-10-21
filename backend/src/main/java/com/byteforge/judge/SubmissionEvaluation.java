package com.byteforge.judge;

import com.byteforge.entity.Verdict;

import java.util.List;

/**
 * Encapsulates the complete result of judging a submission against a suite of test cases.
 */
public record SubmissionEvaluation(
        Verdict verdict,
        String detailedVerdict,
        int score,
        int maxPoints,
        int totalTestCases,
        int passedTestCases,
        long maxExecutionTimeMs,
        String errorMessage,
        List<TestCaseResult> testCaseResults
) {
    public boolean isAccepted() {
        return verdict == Verdict.ACCEPTED;
    }
}
