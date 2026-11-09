package com.company.email.mail.service;

import com.company.email.mail.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

    public List<EmailJobHistoryDTO> getEmailJobs(
            String search,
            String status,
            LocalDate createdFrom,
            LocalDate createdTo,
            int limit,
            int offset) {

        String sql = "CALL sp_get_email_jobs(?, ?, ?, ?, ?, ?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEmailJobHistory(rs),
                search,
                status,
                createdFrom,
                createdTo,
                limit,
                offset
        );
    }

    public EmailJobDetailsDTO getEmailJobDetails(Long jobId) {

        String sql = "CALL sp_get_email_job(?)";

        List<EmailJobDetailsDTO> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEmailJobDetails(rs),
                jobId
        );

        if (results.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Email job not found"
            );
        }

        return results.get(0);
    }

    public List<EmailJobLogDTO> getEmailJobLogs(Long jobId) {

        String sql = "CALL sp_get_email_job_logs(?)";

        List<EmailJobLogDTO> results = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEmailJobLog(rs),
                jobId
        );

        if (results.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Email job not found"
            );
        }

        return results;
    }

    private EmailJobHistoryDTO mapEmailJobHistory(
            ResultSet rs) throws SQLException {

        return new EmailJobHistoryDTO(
                rs.getLong("id"),
                rs.getString("record_reference_snapshot"),
                rs.getString("record_title_snapshot"),
                rs.getString("template_name_snapshot"),
                rs.getString("subject_snapshot"),
                rs.getString("status"),
                rs.getInt("total_recipients"),
                rs.getInt("sent_count"),
                rs.getInt("failed_count"),
                getLocalDateTime(rs, "created_at"),
                getLocalDateTime(rs, "started_at"),
                getLocalDateTime(rs, "completed_at")
        );
    }

    private EmailJobDetailsDTO mapEmailJobDetails(
            ResultSet rs) throws SQLException {

        return new EmailJobDetailsDTO(
                rs.getLong("id"),
                rs.getString("record_reference_snapshot"),
                rs.getString("record_title_snapshot"),
                rs.getString("template_name_snapshot"),
                rs.getString("subject_snapshot"),
                rs.getString("body_html_snapshot"),
                rs.getString("body_text_snapshot"),
                rs.getString("status"),
                rs.getInt("total_recipients"),
                rs.getInt("sent_count"),
                rs.getInt("failed_count"),
                rs.getString("created_by"),
                getLocalDateTime(rs, "created_at"),
                getLocalDateTime(rs, "started_at"),
                getLocalDateTime(rs, "completed_at")
        );
    }

    private EmailJobLogDTO mapEmailJobLog(
            ResultSet rs) throws SQLException {

        return new EmailJobLogDTO(
                rs.getLong("id"),
                rs.getString("recipient_name"),
                rs.getString("recipient_email"),
                rs.getString("status"),
                rs.getInt("attempt_count"),
                rs.getBoolean("is_retryable"),
                getLocalDateTime(rs, "last_attempt_at"),
                getLocalDateTime(rs, "sent_at"),
                rs.getString("error_message")
        );
    }

    private LocalDateTime getLocalDateTime(
            ResultSet rs,
            String columnName) throws SQLException {

        Timestamp timestamp = rs.getTimestamp(columnName);

        return timestamp != null
                ? timestamp.toLocalDateTime()
                : null;
    }
}
