package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A single test case belonging to a problem.
 *
 * Two kinds of test cases:
 *   sample = true  → shown publicly on the problem page so users can test locally
 *   sample = false → hidden, used by the judge only
 *
 * orderIndex controls the order in which the judge runs test cases.
 * Convention: run sample test cases first (fast feedback on obvious WA),
 * then hidden ones. The judge stops on the first failure.
 *
 * No @SQLRestriction here — test cases are never soft-deleted.
 * When a problem is soft-deleted, its test cases become unreachable
 * via the problem foreign key anyway.
 */
@Entity
@Table(name = "test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The problem this test case belongs to.
     * LAZY: loaded only when explicitly accessed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /** Raw input that will be fed to the program's stdin. */
    @Column(name = "input_data", nullable = false, columnDefinition = "TEXT")
    private String inputData;

    /** The exact output the program must produce to stdout. */
    @Column(name = "expected_output", nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;

    /**
     * If true, shown publicly on the problem page.
     * If false, used only by the judge (hidden from contestants).
     */
    @Column(name = "is_sample", nullable = false)
    @Builder.Default
    private boolean sample = false;

    /**
     * Determines the execution order — lower index runs first.
     * Allows authors to order sample cases before hidden ones.
     */
    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private int orderIndex = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
