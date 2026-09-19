package com.byteforge.controller;

import com.byteforge.dto.SubmissionRequest;
import com.byteforge.dto.SubmissionResponse;
import com.byteforge.dto.SubmissionSummaryResponse;
import com.byteforge.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Submission endpoints — all require authentication (no public access).
 *
 * After submitting, the client receives a PENDING response immediately.
 * The client should then poll GET /submissions/{id} periodically
 * (e.g., every 1–2 seconds) until verdict != "PENDING".
 *
 * In a production system, this polling is typically replaced with
 * WebSockets or Server-Sent Events (SSE) for real-time verdict updates.
 * That's a Phase 5+ enhancement.
 */
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    /**
     * POST /api/submissions  — Authenticated
     * Submit code for a problem. Returns immediately with verdict = PENDING.
     * Judging happens asynchronously in the background.
     */
    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(
            @Valid @RequestBody SubmissionRequest request,
            Authentication authentication) {

        SubmissionResponse response =
                submissionService.submit(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/submissions/my  — Authenticated
     * Returns the current user's submission history, newest first.
     */
    @GetMapping("/my")
    public ResponseEntity<Page<SubmissionSummaryResponse>> getMySubmissions(
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "10")            int size,
            Authentication authentication) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("submittedAt").descending());

        return ResponseEntity.ok(
                submissionService.getMySubmissions(authentication.getName(), pageable));
    }

    /**
     * GET /api/submissions/{id}  — Authenticated
     * Returns full submission detail including the code.
     * Regular users can only view their own submissions (enforced in service).
     * ADMIN can view any submission.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(submissionService.getById(id, authentication));
    }
}
