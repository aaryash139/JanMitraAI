package com.constituency.engine.repository;

import com.constituency.engine.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByWardId(Long wardId);
    long countByWardId(Long wardId);
}
