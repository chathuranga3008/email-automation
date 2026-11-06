package com.company.email.dto;

public record CreateRecordRequest(
        String recordReference,
        String recordTitle,
        String description
) {
}
