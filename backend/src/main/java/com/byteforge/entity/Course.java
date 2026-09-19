package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing structured learning courses and roadmaps (Learn C, DSA 1★ to 3★, etc.).
 */
@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug; // e.g. "learn-c-scratch", "dsa-roadmap-1-to-3-star"

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String category; // "LANGUAGE", "DSA_ROADMAP", "INTERVIEW_PREP"

    @Column(nullable = false, length = 30)
    private String level; // "BEGINNER", "INTERMEDIATE", "ADVANCED"

    private int modulesCount;
    private int lessonsCount;
    private int practiceProblemsCount;

    private double rating; // e.g. 4.9
    private int enrolledCount; // e.g. 14200

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String roadmapTopics; // "Pointers::Memory::Recursion::Sorting"

    @Column(length = 50)
    private String badgeColor; // "blue", "amber", "emerald", "purple"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (rating == 0.0) rating = 4.9;
    }
}
