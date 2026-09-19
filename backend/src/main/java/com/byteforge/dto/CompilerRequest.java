package com.byteforge.dto;

import com.byteforge.entity.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for the Online Compiler / IDE runner.
 */
public record CompilerRequest(
    @NotBlank(message = "Code cannot be empty")
    String code,

    @NotNull(message = "Language is required")
    Language language,

    String input
) {}
