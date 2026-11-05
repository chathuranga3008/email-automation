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

        if ("Template code already exists".equals(message)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
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

    private boolean isBadRequestMessage(String message) {

        return message != null && (
                message.contains("is required") ||
                        message.contains("Invalid") ||
                        message.contains("must be between") ||
                        message.contains("cannot be negative")
        );
    }

    private String getDatabaseErrorMessage(Throwable exception) {

        Throwable current = exception;

        while (current != null) {

            String message = current.getMessage();

            if (message != null) {

                if (message.contains("Template code already exists")) {
                    return "Template code already exists";
                }

                if (message.contains("Limit must be between 1 and 100")) {
                    return "Limit must be between 1 and 100";
                }

                if (message.contains("Offset cannot be negative")) {
                    return "Offset cannot be negative";
                }

                if (message.contains("is required") ||
                        message.contains("Invalid")) {
                    return message;
                }
            }

            current = current.getCause();
        }

        return null;
    }
}
