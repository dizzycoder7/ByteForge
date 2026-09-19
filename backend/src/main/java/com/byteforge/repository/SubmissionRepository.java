package com.byteforge.repository;

import com.byteforge.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Submission.
 *
 * Both custom queries use JOIN FETCH to prevent N+1 on the Problem relation.
 *
 * findByIdWithDetails: loads submission + user + problem in one JOIN.
 *   Used by getById() and the judge to retrieve all needed data fresh.
 *
 * findByUserEmailWithProblem: paginates a user's submissions with problem
 *   eagerly loaded (avoids N+1 when mapping each row to a summary DTO).
 */
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * Load a single submission with user and problem eagerly joined.
     * Used by getById() and JudgeService to avoid lazy-load issues.
     */
    @Query("SELECT s FROM Submission s " +
           "JOIN FETCH s.user " +
           "JOIN FETCH s.problem " +
           "WHERE s.id = :id")
    Optional<Submission> findByIdWithDetails(@Param("id") Long id);

    /**
     * Paginated submission history for a specific user, with problem joined.
     * The separate countQuery omits JOIN FETCH (invalid in COUNT queries).
     */
    @Query(
        value      = "SELECT s FROM Submission s JOIN FETCH s.problem " +
                     "WHERE s.user.email = :email",
        countQuery = "SELECT COUNT(s) FROM Submission s WHERE s.user.email = :email"
    )
    Page<Submission> findByUserEmailWithProblem(
            @Param("email") String email, Pageable pageable);

    // ── Leaderboard ───────────────────────────────────────────────────────────

    /**
     * Leaderboard query: ranks users by distinct problems solved.
     *
     * SQL breakdown (interview-ready explanation):
     *   INNER JOIN       → only users who have at least one submission
     *   COUNT(DISTINCT CASE WHEN verdict='ACCEPTED' THEN problem_id END)
     *                    → counts unique problems solved (AC) per user,
     *                       ignoring duplicate AC submissions for same problem
     *   COUNT(s.id)      → total submissions (all verdicts)
     *   GROUP BY u.id    → aggregate per user
     *   ORDER BY problems_solved DESC → highest solvers first
     *
     * Why native SQL and not JPQL?
     *   JPQL doesn't support CASE expressions inside COUNT(DISTINCT ...).
     *   Native SQL gives us full MySQL power when JPQL falls short.
     */
    @Query(
        value = """
            SELECT u.username          AS username,
                   COALESCE(u.college_name, 'Independent Coder') AS college_name,
                   COUNT(DISTINCT CASE WHEN s.verdict = 'ACCEPTED'
                                       THEN s.problem_id END) AS problems_solved,
                   COUNT(s.id)                                 AS total_submissions
            FROM users u
            INNER JOIN submissions s ON s.user_id = u.id
            GROUP BY u.id, u.username, u.college_name
            ORDER BY problems_solved DESC, u.username ASC
            """,
        countQuery = """
            SELECT COUNT(DISTINCT u.id)
            FROM users u
            INNER JOIN submissions s ON s.user_id = u.id
            """,
        nativeQuery = true
    )
    Page<Object[]> findLeaderboardData(Pageable pageable);

    @Query(
        value = """
            SELECT u.username          AS username,
                   COALESCE(u.college_name, 'Independent Coder') AS college_name,
                   COUNT(DISTINCT CASE WHEN s.verdict = 'ACCEPTED'
                                       THEN s.problem_id END) AS problems_solved,
                   COUNT(s.id)                                 AS total_submissions
            FROM users u
            INNER JOIN submissions s ON s.user_id = u.id
            WHERE LOWER(u.college_name) LIKE LOWER(CONCAT('%', :college, '%'))
            GROUP BY u.id, u.username, u.college_name
            ORDER BY problems_solved DESC, u.username ASC
            """,
        countQuery = """
            SELECT COUNT(DISTINCT u.id)
            FROM users u
            INNER JOIN submissions s ON s.user_id = u.id
            WHERE LOWER(u.college_name) LIKE LOWER(CONCAT('%', :college, '%'))
            """,
        nativeQuery = true
    )
    Page<Object[]> findLeaderboardDataByCollege(
            @Param("college") String college, Pageable pageable);

    // ── Profile stats ─────────────────────────────────────────────────────────

    /** Total number of submissions (all verdicts) made by a user. */
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.user.username = :handle")
    long countTotalByHandle(@Param("handle") String handle);

    /** Number of DISTINCT problems solved (at least one AC submission). */
    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s " +
           "WHERE s.user.username = :handle AND s.verdict = 'ACCEPTED'")
    long countProblemsSolvedByHandle(@Param("handle") String handle);

    /** Problems solved filtered by difficulty — used for EASY/MEDIUM/HARD breakdown. */
    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s " +
           "WHERE s.user.username = :handle AND s.verdict = 'ACCEPTED' " +
           "AND s.problem.difficulty = :difficulty")
    long countProblemsSolvedByDifficulty(
            @Param("handle") String handle,
            @Param("difficulty") com.byteforge.entity.Difficulty difficulty);
}
