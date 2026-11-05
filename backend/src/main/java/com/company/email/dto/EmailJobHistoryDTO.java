package com.company.email.dto;

import java.time.LocalDateTime;

public record EmailJobHistoryDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String templateName,
        String subject,
        String status,
        Integer totalRecipients,
        Integer sentCount,
        Integer failedCount,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}
