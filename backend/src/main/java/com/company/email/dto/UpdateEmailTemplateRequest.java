package com.company.email.dto;

public record UpdateEmailTemplateRequest(
        String templateName,
        String subjectTemplate,
        String bodyHtml,
        String bodyText
) {
}
