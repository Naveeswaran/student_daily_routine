package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.RoutineRequest;
import com.routinemate.dto.RoutineResponse;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.RoutineService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;
    private final AuthService authService;

    public RoutineController(RoutineService routineService, AuthService authService) {
        this.routineService = routineService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoutineResponse>>> getAllRoutines() {
        Student student = authService.getCurrentStudent();
        List<RoutineResponse> routines = routineService.getAllRoutines(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Routines retrieved successfully", routines));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<RoutineResponse>>> getRoutinesForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Student student = authService.getCurrentStudent();
        List<RoutineResponse> routines = routineService.getRoutinesForDate(student.getId(), date);
        return ResponseEntity.ok(ApiResponse.ok("Routines for " + date + " retrieved", routines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoutineResponse>> getRoutineById(@PathVariable Long id) {
        Student student = authService.getCurrentStudent();
        RoutineResponse routine = routineService.getRoutineById(student.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Routine retrieved successfully", routine));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoutineResponse>> createRoutine(@Valid @RequestBody RoutineRequest request) {
        Student student = authService.getCurrentStudent();
        RoutineResponse routine = routineService.createRoutine(student.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Routine created successfully", routine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoutineResponse>> updateRoutine(
            @PathVariable Long id,
            @Valid @RequestBody RoutineRequest request) {
        Student student = authService.getCurrentStudent();
        RoutineResponse updated = routineService.updateRoutine(student.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Routine updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoutine(@PathVariable Long id) {
        Student student = authService.getCurrentStudent();
        routineService.deleteRoutine(student.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Routine deleted successfully"));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<RoutineResponse>> markComplete(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Student student = authService.getCurrentStudent();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        RoutineResponse res = routineService.updateCompletionStatus(student.getId(), id, targetDate, "COMPLETED");
        return ResponseEntity.ok(ApiResponse.ok("Routine marked as completed", res));
    }

    @PatchMapping("/{id}/skip")
    public ResponseEntity<ApiResponse<RoutineResponse>> markSkipped(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Student student = authService.getCurrentStudent();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        RoutineResponse res = routineService.updateCompletionStatus(student.getId(), id, targetDate, "SKIPPED");
        return ResponseEntity.ok(ApiResponse.ok("Routine marked as skipped", res));
    }

    @PatchMapping("/{id}/pending")
    public ResponseEntity<ApiResponse<RoutineResponse>> markPending(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Student student = authService.getCurrentStudent();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        RoutineResponse res = routineService.updateCompletionStatus(student.getId(), id, targetDate, "PENDING");
        return ResponseEntity.ok(ApiResponse.ok("Routine marked as pending", res));
    }
}
