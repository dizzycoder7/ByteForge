package com.byteforge.controller;

import com.byteforge.dto.LeaderboardEntry;
import com.byteforge.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * GET /api/leaderboard — Public endpoint, no authentication required.
 *
 * Returns a paginated leaderboard of users ranked by problems solved.
 *
 * The native SQL query in SubmissionRepository returns Object[] rows.
 * We map them to LeaderboardEntry DTOs here and assign rank numbers.
 *
 * Rank calculation:
 *   On page 0, ranks are 1, 2, 3, ...
 *   On page 1 (size=20), ranks are 21, 22, 23, ...
 *   Formula: rank = (pageNumber * pageSize) + rowIndex + 1
 *   We use page.getPageable().getOffset() to get the starting offset.
 */
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final SubmissionRepository submissionRepository;

    @GetMapping
    public ResponseEntity<Page<LeaderboardEntry>> getLeaderboard(
            @RequestParam(required = false)    String college,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> raw = (college != null && !college.isBlank())
                ? submissionRepository.findLeaderboardDataByCollege(college.trim(), pageable)
                : submissionRepository.findLeaderboardData(pageable);

        // Starting rank for this page (e.g., page 1 of size 20 starts at rank 21)
        int startRank = (int) raw.getPageable().getOffset() + 1;
        AtomicInteger rankCounter = new AtomicInteger(startRank);

        List<LeaderboardEntry> entries = raw.getContent().stream()
                .map(row -> new LeaderboardEntry(
                        rankCounter.getAndIncrement(),
                        (String) row[0],                   // username
                        (String) row[1],                   // college_name
                        ((Number) row[2]).longValue(),      // problems_solved
                        ((Number) row[3]).longValue()       // total_submissions
                ))
                .toList();

        return ResponseEntity.ok(
                new PageImpl<>(entries, pageable, raw.getTotalElements())
        );
    }
}
