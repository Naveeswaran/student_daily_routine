package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.PushSubscriptionRequest;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.PushNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/push")
public class PushNotificationController {

    private final PushNotificationService pushService;
    private final AuthService authService;

    public PushNotificationController(PushNotificationService pushService, AuthService authService) {
        this.pushService = pushService;
        this.authService = authService;
    }

    @GetMapping("/public-key")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicKey() {
        Map<String, String> data = new HashMap<>();
        data.put("publicKey", pushService.getVapidPublicKey());
        return ResponseEntity.ok(ApiResponse.ok("VAPID public key retrieved", data));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<Void>> subscribe(@Valid @RequestBody PushSubscriptionRequest request) {
        Student student = authService.getCurrentStudent();
        pushService.subscribe(student, request);
        return ResponseEntity.ok(ApiResponse.ok("Push notification subscription registered"));
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(@RequestParam String endpoint) {
        Student student = authService.getCurrentStudent();
        pushService.unsubscribe(student, endpoint);
        return ResponseEntity.ok(ApiResponse.ok("Unsubscribed from push notifications"));
    }

    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestNotification() {
        Student student = authService.getCurrentStudent();
        Map<String, Object> testData = new HashMap<>();
        testData.put("type", "TEST");
        testData.put("timestamp", System.currentTimeMillis());

        boolean sent = pushService.sendPushNotification(
                student,
                "RoutineMate – Notification Test",
                "Great news! Your RoutineMate smart notification system is fully connected and operational.",
                testData
        );

        Map<String, Object> result = new HashMap<>();
        result.put("deliveredViaPush", sent);
        result.put("message", sent ? "Push notification sent to your device!" : "No active push client found; fallback notification triggered.");

        return ResponseEntity.ok(ApiResponse.ok("Test notification dispatched", result));
    }
}
