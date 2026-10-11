package com.routinemate.dto;

import java.time.LocalDate;

public class DayProgressDto {
    private LocalDate date;
    private String dayName;
    private int total;
    private int completed;
    private int missed;
    private double percentage;

    public DayProgressDto() {}

    public DayProgressDto(LocalDate date, String dayName, int total, int completed, int missed, double percentage) {
        this.date = date;
        this.dayName = dayName;
        this.total = total;
        this.completed = completed;
        this.missed = missed;
        this.percentage = percentage;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getCompleted() {
        return completed;
    }

    public void setCompleted(int completed) {
        this.completed = completed;
    }

    public int getMissed() {
        return missed;
    }

    public void setMissed(int missed) {
        this.missed = missed;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
