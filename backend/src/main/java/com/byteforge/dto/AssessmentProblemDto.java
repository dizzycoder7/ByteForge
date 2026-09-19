package com.byteforge.dto;

import java.time.LocalDateTime;

public record AssessmentProblemDto(
        Long id,
        Long assessmentId,
        String title,
        String difficulty,
        int points,
        String description,
        String constraints,
        String inputFormat,
        String outputFormat,
        String sampleInput,
        String sampleOutput,
        String hiddenTestCasesJson,
        String starterCodesJson,
        int orderIndex,
        LocalDateTime createdAt
) {}
