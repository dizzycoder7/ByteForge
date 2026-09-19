package com.byteforge.repository;

import com.byteforge.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    Optional<Contest> findByCode(String code);
    List<Contest> findByStatusOrderByStartTimeAsc(String status);
    List<Contest> findAllByOrderByStartTimeDesc();
}
