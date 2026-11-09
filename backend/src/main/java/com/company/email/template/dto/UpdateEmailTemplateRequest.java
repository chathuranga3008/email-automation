package com.company.email.template.dto;

public record UpdateEmailTemplateRequest(
        String templateName,
        String subjectTemplate,
        String bodyHtml,
        String bodyText
) {
}
