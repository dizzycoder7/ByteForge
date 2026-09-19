package com.byteforge.controller;

import com.byteforge.dto.ContestResponse;
import com.byteforge.entity.Contest;
import com.byteforge.repository.ContestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestRepository contestRepository;

    public record ContestsGroupedResponse(
        List<ContestResponse> live,
        List<ContestResponse> upcoming,
        List<ContestResponse> past
    ) {}

    @GetMapping
    public ResponseEntity<ContestsGroupedResponse> getAllContests() {
        List<Contest> all = contestRepository.findAllByOrderByStartTimeDesc();

        List<ContestResponse> live = new ArrayList<>();
        List<ContestResponse> upcoming = new ArrayList<>();
        List<ContestResponse> past = new ArrayList<>();

        for (Contest c : all) {
            ContestResponse res = mapToResponse(c);
            if ("LIVE".equalsIgnoreCase(c.getStatus())) {
                live.add(res);
            } else if ("UPCOMING".equalsIgnoreCase(c.getStatus())) {
                upcoming.add(res);
            } else {
                past.add(res);
            }
        }

        return ResponseEntity.ok(new ContestsGroupedResponse(live, upcoming, past));
    }

    public record ContestDetailPayload(
        ContestResponse contest,
        List<ContestResponse.ContestProblemDto> problems,
        List<ContestResponse.ContestRankDto> scoreboard,
        List<String> announcements
    ) {}

    @GetMapping("/{code}")
    public ResponseEntity<ContestDetailPayload> getContestByCode(
            @PathVariable String code,
            @RequestParam(defaultValue = "DIV4") String division) {
        Contest c = contestRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Contest not found: " + code));

        // Sample Contest Problems matching CodeChef divisions
        List<ContestResponse.ContestProblemDto> problems = List.of(
                new ContestResponse.ContestProblemDto("P01", "Chef and Magical Apples", "EASY", 100, 1420, 88.4),
                new ContestResponse.ContestProblemDto("P02", "Subarray Distinct XOR", "MEDIUM", 100, 840, 62.1),
                new ContestResponse.ContestProblemDto("P03", "Tree Painting Game", "MEDIUM", 100, 430, 44.8),
                new ContestResponse.ContestProblemDto("P04", "Counting Palindromic Trees", "HARD", 100, 112, 21.5)
        );

        // Sample Live Division Contest Scoreboard
        List<ContestResponse.ContestRankDto> scoreboard = List.of(
                new ContestResponse.ContestRankDto(1, "tourist_algo", "IIT Delhi", 6, 400, 48, List.of("P01", "P02", "P03", "P04")),
                new ContestResponse.ContestRankDto(2, "rohit_coder", "Delhi Technological University (DTU)", 5, 400, 62, List.of("P01", "P02", "P03", "P04")),
                new ContestResponse.ContestRankDto(3, "priya_sharma", "IIT Delhi", 4, 300, 78, List.of("P01", "P02", "P03")),
                new ContestResponse.ContestRankDto(4, "aryan_bits", "BITS Pilani", 4, 300, 94, List.of("P01", "P02", "P03")),
                new ContestResponse.ContestRankDto(5, "coder_vit", "VIT Vellore", 3, 200, 55, List.of("P01", "P02")),
                new ContestResponse.ContestRankDto(6, "tech_dtu_lead", "Delhi Technological University (DTU)", 4, 200, 68, List.of("P01", "P02")),
                new ContestResponse.ContestRankDto(7, "rahul_nitk", "NIT Trichy", 3, 200, 82, List.of("P01", "P02")),
                new ContestResponse.ContestRankDto(8, "neha_iitb", "IIT Bombay", 2, 100, 22, List.of("P01"))
        );

        List<String> announcements = List.of(
                "📢 Clarification on Problem B: N can be 0. Subarray indexing is 1-based.",
                "📢 Contest scoreboard is live. Happy coding!"
        );

        return ResponseEntity.ok(new ContestDetailPayload(
                mapToResponse(c),
                problems,
                scoreboard,
                announcements
        ));
    }

    private ContestResponse mapToResponse(Contest c) {
        return new ContestResponse(
                c.getId(),
                c.getCode(),
                c.getName(),
                c.getType(),
                c.getStartTime(),
                c.getEndTime(),
                c.getDurationMins(),
                c.getStatus(),
                c.getRatedFor(),
                c.getDivisions(),
                c.getDescription()
        );
    }
}
