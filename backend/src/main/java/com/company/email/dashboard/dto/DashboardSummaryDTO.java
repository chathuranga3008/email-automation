package com.company.email.dashboard.dto;

public record DashboardSummaryDTO(
        Long totalJobs,
        Long pendingJobs,
        Long processingJobs,
        Long completedJobs,
        Long partialJobs,
        Long failedJobs,
        Long totalRecipients,
        Long sentRecipients,
        Long failedRecipients
) {
}
