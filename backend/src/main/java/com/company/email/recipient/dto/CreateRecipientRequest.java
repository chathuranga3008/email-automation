package com.company.email.recipient.dto;

public record CreateRecipientRequest(
        String recipientName,
        String emailAddress
) {
}
