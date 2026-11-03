package com.company.email.dto;

public record RecipientDTO(
        Long recipientId,
        String recipientName,
        String emailAddress
) {
}
