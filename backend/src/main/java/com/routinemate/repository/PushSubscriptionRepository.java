package com.routinemate.repository;

import com.routinemate.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByStudentId(Long studentId);
    Optional<PushSubscription> findByStudentIdAndEndpoint(Long studentId, String endpoint);
    void deleteByStudentIdAndEndpoint(Long studentId, String endpoint);
}
