package com.company.email.record.dto;

import java.time.LocalDateTime;

public record RecordDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String description,
        LocalDateTime createdAt
) {
}
