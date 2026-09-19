package com.byteforge.dto;

import java.util.List;

/**
 * Institutional Dashboard Summary payload for university administrators and faculty.
 */
public record UniversityDashboardResponse(
    String universityName,
    String campusCode,
    String chapterTier,
    String coordinatorName,
    int totalStudents,
    int problemsSolvedThisTerm,
    int placementReadyCount,
    int activeLabTests,
    List<String> batches,
    List<CollegeStudentRoster> students,
    List<CollegeLabTest> labTests,
    RatingDistribution ratingDistribution
) {
    public record CollegeStudentRoster(
        String name,
        String rollNo,
        String handle,
        String batch,
        int problemsSolved,
        int starRating,
        int ratingScore,
        String placementStatus, // "READY", "IN_PROGRESS", "NEEDS_PRACTICE"
        String lastActive
    ) {}

    public record CollegeLabTest(
        String id,
        String title,
        String batch,
        String duration,
        int totalEnrolled,
        int submissionsCount,
        int avgScore,
        String status // "ACTIVE", "COMPLETED", "SCHEDULED"
    ) {}

    public record RatingDistribution(
        int oneStar,
        int twoStar,
        int threeStar,
        int fourStar,
        int fiveStarPlus
    ) {}
}
