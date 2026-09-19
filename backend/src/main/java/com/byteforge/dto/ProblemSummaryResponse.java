package com.byteforge.dto;

import java.time.LocalDateTime;

/**
 * Lightweight problem response for list views â€” GET /api/problems.
 *
 * Why a separate summary DTO instead of reusing ProblemResponse?
 * The list endpoint returns many problems per page. Sending the full
 * description, inputFormat, outputFormat, and constraints for each
 * problem would waste bandwidth â€” those fields can be kilobytes each.
 *
 * This is the "list vs detail" DTO pattern: the summary DTO carries
 * only what the UI needs to render a card/row in the problem list.
 * The full detail DTO is fetched lazily when the user clicks a problem.
 *
 * Interview term: this is a form of "over-fetching prevention" â€” one of
 * the main motivations behind GraphQL (though REST handles it fine
 * with separate endpoints or query params).
 */
public record ProblemSummaryResponse(
    Long id,
    String title,
    String slug,          // used by the frontend for routing: /problems/{slug}
    String difficulty,    // "EASY" / "MEDIUM" / "HARD"
    boolean published,
    String authorUsername,
    LocalDateTime createdAt
) {}

