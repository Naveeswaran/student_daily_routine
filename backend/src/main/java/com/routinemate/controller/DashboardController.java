package com.routinemate.controller;

import com.routinemate.dto.ApiResponse;
import com.routinemate.dto.DashboardSummaryDto;
import com.routinemate.entity.Student;
import com.routinemate.service.AuthService;
import com.routinemate.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public DashboardController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getTodayDashboard() {
        Student student = authService.getCurrentStudent();
        DashboardSummaryDto dashboard = dashboardService.getTodayDashboard(student.getId());
        return ResponseEntity.ok(ApiResponse.ok("Today's dashboard data retrieved", dashboard));
    }
}
