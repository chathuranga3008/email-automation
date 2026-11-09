package com.company.email.mail.controller;

import com.company.email.mail.dto.*;
import com.company.email.mail.service.EmailJobService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate createdTo,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        return emailJobService.getEmailJobs(
                search,
                status,
                createdFrom,
                createdTo,
                limit,
                offset
        );
    }

    @GetMapping("/{id}")
    public EmailJobDetailsDTO getEmailJobDetails(
            @PathVariable Long id) {

        return emailJobService.getEmailJobDetails(id);
    }

    @GetMapping("/{id}/logs")
    public List<EmailJobLogDTO> getEmailJobLogs(
            @PathVariable Long id) {

        return emailJobService.getEmailJobLogs(id);
    }
}
