package com.company.email.mail.dto;

import java.time.LocalDateTime;

public record EmailJobLogDTO(
        Long id,
        String recipientName,
        String recipientEmail,
        String status,
        Integer attemptCount,
        Boolean isRetryable,
        LocalDateTime lastAttemptAt,
        LocalDateTime sentAt,
        String errorMessage
) {
}
