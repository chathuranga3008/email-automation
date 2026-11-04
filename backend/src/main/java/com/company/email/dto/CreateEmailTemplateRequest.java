package com.company.email.dto;

public record CreateEmailTemplateRequest(
        String templateCode,
        String templateName,
        String subjectTemplate,
        String bodyHtml,
        String bodyText
) {
}
