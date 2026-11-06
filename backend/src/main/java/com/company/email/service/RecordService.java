package com.company.email.service;

import com.company.email.dto.CreateRecordRequest;
import com.company.email.dto.RecordDTO;
import com.company.email.dto.RecordManagementDTO;
import com.company.email.dto.UpdateRecordRequest;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class RecordService {

    private final JdbcTemplate jdbcTemplate;

    public RecordService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Existing method used by Send Emails.
    // Only returns active records.
    public List<RecordDTO> getAllRecords() {

        String sql = "CALL sp_get_records()";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new RecordDTO(
                        rs.getLong("id"),
                        rs.getString("record_reference"),
                        rs.getString("record_title"),
                        rs.getString("description"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                )
        );
    }

    // Retrieve records for Record Management.
    // Supports optional search and status filters.
    public List<RecordManagementDTO> getRecords(
            String search,
            Boolean isActive
    ) {

        Integer status = isActive == null
                ? null
                : (isActive ? 1 : 0);

        String sql = "CALL sp_get_records_management(?, ?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapRecord(rs),
                search,
                status
        );
    }

    // Retrieve one record by ID.
    public RecordManagementDTO getRecordById(Long recordId) {

        String sql = "CALL sp_get_record_by_id(?)";

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> mapRecord(rs),
                recordId
        );
    }

    // Create a record and return its generated ID.
    public Long createRecord(CreateRecordRequest request) {

        return jdbcTemplate.execute((ConnectionCallback<Long>) connection -> {

            try (var statement = connection.prepareCall(
                    "{CALL sp_create_record(?, ?, ?)}"
            )) {

                statement.setString(1, request.recordReference());
                statement.setString(2, request.recordTitle());
                statement.setString(3, request.description());

                statement.execute();

                try (var result = connection.createStatement();
                     var rs = result.executeQuery("SELECT LAST_INSERT_ID()")) {

                    if (rs.next()) {
                        return rs.getLong(1);
                    }

                    throw new IllegalStateException(
                            "Unable to retrieve created record ID"
                    );
                }
            }
        });
    }

    // Update record details.
    public void updateRecord(
            Long recordId,
            UpdateRecordRequest request
    ) {

        String sql = "CALL sp_update_record(?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                recordId,
                request.recordReference(),
                request.recordTitle(),
                request.description()
        );
    }

    // Activate or deactivate a record.
    public void setRecordStatus(
            Long recordId,
            Boolean isActive
    ) {

        Integer status = isActive == null
                ? null
                : (isActive ? 1 : 0);

        String sql = "CALL sp_set_record_status(?, ?)";

        jdbcTemplate.update(sql, recordId, status);
    }

    private RecordManagementDTO mapRecord(
            ResultSet rs
    ) throws SQLException {

        return new RecordManagementDTO(
                rs.getLong("id"),
                rs.getString("record_reference"),
                rs.getString("record_title"),
                rs.getString("description"),
                rs.getBoolean("is_active"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        );
    }
}
