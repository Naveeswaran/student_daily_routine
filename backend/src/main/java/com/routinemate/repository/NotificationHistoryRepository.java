package com.routinemate.repository;

import com.routinemate.entity.NotificationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, Long> {

    List<NotificationHistory> findByStudentIdOrderBySentAtDesc(Long studentId);

    List<NotificationHistory> findTop10ByStudentIdOrderBySentAtDesc(Long studentId);

    List<NotificationHistory> findByStudentIdAndScheduledDate(Long studentId, LocalDate scheduledDate);

    boolean existsByRoutineIdAndScheduledDateAndNotificationType(Long routineId, LocalDate scheduledDate, String notificationType);

    long countByStudentIdAndIsReadFalse(Long studentId);
}
