package com.byteforge.controller;

import com.byteforge.dto.CourseResponse;
import com.byteforge.entity.Course;
import com.byteforge.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses(
            @RequestParam(required = false) String category) {
        List<Course> list = (category != null && !category.isBlank())
                ? courseRepository.findByCategoryOrderByEnrolledCountDesc(category)
                : courseRepository.findAllByOrderByEnrolledCountDesc();

        return ResponseEntity.ok(list.stream().map(this::mapToResponse).toList());
    }

    public record CourseDetailPayload(
        CourseResponse course,
        List<CourseResponse.CourseModuleDto> modules,
        List<String> keyOutcomes,
        List<String> prerequisites
    ) {}

    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailPayload> getCourseBySlug(@PathVariable String slug) {
        Course c = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Course not found: " + slug));

        // Sample interactive roadmap modules matching CodeChef Learn curriculum
        List<CourseResponse.CourseModuleDto> modules = List.of(
                new CourseResponse.CourseModuleDto(
                        1,
                        "Module 1: Foundations & Fast I/O",
                        "2.5 Hours",
                        List.of(
                                new CourseResponse.CourseLessonDto(
                                        "L101",
                                        "Introduction to Memory Architecture & Compilers",
                                        "READING",
                                        10,
                                        "",
                                        "Understand stack vs heap memory allocation, CPU caches, and compilation stages.",
                                        "Read the theory notes and prepare your local environment."
                                ),
                                new CourseResponse.CourseLessonDto(
                                        "L102",
                                        "Interactive Coding Lab: Fast Input/Output in C/C++",
                                        "CODING_LAB",
                                        50,
                                        "#include <stdio.h>\n\nint main() {\n    int a, b;\n    // Read two integers and print their sum\n    return 0;\n}",
                                        "Standard printf/scanf vs buffer methods like getchar_unlocked.",
                                        "Write a program to read two integers and print their sum with O(1) space."
                                )
                        )
                ),
                new CourseResponse.CourseModuleDto(
                        2,
                        "Module 2: Control Flow, Loops & Conditionals",
                        "3.0 Hours",
                        List.of(
                                new CourseResponse.CourseLessonDto(
                                        "L201",
                                        "Branching Logic & Bitwise Conditionals",
                                        "READING",
                                        20,
                                        "",
                                        "Optimizing conditional execution using bit manipulation (&, |, ^, <<, >>).",
                                        "Review operator precedence tables."
                                ),
                                new CourseResponse.CourseLessonDto(
                                        "L202",
                                        "Interactive Coding Lab: Palindrome Number Checker",
                                        "CODING_LAB",
                                        50,
                                        "#include <stdio.h>\n\nint main() {\n    // Check if input integer N is a palindrome\n    return 0;\n}",
                                        "Reversing digits without string conversion to prevent integer overflow.",
                                        "Read integer N from standard input and print YES if palindrome, NO otherwise."
                                )
                        )
                ),
                new CourseResponse.CourseModuleDto(
                        3,
                        "Module 3: Functions, Pointers & Memory Management",
                        "4.0 Hours",
                        List.of(
                                new CourseResponse.CourseLessonDto(
                                        "L301",
                                        "Pointer Arithmetic & Dynamic Memory (malloc/free)",
                                        "READING",
                                        30,
                                        "",
                                        "Deep dive into reference dereferencing, double pointers, and avoiding memory leaks.",
                                        "Study valgrind memory leak diagrams."
                                ),
                                new CourseResponse.CourseLessonDto(
                                        "L302",
                                        "Interactive Coding Lab: Dynamic Array Inversion",
                                        "CODING_LAB",
                                        75,
                                        "#include <stdio.h>\n#include <stdlib.h>\n\nvoid reverseArray(int* arr, int n) {\n    // Reverse array in-place using two pointers\n}\n\nint main() {\n    return 0;\n}",
                                        "In-place two-pointer reversal technique.",
                                        "Implement reverseArray() using pointer arithmetic without extra memory."
                                )
                        )
                ),
                new CourseResponse.CourseModuleDto(
                        4,
                        "Module 4: Recursion, Divide & Conquer (1★ to 2★)",
                        "5.0 Hours",
                        List.of(
                                new CourseResponse.CourseLessonDto(
                                        "L401",
                                        "Recursive Call Stacks & Base Cases",
                                        "READING",
                                        25,
                                        "",
                                        "Master recurrence relations: T(N) = 2T(N/2) + O(N).",
                                        "Analyze stack frame visualizer."
                                ),
                                new CourseResponse.CourseLessonDto(
                                        "L402",
                                        "Interactive Coding Lab: Tower of Hanoi & Merge Sort",
                                        "CODING_LAB",
                                        100,
                                        "#include <stdio.h>\n\nvoid solveHanoi(int n, char from, char to, char aux) {\n    // Print minimal move sequences\n}\n\nint main() {\n    return 0;\n}",
                                        "Classic recursion problem solving.",
                                        "Print the exact step-by-step move sequence for N disks from rod A to C."
                                )
                        )
                ),
                new CourseResponse.CourseModuleDto(
                        5,
                        "Module 5: Competitive Data Structures (2★ to 3★ Roadmap)",
                        "6.5 Hours",
                        List.of(
                                new CourseResponse.CourseLessonDto(
                                        "L501",
                                        "Binary Heaps, Priority Queues & Disjoint Set Union (DSU)",
                                        "READING",
                                        40,
                                        "",
                                        "Path compression and union by rank for Kruskal's MST.",
                                        "Understand amortized O(alpha(N)) complexity."
                                ),
                                new CourseResponse.CourseLessonDto(
                                        "L502",
                                        "Interactive Coding Lab: Connected Components via DSU",
                                        "CODING_LAB",
                                        100,
                                        "#include <stdio.h>\n\n// Implement Disjoint Set Union (DSU) with Path Compression\nint parent[100005];\nint find(int i) { return parent[i] == i ? i : (parent[i] = find(parent[i])); }\n\nint main() {\n    return 0;\n}",
                                        "Cycle detection in undirected graphs.",
                                        "Count total disconnected components in a network of N servers and M connections."
                                )
                        )
                )
        );

        List<String> outcomes = List.of(
                "Write clean, optimal, bug-free C and C++ code for production & competitions.",
                "Master pointer arithmetic, dynamic memory, and memory leak prevention.",
                "Build strong algorithmic problem-solving intuition from 1★ up to 3★ rating.",
                "Confidently clear technical coding rounds at top tech product companies."
        );

        List<String> prereqs = List.of(
                "Basic high school math logic (No prior programming experience required).",
                "A computer with web browser (All coding runs in ByteForge Monaco Cloud IDE)."
        );

        return ResponseEntity.ok(new CourseDetailPayload(
                mapToResponse(c),
                modules,
                outcomes,
                prereqs
        ));
    }

    private CourseResponse mapToResponse(Course c) {
        return new CourseResponse(
                c.getId(),
                c.getSlug(),
                c.getTitle(),
                c.getCategory(),
                c.getLevel(),
                c.getModulesCount(),
                c.getLessonsCount(),
                c.getPracticeProblemsCount(),
                c.getRating(),
                c.getEnrolledCount(),
                c.getDescription(),
                c.getRoadmapTopics(),
                c.getBadgeColor() != null ? c.getBadgeColor() : "blue"
        );
    }
}
