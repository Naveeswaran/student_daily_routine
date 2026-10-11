package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.NotificationPreferenceDto;
import com.routinemate.dto.PasswordChangeRequest;
import com.routinemate.dto.StudentProfileDto;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;
    private final AuthService authService;

    public SettingsController(SettingsService settingsService, AuthService authService) {
        this.settingsService = settingsService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings() {
        Student student = authService.getCurrentStudent();
        Map<String, Object> settings = settingsService.getAllSettings(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Settings retrieved", settings));
    }

    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<NotificationPreferenceDto>> updateNotificationSettings(
            @RequestBody NotificationPreferenceDto dto) {
        Student student = authService.getCurrentStudent();
        NotificationPreferenceDto updated = settingsService.updateNotificationPreferences(student.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Notification settings updated successfully", updated));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(
            @Valid @RequestBody StudentProfileDto dto) {
        Student student = authService.getCurrentStudent();
        StudentProfileDto updated = settingsService.updateProfile(student.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody PasswordChangeRequest req) {
        Student student = authService.getCurrentStudent();
        settingsService.changePassword(student.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
}
