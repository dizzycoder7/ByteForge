package com.byteforge.dto;

import java.time.LocalDateTime;

public record AssessmentResponse(
    Long id,
    String cohort,
    String assessmentName,
    String startTime,
    int durationDays,
    int durationHours,
    int durationMins,
    String syllabus,
    String description,
    boolean browserRestrictions,
    boolean enableReview,
    boolean hideStudentReport,
    String allowedLanguages,
    String collegeName,
    String status,
    LocalDateTime createdAt
) {}
