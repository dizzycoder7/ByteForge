package com.byteforge.repository;

import com.byteforge.entity.Problem;
import com.byteforge.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TestCase.
 *
 * Derived query method breakdown:
 *   findByProblemIdOrderByOrderIndexAsc
 *     → WHERE problem_id = ? ORDER BY order_index ASC
 *
 *   findByProblemIdAndSampleTrueOrderByOrderIndexAsc
 *     → WHERE problem_id = ? AND is_sample = true ORDER BY order_index ASC
 *     → Used for the public-facing "sample test cases" endpoint.
 */
@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    /** All test cases for a problem (admin + judging use). */
    List<TestCase> findByProblemIdOrderByOrderIndexAsc(Long problemId);

    /** Only sample (public) test cases — shown on the problem page. */
    List<TestCase> findByProblemIdAndSampleTrueOrderByOrderIndexAsc(Long problemId);

    /** Used to cascade test case deletion when a problem is hard-deleted. */
    void deleteByProblem(Problem problem);
}
