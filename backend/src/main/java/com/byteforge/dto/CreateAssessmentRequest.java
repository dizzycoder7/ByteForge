package com.byteforge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAssessmentRequest(
    @NotBlank(message = "Cohort is required")
    String cohort,

    @NotBlank(message = "Assessment name is required")
    @Size(min = 2, max = 100, message = "Assessment name must be between 2 and 100 characters")
    String assessmentName,

    String startTime,

    Integer durationDays,
    Integer durationHours,
    Integer durationMins,

    String syllabus,
    String description,

    boolean browserRestrictions,
    boolean enableReview,
    boolean hideStudentReport,

    String allowedLanguages,
    String collegeName
) {}
