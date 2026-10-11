package com.routinemate.repository;

import com.routinemate.entity.RoutineCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineCompletionRepository extends JpaRepository<RoutineCompletion, Long> {

    Optional<RoutineCompletion> findByRoutineIdAndScheduledDate(Long routineId, LocalDate scheduledDate);

    List<RoutineCompletion> findByStudentIdAndScheduledDate(Long studentId, LocalDate scheduledDate);

    List<RoutineCompletion> findByStudentIdAndScheduledDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);

    long countByStudentIdAndScheduledDateAndStatus(Long studentId, LocalDate scheduledDate, String status);

    long countByStudentIdAndStatusAndScheduledDateBetween(Long studentId, String status, LocalDate startDate, LocalDate endDate);

    @Query("SELECT rc.routine.id, rc.routine.title, COUNT(rc) as compCount " +
           "FROM RoutineCompletion rc " +
           "WHERE rc.student.id = :studentId AND rc.status = 'COMPLETED' " +
           "GROUP BY rc.routine.id, rc.routine.title " +
           "ORDER BY compCount DESC")
    List<Object[]> findMostConsistentRoutineByStudent(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT rc.scheduledDate FROM RoutineCompletion rc " +
           "WHERE rc.student.id = :studentId AND rc.status = 'COMPLETED' " +
           "ORDER BY rc.scheduledDate DESC")
    List<LocalDate> findDistinctCompletedDatesByStudent(@Param("studentId") Long studentId);
}
