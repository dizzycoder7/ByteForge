package com.byteforge.dto;

import com.byteforge.entity.Difficulty;
import jakarta.validation.constraints.*;

/**
 * DTO for creating or updating a problem.
 *
 * Single DTO used for both POST (create) and PUT (update) to keep
 * things simple. If create and update rules diverged significantly,
 * we'd split into CreateProblemRequest / UpdateProblemRequest.
 *
 * timeLimitMs and memoryLimitMb use Integer (nullable boxed type)
 * so the client can omit them and the service applies defaults (2000ms / 256MB).
 */
public record ProblemRequest(

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    String title,

    @NotBlank(message = "Description is required")
    String description,

    String inputFormat,

    String outputFormat,

    String constraints,

    @NotNull(message = "Difficulty is required")
    Difficulty difficulty,

    @Min(value = 100,   message = "Time limit must be at least 100ms")
    @Max(value = 10000, message = "Time limit cannot exceed 10,000ms")
    Integer timeLimitMs,       // null â†’ service defaults to 2000

    @Min(value = 16,   message = "Memory limit must be at least 16MB")
    @Max(value = 1024, message = "Memory limit cannot exceed 1024MB")
    Integer memoryLimitMb,     // null â†’ service defaults to 256

    boolean published          // false = DRAFT, true = PUBLISHED

) {}

