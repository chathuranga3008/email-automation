package com.company.email.service;

import com.company.email.dto.RecipientDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipientService {

    private final JdbcTemplate jdbcTemplate;

    public RecipientService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

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
}