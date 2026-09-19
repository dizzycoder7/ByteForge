package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * UniversityPartnership entity — stores applications from universities,
 * colleges, and faculty coordinators looking to partner with ByteForge.
 */
@Entity
@Table(name = "university_partnerships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UniversityPartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String collegeName;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String coordinatorName;

    @Column(nullable = false, length = 100)
    private String coordinatorEmail;

    @Column(nullable = false, length = 20)
    private String coordinatorPhone;

    @Column(length = 80)
    private String designation; // e.g. "HOD CSE", "TPO Officer", "Student Chapter Lead"

    private Integer studentCount;

    @Column(length = 255)
    private String preferredTracks; // e.g. "DSA Lab, Placement Prep, Campus Chapter"

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PartnershipStatus status = PartnershipStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = PartnershipStatus.PENDING;
        }
    }

    public enum PartnershipStatus {
        PENDING,
        REVIEWED,
        APPROVED,
        ONBOARDED
    }
}
