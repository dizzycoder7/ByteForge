package com.byteforge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a test case.
 * orderIndex controls execution order — lower runs first.
 */
public record TestCaseRequest(

    @NotBlank(message = "Input data is required")
    String inputData,

    @NotBlank(message = "Expected output is required")
    String expectedOutput,

    boolean sample,    // true = shown publicly, false = hidden judge-only

    @Min(value = 0, message = "Order index must be non-negative")
    int orderIndex

) {}
