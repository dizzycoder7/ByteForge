package com.byteforge.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAssessmentProblemRequest(
        @NotBlank(message = "Problem title is required")
        String title,

        String difficulty, // EASY, MEDIUM, HARD
        Integer points,
        
        @NotBlank(message = "Problem statement description is required")
        String description,

        String constraints,
        String inputFormat,
        String outputFormat,
        String sampleInput,
        String sampleOutput,
        String hiddenTestCasesJson,
        String starterCodesJson,
        Integer orderIndex
) {}
