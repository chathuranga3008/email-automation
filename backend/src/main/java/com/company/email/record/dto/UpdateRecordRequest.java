package com.company.email.record.dto;

public record UpdateRecordRequest(
        String recordReference,
        String recordTitle,
        String description
) {
}
