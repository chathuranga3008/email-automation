package com.company.email.service;

import com.company.email.dto.EmailJobResponseDTO;
import com.company.email.dto.SendEmailRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class EmailJobService {

    private final JdbcTemplate jdbcTemplate;

    public EmailJobService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public EmailJobResponseDTO createEmailJob(
            SendEmailRequestDTO request) {

        String sql = "CALL sp_create_email_job(?, ?, ?, ?)";

        Map<String, Object> result = jdbcTemplate.queryForMap(
                sql,
                request.recordId(),
                request.templateId(),
                request.idempotencyKey(),
                null
        );

        Number id = (Number) result.get("id");

        Number totalRecipients =
                (Number) result.get("total_recipients");

        Object createdAtValue = result.get("created_at");

        LocalDateTime createdAt;

        if (createdAtValue instanceof LocalDateTime) {
            createdAt = (LocalDateTime) createdAtValue;
        } else if (createdAtValue instanceof Timestamp) {
            createdAt = ((Timestamp) createdAtValue).toLocalDateTime();
        } else {
            throw new IllegalStateException(
                    "Unexpected created_at type: "
                            + createdAtValue.getClass().getName()
            );
        }

        return new EmailJobResponseDTO(
                id.longValue(),
                result.get("status").toString(),
                totalRecipients.intValue(),
                createdAt
        );
    }
}