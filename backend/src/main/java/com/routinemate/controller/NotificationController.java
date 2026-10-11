package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.NotificationHistoryDto;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationHistoryDto>>> getNotifications() {
        Student student = authService.getCurrentStudent();
        List<NotificationHistoryDto> list = notificationService.getRecentNotifications(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification history retrieved", list));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Student student = authService.getCurrentStudent();
        notificationService.markAsRead(student.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Student student = authService.getCurrentStudent();
        notificationService.markAllAsRead(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Student student = authService.getCurrentStudent();
        long count = notificationService.getUnreadCount(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", count));
    }
}
