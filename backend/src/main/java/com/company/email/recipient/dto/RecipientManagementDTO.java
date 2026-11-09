package com.company.email.recipient.dto;

import java.time.LocalDateTime;

public record RecipientManagementDTO(
        Long recipientId,
        String recipientName,
        String emailAddress,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
