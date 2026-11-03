package com.company.email.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendEmailRequestDTO(
        @NotNull(message = "Record ID is required")
        Long recordId,

        @NotNull(message = "Template ID is required")
        Long templateId,

        @NotBlank(message = "Idempotency key is required")
        String idempotencyKey
) {
}
