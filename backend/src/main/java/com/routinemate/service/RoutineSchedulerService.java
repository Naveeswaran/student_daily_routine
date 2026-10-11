package com.routinemate.service;

import com.routinemate.entity.NotificationPreference;
import com.routinemate.entity.Routine;
import com.routinemate.entity.RoutineCompletion;
import com.routinemate.entity.Student;
import com.routinemate.repository.NotificationHistoryRepository;
import com.routinemate.repository.NotificationPreferenceRepository;
import com.routinemate.repository.RoutineCompletionRepository;
import com.routinemate.repository.RoutineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RoutineSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(RoutineSchedulerService.class);

    private final RoutineRepository routineRepository;
    private final RoutineCompletionRepository completionRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationHistoryRepository historyRepository;
    private final PushNotificationService pushNotificationService;
    private final NotificationService notificationService;
    private final RoutineService routineService;

    public RoutineSchedulerService(
            RoutineRepository routineRepository,
            RoutineCompletionRepository completionRepository,
            NotificationPreferenceRepository preferenceRepository,
            NotificationHistoryRepository historyRepository,
            PushNotificationService pushNotificationService,
            NotificationService notificationService,
            RoutineService routineService) {
        this.routineRepository = routineRepository;
        this.completionRepository = completionRepository;
        this.preferenceRepository = preferenceRepository;
        this.historyRepository = historyRepository;
        this.pushNotificationService = pushNotificationService;
        this.notificationService = notificationService;
        this.routineService = routineService;
    }

    @Scheduled(fixedDelay = 30000) // Runs every 30 seconds
    public void checkAndSendRoutineReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Routine> activeRoutines = routineRepository.findAllByActiveTrue();

        for (Routine routine : activeRoutines) {
            try {
                processRoutineNotification(routine, today, now);
            } catch (Exception ex) {
                logger.error("Error evaluating reminder for routine id {}: {}", routine.getId(), ex.getMessage());
            }
        }
    }

    private void processRoutineNotification(Routine routine, LocalDate today, LocalTime now) {
        // 1. Verify routine applies to today
        if (!routineService.isRoutineOnDate(routine, today)) {
            return;
        }

        Student student = routine.getStudent();
        NotificationPreference pref = preferenceRepository.findByStudentId(student.getId())
                .orElse(null);

        // 2. Check if student has disabled notifications
        if (pref != null && Boolean.FALSE.equals(pref.getEnabled())) {
            return;
        }

        // 3. Check quiet hours
        if (pref != null && isInQuietHours(now, pref.getQuietStart(), pref.getQuietEnd())) {
            logger.debug("Quiet hours active for student {}. Suppressing reminder for routine {}", student.getId(), routine.getTitle());
            return;
        }

        // 4. Check if routine is already completed or skipped
        Optional<RoutineCompletion> completion = completionRepository.findByRoutineIdAndScheduledDate(routine.getId(), today);
        if (completion.isPresent()) {
            String status = completion.get().getStatus();
            if ("COMPLETED".equalsIgnoreCase(status) || "SKIPPED".equalsIgnoreCase(status)) {
                // Done or skipped, no reminders
                return;
            }
        }

        // 5. Evaluate DUE REMINDER
        int reminderMinutes = routine.getReminderTimeMinutes() != null ? routine.getReminderTimeMinutes() : 0;
        LocalTime dueReminderTime = routine.getStartTime().minusMinutes(reminderMinutes);

        // Has due reminder time arrived?
        if (!now.isBefore(dueReminderTime)) {
            boolean alreadySentDue = historyRepository.existsByRoutineIdAndScheduledDateAndNotificationType(
                    routine.getId(), today, "DUE_REMINDER");

            if (!alreadySentDue) {
                sendDueReminder(student, routine, today);
                return; // sent due reminder this cycle
            }
        }

        // 6. Evaluate FOLLOW-UP REMINDER (if overdue)
        int followUpDelay = (pref != null && pref.getReminderIntervalMinutes() != null)
                ? pref.getReminderIntervalMinutes()
                : 15;
        LocalTime followUpTime = routine.getStartTime().plusMinutes(followUpDelay);

        if (!now.isBefore(followUpTime)) {
            boolean alreadySentFollowup = historyRepository.existsByRoutineIdAndScheduledDateAndNotificationType(
                    routine.getId(), today, "FOLLOWUP_REMINDER");

            if (!alreadySentFollowup) {
                sendFollowupReminder(student, routine, today);
            }
        }
    }

    private void sendDueReminder(Student student, Routine routine, LocalDate today) {
        String title = "RoutineMate – Routine Reminder";
        String message = "Your " + routine.getCategory() + " routine '" + routine.getTitle() + "' is scheduled for "
                + routine.getStartTime().toString() + ". Time to make progress!";

        Map<String, Object> data = new HashMap<>();
        data.put("routineId", routine.getId());
        data.put("type", "DUE_REMINDER");
        data.put("title", routine.getTitle());

        boolean pushDelivered = pushNotificationService.sendPushNotification(student, title, message, data);
        String deliveryStatus = pushDelivered ? "DELIVERED" : "SENT";

        notificationService.recordNotification(student, routine, today, "DUE_REMINDER", title, message, deliveryStatus);
        logger.info("Sent due reminder for routine '{}' to student {}", routine.getTitle(), student.getEmail());
    }

    private void sendFollowupReminder(Student student, Routine routine, LocalDate today) {
        String title = "RoutineMate – Overdue Follow-up";
        String message = "Your routine '" + routine.getTitle() + "' was scheduled for "
                + routine.getStartTime().toString() + " and is still incomplete. Complete it now to keep your streak!";

        Map<String, Object> data = new HashMap<>();
        data.put("routineId", routine.getId());
        data.put("type", "FOLLOWUP_REMINDER");
        data.put("title", routine.getTitle());

        boolean pushDelivered = pushNotificationService.sendPushNotification(student, title, message, data);
        String deliveryStatus = pushDelivered ? "DELIVERED" : "SENT";

        notificationService.recordNotification(student, routine, today, "FOLLOWUP_REMINDER", title, message, deliveryStatus);
        logger.info("Sent follow-up reminder for routine '{}' to student {}", routine.getTitle(), student.getEmail());
    }

    private boolean isInQuietHours(LocalTime now, LocalTime quietStart, LocalTime quietEnd) {
        if (quietStart == null || quietEnd == null) return false;
        if (quietStart.equals(quietEnd)) return false;

        if (quietStart.isAfter(quietEnd)) {
            // Spans midnight, e.g., 22:00 to 07:00
            return !now.isBefore(quietStart) || now.isBefore(quietEnd);
        } else {
            // Same day, e.g., 13:00 to 15:00
            return !now.isBefore(quietStart) && now.isBefore(quietEnd);
        }
    }
}
