package com.company.email.service;

import com.company.email.dto.EmailJobHistoryDTO;
import com.company.email.dto.EmailJobResponseDTO;
import com.company.email.dto.SendEmailRequestDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
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
            int limit,
            int offset) {

        String sql = "CALL sp_get_email_jobs(?, ?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEmailJobHistory(rs),
                limit,
                offset
        );
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

    private LocalDateTime getLocalDateTime(
            ResultSet rs,
            String columnName) throws SQLException {

        Timestamp timestamp = rs.getTimestamp(columnName);

        return timestamp != null
                ? timestamp.toLocalDateTime()
                : null;
    }
}
