package com.company.email.dto;

public record CreateRecipientRequest(
        String recipientName,
        String emailAddress
) {
}
