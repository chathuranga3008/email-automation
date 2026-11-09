package com.company.email.record.dto;

import java.time.LocalDateTime;

public record RecordManagementDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String description,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
