package com.company.email.dto;

import java.time.LocalDateTime;

public record EmailTemplateDTO(
        Long id,
        String templateCode,
        String templateName,
        String subjectTemplate,
        String bodyHtml,
        String bodyText,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
