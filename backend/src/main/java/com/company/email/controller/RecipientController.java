package com.company.email.controller;

import com.company.email.dto.*;
import com.company.email.service.RecipientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RecipientController {

    private final RecipientService recipientService;

    public RecipientController(RecipientService recipientService) {
        this.recipientService = recipientService;
    }

    // Existing endpoint used by Send Emails.
    @GetMapping("/records/{recordId}/recipients")
    public List<RecipientDTO> getRecipientsByRecordId(
            @PathVariable Long recordId
    ) {
        return recipientService.getRecipientsByRecordId(recordId);
    }

    // Retrieve all recipients with optional filters.
    @GetMapping("/recipients")
    public List<RecipientManagementDTO> getRecipients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive
    ) {
        return recipientService.getRecipients(search, isActive);
    }

    // Retrieve one recipient.
    @GetMapping("/recipients/{id}")
    public RecipientManagementDTO getRecipientById(
            @PathVariable Long id
    ) {
        return recipientService.getRecipientById(id);
    }

    // Create a recipient.
    @PostMapping("/recipients")
    public ResponseEntity<Long> createRecipient(
            @RequestBody CreateRecipientRequest request
    ) {
        Long recipientId = recipientService.createRecipient(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recipientId);
    }

    // Update recipient details.
    @PutMapping("/recipients/{id}")
    public ResponseEntity<Void> updateRecipient(
            @PathVariable Long id,
            @RequestBody UpdateRecipientRequest request
    ) {
        recipientService.updateRecipient(id, request);

        return ResponseEntity.noContent().build();
    }

    // Activate or deactivate a recipient.
    @PatchMapping("/recipients/{id}/status")
    public ResponseEntity<Void> setRecipientStatus(
            @PathVariable Long id,
            @RequestBody RecipientStatusRequest request
    ) {
        recipientService.setRecipientStatus(
                id,
                request.isActive()
        );

        return ResponseEntity.noContent().build();
    }

    // Retrieve recipient record assignments.
    @GetMapping("/recipients/{id}/records")
    public List<RecipientRecordAssignmentDTO> getRecipientRecordAssignments(
            @PathVariable Long id
    ) {
        return recipientService.getRecipientRecordAssignments(id);
    }

    // Assign or unassign a recipient from a record.
    @PatchMapping("/recipients/{id}/records/{recordId}/assignment")
    public ResponseEntity<Void> setRecipientRecordAssignment(
            @PathVariable Long id,
            @PathVariable Long recordId,
            @RequestBody RecipientAssignmentRequest request
    ) {
        recipientService.setRecipientRecordAssignment(
                id,
                recordId,
                request.isAssigned()
        );

        return ResponseEntity.noContent().build();
    }
}
