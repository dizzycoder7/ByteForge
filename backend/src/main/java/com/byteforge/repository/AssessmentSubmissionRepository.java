package com.byteforge.repository;

import com.byteforge.entity.AssessmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {
    List<AssessmentSubmission> findByAssessmentIdOrderBySubmittedAtDesc(Long assessmentId);
    List<AssessmentSubmission> findByStudentHandleOrderBySubmittedAtDesc(String studentHandle);
}
