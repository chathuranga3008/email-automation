package com.company.email.controller;

import com.company.email.dto.*;
import com.company.email.service.RecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
public class RecordController {

    private final RecordService recordService;

    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    // Existing endpoint used by Send Emails.
    @GetMapping
    public List<RecordDTO> getAllRecords() {
        return recordService.getAllRecords();
    }

    // Retrieve records for Record Management.
    @GetMapping("/manage")
    public List<RecordManagementDTO> getRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive
    ) {
        return recordService.getRecords(search, isActive);
    }

    // Retrieve one record.
    @GetMapping("/{id}")
    public RecordManagementDTO getRecordById(
            @PathVariable Long id
    ) {
        return recordService.getRecordById(id);
    }

    // Create a record.
    @PostMapping
    public ResponseEntity<Long> createRecord(
            @RequestBody CreateRecordRequest request
    ) {
        Long recordId = recordService.createRecord(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recordId);
    }

    // Update record details.
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRecord(
            @PathVariable Long id,
            @RequestBody UpdateRecordRequest request
    ) {
        recordService.updateRecord(id, request);

        return ResponseEntity.noContent().build();
    }

    // Activate or deactivate a record.
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> setRecordStatus(
            @PathVariable Long id,
            @RequestBody RecordStatusRequest request
    ) {
        recordService.setRecordStatus(
                id,
                request.isActive()
        );

        return ResponseEntity.noContent().build();
    }
}
