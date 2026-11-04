package com.company.email.service;

import com.company.email.dto.DashboardSummaryDTO;
import com.company.email.dto.RecentEmailJobDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardSummaryDTO getDashboardSummary() {

        String sql = "CALL sp_get_dashboard_summary()";

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> new DashboardSummaryDTO(
                        rs.getLong("total_jobs"),
                        rs.getLong("pending_jobs"),
                        rs.getLong("processing_jobs"),
                        rs.getLong("completed_jobs"),
                        rs.getLong("partial_jobs"),
                        rs.getLong("failed_jobs"),
                        rs.getLong("total_recipients"),
                        rs.getLong("sent_recipients"),
                        rs.getLong("failed_recipients")
                )
        );
    }

    public List<RecentEmailJobDTO> getRecentEmailJobs() {

        String sql = "CALL sp_get_recent_email_jobs(?)";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new RecentEmailJobDTO(
                        rs.getLong("id"),
                        rs.getString("record_reference_snapshot"),
                        rs.getString("record_title_snapshot"),
                        rs.getString("template_name_snapshot"),
                        rs.getString("subject_snapshot"),
                        rs.getString("status"),
                        rs.getLong("total_recipients"),
                        rs.getLong("sent_count"),
                        rs.getLong("failed_count"),
                        toLocalDateTime(rs.getTimestamp("created_at")),
                        toLocalDateTime(rs.getTimestamp("started_at")),
                        toLocalDateTime(rs.getTimestamp("completed_at"))
                ),
                10
        );
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {

        return timestamp != null
                ? timestamp.toLocalDateTime()
                : null;
    }
}
