package com.routinemate.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_days", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"routine_id", "day_of_week"})
})
public class RoutineDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, etc.

    public RoutineDay() {}

    public RoutineDay(Routine routine, String dayOfWeek) {
        this.routine = routine;
        this.dayOfWeek = dayOfWeek;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
}
