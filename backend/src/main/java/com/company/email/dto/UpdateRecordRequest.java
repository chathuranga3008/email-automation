package com.company.email.dto;

public record UpdateRecordRequest(
        String recordReference,
        String recordTitle,
        String description
) {
}
