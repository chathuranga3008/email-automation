package com.company.email.mail.dto;

public record EmailJobContentDTO(
        Long id,
        String recordReference,
        String recordTitle,
        String subject,
        String bodyHtml,
        String bodyText
) {
}
