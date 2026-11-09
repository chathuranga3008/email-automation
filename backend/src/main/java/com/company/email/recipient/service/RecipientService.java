package com.company.email.recipient.service;

import com.company.email.recipient.dto.*;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipientService {

    private final JdbcTemplate jdbcTemplate;

    public RecipientService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Existing method used by Send Emails.
    public List<RecipientDTO> getRecipientsByRecordId(Long recordId) {

        String sql = "CALL sp_get_record_recipients(?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new RecipientDTO(
                        rs.getLong("recipient_id"),
                        rs.getString("recipient_name"),
                        rs.getString("email_address")
                ),
                recordId
        );
    }

    // Retrieve recipients with optional search and status filters.
    public List<RecipientManagementDTO> getRecipients(
            String search,
            Boolean isActive
    ) {

        String sql = "CALL sp_get_recipients(?, ?)";

        Integer status = isActive == null
                ? null
                : (isActive ? 1 : 0);

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRecipient(rs),
                search,
                status
        );
    }

    // Retrieve one recipient.
    public RecipientManagementDTO getRecipientById(Long recipientId) {

        String sql = "CALL sp_get_recipient_by_id(?)";

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> mapRecipient(rs),
                recipientId
        );
    }

    // Create a recipient and return its generated ID.
    public Long createRecipient(CreateRecipientRequest request) {

        return jdbcTemplate.execute((ConnectionCallback<Long>) connection -> {

            try (var statement = connection.prepareCall(
                    "{CALL sp_create_recipient(?, ?)}"
            )) {

                statement.setString(1, request.recipientName());
                statement.setString(2, request.emailAddress());

                statement.execute();

                try (var result = connection.createStatement();
                     var rs = result.executeQuery("SELECT LAST_INSERT_ID()")) {

                    if (rs.next()) {
                        return rs.getLong(1);
                    }

                    throw new IllegalStateException(
                            "Unable to retrieve created recipient ID"
                    );
                }
            }
        });
    }

    // Update recipient details.
    public void updateRecipient(
            Long recipientId,
            UpdateRecipientRequest request
    ) {

        String sql = "CALL sp_update_recipient(?, ?, ?)";

        jdbcTemplate.update(
                sql,
                recipientId,
                request.recipientName(),
                request.emailAddress()
        );
    }

    // Activate or deactivate a recipient.
    public void setRecipientStatus(
            Long recipientId,
            Boolean isActive
    ) {

        Integer status = isActive == null
                ? null
                : (isActive ? 1 : 0);

        String sql = "CALL sp_set_recipient_status(?, ?)";

        jdbcTemplate.update(sql, recipientId, status);
    }

    // Retrieve all records and assignment statuses for a recipient.
    public List<RecipientRecordAssignmentDTO> getRecipientRecordAssignments(
            Long recipientId
    ) {

        String sql = "CALL sp_get_recipient_record_assignments(?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new RecipientRecordAssignmentDTO(
                        rs.getLong("record_id"),
                        rs.getString("record_reference"),
                        rs.getString("record_title"),
                        rs.getBoolean("record_is_active"),
                        rs.getBoolean("is_assigned")
                ),
                recipientId
        );
    }

    // Assign or unassign a recipient from a record.
    public void setRecipientRecordAssignment(
            Long recipientId,
            Long recordId,
            Boolean isAssigned
    ) {

        Integer assignmentStatus = isAssigned == null
                ? null
                : (isAssigned ? 1 : 0);

        String sql = "CALL sp_set_recipient_record_assignment(?, ?, ?)";

        jdbcTemplate.update(
                sql,
                recipientId,
                recordId,
                assignmentStatus
        );
    }

    private RecipientManagementDTO mapRecipient(
            java.sql.ResultSet rs
    ) throws java.sql.SQLException {

        return new RecipientManagementDTO(
                rs.getLong("recipient_id"),
                rs.getString("recipient_name"),
                rs.getString("email_address"),
                rs.getBoolean("is_active"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        );
    }
}
