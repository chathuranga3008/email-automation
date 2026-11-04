package com.company.email.controller;

import com.company.email.dto.CreateEmailTemplateRequest;
import com.company.email.dto.EmailTemplateDTO;
import com.company.email.dto.EmailTemplateStatusRequest;
import com.company.email.dto.UpdateEmailTemplateRequest;
import com.company.email.service.EmailTemplateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
public class EmailTemplateController {

    private final EmailTemplateService emailTemplateService;

    public EmailTemplateController(EmailTemplateService emailTemplateService) {
        this.emailTemplateService = emailTemplateService;
    }

    @GetMapping
    public List<EmailTemplateDTO> getAllTemplates() {
        return emailTemplateService.getAllTemplates();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTemplate(
            @PathVariable Long id,
            @RequestBody UpdateEmailTemplateRequest request
    ) {
        emailTemplateService.updateTemplate(id, request);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setTemplateStatus(
            @PathVariable Long id,
            @RequestBody EmailTemplateStatusRequest request
    ) {
        emailTemplateService.setTemplateStatus(
                id,
                request.isActive()
        );

        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Long> createTemplate(
            @RequestBody CreateEmailTemplateRequest request
    ) {
        Long templateId = emailTemplateService.createTemplate(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(templateId);
    }
}
