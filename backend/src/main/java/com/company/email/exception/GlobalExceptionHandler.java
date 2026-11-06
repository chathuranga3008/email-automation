package com.company.email.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDatabaseException(
            DataAccessException exception
    ) {

        String message = getDatabaseErrorMessage(exception);

        if (message == null) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "A database error occurred. Please try again later."
                    ));
        }

        if (isConflictMessage(message)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", message));
        }

        if (isNotFoundMessage(message)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
        }

        if (isBadRequestMessage(message)) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", message));
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "message",
                        "A database error occurred. Please try again later."
                ));
    }

    private boolean isConflictMessage(String message) {

        return message.contains("Template code already exists")
                || message.contains("Email address already exists")
                || message.contains("Duplicate entry");
    }

    private boolean isNotFoundMessage(String message) {

        return message.equals("Recipient not found")
                || message.equals("Record not found");
    }

    private boolean isBadRequestMessage(String message) {

        return message.contains("is required")
                || message.contains("Invalid")
                || message.contains("must be between")
                || message.contains("cannot be negative")
                || message.contains("Start date cannot be after end date")
                || message.contains("Cannot assign recipient to an inactive record");
    }

    private String getDatabaseErrorMessage(Throwable exception) {

        Throwable current = exception;

        while (current != null) {

            String message = current.getMessage();

            if (message != null) {

                if (message.contains("Template code already exists")) {
                    return "Template code already exists";
                }

                if (message.contains("Email address already exists")) {
                    return "Email address already exists";
                }

                if (message.contains("Recipient not found")) {
                    return "Recipient not found";
                }

                if (message.contains("Record not found")) {
                    return "Record not found";
                }

                if (message.contains("Cannot assign recipient to an inactive record")) {
                    return "Cannot assign recipient to an inactive record";
                }

                if (message.contains("Limit must be between 1 and 100")) {
                    return "Limit must be between 1 and 100";
                }

                if (message.contains("Offset cannot be negative")) {
                    return "Offset cannot be negative";
                }

                if (message.contains("Invalid email job status")) {
                    return "Invalid email job status";
                }

                if (message.contains("Start date cannot be after end date")) {
                    return "Start date cannot be after end date";
                }

                if (message.contains("Duplicate entry")) {
                    return "A record with this unique value already exists";
                }

                // Avoid returning the JDBC wrapper message.
                if (!message.contains("PreparedStatementCallback") &&
                        (message.contains("is required") ||
                                message.contains("Invalid"))) {
                    return message;
                }
            }

            current = current.getCause();
        }

        return null;
    }
}
