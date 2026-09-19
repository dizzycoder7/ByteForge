package com.byteforge.config;

import com.byteforge.entity.CollegeAssessment;
import com.byteforge.entity.Role;
import com.byteforge.entity.User;
import com.byteforge.repository.CollegeAssessmentRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds and synchronizes default administrative accounts, faculty coordinators,
 * test students, and sample college assessments so login and tests work 100% reliably.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CollegeAssessmentRepository assessmentRepository;
    private final com.byteforge.repository.AssessmentProblemRepository problemRepository;
    private final com.byteforge.repository.ContestRepository contestRepository;
    private final com.byteforge.repository.CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // ──────────────────────────────────────────────────────────────────
        // 1. Super Admin Account (admin@byteforge.tech / Admin@12345)
        // ──────────────────────────────────────────────────────────────────
        userRepository.findByUsername("admin").ifPresentOrElse(
            admin -> {
                admin.setEmail("admin@byteforge.tech");
                admin.setPassword(passwordEncoder.encode("Admin@12345"));
                admin.setRole(Role.ADMIN);
                admin.setCollegeName("ByteForge Technical Administration");
                userRepository.save(admin);
                log.info("[DataInitializer] Synced Super Admin credentials: admin / Admin@12345");
            },
            () -> {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@byteforge.tech")
                        .password(passwordEncoder.encode("Admin@12345"))
                        .role(Role.ADMIN)
                        .collegeName("ByteForge Technical Administration")
                        .build();
                userRepository.save(admin);
                log.info("[DataInitializer] Created Super Admin: admin@byteforge.tech / Admin@12345");
            }
        );

        // ──────────────────────────────────────────────────────────────────
        // 2. Faculty Mentor Account (faculty@dtu.ac.in / Campus@12345)
        // ──────────────────────────────────────────────────────────────────
        userRepository.findByUsername("prof_verma").ifPresentOrElse(
            faculty -> {
                faculty.setEmail("faculty@dtu.ac.in");
                faculty.setPassword(passwordEncoder.encode("Campus@12345"));
                faculty.setRole(Role.FACULTY_ADMIN);
                faculty.setCollegeName("Delhi Technological University (DTU)");
                userRepository.save(faculty);
                log.info("[DataInitializer] Synced Faculty credentials: prof_verma / Campus@12345");
            },
            () -> {
                User faculty = User.builder()
                        .username("prof_verma")
                        .email("faculty@dtu.ac.in")
                        .password(passwordEncoder.encode("Campus@12345"))
                        .role(Role.FACULTY_ADMIN)
                        .collegeName("Delhi Technological University (DTU)")
                        .build();
                userRepository.save(faculty);
                log.info("[DataInitializer] Created Faculty: faculty@dtu.ac.in / Campus@12345");
            }
        );

        // ──────────────────────────────────────────────────────────────────
        // 3. DTU Student Account (rohit@dtu.ac.in / Student@12345)
        // ──────────────────────────────────────────────────────────────────
        userRepository.findByUsername("rohit_coder").ifPresentOrElse(
            student -> {
                student.setEmail("rohit@dtu.ac.in");
                student.setPassword(passwordEncoder.encode("Student@12345"));
                student.setRole(Role.USER);
                student.setCollegeName("Delhi Technological University (DTU)");
                userRepository.save(student);
                log.info("[DataInitializer] Synced Student credentials: rohit_coder (rohit@dtu.ac.in) / Student@12345");
            },
            () -> {
                User student = User.builder()
                        .username("rohit_coder")
                        .email("rohit@dtu.ac.in")
                        .password(passwordEncoder.encode("Student@12345"))
                        .role(Role.USER)
                        .collegeName("Delhi Technological University (DTU)")
                        .build();
                userRepository.save(student);
                log.info("[DataInitializer] Created Student: rohit@dtu.ac.in / Student@12345");
            }
        );

        // ──────────────────────────────────────────────────────────────────
        // 4. IIT Delhi Student Account (priya@iitd.ac.in / Student@12345)
        // ──────────────────────────────────────────────────────────────────
        userRepository.findByUsername("priya_sharma").ifPresentOrElse(
            student2 -> {
                student2.setEmail("priya@iitd.ac.in");
                student2.setPassword(passwordEncoder.encode("Student@12345"));
                student2.setRole(Role.USER);
                student2.setCollegeName("IIT Delhi");
                userRepository.save(student2);
            },
            () -> {
                User student2 = User.builder()
                        .username("priya_sharma")
                        .email("priya@iitd.ac.in")
                        .password(passwordEncoder.encode("Student@12345"))
                        .role(Role.USER)
                        .collegeName("IIT Delhi")
                        .build();
                userRepository.save(student2);
            }
        );

        // ──────────────────────────────────────────────────────────────────
        // 5. Seed Sample Live, Scheduled & Completed Assessments for Colleges
        // ──────────────────────────────────────────────────────────────────
        if (assessmentRepository.findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc("Delhi Technological University").isEmpty()) {
            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("CSE 3rd Year - Section A (2026 Batch)")
                    .assessmentName("Mid-Sem DSA Lab Practical: Binary Trees & Graphs")
                    .startTime("2026-09-11 10:00:00")
                    .durationDays(0)
                    .durationHours(2)
                    .durationMins(0)
                    .syllabus("Binary Trees::DFS::BFS::Shortest Path")
                    .description("Solve 2 algorithmic questions within 2 hours. Full screen proctoring is enabled.")
                    .browserRestrictions(true)
                    .enableReview(false)
                    .hideStudentReport(false)
                    .allowedLanguages("C,C++,Java,Pyth 3")
                    .collegeName("Delhi Technological University (DTU)")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .build());

            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("Pre-Placement Advanced DSA Club")
                    .assessmentName("Campus Mock Placement Assessment 2026")
                    .startTime("2026-09-15 14:00:00")
                    .durationDays(0)
                    .durationHours(1)
                    .durationMins(30)
                    .syllabus("Dynamic Programming::Greedy::Sliding Window")
                    .description("Official shortlisting assessment for visiting tech companies.")
                    .browserRestrictions(true)
                    .enableReview(true)
                    .hideStudentReport(false)
                    .allowedLanguages("C++,Java,Pyth 3")
                    .collegeName("Delhi Technological University (DTU)")
                    .status("SCHEDULED")
                    .createdAt(LocalDateTime.now())
                    .build());

            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("CSE 3rd Year - Section A (2026 Batch)")
                    .assessmentName("Lab Evaluation 1: Arrays, Stacks & Queues")
                    .startTime("2026-08-20 09:00:00")
                    .durationDays(0)
                    .durationHours(1)
                    .durationMins(30)
                    .syllabus("Stack Applications::Monotonic Queue::Two Pointers")
                    .description("First departmental lab evaluation. Graded.")
                    .browserRestrictions(true)
                    .enableReview(true)
                    .hideStudentReport(false)
                    .allowedLanguages("C,C++,Java,Pyth 3")
                    .collegeName("Delhi Technological University (DTU)")
                    .status("COMPLETED")
                    .createdAt(LocalDateTime.now().minusDays(20))
                    .build());

            log.info("[DataInitializer] Seeded sample college assessments for DTU.");
        }

        if (assessmentRepository.findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc("IIT Delhi").isEmpty()) {
            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("IITD B.Tech CSE 2026 Batch")
                    .assessmentName("COL106: Data Structures & Algorithms Lab Evaluation")
                    .startTime("2026-09-11 11:00:00")
                    .durationDays(0)
                    .durationHours(2)
                    .durationMins(30)
                    .syllabus("Balanced Trees::Heaps::Trie::Graph Algorithms")
                    .description("Department of Computer Science & Engineering, IIT Delhi. Official practical assessment.")
                    .browserRestrictions(true)
                    .enableReview(false)
                    .hideStudentReport(false)
                    .allowedLanguages("C,C++,Java,Pyth 3")
                    .collegeName("IIT Delhi")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now())
                    .build());

            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("IITD B.Tech CSE 2026 Batch")
                    .assessmentName("COL216: Computer Architecture & Assembly Practical")
                    .startTime("2026-09-18 15:00:00")
                    .durationDays(0)
                    .durationHours(2)
                    .durationMins(0)
                    .syllabus("MIPS Assembly::Instruction Pipeline::Memory Caching")
                    .description("Mid-semester architectural coding practical under proctor supervision.")
                    .browserRestrictions(true)
                    .enableReview(false)
                    .hideStudentReport(false)
                    .allowedLanguages("C,C++,Java")
                    .collegeName("IIT Delhi")
                    .status("SCHEDULED")
                    .createdAt(LocalDateTime.now())
                    .build());

            assessmentRepository.save(CollegeAssessment.builder()
                    .cohort("IITD B.Tech CSE 2026 Batch")
                    .assessmentName("COL100: Introduction to Computer Science Lab 1")
                    .startTime("2026-08-15 10:00:00")
                    .durationDays(0)
                    .durationHours(1)
                    .durationMins(30)
                    .syllabus("Recursion::Memory Management::Pointers")
                    .description("Department introductory practical benchmark test.")
                    .browserRestrictions(true)
                    .enableReview(true)
                    .hideStudentReport(false)
                    .allowedLanguages("C,C++,Java,Pyth 3")
                    .collegeName("IIT Delhi")
                    .status("COMPLETED")
                    .createdAt(LocalDateTime.now().minusDays(25))
                    .build());

            log.info("[DataInitializer] Seeded sample college assessments for IIT Delhi.");
        }

        // ──────────────────────────────────────────────────────────────────
        // 5.1 Seed Sample Problems Attached to Assessments
        // ──────────────────────────────────────────────────────────────────
        if (problemRepository.count() == 0) {
            // Find first assessment (e.g. DTU or IITD)
            assessmentRepository.findAll().forEach(a -> {
                if (problemRepository.countByAssessmentId(a.getId()) == 0) {
                    problemRepository.save(com.byteforge.entity.AssessmentProblem.builder()
                            .assessmentId(a.getId())
                            .title("Problem 1: Invert a Binary Tree")
                            .difficulty("MEDIUM")
                            .points(50)
                            .description("Given the root of a binary tree, invert the tree, and return its root. Each left child becomes the right child, and vice versa.")
                            .constraints("1 <= Number of nodes <= 100\n-100 <= Node.val <= 100")
                            .inputFormat("Root array in level order representation: e.g. [4,2,7,1,3,6,9]")
                            .outputFormat("Inverted tree array in level order representation: e.g. [4,7,2,9,6,3,1]")
                            .sampleInput("[4, 2, 7, 1, 3, 6, 9]")
                            .sampleOutput("[4, 7, 2, 9, 6, 3, 1]")
                            .orderIndex(1)
                            .build());

                    problemRepository.save(com.byteforge.entity.AssessmentProblem.builder()
                            .assessmentId(a.getId())
                            .title("Problem 2: Maximum Subarray Sum (Kadane)")
                            .difficulty("EASY")
                            .points(50)
                            .description("Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.")
                            .constraints("1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4")
                            .inputFormat("An integer array nums: e.g. [-2,1,-3,4,-1,2,1,-5,4]")
                            .outputFormat("Maximum contiguous subarray sum: e.g. 6")
                            .sampleInput("[-2, 1, -3, 4, -1, 2, 1, -5, 4]")
                            .sampleOutput("6")
                            .orderIndex(2)
                            .build());
                }
            });
            log.info("[DataInitializer] Seeded sample AssessmentProblems for college assessments.");
        }
        // 6. Seed Sample Contests (Starters, Cook-Off, Lunchtime)
        // ──────────────────────────────────────────────────────────────────
        if (contestRepository.count() == 0) {
            com.byteforge.entity.Contest c1 = com.byteforge.entity.Contest.builder()
                    .code("START254")
                    .name("ByteForge Starters 254 (Rated for All)")
                    .type("STARTERS")
                    .startTime(LocalDateTime.now().minusMinutes(35))
                    .endTime(LocalDateTime.now().plusMinutes(85))
                    .durationMins(120)
                    .status("LIVE")
                    .ratedFor("Rated for Div 1, 2, 3 & 4 (All Coders)")
                    .divisions("Div 1, Div 2, Div 3, Div 4")
                    .description("The premier weekly 2-hour rating battle. Solve 4 algorithmic challenges to earn stars.")
                    .build();

            com.byteforge.entity.Contest c2 = com.byteforge.entity.Contest.builder()
                    .code("COOK162")
                    .name("ByteForge Cook-Off 162")
                    .type("COOK_OFF")
                    .startTime(LocalDateTime.now().plusDays(2).withHour(20).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(2).withHour(22).withMinute(30))
                    .durationMins(150)
                    .status("UPCOMING")
                    .ratedFor("Rated for Div 1, 2 & 3")
                    .divisions("Div 1, Div 2, Div 3")
                    .description("Fast-paced ICPC style contest with penalty for wrong attempts.")
                    .build();

            com.byteforge.entity.Contest c3 = com.byteforge.entity.Contest.builder()
                    .code("UNIV2026")
                    .name("Inter-Collegiate ByteForge Cup 2026")
                    .type("COLLEGE_LEAGUE")
                    .startTime(LocalDateTime.now().plusDays(5).withHour(14).withMinute(0))
                    .endTime(LocalDateTime.now().plusDays(5).withHour(17).withMinute(0))
                    .durationMins(180)
                    .status("UPCOMING")
                    .ratedFor("All University Students & Faculty")
                    .divisions("Div 1, Div 2, Div 3, Div 4")
                    .description("Official university coding league with institutional rankings.")
                    .build();

            com.byteforge.entity.Contest c4 = com.byteforge.entity.Contest.builder()
                    .code("LTIME112")
                    .name("ByteForge Lunchtime 112")
                    .type("LUNCHTIME")
                    .startTime(LocalDateTime.now().minusDays(3).withHour(19).withMinute(30))
                    .endTime(LocalDateTime.now().minusDays(3).withHour(22).withMinute(30))
                    .durationMins(180)
                    .status("PAST")
                    .ratedFor("Rated for All")
                    .divisions("Div 1, Div 2, Div 3, Div 4")
                    .description("Archived 3-hour rating challenge. Complete problem sets & editorials available.")
                    .build();

            contestRepository.saveAll(java.util.List.of(c1, c2, c3, c4));
            log.info("[DataInitializer] Seeded sample contests into database.");
        }

        // ──────────────────────────────────────────────────────────────────
        // 7. Seed Structured Learning Courses & DSA Roadmaps
        // ──────────────────────────────────────────────────────────────────
        if (courseRepository.count() == 0) {
            com.byteforge.entity.Course crs1 = com.byteforge.entity.Course.builder()
                    .slug("learn-c-scratch")
                    .title("Learn C Programming from Scratch")
                    .category("LANGUAGE")
                    .level("BEGINNER")
                    .modulesCount(6)
                    .lessonsCount(28)
                    .practiceProblemsCount(35)
                    .rating(4.9)
                    .enrolledCount(18450)
                    .description("Master memory management, pointers, bitwise operations, and low-level computer architecture with interactive in-browser coding labs.")
                    .roadmapTopics("Pointers::Dynamic Memory::Structs::Recursion::File I/O")
                    .badgeColor("blue")
                    .build();

            com.byteforge.entity.Course crs2 = com.byteforge.entity.Course.builder()
                    .slug("dsa-roadmap-1-to-3-star")
                    .title("DSA Career Track: 1★ to 3★ Rating Roadmap")
                    .category("DSA_ROADMAP")
                    .level("INTERMEDIATE")
                    .modulesCount(8)
                    .lessonsCount(42)
                    .practiceProblemsCount(60)
                    .rating(4.95)
                    .enrolledCount(24300)
                    .description("The definitive blueprint to elevate your competitive programming rating from Div 4 (1★) to Div 2 (3★). Includes Two Pointers, Binary Search, Trees & DP.")
                    .roadmapTopics("Binary Search::Two Pointers::Trees::Greedy::DP::Bitmasking")
                    .badgeColor("emerald")
                    .build();

            com.byteforge.entity.Course crs3 = com.byteforge.entity.Course.builder()
                    .slug("java-21-placements")
                    .title("Java 21 & OOPs for Campus Placements")
                    .category("LANGUAGE")
                    .level("BEGINNER")
                    .modulesCount(7)
                    .lessonsCount(34)
                    .practiceProblemsCount(45)
                    .rating(4.85)
                    .enrolledCount(12900)
                    .description("Object-Oriented Design, Collections Framework, Multithreading, and Clean Architecture for FAANG campus placement rounds.")
                    .roadmapTopics("OOPs::Collections::Generics::Lambdas & Streams::Multithreading")
                    .badgeColor("amber")
                    .build();

            com.byteforge.entity.Course crs4 = com.byteforge.entity.Course.builder()
                    .slug("competitive-programming-masterclass")
                    .title("Competitive Programming Masterclass (3★ to 5★)")
                    .category("DSA_ROADMAP")
                    .level("ADVANCED")
                    .modulesCount(10)
                    .lessonsCount(50)
                    .practiceProblemsCount(75)
                    .rating(4.98)
                    .enrolledCount(9800)
                    .description("Advanced Graph Theory, Segment Trees, Fenwick Trees, Treaps, Dynamic Programming on Trees, and Heavy-Light Decomposition for Grandmasters.")
                    .roadmapTopics("Segment Trees::DSU::Dijkstra & Flow::Tree DP::HLD::Number Theory")
                    .badgeColor("purple")
                    .build();

            courseRepository.saveAll(java.util.List.of(crs1, crs2, crs3, crs4));
            log.info("[DataInitializer] Seeded structured learning courses into database.");
        }
    }
}
