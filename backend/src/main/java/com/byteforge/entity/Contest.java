package com.byteforge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing rated coding contests (ByteForge Starters, Cook-Off, etc.).
 */
@Entity
@Table(name = "contests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "START254", "COOK162"

    @Column(nullable = false, length = 150)
    private String name; // e.g. "ByteForge Starters 254"

    @Column(nullable = false, length = 30)
    private String type; // "STARTERS", "COOK_OFF", "LUNCHTIME", "COLLEGE_LEAGUE"

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    private int durationMins; // e.g. 120 (2 hours)

    @Column(nullable = false, length = 20)
    private String status; // "LIVE", "UPCOMING", "PAST"

    @Column(length = 100)
    private String ratedFor; // e.g. "Rated for Div 1, 2, 3 & 4 (All Stars)"

    @Column(length = 100)
    private String divisions; // "Div 1, Div 2, Div 3, Div 4"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "UPCOMING";
    }
}
