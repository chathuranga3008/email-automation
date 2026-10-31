package com.company.email.controller;

import com.company.email.dto.EmailJobResponseDTO;
import com.company.email.dto.SendEmailRequestDTO;
import com.company.email.service.EmailJobService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email-jobs")
public class EmailJobController {

    private final EmailJobService emailJobService;

    public EmailJobController(EmailJobService emailJobService) {
        this.emailJobService = emailJobService;
    }

    @PostMapping
    public EmailJobResponseDTO createEmailJob(
            @Valid @RequestBody SendEmailRequestDTO request) {

        return emailJobService.createEmailJob(request);
    }
}