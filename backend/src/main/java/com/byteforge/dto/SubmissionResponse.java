package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Full submission detail response.
 * Includes the submitted code — only returned when a user views their own submission.
 */
public record SubmissionResponse(
    Long   id,
    Long   problemId,
    String problemTitle,
    String problemSlug,
    String username,        // display handle of the submitter
    String code,            // the actual submitted code
    String language,        // "JAVA" / "CPP" / "PYTHON"
    String verdict,         // "ACCEPTED" / "WRONG_ANSWER" / etc.
    Long   executionTimeMs, // null while PENDING
    String errorMessage,    // non-null for CE / RE
    LocalDateTime submittedAt
) {}
