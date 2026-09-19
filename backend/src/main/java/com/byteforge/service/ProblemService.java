package com.byteforge.service;

import com.byteforge.dto.ProblemRequest;
import com.byteforge.dto.ProblemResponse;
import com.byteforge.dto.ProblemSummaryResponse;
import com.byteforge.entity.Problem;
import com.byteforge.entity.User;
import com.byteforge.exception.ResourceNotFoundException;
import com.byteforge.repository.ProblemRepository;
import com.byteforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Business logic for problem CRUD operations.
 *
 * @Transactional at the class level means every public method runs inside a
 * transaction by default. This is important for two reasons:
 *   1. Lazy-loaded associations (like problem.getAuthor()) can be accessed
 *      safely because the Hibernate session stays open for the method's duration.
 *   2. If any step in a method throws an exception, the whole transaction rolls
 *      back automatically â€” data stays consistent.
 *
 * Read-only methods override with @Transactional(readOnly = true) as an
 * optimisation: Hibernate skips dirty-checking (tracking entity changes) for
 * read-only transactions, which reduces overhead on list/detail queries.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserRepository    userRepository;

    /**
     * Creates and persists a new problem.
     *
     * @param request     validated DTO from the controller
     * @param authorEmail email of the currently authenticated admin (from JWT)
     */
    public ProblemResponse create(ProblemRequest request, String authorEmail) {

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Author not found: " + authorEmail));

        String slug = generateUniqueSlug(request.title());

        Problem problem = Problem.builder()
                .title(request.title())
                .slug(slug)
                .description(request.description())
                .inputFormat(request.inputFormat())
                .outputFormat(request.outputFormat())
                .constraints(request.constraints())
                .difficulty(request.difficulty())
                .timeLimitMs(request.timeLimitMs()  != null ? request.timeLimitMs()  : 2000)
                .memoryLimitMb(request.memoryLimitMb() != null ? request.memoryLimitMb() : 256)
                .author(author)
                .published(request.published())
                .deleted(false)
                .build();

        return toResponse(problemRepository.save(problem));
    }

    /**
     * Returns a paginated list of published problems.
     * readOnly = true: skips Hibernate dirty-check for performance.
     */
    @Transactional(readOnly = true)
    public Page<ProblemSummaryResponse> getAllPublished(Pageable pageable) {
        return problemRepository.findPublishedProblems(pageable)
                .map(this::toSummary);
    }

    /**
     * Returns full detail for a single problem.
     * Accessible publicly â€” does NOT filter by published status intentionally,
     * so admins can preview draft problems by ID.
     */
    @Transactional(readOnly = true)
    public ProblemResponse getById(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        return toResponse(problem);
    }

    /** Lookup by URL slug — used by the frontend detail page route /problems/:slug */
    @Transactional(readOnly = true)
    public ProblemResponse getBySlug(String slug) {
        Problem problem = problemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + slug));
        return toResponse(problem);
    }

    /**
     * Updates mutable fields of an existing problem.
     * Slug is intentionally NOT updated even if the title changes,
     * to preserve stable URLs for bookmarks and external links.
     */
    public ProblemResponse update(Long id, ProblemRequest request) {

        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));

        problem.setTitle(request.title());
        problem.setDescription(request.description());
        problem.setInputFormat(request.inputFormat());
        problem.setOutputFormat(request.outputFormat());
        problem.setConstraints(request.constraints());
        problem.setDifficulty(request.difficulty());
        problem.setPublished(request.published());

        if (request.timeLimitMs()  != null) problem.setTimeLimitMs(request.timeLimitMs());
        if (request.memoryLimitMb() != null) problem.setMemoryLimitMb(request.memoryLimitMb());

        // @PreUpdate in Problem entity will auto-update the updatedAt timestamp.
        // No need to call problemRepository.save() explicitly â€” within a transaction,
        // changes to a managed entity are automatically flushed (dirty-checking).
        return toResponse(problem);
    }

    /**
     * Soft-deletes a problem by setting is_deleted = true.
     * The @SQLRestriction on Problem makes the row invisible to all future queries.
     * The row stays in the DB, preserving referential integrity for submissions.
     */
    public void delete(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        problem.setDeleted(true);
        // Dirty-checking flushes the flag change â€” no explicit save() needed.
    }

    // â”€â”€â”€ Slug generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Generates a URL-friendly slug from a title.
     * "Two Sum"  â†’ "two-sum"
     * "A+B Problem" â†’ "ab-problem"
     *
     * If the base slug already exists (e.g., someone already has "two-sum"),
     * we append a counter: "two-sum-1", "two-sum-2", etc.
     */
    private String generateUniqueSlug(String title) {
        String base = title.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "") // remove non-alphanumeric (except space/hyphen)
                .trim()
                .replaceAll("\\s+", "-")          // spaces â†’ hyphens
                .replaceAll("-+", "-");            // collapse consecutive hyphens

        String slug    = base;
        int    counter = 1;

        while (problemRepository.existsBySlug(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    // â”€â”€â”€ DTO mappers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private ProblemResponse toResponse(Problem p) {
        return new ProblemResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getDescription(),
                p.getInputFormat(),
                p.getOutputFormat(),
                p.getConstraints(),
                p.getDifficulty().name(),
                p.getTimeLimitMs(),
                p.getMemoryLimitMb(),
                p.getAuthor().getHandle(),  // triggers lazy load â€” safe inside @Transactional
                p.isPublished(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private ProblemSummaryResponse toSummary(Problem p) {
        return new ProblemSummaryResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getDifficulty().name(),
                p.isPublished(),
                p.getAuthor().getHandle(),
                p.getCreatedAt()
        );
    }
}

