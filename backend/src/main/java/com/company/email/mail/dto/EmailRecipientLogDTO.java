package com.company.email.mail.dto;

public record EmailRecipientLogDTO(
        Long id,
        Long jobId,
        Long recipientId,
        String recipientName,
        String recipientEmail,
        Integer attemptCount
) {
}
