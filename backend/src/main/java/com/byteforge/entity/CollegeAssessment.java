package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing an institutional coding assessment / lab test
 * authored by a faculty member in the CodeChef College Offering dashboard.
 */
@Entity
@Table(name = "college_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollegeAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String cohort; // e.g. "Faculty Review - Learn C", "CSE 3rd Year - Section A"

    @Column(nullable = false, length = 120)
    private String assessmentName;

    @Column(nullable = false, length = 50)
    private String startTime; // e.g. "2026-09-01 10:00:00"

    private int durationDays;
    private int durationHours;
    private int durationMins;

    @Column(length = 255)
    private String syllabus; // e.g. "Loops::Functions::Recursion"

    @Column(columnDefinition = "TEXT")
    private String description; // HTML or Markdown details

    private boolean browserRestrictions;
    private boolean enableReview;
    private boolean hideStudentReport;

    @Column(length = 200)
    private String allowedLanguages; // e.g. "C,C++,Java,Pyth 3"

    @Column(length = 150)
    private String collegeName;

    @Column(length = 30)
    @Builder.Default
    private String status = "SCHEDULED"; // "SCHEDULED", "ACTIVE", "COMPLETED"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "SCHEDULED";
    }
}
