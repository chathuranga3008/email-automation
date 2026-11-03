package com.company.email.dto;

public record EmailJobContentDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String subject,
        String bodyHtml,
        String bodyText
) {
}
