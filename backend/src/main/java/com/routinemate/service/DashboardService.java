package com.routinemate.service;

import com.routinemate.dto.DashboardSummaryDto;
import com.routinemate.dto.DayProgressDto;
import com.routinemate.dto.NotificationHistoryDto;
import com.routinemate.dto.RoutineResponse;
import com.routinemate.entity.Student;
import com.routinemate.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final RoutineService routineService;
    private final NotificationService notificationService;
    private final StudentRepository studentRepository;

    public DashboardService(
            RoutineService routineService,
            NotificationService notificationService,
            StudentRepository studentRepository) {
        this.routineService = routineService;
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getTodayDashboard(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        String name = student != null ? student.getName() : "Student";

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<RoutineResponse> todayRoutines = routineService.getRoutinesForDate(studentId, today);

        int total = todayRoutines.size();
        int completed = (int) todayRoutines.stream()
                .filter(r -> "COMPLETED".equals(r.getStatus()))
                .count();
        int overdue = (int) todayRoutines.stream()
                .filter(r -> "OVERDUE".equals(r.getStatus()))
                .count();
        int pending = (int) todayRoutines.stream()
                .filter(r -> "PENDING".equals(r.getCompletionStatus()) && !"OVERDUE".equals(r.getStatus()))
                .count();

        double completionRate = total > 0 ? Math.round(((double) completed / total) * 1000.0) / 10.0 : 0.0;

        // Upcoming routine: next incomplete routine today
        RoutineResponse upcoming = todayRoutines.stream()
                .filter(r -> !"COMPLETED".equals(r.getStatus()) && !"SKIPPED".equals(r.getStatus()))
                .findFirst()
                .orElse(null);

        List<NotificationHistoryDto> recentNotifications = notificationService.getTopRecentNotifications(studentId);

        // Weekly productivity (last 7 days)
        List<DayProgressDto> weeklyProductivity = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<RoutineResponse> dayRoutines = routineService.getRoutinesForDate(studentId, d);
            int dayTotal = dayRoutines.size();
            int dayComp = (int) dayRoutines.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
            int dayMissed = (int) dayRoutines.stream().filter(r -> "OVERDUE".equals(r.getStatus()) || "SKIPPED".equals(r.getStatus())).count();
            double pct = dayTotal > 0 ? Math.round(((double) dayComp / dayTotal) * 1000.0) / 10.0 : 0.0;
            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            weeklyProductivity.add(new DayProgressDto(d, dayName, dayTotal, dayComp, dayMissed, pct));
        }

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setStudentName(name);
        summary.setCurrentDate(today);
        summary.setCurrentTime(now);
        summary.setTotalToday(total);
        summary.setCompletedToday(completed);
        summary.setPendingToday(pending);
        summary.setOverdueToday(overdue);
        summary.setCompletionRate(completionRate);
        summary.setTodaySchedule(todayRoutines);
        summary.setUpcomingRoutine(upcoming);
        summary.setRecentNotifications(recentNotifications);
        summary.setWeeklyProductivity(weeklyProductivity);

        return summary;
    }
}
