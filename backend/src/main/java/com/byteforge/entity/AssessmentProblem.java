package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing an individual coding problem/question attached
 * to a specific CollegeAssessment authored by faculty.
 */
@Entity
@Table(name = "assessment_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assessmentId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 20)
    @Builder.Default
    private String difficulty = "MEDIUM"; // "EASY", "MEDIUM", "HARD"

    @Builder.Default
    private int points = 50;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description; // Markdown/HTML problem statement

    @Column(columnDefinition = "TEXT")
    private String constraints; // e.g. "1 <= N <= 10^5\n-100 <= Node.val <= 100"

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(columnDefinition = "TEXT")
    private String hiddenTestCasesJson; // JSON array of additional grading test cases

    @Column(columnDefinition = "TEXT")
    private String starterCodesJson; // JSON map of language -> custom starter code template

    @Builder.Default
    private int orderIndex = 1;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (difficulty == null) difficulty = "MEDIUM";
        if (points <= 0) points = 50;
    }
}
