package com.routinemate.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class DashboardSummaryDto {

    private String studentName;
    private LocalDate currentDate;
    private LocalTime currentTime;
    private int totalToday;
    private int completedToday;
    private int pendingToday;
    private int overdueToday;
    private double completionRate;

    private List<RoutineResponse> todaySchedule;
    private RoutineResponse upcomingRoutine;
    private List<NotificationHistoryDto> recentNotifications;
    private List<DayProgressDto> weeklyProductivity;

    public DashboardSummaryDto() {}

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public LocalDate getCurrentDate() {
        return currentDate;
    }

    public void setCurrentDate(LocalDate currentDate) {
        this.currentDate = currentDate;
    }

    public LocalTime getCurrentTime() {
        return currentTime;
    }

    public void setCurrentTime(LocalTime currentTime) {
        this.currentTime = currentTime;
    }

    public int getTotalToday() {
        return totalToday;
    }

    public void setTotalToday(int totalToday) {
        this.totalToday = totalToday;
    }

    public int getCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(int completedToday) {
        this.completedToday = completedToday;
    }

    public int getPendingToday() {
        return pendingToday;
    }

    public void setPendingToday(int pendingToday) {
        this.pendingToday = pendingToday;
    }

    public int getOverdueToday() {
        return overdueToday;
    }

    public void setOverdueToday(int overdueToday) {
        this.overdueToday = overdueToday;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public List<RoutineResponse> getTodaySchedule() {
        return todaySchedule;
    }

    public void setTodaySchedule(List<RoutineResponse> todaySchedule) {
        this.todaySchedule = todaySchedule;
    }

    public RoutineResponse getUpcomingRoutine() {
        return upcomingRoutine;
    }

    public void setUpcomingRoutine(RoutineResponse upcomingRoutine) {
        this.upcomingRoutine = upcomingRoutine;
    }

    public List<NotificationHistoryDto> getRecentNotifications() {
        return recentNotifications;
    }

    public void setRecentNotifications(List<NotificationHistoryDto> recentNotifications) {
        this.recentNotifications = recentNotifications;
    }

    public List<DayProgressDto> getWeeklyProductivity() {
        return weeklyProductivity;
    }

    public void setWeeklyProductivity(List<DayProgressDto> weeklyProductivity) {
        this.weeklyProductivity = weeklyProductivity;
    }
}
