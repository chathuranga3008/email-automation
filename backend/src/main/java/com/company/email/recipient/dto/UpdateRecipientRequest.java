package com.company.email.recipient.dto;

public record UpdateRecipientRequest(
        String recipientName,
        String emailAddress
) {
}
