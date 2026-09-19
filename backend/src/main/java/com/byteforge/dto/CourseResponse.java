package com.byteforge.dto;

import java.util.List;

public record CourseResponse(
    Long id,
    String slug,
    String title,
    String category,
    String level,
    int modulesCount,
    int lessonsCount,
    int practiceProblemsCount,
    double rating,
    int enrolledCount,
    String description,
    String roadmapTopics,
    String badgeColor
) {
    public record CourseModuleDto(
        int moduleNumber,
        String title,
        String estimatedTime,
        List<CourseLessonDto> lessons
    ) {}

    public record CourseLessonDto(
        String lessonId,
        String title,
        String type, // "READING", "CODING_LAB", "QUIZ"
        int points,
        String starterCode,
        String theoryNotes,
        String taskPrompt
    ) {}
}
