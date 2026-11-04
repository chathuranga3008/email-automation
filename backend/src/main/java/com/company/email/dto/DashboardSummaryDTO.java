package com.company.email.dto;

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
