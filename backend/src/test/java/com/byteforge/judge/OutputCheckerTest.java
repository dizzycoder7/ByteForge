package com.byteforge.judge;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OutputChecker Tests")
class OutputCheckerTest {

    private OutputChecker checker;

    @BeforeEach
    void setUp() {
        checker = new OutputChecker();
    }

    @Test
    @DisplayName("NORMALIZED_WHITESPACE: Matching outputs with different trailing spaces and CRLF")
    void testNormalizedWhitespaceMatching() {
        String actual = "1 2 3   \r\n4 5 6  \r\n\r\n";
        String expected = "1 2 3\n4 5 6\n";

        ComparisonResult result = checker.compare(actual, expected, ComparisonPolicy.NORMALIZED_WHITESPACE);
        assertTrue(result.matched());
    }

    @Test
    @DisplayName("NORMALIZED_WHITESPACE: Detects wrong answers correctly")
    void testNormalizedWhitespaceMismatch() {
        String actual = "1 2 4\n4 5 6";
        String expected = "1 2 3\n4 5 6";

        ComparisonResult result = checker.compare(actual, expected, ComparisonPolicy.NORMALIZED_WHITESPACE);
        assertFalse(result.matched());
        assertNotNull(result.diffMessage());
        assertTrue(result.diffMessage().contains("Difference at line 1"));
    }

    @Test
    @DisplayName("EXACT: Preserves meaningful indentation and internal whitespace")
    void testExactComparison() {
        String actual = "  *  \n *** \n*****\n";
        String expected = "  *  \n *** \n*****";

        ComparisonResult result = checker.compare(actual, expected, ComparisonPolicy.EXACT);
        assertTrue(result.matched(), "Single trailing newline difference is tolerated in EXACT");

        String wrongActual = "*  \n*** \n*****";
        ComparisonResult wrongResult = checker.compare(wrongActual, expected, ComparisonPolicy.EXACT);
        assertFalse(wrongResult.matched(), "Leading indentation mismatch must fail in EXACT mode");
    }

    @Test
    @DisplayName("TOKEN_BASED: Matches floating-point values within 1e-6 tolerance")
    void testTokenBasedFloatingPointTolerance() {
        String actual = "3.14159265 2.71828182";
        String expected = "3.141593 2.718282";

        ComparisonResult result = checker.compare(actual, expected, ComparisonPolicy.TOKEN_BASED);
        assertTrue(result.matched());
    }

    @Test
    @DisplayName("TOKEN_BASED: Rejects tokens outside tolerance")
    void testTokenBasedMismatch() {
        String actual = "3.15 2.71";
        String expected = "3.14 2.71";

        ComparisonResult result = checker.compare(actual, expected, ComparisonPolicy.TOKEN_BASED);
        assertFalse(result.matched());
        assertTrue(result.diffMessage().contains("Mismatch at token 1"));
    }

    @Test
    @DisplayName("Empty output handling: Empty expected matches empty actual")
    void testEmptyOutputs() {
        ComparisonResult result = checker.compare("", "", ComparisonPolicy.NORMALIZED_WHITESPACE);
        assertTrue(result.matched());

        ComparisonResult mismatch = checker.compare("Unexpected output", "", ComparisonPolicy.NORMALIZED_WHITESPACE);
        assertFalse(mismatch.matched());
    }

    @Test
    @DisplayName("Large output comparison executes rapidly")
    void testLargeOutputPerformance() {
        StringBuilder sbActual = new StringBuilder();
        StringBuilder sbExpected = new StringBuilder();
        for (int i = 0; i < 20000; i++) {
            sbActual.append("Line ").append(i).append(" data\n");
            sbExpected.append("Line ").append(i).append(" data\n");
        }

        long start = System.currentTimeMillis();
        ComparisonResult result = checker.compare(sbActual.toString(), sbExpected.toString(), ComparisonPolicy.NORMALIZED_WHITESPACE);
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(result.matched());
        assertTrue(elapsed < 1000, "20,000 lines should be verified in under 1 second");
    }
}
