package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity storing individual student code submissions for institutional lab assessments.
 * Allows faculty mentors and professors to inspect submitted code, execution logs, and marks.
 */
@Entity
@Table(name = "assessment_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assessmentId;

    @Column(nullable = false, length = 100)
    private String studentName;

    @Column(nullable = false, length = 100)
    private String studentHandle;

    @Column(length = 50)
    private String rollNo;

    @Column(length = 150)
    private String problemTitle;

    @Column(nullable = false, length = 20)
    private String language;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String sourceCode;

    private int score; // e.g. 90, 100

    @Column(length = 50)
    private String verdict; // "ACCEPTED", "10/10 Test Cases Passed"

    private int tabSwitchFlags;

    @Column(length = 50)
    private String timeTaken; // e.g. "42 mins"

    @Column(length = 255)
    private String facultyFeedback;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
