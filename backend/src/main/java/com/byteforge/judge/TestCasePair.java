package com.byteforge.judge;

/**
 * Standard representation of an input-output test pair.
 */
public record TestCasePair(
        int index,
        String inputData,
        String expectedOutput,
        boolean isSample
) {}
