package com.company.email.dto;

import java.time.LocalDateTime;

public record EmailJobDetailsDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String templateName,
        String subject,
        String bodyHtml,
        String bodyText,
        String status,
        Integer totalRecipients,
        Integer sentCount,
        Integer failedCount,
        Long createdBy,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}
