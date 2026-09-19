package com.byteforge.controller;

import com.byteforge.dto.TestCaseRequest;
import com.byteforge.dto.TestCaseResponse;
import com.byteforge.service.TestCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Test case management endpoints — nested under /api/problems/{problemId}.
 *
 * URL nesting convention: /api/problems/{problemId}/testcases
 * This communicates that test cases are a sub-resource of problems —
 * a test case without a problem makes no sense in isolation.
 *
 * Access:
 *   POST / GET all / DELETE → ADMIN only
 *   GET samples             → Public (shown on problem page)
 */
@RestController
@RequestMapping("/api/problems/{problemId}/testcases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    /**
     * POST /api/problems/{problemId}/testcases  — ADMIN only
     * Add a test case to a problem.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TestCaseResponse> create(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testCaseService.create(problemId, request));
    }

    /**
     * GET /api/problems/{problemId}/testcases  — ADMIN only
     * Returns ALL test cases including hidden ones.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TestCaseResponse>> getAll(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getAllByProblem(problemId));
    }

    /**
     * GET /api/problems/{problemId}/testcases/samples  — Public
     * Returns only sample (non-hidden) test cases shown on the problem page.
     * No token required.
     */
    @GetMapping("/samples")
    public ResponseEntity<List<TestCaseResponse>> getSamples(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getSamplesByProblem(problemId));
    }

    /**
     * DELETE /api/problems/{problemId}/testcases/{id}  — ADMIN only
     * Returns 204 No Content on success.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long problemId,
            @PathVariable Long id) {

        testCaseService.delete(problemId, id);
        return ResponseEntity.noContent().build();
    }
}
