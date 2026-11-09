package com.company.email.recipient.dto;

public record RecipientRecordAssignmentDTO(
        Long recordId,
        String recordReference,
        String recordTitle,
        Boolean recordIsActive,
        Boolean isAssigned
) {
}
