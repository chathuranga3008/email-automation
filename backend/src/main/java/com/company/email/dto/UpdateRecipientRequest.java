package com.company.email.dto;

public record UpdateRecipientRequest(
        String recipientName,
        String emailAddress
) {
}
