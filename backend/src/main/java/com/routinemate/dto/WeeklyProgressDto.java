package com.routinemate.dto;

import java.util.List;

public class WeeklyProgressDto {

    private double dailyCompletionPercentage;
    private double weeklyCompletionRate;
    private int totalCompletedRoutines;
    private int totalMissedRoutines;
    private String mostConsistentRoutine;
    private int currentStreak;
    private int longestStreak;
    private List<DayProgressDto> lastSevenDays;

    public WeeklyProgressDto() {}

    public double getDailyCompletionPercentage() {
        return dailyCompletionPercentage;
    }

    public void setDailyCompletionPercentage(double dailyCompletionPercentage) {
        this.dailyCompletionPercentage = dailyCompletionPercentage;
    }

    public double getWeeklyCompletionRate() {
        return weeklyCompletionRate;
    }

    public void setWeeklyCompletionRate(double weeklyCompletionRate) {
        this.weeklyCompletionRate = weeklyCompletionRate;
    }

    public int getTotalCompletedRoutines() {
        return totalCompletedRoutines;
    }

    public void setTotalCompletedRoutines(int totalCompletedRoutines) {
        this.totalCompletedRoutines = totalCompletedRoutines;
    }

    public int getTotalMissedRoutines() {
        return totalMissedRoutines;
    }

    public void setTotalMissedRoutines(int totalMissedRoutines) {
        this.totalMissedRoutines = totalMissedRoutines;
    }

    public String getMostConsistentRoutine() {
        return mostConsistentRoutine;
    }

    public void setMostConsistentRoutine(String mostConsistentRoutine) {
        this.mostConsistentRoutine = mostConsistentRoutine;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public List<DayProgressDto> getLastSevenDays() {
        return lastSevenDays;
    }

    public void setLastSevenDays(List<DayProgressDto> lastSevenDays) {
        this.lastSevenDays = lastSevenDays;
    }
}
