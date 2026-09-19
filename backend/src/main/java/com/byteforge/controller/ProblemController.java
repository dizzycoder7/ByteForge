package com.byteforge.controller;

import com.byteforge.dto.ProblemRequest;
import com.byteforge.dto.ProblemResponse;
import com.byteforge.dto.ProblemSummaryResponse;
import com.byteforge.entity.User;
import com.byteforge.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for problem CRUD.
 *
 * Access control strategy:
 *   - Read endpoints (GET) â†’ declared public in SecurityConfig via
 *     requestMatchers(HttpMethod.GET, "/api/problems/**").permitAll()
 *   - Write endpoints (POST/PUT/DELETE) â†’ authenticated + ADMIN role via
 *     @PreAuthorize("hasRole('ADMIN')")
 *
 * @PreAuthorize works because @EnableMethodSecurity is set in SecurityConfig.
 * It evaluates SpEL (Spring Expression Language) against the SecurityContext
 * before the method body executes. If the check fails â†’ 403 Forbidden.
 *
 * Why @AuthenticationPrincipal?
 *   Spring resolves this from SecurityContextHolder.getContext().getAuthentication()
 *   .getPrincipal(). Since our JwtAuthenticationFilter stores the User entity
 *   as the principal, we get the typed User directly â€” no manual casting needed.
 */
@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    /**
     * POST /api/problems  â€” ADMIN only
     * Creates a new problem. Returns 201 Created with the full problem detail.
     *
     * @AuthenticationPrincipal injects the currently logged-in User
     * so the service can record who authored the problem.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemResponse> create(
            @Valid @RequestBody ProblemRequest request,
            @AuthenticationPrincipal User currentUser) {

        ProblemResponse response = problemService.create(request, currentUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/problems  â€” Public
     * Returns a paginated list of published problems.
     *
     * Query params:
     *   page    (default 0)          â€” zero-indexed page number
     *   size    (default 10)         â€” items per page
     *   sortBy  (default createdAt)  â€” field to sort by
     *   sortDir (default desc)       â€” "asc" or "desc"
     *
     * Returns Spring's Page<> JSON:
     *   { content: [...], totalPages: N, totalElements: M, ... }
     */
    @GetMapping
    public ResponseEntity<Page<ProblemSummaryResponse>> getAllPublished(
            @RequestParam(defaultValue = "0")           int page,
            @RequestParam(defaultValue = "10")          int size,
            @RequestParam(defaultValue = "createdAt")   String sortBy,
            @RequestParam(defaultValue = "desc")        String sortDir) {

        Sort sort     = sortDir.equalsIgnoreCase("asc")
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(problemService.getAllPublished(pageable));
    }

    /**
     * GET /api/problems/{id}  — Public
     * Returns the full detail of a single problem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getById(id));
    }

    /**
     * GET /api/problems/slug/{slug}  — Public
     * Returns problem by URL slug. Used by the frontend detail page
     * so the route /problems/two-sum works without knowing the DB id.
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProblemResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(problemService.getBySlug(slug));
    }

    /**
     * PUT /api/problems/{id}  — ADMIN only
     * Replaces mutable fields of an existing problem.
     * Slug is not updated — title changes don't break URLs.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request) {

        return ResponseEntity.ok(problemService.update(id, request));
    }

    /**
     * DELETE /api/problems/{id}  â€” ADMIN only
     * Soft-deletes the problem (sets is_deleted = true).
     * Returns 204 No Content â€” the standard response for a successful DELETE.
     * No body is needed: the client already knows what was deleted (it sent the id).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        problemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

