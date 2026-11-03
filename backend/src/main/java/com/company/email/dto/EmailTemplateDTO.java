package com.company.email.dto;

public record EmailTemplateDTO(
        Long id,
        String templateCode,
        String templateName,
        String subjectTemplate,
        String bodyHtml,
        String bodyText
) {
}
