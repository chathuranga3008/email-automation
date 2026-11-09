package com.company.email.template.service;

import com.company.email.template.dto.CreateEmailTemplateRequest;
import com.company.email.template.dto.EmailTemplateDTO;
import com.company.email.template.dto.UpdateEmailTemplateRequest;
import org.springframework.jdbc.core.ConnectionCallback;
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
                        rs.getString("body_text"),
                        rs.getBoolean("is_active"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                )
        );
    }

    public void updateTemplate(
            Long templateId,
            UpdateEmailTemplateRequest request
    ) {

        String sql = "CALL sp_update_email_template(?, ?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                templateId,
                request.templateName(),
                request.subjectTemplate(),
                request.bodyHtml(),
                request.bodyText()
        );
    }

    public void setTemplateStatus(Long templateId, Boolean isActive) {

        String sql = "CALL sp_set_email_template_status(?, ?)";

        Integer status = isActive == null
                ? null
                : (isActive ? 1 : 0);

        jdbcTemplate.update(sql, templateId, status);
    }

    public Long createTemplate(CreateEmailTemplateRequest request) {

        return jdbcTemplate.execute((ConnectionCallback<Long>) connection -> {
            try (var statement = connection.prepareCall(
                    "{CALL sp_create_email_template(?, ?, ?, ?, ?)}"
            )) {
                statement.setString(1, request.templateCode());
                statement.setString(2, request.templateName());
                statement.setString(3, request.subjectTemplate());
                statement.setString(4, request.bodyHtml());
                statement.setString(5, request.bodyText());

                statement.execute();

                try (var result = connection.createStatement();
                     var rs = result.executeQuery("SELECT LAST_INSERT_ID()")) {

                    if (rs.next()) {
                        return rs.getLong(1);
                    }

                    throw new IllegalStateException(
                            "Unable to retrieve created template ID"
                    );
                }
            }
        });
    }
}
