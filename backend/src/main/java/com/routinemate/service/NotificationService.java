package com.routinemate.service;

import com.routinemate.dto.NotificationHistoryDto;
import com.routinemate.entity.NotificationHistory;
import com.routinemate.entity.Routine;
import com.routinemate.entity.Student;
import com.routinemate.exception.ResourceNotFoundException;
import com.routinemate.repository.NotificationHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationHistoryRepository historyRepository;

    public NotificationService(NotificationHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationHistoryDto> getRecentNotifications(Long studentId) {
        return historyRepository.findByStudentIdOrderBySentAtDesc(studentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationHistoryDto> getTopRecentNotifications(Long studentId) {
        return historyRepository.findTop10ByStudentIdOrderBySentAtDesc(studentId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long studentId, Long notificationId) {
        NotificationHistory history = historyRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!history.getStudent().getId().equals(studentId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        history.setIsRead(true);
        historyRepository.save(history);
    }

    @Transactional
    public void markAllAsRead(Long studentId) {
        List<NotificationHistory> unreadList = historyRepository.findByStudentIdOrderBySentAtDesc(studentId);
        for (NotificationHistory item : unreadList) {
            if (!item.getIsRead()) {
                item.setIsRead(true);
            }
        }
        historyRepository.saveAll(unreadList);
    }

    @Transactional
    public NotificationHistory recordNotification(
            Student student,
            Routine routine,
            LocalDate scheduledDate,
            String notificationType,
            String title,
            String message,
            String deliveryStatus) {

        NotificationHistory record = new NotificationHistory(
                student,
                routine,
                scheduledDate,
                notificationType,
                title,
                message,
                deliveryStatus
        );
        return historyRepository.save(record);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long studentId) {
        return historyRepository.countByStudentIdAndIsReadFalse(studentId);
    }

    private NotificationHistoryDto toDto(NotificationHistory history) {
        NotificationHistoryDto dto = new NotificationHistoryDto();
        dto.setId(history.getId());
        dto.setScheduledDate(history.getScheduledDate());
        dto.setNotificationType(history.getNotificationType());
        dto.setTitle(history.getTitle());
        dto.setMessage(history.getMessage());
        dto.setSentAt(history.getSentAt());
        dto.setDeliveryStatus(history.getDeliveryStatus());
        dto.setIsRead(history.getIsRead());

        if (history.getRoutine() != null) {
            dto.setRoutineId(history.getRoutine().getId());
            dto.setRoutineTitle(history.getRoutine().getTitle());
        }
        return dto;
    }
}
