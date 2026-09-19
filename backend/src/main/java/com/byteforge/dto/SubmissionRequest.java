package com.byteforge.dto;

import com.byteforge.entity.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for submitting code.
 *
 * Java note: the main class in your code MUST be named "Solution".
 * This is required because the judge uses "java -cp . Solution" to run it.
 * This is a standard convention on most online judges.
 */
public record SubmissionRequest(

    @NotNull(message = "Problem ID is required")
    Long problemId,

    @NotBlank(message = "Code is required")
    String code,

    @NotNull(message = "Language is required")
    Language language

) {}
