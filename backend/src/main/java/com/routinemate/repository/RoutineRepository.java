package com.routinemate.repository;

import com.routinemate.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    List<Routine> findByStudentIdAndActiveTrueOrderByStartTimeAsc(Long studentId);

    List<Routine> findByStudentIdOrderByStartTimeAsc(Long studentId);

    Optional<Routine> findByIdAndStudentId(Long id, Long studentId);

    List<Routine> findAllByActiveTrue();

    @Query("SELECT r FROM Routine r WHERE r.student.id = :studentId AND r.active = true")
    List<Routine> findActiveByStudentId(@Param("studentId") Long studentId);
}
