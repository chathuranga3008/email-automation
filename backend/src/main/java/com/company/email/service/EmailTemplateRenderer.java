package com.company.email.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateRenderer {

    public String renderSubject(
            String template,
            String recipientName,
            String recordTitle,
            String recordReference) {

        return replacePlaceholders(
                template,
                recipientName,
                recordTitle,
                recordReference,
                false
        );
    }

    public String renderHtml(
            String template,
            String recipientName,
            String recordTitle,
            String recordReference) {

        return replacePlaceholders(
                template,
                recipientName,
                recordTitle,
                recordReference,
                true
        );
    }

    public String renderText(
            String template,
            String recipientName,
            String recordTitle,
            String recordReference) {

        return replacePlaceholders(
                template,
                recipientName,
                recordTitle,
                recordReference,
                false
        );
    }

    private String replacePlaceholders(
            String template,
            String recipientName,
            String recordTitle,
            String recordReference,
            boolean escapeHtml) {

        if (template == null) {
            return null;
        }

        String name = escapeHtml
                ? escapeHtml(recipientName)
                : recipientName;

        String title = escapeHtml
                ? escapeHtml(recordTitle)
                : recordTitle;

        String reference = escapeHtml
                ? escapeHtml(recordReference)
                : recordReference;

        return template
                .replace("{{recipientName}}", name)
                .replace("{{recordTitle}}", title)
                .replace("{{recordReference}}", reference);
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
