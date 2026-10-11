package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.AuthRequest;
import com.routinemate.dto.AuthResponse;
import com.routinemate.dto.RegisterRequest;
import com.routinemate.dto.StudentProfileDto;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Welcome to RoutineMate!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getCurrentUser() {
        Student student = authService.getCurrentStudent();
        StudentProfileDto profile = new StudentProfileDto(student.getId(), student.getName(), student.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Current user profile retrieved", profile));
    }
}
