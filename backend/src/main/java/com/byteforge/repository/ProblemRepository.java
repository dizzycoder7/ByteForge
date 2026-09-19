package com.byteforge.repository;

import com.byteforge.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Problem.
 *
 * The @SQLRestriction("is_deleted = false") on the Problem entity
 * automatically filters all queries here â€” no need to add "AND is_deleted = false"
 * to any query in this repository.
 *
 * N+1 Problem note:
 *   findPublishedProblems() loads a page of Problems. Each Problem has a lazy-
 *   loaded `author` (User). If we call getAuthor() for each problem in the service,
 *   Hibernate issues 1 query for the page + N queries for N authors = N+1 queries.
 *
 *   The @Query with JOIN FETCH solves this: Hibernate loads all authors in a
 *   single JOIN, so the total is 1 query (+ 1 count query for pagination).
 *
 *   The separate countQuery is required because JPQL JOIN FETCH is not valid
 *   in a COUNT query â€” Spring Data needs to count records separately.
 */
@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    /**
     * Paginated list of published, non-deleted problems with author eagerly loaded.
     * The JOIN FETCH prevents the N+1 select problem on the author field.
     */
    @Query(
        value      = "SELECT p FROM Problem p JOIN FETCH p.author WHERE p.published = true",
        countQuery = "SELECT COUNT(p) FROM Problem p WHERE p.published = true"
    )
    Page<Problem> findPublishedProblems(Pageable pageable);

    /** Used by the slug-generation logic to guarantee uniqueness. */
    boolean existsBySlug(String slug);

    Optional<Problem> findBySlug(String slug);
}

