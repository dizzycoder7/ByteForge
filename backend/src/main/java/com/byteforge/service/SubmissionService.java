package com.byteforge.service;

import com.byteforge.dto.SubmissionRequest;
import com.byteforge.dto.SubmissionResponse;
import com.byteforge.dto.SubmissionSummaryResponse;
import com.byteforge.entity.Problem;
import com.byteforge.entity.Submission;
import com.byteforge.entity.User;
import com.byteforge.entity.Verdict;
import com.byteforge.exception.ResourceNotFoundException;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.SubmissionRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles submission creation and retrieval.
 *
 * submit() flow:
 *   1. Validate problem exists and is published
 *   2. Save submission with verdict = PENDING (immediately visible to user)
 *   3. Trigger judgeService.judge(id) asynchronously (returns instantly)
 *   4. Return the PENDING submission to the caller
 *
 * The client polls GET /submissions/{id} until verdict != PENDING.
 *
 * Why save FIRST, then judge async?
 *   - The HTTP response goes back immediately (no blocking)
 *   - The submission ID is available for the user to track progress
 *   - If the server restarts, the PENDING submission is still in the DB
 *     (a recovery job could re-judge PENDING submissions on startup — Phase 4)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository    problemRepository;
    private final UserRepository       userRepository;
    private final JudgeService         judgeService;

    public SubmissionResponse submit(SubmissionRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        Problem problem = problemRepository.findById(request.problemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Problem not found with id: " + request.problemId()));

        if (!problem.isPublished()) {
            throw new ResourceNotFoundException(
                    "Problem not found with id: " + request.problemId());
            // Return 404 (not 403) to avoid leaking the existence of draft problems
        }

        // Save as PENDING — the judge will update this asynchronously
        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .code(request.code())
                .language(request.language())
                .verdict(Verdict.PENDING)
                .build();

        submission = submissionRepository.save(submission);

        // Fire-and-forget: returns immediately, judging runs in background thread.
        // Pass only the ID — JudgeService loads fresh data to avoid detached entity issues.
        judgeService.judge(submission.getId());

        return toResponse(submission);
    }

    /** Paginated list of the current user's own submissions. */
    @Transactional(readOnly = true)
    public Page<SubmissionSummaryResponse> getMySubmissions(String userEmail, Pageable pageable) {
        return submissionRepository
                .findByUserEmailWithProblem(userEmail, pageable)
                .map(this::toSummary);
    }

    /**
     * Get a single submission by ID.
     * Security: a regular user can only view their own submissions.
     *           an ADMIN can view any submission.
     */
    @Transactional(readOnly = true)
    public SubmissionResponse getById(Long id, Authentication auth) {
        Submission submission = submissionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Submission not found with id: " + id));

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // auth.getName() returns the principal identifier, which is the user's email
        if (!isAdmin && !submission.getUser().getEmail().equals(auth.getName())) {
            throw new AccessDeniedException("You can only view your own submissions");
        }

        return toResponse(submission);
    }

    // ─── DTO mappers ──────────────────────────────────────────────────────────

    private SubmissionResponse toResponse(Submission s) {
        return new SubmissionResponse(
                s.getId(),
                s.getProblem().getId(),
                s.getProblem().getTitle(),
                s.getProblem().getSlug(),
                s.getUser().getHandle(),
                s.getCode(),
                s.getLanguage().name(),
                s.getVerdict().name(),
                s.getExecutionTimeMs(),
                s.getErrorMessage(),
                s.getSubmittedAt()
        );
    }

    private SubmissionSummaryResponse toSummary(Submission s) {
        return new SubmissionSummaryResponse(
                s.getId(),
                s.getProblem().getId(),
                s.getProblem().getTitle(),
                s.getProblem().getSlug(),
                s.getLanguage().name(),
                s.getVerdict().name(),
                s.getExecutionTimeMs(),
                s.getSubmittedAt()
        );
    }
}
