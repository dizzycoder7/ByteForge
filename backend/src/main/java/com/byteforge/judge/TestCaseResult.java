package com.byteforge.judge;

import com.byteforge.entity.Verdict;

/**
 * Result of evaluating a candidate solution against a single test case.
 */
public record TestCaseResult(
        int testCaseIndex,
        Verdict verdict,
        long executionTimeMs,
        String message,
        boolean passed
) {
    public static TestCaseResult pass(int index, long timeMs) {
        return new TestCaseResult(index, Verdict.ACCEPTED, timeMs, "Passed", true);
    }

    public static TestCaseResult fail(int index, Verdict verdict, long timeMs, String message) {
        return new TestCaseResult(index, verdict, timeMs, message, false);
    }
}
