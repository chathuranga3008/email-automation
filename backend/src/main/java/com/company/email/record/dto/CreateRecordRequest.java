package com.company.email.record.dto;

public record CreateRecordRequest(
        String recordReference,
        String recordTitle,
        String description
) {
}
