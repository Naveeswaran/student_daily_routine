package com.routinemate.service;

import com.routinemate.dto.RoutineRequest;
import com.routinemate.dto.RoutineResponse;
import com.routinemate.entity.Routine;
import com.routinemate.entity.RoutineCompletion;
import com.routinemate.entity.RoutineDay;
import com.routinemate.entity.Student;
import com.routinemate.exception.BadRequestException;
import com.routinemate.exception.ResourceNotFoundException;
import com.routinemate.repository.RoutineCompletionRepository;
import com.routinemate.repository.RoutineRepository;
import com.routinemate.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineCompletionRepository completionRepository;
    private final StudentRepository studentRepository;

    public RoutineService(
            RoutineRepository routineRepository,
            RoutineCompletionRepository completionRepository,
            StudentRepository studentRepository) {
        this.routineRepository = routineRepository;
        this.completionRepository = completionRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<RoutineResponse> getAllRoutines(Long studentId) {
        List<Routine> routines = routineRepository.findByStudentIdOrderByStartTimeAsc(studentId);
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<RoutineCompletion> completions = completionRepository.findByStudentIdAndScheduledDate(studentId, today);
        Map<Long, RoutineCompletion> completionMap = completions.stream()
                .collect(Collectors.toMap(c -> c.getRoutine().getId(), c -> c, (c1, c2) -> c1));

        return routines.stream()
                .map(r -> toResponse(r, today, completionMap.get(r.getId()), now))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoutineResponse> getRoutinesForDate(Long studentId, LocalDate date) {
        List<Routine> routines = routineRepository.findByStudentIdAndActiveTrueOrderByStartTimeAsc(studentId);
        LocalTime now = LocalTime.now();

        List<RoutineCompletion> completions = completionRepository.findByStudentIdAndScheduledDate(studentId, date);
        Map<Long, RoutineCompletion> completionMap = completions.stream()
                .collect(Collectors.toMap(c -> c.getRoutine().getId(), c -> c, (c1, c2) -> c1));

        return routines.stream()
                .filter(r -> isRoutineOnDate(r, date))
                .map(r -> toResponse(r, date, completionMap.get(r.getId()), now))
                .sorted(Comparator.comparing(RoutineResponse::getStartTime))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoutineResponse getRoutineById(Long studentId, Long routineId) {
        Routine routine = routineRepository.findByIdAndStudentId(routineId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + routineId));

        LocalDate today = LocalDate.now();
        Optional<RoutineCompletion> comp = completionRepository.findByRoutineIdAndScheduledDate(routineId, today);
        return toResponse(routine, today, comp.orElse(null), LocalTime.now());
    }

    @Transactional
    public RoutineResponse createRoutine(Long studentId, RoutineRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Routine routine = new Routine();
        routine.setStudent(student);
        mapRequestToEntity(request, routine);

        Routine saved = routineRepository.save(routine);
        return toResponse(saved, LocalDate.now(), null, LocalTime.now());
    }

    @Transactional
    public RoutineResponse updateRoutine(Long studentId, Long routineId, RoutineRequest request) {
        Routine routine = routineRepository.findByIdAndStudentId(routineId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + routineId));

        mapRequestToEntity(request, routine);
        Routine saved = routineRepository.save(routine);

        LocalDate today = LocalDate.now();
        Optional<RoutineCompletion> comp = completionRepository.findByRoutineIdAndScheduledDate(routineId, today);
        return toResponse(saved, today, comp.orElse(null), LocalTime.now());
    }

    @Transactional
    public void deleteRoutine(Long studentId, Long routineId) {
        Routine routine = routineRepository.findByIdAndStudentId(routineId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + routineId));
        routineRepository.delete(routine);
    }

    @Transactional
    public RoutineResponse updateCompletionStatus(Long studentId, Long routineId, LocalDate date, String status) {
        Routine routine = routineRepository.findByIdAndStudentId(routineId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + routineId));

        String normalizedStatus = status.toUpperCase().trim();
        if (!List.of("COMPLETED", "SKIPPED", "PENDING").contains(normalizedStatus)) {
            throw new BadRequestException("Invalid status: " + status + ". Allowed values: COMPLETED, SKIPPED, PENDING");
        }

        Optional<RoutineCompletion> existingOpt = completionRepository.findByRoutineIdAndScheduledDate(routineId, date);

        RoutineCompletion completion;
        if ("PENDING".equals(normalizedStatus)) {
            existingOpt.ifPresent(completionRepository::delete);
            completion = null;
        } else {
            completion = existingOpt.orElseGet(() -> {
                RoutineCompletion newComp = new RoutineCompletion();
                newComp.setRoutine(routine);
                newComp.setStudent(routine.getStudent());
                newComp.setScheduledDate(date);
                return newComp;
            });
            completion.setStatus(normalizedStatus);
            completion.setCompletedAt(LocalDateTime.now());
            completion = completionRepository.save(completion);
        }

        return toResponse(routine, date, completion, LocalTime.now());
    }

    public boolean isRoutineOnDate(Routine routine, LocalDate date) {
        if (!routine.getActive()) return false;
        if (date.isBefore(routine.getStartDate())) return false;

        String repeat = routine.getRepeatType().toLowerCase();
        if ("once".equals(repeat)) {
            return routine.getStartDate().equals(date);
        } else if ("daily".equals(repeat)) {
            return true;
        } else if ("weekdays".equals(repeat)) {
            String dayName = date.getDayOfWeek().name();
            if (routine.getRecurringDays() == null || routine.getRecurringDays().isEmpty()) {
                // Default Mon-Fri if weekdays selected but no specific days provided
                return date.getDayOfWeek().getValue() <= 5;
            }
            return routine.getRecurringDays().stream()
                    .anyMatch(d -> d.getDayOfWeek().equalsIgnoreCase(dayName));
        }
        return false;
    }

    private void mapRequestToEntity(RoutineRequest request, Routine routine) {
        routine.setTitle(request.getTitle().trim());
        routine.setDescription(request.getDescription());
        routine.setCategory(request.getCategory() != null ? request.getCategory().trim() : "Study");
        routine.setStartTime(request.getStartTime());
        routine.setEndTime(request.getEndTime());
        routine.setStartDate(request.getStartDate());
        routine.setRepeatType(request.getRepeatType().toLowerCase().trim());
        routine.setPriority(request.getPriority() != null ? request.getPriority().toLowerCase().trim() : "medium");
        routine.setReminderTimeMinutes(request.getReminderTimeMinutes() != null ? request.getReminderTimeMinutes() : 0);
        routine.setActive(request.getActive() != null ? request.getActive() : true);

        routine.clearDays();
        if ("weekdays".equalsIgnoreCase(routine.getRepeatType()) && request.getRecurringDays() != null) {
            for (String day : request.getRecurringDays()) {
                if (day != null && !day.isBlank()) {
                    routine.addDay(day.trim().toUpperCase());
                }
            }
        }
    }

    private RoutineResponse toResponse(Routine routine, LocalDate date, RoutineCompletion completion, LocalTime now) {
        RoutineResponse dto = new RoutineResponse();
        dto.setId(routine.getId());
        dto.setStudentId(routine.getStudent().getId());
        dto.setTitle(routine.getTitle());
        dto.setDescription(routine.getDescription());
        dto.setCategory(routine.getCategory());
        dto.setStartTime(routine.getStartTime());
        dto.setEndTime(routine.getEndTime());
        dto.setStartDate(routine.getStartDate());
        dto.setRepeatType(routine.getRepeatType());
        dto.setPriority(routine.getPriority());
        dto.setReminderTimeMinutes(routine.getReminderTimeMinutes());
        dto.setActive(routine.getActive());
        dto.setCreatedAt(routine.getCreatedAt());

        List<String> days = routine.getRecurringDays().stream()
                .map(RoutineDay::getDayOfWeek)
                .collect(Collectors.toList());
        dto.setRecurringDays(days);

        LocalDate today = LocalDate.now();

        if (completion != null) {
            dto.setStatus(completion.getStatus());
            dto.setCompletionStatus(completion.getStatus());
            dto.setCompletedAt(completion.getCompletedAt());
            dto.setDueNow(false);
            dto.setOverdue(false);
        } else {
            dto.setCompletionStatus("PENDING");
            if (date.isBefore(today)) {
                dto.setStatus("OVERDUE");
                dto.setOverdue(true);
                dto.setDueNow(false);
            } else if (date.isAfter(today)) {
                dto.setStatus("UPCOMING");
                dto.setDueNow(false);
                dto.setOverdue(false);
            } else {
                // Today
                if (now.isAfter(routine.getStartTime())) {
                    dto.setStatus("OVERDUE");
                    dto.setOverdue(true);
                    dto.setDueNow(false);
                } else {
                    LocalTime reminderTime = routine.getStartTime().minusMinutes(
                            routine.getReminderTimeMinutes() > 0 ? routine.getReminderTimeMinutes() : 15
                    );
                    if (!now.isBefore(reminderTime)) {
                        dto.setStatus("DUE_SOON");
                        dto.setDueNow(true);
                        dto.setOverdue(false);
                    } else {
                        dto.setStatus("UPCOMING");
                        dto.setDueNow(false);
                        dto.setOverdue(false);
                    }
                }
            }
        }

        return dto;
    }
}
