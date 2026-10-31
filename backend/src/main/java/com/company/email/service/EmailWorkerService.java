package com.company.email.service;

import com.company.email.dto.EmailJobContentDTO;
import com.company.email.dto.EmailRecipientLogDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class EmailWorkerService {

    private final JdbcTemplate jdbcTemplate;

    public EmailWorkerService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Long> getClaimableJobIds() {

        String sql = "CALL sp_get_claimable_email_jobs()";

        return jdbcTemplate.queryForList(sql, Long.class);
    }

    public boolean claimEmailJob(Long jobId) {

        String sql = "CALL sp_claim_email_job(?)";

        Map<String, Object> result =
                jdbcTemplate.queryForMap(sql, jobId);

        Number claimed = (Number) result.get("claimed");

        return claimed.intValue() == 1;
    }

    public List<Long> getPendingEmailLogIds(Long jobId) {

        String sql = "CALL sp_get_pending_email_logs(?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getLong("id"),
                jobId
        );
    }

    public boolean claimEmailLog(Long logId) {

        String sql = "CALL sp_claim_email_log(?)";

        Map<String, Object> result =
                jdbcTemplate.queryForMap(sql, logId);

        Number claimed = (Number) result.get("claimed");

        return claimed.intValue() == 1;
    }

    public void updateEmailLog(
            Long logId,
            String status,
            boolean retryable,
            String errorMessage,
            LocalDateTime nextRetryAt
    ) {

        String sql = "CALL sp_update_email_log(?, ?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                logId,
                status,
                retryable,
                errorMessage,
                nextRetryAt
        );
    }

    public void finalizeEmailJob(Long jobId) {

        String sql = "CALL sp_finalize_email_job(?)";

        jdbcTemplate.queryForList(sql, jobId);
    }

    public EmailJobContentDTO getEmailJobContent(Long jobId) {
        String sql = "CALL sp_get_email_job(?)";

        Map<String, Object> result =
                jdbcTemplate.queryForMap(sql, jobId);

        return new EmailJobContentDTO(
                ((Number) result.get("id")).longValue(),
                (String) result.get("record_reference_snapshot"),
                (String) result.get("record_title_snapshot"),
                (String) result.get("subject_snapshot"),
                (String) result.get("body_html_snapshot"),
                (String) result.get("body_text_snapshot")
        );
    }

    public EmailRecipientLogDTO getClaimedEmailLog(Long logId) {
        String sql = "CALL sp_get_claimed_email_log(?)";

        Map<String, Object> result =
                jdbcTemplate.queryForMap(sql, logId);

        return new EmailRecipientLogDTO(
                ((Number) result.get("id")).longValue(),
                ((Number) result.get("job_id")).longValue(),
                ((Number) result.get("recipient_id")).longValue(),
                (String) result.get("recipient_name"),
                (String) result.get("recipient_email"),
                ((Number) result.get("attempt_count")).intValue()
        );
    }

    public void testClaimedEmailLog(Long logId) {
        EmailRecipientLogDTO result = getClaimedEmailLog(logId);
        System.out.println("Claimed email log: " + result);
    }
}