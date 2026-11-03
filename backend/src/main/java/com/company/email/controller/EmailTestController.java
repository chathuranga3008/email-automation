package com.company.email.controller;

import com.company.email.service.EmailSenderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/email-test")
public class EmailTestController {

    private final EmailSenderService emailSenderService;

    public EmailTestController(EmailSenderService emailSenderService) {
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String recipient) {

        try {
            emailSenderService.sendEmail(
                    recipient,
                    "Email Automation System - SMTP Test",
                    "<html><body><h2>SMTP Test Successful</h2>"
                            + "<p>Your Gmail SMTP integration is working.</p>"
                            + "</body></html>",
                    "SMTP Test Successful\n"
                            + "Your Gmail SMTP integration is working."
            );

            return ResponseEntity.ok("Test email sent successfully.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Email sending failed: " + e.getMessage());
        }
    }
}
