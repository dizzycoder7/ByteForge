package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Lightweight submission summary for list views.
 * Excludes the code field to avoid sending large payloads per page item.
 * The full code is fetched only when a user clicks a specific submission.
 */
public record SubmissionSummaryResponse(
    Long   id,
    Long   problemId,
    String problemTitle,
    String problemSlug,
    String language,
    String verdict,
    Long   executionTimeMs,
    LocalDateTime submittedAt
) {}
