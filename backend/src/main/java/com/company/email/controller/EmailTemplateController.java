package com.company.email.controller;

import com.company.email.dto.EmailTemplateDTO;
import com.company.email.service.EmailTemplateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
