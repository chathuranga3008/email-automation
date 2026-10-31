package com.company.email.controller;

import com.company.email.dto.RecipientDTO;
import com.company.email.service.RecipientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class RecipientController {

    private final RecipientService recipientService;

    public RecipientController(RecipientService recipientService) {
        this.recipientService = recipientService;
    }

    @GetMapping("/{recordId}/recipients")
    public List<RecipientDTO> getRecipientsByRecordId(
            @PathVariable Long recordId) {

        return recipientService.getRecipientsByRecordId(recordId);
    }
}