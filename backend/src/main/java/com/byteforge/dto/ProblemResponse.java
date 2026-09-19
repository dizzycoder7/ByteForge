package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Full problem detail response â€” returned for GET /api/problems/{id}.
 * Contains all fields including the large text fields (description, formats).
 *
 * We return authorUsername (String) rather than a nested User object
 * to avoid over-fetching and to keep the API surface flat and simple.
 * This is the "flattening" pattern â€” common in REST API design.
 */
public record ProblemResponse(
    Long id,
    String title,
    String slug,
    String description,
    String inputFormat,
    String outputFormat,
    String constraints,
    String difficulty,       // "EASY" / "MEDIUM" / "HARD"
    int timeLimitMs,
    int memoryLimitMb,
    String authorUsername,   // the author's display handle
    boolean published,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}

