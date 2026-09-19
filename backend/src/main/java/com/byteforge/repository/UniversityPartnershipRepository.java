package com.byteforge.repository;

import com.byteforge.entity.UniversityPartnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversityPartnershipRepository extends JpaRepository<UniversityPartnership, Long> {
    List<UniversityPartnership> findAllByOrderByCreatedAtDesc();
    boolean existsByCoordinatorEmail(String coordinatorEmail);
}
