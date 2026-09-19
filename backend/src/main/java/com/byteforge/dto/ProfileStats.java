package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Public profile stats for a user — returned by GET /api/users/{username}.
 */
public record ProfileStats(
    String        username,
    String        role,            // "USER" / "ADMIN" / "PROBLEM_SETTER"
    String        collegeName,     // Institutional association
    int           starRating,      // 1★ to 7★ CodeChef-style rating
    int           ratingScore,     // Algorithmic rating points
    long          totalSubmissions,
    long          problemsSolved,
    long          easyCount,
    long          mediumCount,
    long          hardCount,
    LocalDateTime joinedAt
) {}
