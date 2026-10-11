package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.WeeklyProgressDto;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final AuthService authService;

    public ProgressController(ProgressService progressService, AuthService authService) {
        this.progressService = progressService;
        this.authService = authService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklyProgressDto>> getWeeklyProgress() {
        Student student = authService.getCurrentStudent();
        WeeklyProgressDto progress = progressService.getWeeklyProgress(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Weekly progress retrieved", progress));
    }
}
