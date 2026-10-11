package com.routinemate.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "reminder_interval_minutes", nullable = false)
    private Integer reminderIntervalMinutes = 15;

    @Column(name = "quiet_start", nullable = false)
    private LocalTime quietStart = LocalTime.of(22, 0);

    @Column(name = "quiet_end", nullable = false)
    private LocalTime quietEnd = LocalTime.of(7, 0);

    @Column(name = "sound_enabled", nullable = false)
    private Boolean soundEnabled = true;

    @Column(nullable = false, length = 20)
    private String theme = "dark";

    @Column(name = "week_start_day", nullable = false, length = 15)
    private String weekStartDay = "MONDAY";

    public NotificationPreference() {}

    public NotificationPreference(Student student) {
        this.student = student;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getReminderIntervalMinutes() {
        return reminderIntervalMinutes;
    }

    public void setReminderIntervalMinutes(Integer reminderIntervalMinutes) {
        this.reminderIntervalMinutes = reminderIntervalMinutes;
    }

    public LocalTime getQuietStart() {
        return quietStart;
    }

    public void setQuietStart(LocalTime quietStart) {
        this.quietStart = quietStart;
    }

    public LocalTime getQuietEnd() {
        return quietEnd;
    }

    public void setQuietEnd(LocalTime quietEnd) {
        this.quietEnd = quietEnd;
    }

    public Boolean getSoundEnabled() {
        return soundEnabled;
    }

    public void setSoundEnabled(Boolean soundEnabled) {
        this.soundEnabled = soundEnabled;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getWeekStartDay() {
        return weekStartDay;
    }

    public void setWeekStartDay(String weekStartDay) {
        this.weekStartDay = weekStartDay;
    }
}
