package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents one code submission by a user for a specific problem.
 *
 * Lifecycle:
 *   1. User submits → record saved with verdict = PENDING
 *   2. JudgeService picks it up asynchronously
 *   3. Judge runs the code against all test cases
 *   4. verdict updated to final result (AC, WA, TLE, etc.)
 *
 * The code is stored as TEXT in the database.
 * For Java submissions, the main class MUST be named "Solution" so the
 * judge knows which class to run (a standard CP convention).
 *
 * executionTimeMs: wall-clock time of the slowest test case.
 * errorMessage: compiler error (for CE) or stderr (for RE), null otherwise.
 */
@Entity
@Table(name = "submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Who submitted this code. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Which problem this is a submission for. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /** The raw source code submitted. Stored as TEXT (max 65 KB). */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Language language;

    /**
     * Starts as PENDING. JudgeService updates this when judging completes.
     * The client polls GET /submissions/{id} to check for a verdict change.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    @Builder.Default
    private Verdict verdict = Verdict.PENDING;

    /**
     * Wall-clock time of the slowest test case, in milliseconds.
     * Null until judging completes.
     */
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    /**
     * Compiler output for CE, or first line of stderr for RE.
     * Null for AC/WA/TLE (no meaningful error message).
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onSubmit() {
        submittedAt = LocalDateTime.now();
    }
}
