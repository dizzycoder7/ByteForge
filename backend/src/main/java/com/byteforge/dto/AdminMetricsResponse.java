package com.byteforge.dto;

import java.util.List;

public record AdminMetricsResponse(
    long totalUsers,
    long totalProblems,
    long totalSubmissions,
    long pendingPartnerships,
    long acceptedSubmissions,
    List<RecentAdminSubmission> recentSubmissions
) {
    public record RecentAdminSubmission(
        Long id,
        String username,
        String problemTitle,
        String language,
        String verdict,
        long executionTimeMs,
        String submittedAt
    ) {}
}
