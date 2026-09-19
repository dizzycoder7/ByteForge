package com.byteforge.repository;

import com.byteforge.entity.AssessmentProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentProblemRepository extends JpaRepository<AssessmentProblem, Long> {
    List<AssessmentProblem> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
    long countByAssessmentId(Long assessmentId);
}
