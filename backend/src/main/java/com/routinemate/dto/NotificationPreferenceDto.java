package com.routinemate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;

public class NotificationPreferenceDto {

    private Boolean enabled;
    private Integer reminderIntervalMinutes;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime quietStart;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime quietEnd;

    private Boolean soundEnabled;
    private String theme;
    private String weekStartDay;

    public NotificationPreferenceDto() {}

    public NotificationPreferenceDto(Boolean enabled, Integer reminderIntervalMinutes, LocalTime quietStart, LocalTime quietEnd, Boolean soundEnabled, String theme, String weekStartDay) {
        this.enabled = enabled;
        this.reminderIntervalMinutes = reminderIntervalMinutes;
        this.quietStart = quietStart;
        this.quietEnd = quietEnd;
        this.soundEnabled = soundEnabled;
        this.theme = theme;
        this.weekStartDay = weekStartDay;
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
