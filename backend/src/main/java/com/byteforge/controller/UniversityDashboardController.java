package com.byteforge.controller;

import com.byteforge.dto.UniversityDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/university")
@RequiredArgsConstructor
public class UniversityDashboardController {

    /**
     * GET /api/university/dashboard
     * Returns the institutional faculty & chapter dashboard dataset.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<UniversityDashboardResponse> getDashboardData(
            @RequestParam(defaultValue = "Delhi Technological University (DTU)") String college) {

        List<String> batches = List.of(
                "All College Batches",
                "CSE 3rd Year - Section A (2026 Batch)",
                "CSE 3rd Year - Section B (2026 Batch)",
                "IT 3rd Year - Section A (2026 Batch)",
                "Advanced Placement CP Training Club"
        );

        List<UniversityDashboardResponse.CollegeStudentRoster> students = List.of(
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Rohit Sharma", "22CSE104", "rohit_coder",
                        "CSE 3rd Year - Section A", 158, 3, 1680, "READY", "Today, 10:30 AM"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Priya Patel", "22CSE089", "priya_dev",
                        "CSE 3rd Year - Section A", 142, 3, 1625, "READY", "Today, 09:15 AM"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Aman Verma", "22CSE012", "aman_algo",
                        "CSE 3rd Year - Section B", 124, 2, 1540, "IN_PROGRESS", "Yesterday"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Sneha Rao", "22IT045", "sneha_codes",
                        "IT 3rd Year - Section A", 118, 2, 1510, "IN_PROGRESS", "2 days ago"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Vikram Singh", "22CSE142", "vikram_cp",
                        "CSE 3rd Year - Section B", 195, 4, 1845, "READY", "Today, 11:00 AM"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Ananya Iyer", "22CSE023", "ananya_i",
                        "CSE 3rd Year - Section A", 96, 2, 1480, "IN_PROGRESS", "3 days ago"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Karan Malhotra", "22IT067", "karan_m",
                        "IT 3rd Year - Section A", 64, 1, 1340, "NEEDS_PRACTICE", "1 week ago"),
                new UniversityDashboardResponse.CollegeStudentRoster(
                        "Aditi Deshmukh", "22CSE005", "aditi_d",
                        "CSE 3rd Year - Section A", 130, 3, 1605, "READY", "Yesterday")
        );

        List<UniversityDashboardResponse.CollegeLabTest> labTests = List.of(
                new UniversityDashboardResponse.CollegeLabTest(
                        "LAB-04", "Lab 4: Binary Search Trees & Heaps Implementation",
                        "CSE 3rd Year - Section A", "90 Mins", 64, 62, 86, "COMPLETED"),
                new UniversityDashboardResponse.CollegeLabTest(
                        "LAB-05", "Lab 5: Dynamic Programming Knapsack & Coin Change",
                        "CSE 3rd Year - Section A & B", "120 Mins", 124, 98, 78, "ACTIVE"),
                new UniversityDashboardResponse.CollegeLabTest(
                        "PLACEMENT-MOCK-02", "Campus Placement Mock Coding Test - Day 1 Prep",
                        "All Batches", "150 Mins", 210, 0, 0, "SCHEDULED")
        );

        UniversityDashboardResponse.RatingDistribution distribution =
                new UniversityDashboardResponse.RatingDistribution(48, 164, 92, 28, 6);

        UniversityDashboardResponse response = new UniversityDashboardResponse(
                college,
                "DTU-DELHI-CAMPUS",
                "Official Tier 1 Chapter",
                "Dr. Rajesh Verma (HOD CSE)",
                450,
                3840,
                78,
                2,
                batches,
                students,
                labTests,
                distribution
        );

        return ResponseEntity.ok(response);
    }
}
