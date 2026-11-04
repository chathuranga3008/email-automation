package com.company.email.dto;

import java.time.LocalDateTime;

public record RecentEmailJobDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String templateName,
        String subject,
        String status,
        Long totalRecipients,
        Long sentCount,
        Long failedCount,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}
