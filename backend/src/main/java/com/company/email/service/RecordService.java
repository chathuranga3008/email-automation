package com.company.email.service;

import com.company.email.dto.RecordDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecordService {

    private final JdbcTemplate jdbcTemplate;

    public RecordService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

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
}
