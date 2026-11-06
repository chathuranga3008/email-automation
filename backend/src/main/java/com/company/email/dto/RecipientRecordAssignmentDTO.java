package com.company.email.dto;

public record RecipientRecordAssignmentDTO(
        Long recordId,
        String recordReference,
        String recordTitle,
        Boolean recordIsActive,
        Boolean isAssigned
) {
}
