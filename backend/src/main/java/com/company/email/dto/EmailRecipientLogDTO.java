package com.company.email.dto;

public record EmailRecipientLogDTO(
        Long id,
        Long jobId,
        Long recipientId,
        String recipientName,
        String recipientEmail,
        Integer attemptCount
) {
}