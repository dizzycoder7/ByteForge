package com.byteforge.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ContestResponse(
    Long id,
    String code,
    String name,
    String type,
    LocalDateTime startTime,
    LocalDateTime endTime,
    int durationMins,
    String status,
    String ratedFor,
    String divisions,
    String description
) {
    public record ContestProblemDto(
        String code,
        String title,
        String difficulty,
        int score,
        int successfulSubmissions,
        double accuracyPercentage
    ) {}

    public record ContestRankDto(
        int rank,
        String handle,
        String collegeName,
        int starRating,
        int totalScore,
        int penaltyTimeMins,
        List<String> solvedProblems
    ) {}
}
