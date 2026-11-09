package com.company.email.dashboard.controller;

import com.company.email.dashboard.dto.DashboardSummaryDTO;
import com.company.email.dashboard.dto.RecentEmailJobDTO;
import com.company.email.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryDTO getDashboardSummary() {

        return dashboardService.getDashboardSummary();
    }

    @GetMapping("/recent-jobs")
    public List<RecentEmailJobDTO> getRecentEmailJobs() {

        return dashboardService.getRecentEmailJobs();
    }
}
