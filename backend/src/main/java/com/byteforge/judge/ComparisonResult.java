package com.byteforge.judge;

/**
 * Result of comparing actual candidate output against expected test case output.
 */
public record ComparisonResult(
        boolean matched,
        String diffMessage,
        String sanitizedActual,
        String sanitizedExpected
) {
    public static ComparisonResult match(String actual, String expected) {
        return new ComparisonResult(true, null, actual, expected);
    }

    public static ComparisonResult mismatch(String diffMessage, String actual, String expected) {
        return new ComparisonResult(false, diffMessage, actual, expected);
    }
}
