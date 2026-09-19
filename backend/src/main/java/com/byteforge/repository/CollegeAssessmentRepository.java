package com.byteforge.repository;

import com.byteforge.entity.CollegeAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollegeAssessmentRepository extends JpaRepository<CollegeAssessment, Long> {
    List<CollegeAssessment> findAllByOrderByCreatedAtDesc();
    List<CollegeAssessment> findByCollegeNameOrderByCreatedAtDesc(String collegeName);
    List<CollegeAssessment> findByCollegeNameContainingIgnoreCaseOrderByCreatedAtDesc(String collegeName);
}
