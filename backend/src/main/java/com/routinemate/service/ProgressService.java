package com.routinemate.service;

import com.routinemate.dto.DayProgressDto;
import com.routinemate.dto.RoutineResponse;
import com.routinemate.dto.WeeklyProgressDto;
import com.routinemate.repository.RoutineCompletionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ProgressService {

    private final RoutineService routineService;
    private final RoutineCompletionRepository completionRepository;

    public ProgressService(RoutineService routineService, RoutineCompletionRepository completionRepository) {
        this.routineService = routineService;
        this.completionRepository = completionRepository;
    }

    @Transactional(readOnly = true)
    public WeeklyProgressDto getWeeklyProgress(Long studentId) {
        LocalDate today = LocalDate.now();

        List<DayProgressDto> lastSevenDays = new ArrayList<>();
        int totalCompleted = 0;
        int totalMissed = 0;
        int totalScheduled = 0;

        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<RoutineResponse> dayRoutines = routineService.getRoutinesForDate(studentId, d);
            int dayTotal = dayRoutines.size();
            int dayComp = (int) dayRoutines.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
            int dayMissed = (int) dayRoutines.stream().filter(r -> "OVERDUE".equals(r.getStatus()) || "SKIPPED".equals(r.getStatus())).count();
            double pct = dayTotal > 0 ? Math.round(((double) dayComp / dayTotal) * 1000.0) / 10.0 : 0.0;

            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            lastSevenDays.add(new DayProgressDto(d, dayName, dayTotal, dayComp, dayMissed, pct));

            totalCompleted += dayComp;
            totalMissed += dayMissed;
            totalScheduled += dayTotal;
        }

        double weeklyRate = totalScheduled > 0 ? Math.round(((double) totalCompleted / totalScheduled) * 1000.0) / 10.0 : 0.0;
        double todayRate = !lastSevenDays.isEmpty() ? lastSevenDays.get(lastSevenDays.size() - 1).getPercentage() : 0.0;

        // Most consistent routine
        List<Object[]> mostConsistentList = completionRepository.findMostConsistentRoutineByStudent(studentId);
        String mostConsistent = "None yet";
        if (!mostConsistentList.isEmpty()) {
            Object[] row = mostConsistentList.get(0);
            String title = (String) row[1];
            Number count = (Number) row[2];
            mostConsistent = title + " (" + count + " completions)";
        }

        // Streaks calculation
        List<LocalDate> completedDates = completionRepository.findDistinctCompletedDatesByStudent(studentId);
        Set<LocalDate> dateSet = new HashSet<>(completedDates);

        int currentStreak = 0;
        LocalDate checkDate = today;

        // If today has completed routines, count from today; otherwise if yesterday was completed, count from yesterday
        if (!dateSet.contains(checkDate)) {
            checkDate = today.minusDays(1);
        }

        while (dateSet.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }

        // Longest streak
        int longestStreak = 0;
        if (!completedDates.isEmpty()) {
            List<LocalDate> sortedDates = new ArrayList<>(dateSet);
            Collections.sort(sortedDates);
            int streak = 0;
            LocalDate prev = null;
            for (LocalDate date : sortedDates) {
                if (prev == null || prev.plusDays(1).equals(date)) {
                    streak++;
                } else {
                    streak = 1;
                }
                if (streak > longestStreak) {
                    longestStreak = streak;
                }
                prev = date;
            }
        }

        WeeklyProgressDto dto = new WeeklyProgressDto();
        dto.setDailyCompletionPercentage(todayRate);
        dto.setWeeklyCompletionRate(weeklyRate);
        dto.setTotalCompletedRoutines(totalCompleted);
        dto.setTotalMissedRoutines(totalMissed);
        dto.setMostConsistentRoutine(mostConsistent);
        dto.setCurrentStreak(currentStreak);
        dto.setLongestStreak(Math.max(longestStreak, currentStreak));
        dto.setLastSevenDays(lastSevenDays);

        return dto;
    }
}
