package com.byteforge.repository;

import com.byteforge.entity.AssessmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {
    List<AssessmentSubmission> findByAssessmentIdOrderBySubmittedAtDesc(Long assessmentId);
    List<AssessmentSubmission> findByStudentHandleOrderBySubmittedAtDesc(String studentHandle);
    List<AssessmentSubmission> findByAssessmentIdAndStudentHandleOrderBySubmittedAtDesc(Long assessmentId, String studentHandle);
    boolean existsByAssessmentIdAndStudentHandleAndProblemTitle(Long assessmentId, String studentHandle, String problemTitle);
    boolean existsByAssessmentIdAndStudentHandle(Long assessmentId, String studentHandle);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM AssessmentSubmission s WHERE s.assessmentId = :assessmentId AND s.studentHandle = :studentHandle")
    void deleteByAssessmentIdAndStudentHandle(
            @org.springframework.data.repository.query.Param("assessmentId") Long assessmentId,
            @org.springframework.data.repository.query.Param("studentHandle") String studentHandle);
}
