package com.company.email.recipient.dto;

public record RecipientDTO(
        Long recipientId,
        String recipientName,
        String emailAddress
) {
}
