package com.byteforge.dto;

/**
 * One row in the leaderboard table.
 *
 * rank             → 1-based position (computed server-side from page offset)
 * username         → public display handle
 * collegeName      → university or college the student represents
 * problemsSolved   → distinct problems with at least one ACCEPTED submission
 * totalSubmissions → all submissions regardless of verdict
 */
public record LeaderboardEntry(
    int    rank,
    String username,
    String collegeName,
    long   problemsSolved,
    long   totalSubmissions
) {}
