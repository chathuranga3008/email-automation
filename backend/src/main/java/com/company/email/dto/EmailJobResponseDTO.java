package com.company.email.dto;

import java.time.LocalDateTime;

public record EmailJobResponseDTO(
        Long id,
        String status,
        Integer totalRecipients,
        LocalDateTime createdAt
) {
}