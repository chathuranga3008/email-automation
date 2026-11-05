package com.company.email.controller;

import com.company.email.dto.EmailJobHistoryDTO;
import com.company.email.dto.EmailJobResponseDTO;
import com.company.email.dto.SendEmailRequestDTO;
import com.company.email.service.EmailJobService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public List<EmailJobHistoryDTO> getEmailJobs(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        return emailJobService.getEmailJobs(limit, offset);
    }
}
