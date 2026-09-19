package com.byteforge.dto;

import java.time.LocalDateTime;

public record AssessmentSubmissionResponse(
    Long id,
    Long assessmentId,
    String studentName,
    String studentHandle,
    String rollNo,
    String problemTitle,
    String language,
    String sourceCode,
    int score,
    String verdict,
    int tabSwitchFlags,
    String timeTaken,
    String facultyFeedback,
    LocalDateTime submittedAt
) {}
