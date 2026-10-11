package com.routinemate.repository;

import com.routinemate.entity.RoutineDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineDayRepository extends JpaRepository<RoutineDay, Long> {
    List<RoutineDay> findByRoutineId(Long routineId);
    void deleteByRoutineId(Long routineId);
}
