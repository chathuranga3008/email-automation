package com.company.email.service;

import com.company.email.dto.EmailTemplateDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailTemplateService {

    private final JdbcTemplate jdbcTemplate;

    public EmailTemplateService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EmailTemplateDTO> getAllTemplates() {

        String sql = "CALL sp_get_email_templates()";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new EmailTemplateDTO(
                        rs.getLong("id"),
                        rs.getString("template_code"),
                        rs.getString("template_name"),
                        rs.getString("subject_template"),
                        rs.getString("body_html"),
                        rs.getString("body_text")
                )
        );
    }
}