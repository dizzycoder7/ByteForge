package com.byteforge.judge;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Robust output checker following competitive programming judge standards (CodeChef / DOMjudge / Judge0).
 */
@Component
public class OutputChecker {

    private static final double FLOAT_EPSILON = 1e-6;

    /**
     * Compares actual output to expected output using the specified policy.
     */
    public ComparisonResult compare(String actual, String expected, ComparisonPolicy policy) {
        if (policy == null) {
            policy = ComparisonPolicy.NORMALIZED_WHITESPACE;
        }

        String safeActual = actual != null ? actual : "";
        String safeExpected = expected != null ? expected : "";

        return switch (policy) {
            case EXACT -> compareExact(safeActual, safeExpected);
            case NORMALIZED_WHITESPACE -> compareNormalizedWhitespace(safeActual, safeExpected);
            case TOKEN_BASED -> compareTokenBased(safeActual, safeExpected);
        };
    }

    /**
     * Default convenience method using standard CP normalized whitespace comparison.
     */
    public ComparisonResult compare(String actual, String expected) {
        return compare(actual, expected, ComparisonPolicy.NORMALIZED_WHITESPACE);
    }

    private ComparisonResult compareExact(String actual, String expected) {
        // Normalize CRLF to LF, but keep exact leading/trailing spaces and newlines
        String normActual = actual.replace("\r\n", "\n").replace('\r', '\n');
        String normExpected = expected.replace("\r\n", "\n").replace('\r', '\n');

        // Optional standard tolerance for trailing single newline:
        if (normActual.endsWith("\n") && !normExpected.endsWith("\n") && normActual.substring(0, normActual.length() - 1).equals(normExpected)) {
            return ComparisonResult.match(normActual, normExpected);
        }
        if (!normActual.endsWith("\n") && normExpected.endsWith("\n") && normExpected.substring(0, normExpected.length() - 1).equals(normActual)) {
            return ComparisonResult.match(normActual, normExpected);
        }

        if (normActual.equals(normExpected)) {
            return ComparisonResult.match(normActual, normExpected);
        }

        return ComparisonResult.mismatch(
                generateLineDiff(normActual, normExpected),
                normActual,
                normExpected
        );
    }

    private ComparisonResult compareNormalizedWhitespace(String actual, String expected) {
        String normActual = normalizeLines(actual);
        String normExpected = normalizeLines(expected);

        if (normActual.equals(normExpected)) {
            return ComparisonResult.match(normActual, normExpected);
        }

        return ComparisonResult.mismatch(
                generateLineDiff(normActual, normExpected),
                normActual,
                normExpected
        );
    }

    private ComparisonResult compareTokenBased(String actual, String expected) {
        List<String> actualTokens = tokenize(actual);
        List<String> expectedTokens = tokenize(expected);

        if (actualTokens.size() != expectedTokens.size()) {
            String msg = String.format("Token count mismatch: expected %d tokens, but got %d tokens.",
                    expectedTokens.size(), actualTokens.size());
            return ComparisonResult.mismatch(msg, actual, expected);
        }

        for (int i = 0; i < expectedTokens.size(); i++) {
            String expToken = expectedTokens.get(i);
            String actToken = actualTokens.get(i);

            if (expToken.equals(actToken)) {
                continue;
            }

            // Check if both are floating-point numbers within epsilon
            if (isNumeric(expToken) && isNumeric(actToken)) {
                try {
                    double expVal = Double.parseDouble(expToken);
                    double actVal = Double.parseDouble(actToken);
                    double diff = Math.abs(expVal - actVal);
                    if (diff <= FLOAT_EPSILON || (Math.abs(expVal) > 0 && diff / Math.abs(expVal) <= FLOAT_EPSILON)) {
                        continue;
                    }
                } catch (NumberFormatException ignored) {}
            }

            String msg = String.format("Mismatch at token %d: expected '%s', got '%s'", i + 1, expToken, actToken);
            return ComparisonResult.mismatch(msg, actual, expected);
        }

        return ComparisonResult.match(actual, expected);
    }

    public String normalizeLines(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        // Split by \r\n, \r, or \n
        String[] lines = text.split("\\r?\\n|\\r", -1);
        List<String> trimmedLines = new ArrayList<>(lines.length);

        for (String line : lines) {
            trimmedLines.add(line.stripTrailing());
        }

        // Strip trailing empty lines from the end
        while (!trimmedLines.isEmpty() && trimmedLines.get(trimmedLines.size() - 1).isEmpty()) {
            trimmedLines.remove(trimmedLines.size() - 1);
        }

        return String.join("\n", trimmedLines);
    }

    private List<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.trim().split("\\s+"))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private boolean isNumeric(String token) {
        try {
            Double.parseDouble(token);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String generateLineDiff(String actual, String expected) {
        String[] actLines = actual.split("\n", -1);
        String[] expLines = expected.split("\n", -1);

        int maxLen = Math.max(actLines.length, expLines.length);
        for (int i = 0; i < maxLen; i++) {
            String act = i < actLines.length ? actLines[i] : "<end of output>";
            String exp = i < expLines.length ? expLines[i] : "<end of output>";
            if (!act.equals(exp)) {
                return String.format("Difference at line %d:\n  Expected: '%s'\n  Actual:   '%s'", i + 1, exp, act);
            }
        }
        return "Outputs differ.";
    }
}
