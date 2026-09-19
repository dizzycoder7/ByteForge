package com.byteforge.repository;

import com.byteforge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByCategoryOrderByEnrolledCountDesc(String category);
    List<Course> findAllByOrderByEnrolledCountDesc();
}
