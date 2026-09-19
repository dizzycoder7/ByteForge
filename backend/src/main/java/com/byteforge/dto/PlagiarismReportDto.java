package com.byteforge.dto;

import java.util.List;

public record PlagiarismReportDto(
    Long assessmentId,
    String assessmentName,
    int totalSubmissionsAnalyzed,
    int totalPairsCompared,
    int highRiskCount,
    int mediumRiskCount,
    int lowRiskCount,
    List<PlagiarismMatchPairDto> matches
) {
    public record PlagiarismMatchPairDto(
        Long submissionIdA,
        String studentNameA,
        String studentHandleA,
        String rollNoA,
        String sourceCodeA,
        Long submissionIdB,
        String studentNameB,
        String studentHandleB,
        String rollNoB,
        String sourceCodeB,
        String problemTitle,
        String language,
        int similarityPercentage,
        int matchedLinesCount,
        String matchedStructurePattern,
        String riskLevel, // "HIGH", "MEDIUM", "LOW"
        String status // "FLAGGED", "DISMISSED", "PENDING_REVIEW"
    ) {}
}
