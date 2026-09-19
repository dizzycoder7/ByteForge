package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Test case response DTO.
 * Returned to ADMIN for management views.
 * For public-facing (sample test cases), use the same DTO
 * but only sample = true records are returned.
 */
public record TestCaseResponse(
    Long id,
    Long problemId,
    String inputData,
    String expectedOutput,
    boolean sample,
    int orderIndex,
    LocalDateTime createdAt
) {}
