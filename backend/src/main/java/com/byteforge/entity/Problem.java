package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Problem entity â€” represents a competitive programming problem.
 *
 * Design decisions worth knowing for interviews:
 *
 * 1. @SQLRestriction("is_deleted = false"):
 *    This Hibernate 6.x annotation (replaces the deprecated @Where from Hibernate 5)
 *    appends "is_deleted = false" to EVERY SQL query Hibernate generates for this
 *    entity. Result: soft-deleted problems are invisible to all repository methods
 *    automatically â€” no manual filtering needed in service or repository code.
 *    Trade-off: to query deleted problems (e.g., for an audit log), you'd need
 *    native SQL or a separate entity view.
 *
 * 2. Slug:
 *    A URL-friendly identifier generated from the title, e.g. "Two Sum" â†’ "two-sum".
 *    Slugs are set once at creation and NEVER updated (even if the title changes)
 *    to preserve stable URLs for bookmarks, social shares, etc.
 *
 * 3. author â†’ @ManyToOne(FetchType.LAZY):
 *    Lazy loading means Hibernate will NOT join the users table unless you call
 *    getAuthor(). The service is @Transactional so the session is open when we
 *    access getAuthor() during DTO mapping.
 *    N+1 risk on list endpoints â€” documented in ProblemRepository.java.
 *
 * 4. @PrePersist / @PreUpdate:
 *    Auto-manages timestamps so service code never has to set them manually.
 */
@Entity
@Table(
    name = "problems",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_problems_slug",  columnNames = "slug"),
        @UniqueConstraint(name = "uk_problems_title", columnNames = "title")
    }
)
@SQLRestriction("is_deleted = false")   // soft-delete filter â€” applies to ALL queries
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    /** URL-safe version of title. Set once, never changed. */
    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    /** Full problem statement â€” stored as TEXT (up to 65,535 chars). */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    /** e.g., "1 â‰¤ N â‰¤ 10^6, 1 â‰¤ arr[i] â‰¤ 10^9" */
    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Difficulty difficulty;

    /** Max execution time allowed for a submission in milliseconds. */
    @Column(name = "time_limit_ms", nullable = false)
    @Builder.Default
    private int timeLimitMs = 2000;

    /** Max memory a submission may use, in megabytes. */
    @Column(name = "memory_limit_mb", nullable = false)
    @Builder.Default
    private int memoryLimitMb = 256;

    /**
     * The admin who created this problem.
     * LAZY: Hibernate loads the author row only when getAuthor() is called.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /**
     * DRAFT (false) â†’ not visible in public list.
     * PUBLISHED (true) â†’ visible to everyone.
     */
    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private boolean published = false;

    /**
     * Soft-delete flag. When true, @SQLRestriction filters this row from all queries.
     * We never run DELETE FROM problems â€” we flip this flag instead.
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

