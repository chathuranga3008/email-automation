-- ============================================================
-- EMAIL AUTOMATION SYSTEM
-- MySQL 8
-- ============================================================

CREATE DATABASE IF NOT EXISTS email_automation
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE email_automation;

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    record_reference VARCHAR(100) NOT NULL,
    record_title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_records_reference (record_reference),
    KEY idx_records_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recipients (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    recipient_name VARCHAR(200) NOT NULL,
    email_address VARCHAR(254) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_recipients_email (email_address),
    KEY idx_recipients_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS record_recipients (
    record_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (record_id, recipient_id),
    CONSTRAINT fk_rr_record
        FOREIGN KEY (record_id) REFERENCES records(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rr_recipient
        FOREIGN KEY (recipient_id) REFERENCES recipients(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_templates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    template_code VARCHAR(100) NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    subject_template VARCHAR(500) NOT NULL,
    body_html LONGTEXT NOT NULL,
    body_text LONGTEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_template_code (template_code),
    KEY idx_templates_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_jobs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    idempotency_key VARCHAR(100) NOT NULL,
    record_id BIGINT UNSIGNED NULL,
    template_id BIGINT UNSIGNED NULL,

    -- Immutable snapshots: later template/record edits do not
    -- change the content of an already-created job.
    record_reference_snapshot VARCHAR(100) NOT NULL,
    record_title_snapshot VARCHAR(255) NOT NULL,
    template_code_snapshot VARCHAR(100) NOT NULL,
    template_name_snapshot VARCHAR(200) NOT NULL,
    subject_snapshot VARCHAR(500) NOT NULL,
    body_html_snapshot LONGTEXT NOT NULL,
    body_text_snapshot LONGTEXT NULL,

    status ENUM(
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'PARTIAL',
        'FAILED'
    ) NOT NULL DEFAULT 'PENDING',

    total_recipients INT UNSIGNED NOT NULL DEFAULT 0,
    sent_count INT UNSIGNED NOT NULL DEFAULT 0,
    failed_count INT UNSIGNED NOT NULL DEFAULT 0,

    created_by VARCHAR(150) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,

    -- Worker lease. A job can be claimed again after this expires.
    locked_until DATETIME NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_email_jobs_idempotency (idempotency_key),
    KEY idx_email_jobs_status_created (status, created_at),
    KEY idx_email_jobs_record (record_id),

    CONSTRAINT fk_jobs_record
        FOREIGN KEY (record_id) REFERENCES records(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_jobs_template
        FOREIGN KEY (template_id) REFERENCES email_templates(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    job_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NULL,

    -- Snapshot of the recipient at the time the job was created.
    recipient_name VARCHAR(200) NOT NULL,
    recipient_email VARCHAR(254) NOT NULL,

    status ENUM(
        'PENDING',
        'PROCESSING',
        'SENT',
        'FAILED'
    ) NOT NULL DEFAULT 'PENDING',

    attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
    is_retryable BOOLEAN NOT NULL DEFAULT TRUE,
    next_retry_at DATETIME NULL,
    last_attempt_at DATETIME NULL,
    claimed_at DATETIME NULL,
    sent_at DATETIME NULL,
    error_message TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_logs_job_status (job_id, status),
    KEY idx_logs_retry (status, next_retry_at),
    KEY idx_logs_recipient (recipient_id),

    CONSTRAINT fk_logs_job
        FOREIGN KEY (job_id) REFERENCES email_jobs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_logs_recipient
        FOREIGN KEY (recipient_id) REFERENCES recipients(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- 2. SAMPLE DATA
-- ============================================================

INSERT INTO records
    (record_reference, record_title, description)
VALUES
    ('CASE-2026-001', 'Annual Compliance Review',
     'Annual compliance review notification'),
    ('CASE-2026-002', 'System Maintenance Notice',
     'Scheduled system maintenance notification'),
    ('CASE-2026-003', 'Project Status Update',
     'Project status notification')
ON DUPLICATE KEY UPDATE
    record_title = VALUES(record_title),
    description = VALUES(description);

INSERT INTO recipients (recipient_name, email_address)
VALUES
    ('Amal Perera', 'amal@example.com'),
    ('Kamal Silva', 'kamal@example.com'),
    ('Nimali Fernando', 'nimali@example.com'),
    ('Saman Jayasinghe', 'saman@example.com')
ON DUPLICATE KEY UPDATE
    recipient_name = VALUES(recipient_name);

-- Associate recipients with records.
INSERT IGNORE INTO record_recipients (record_id, recipient_id)
SELECT r.id, p.id
FROM records r
JOIN recipients p
WHERE
    (r.record_reference = 'CASE-2026-001'
        AND p.email_address IN ('amal@example.com',
                                'kamal@example.com'))
 OR (r.record_reference = 'CASE-2026-002'
        AND p.email_address IN ('nimali@example.com',
                                'saman@example.com'))
 OR (r.record_reference = 'CASE-2026-003'
        AND p.email_address IN ('amal@example.com',
                                'nimali@example.com',
                                'saman@example.com'));

INSERT INTO email_templates
    (template_code, template_name, subject_template,
     body_html, body_text)
VALUES
(
    'STANDARD_NOTIFICATION',
    'Standard Notification',
    'Notification: {{recordReference}}',
    '<html><body>
        <p>Dear {{recipientName}},</p>
        <p>This is a notification regarding
           <strong>{{recordTitle}}</strong>.</p>
        <p>Reference: {{recordReference}}</p>
        <p>Regards,<br>Notification Team</p>
     </body></html>',
    'Dear {{recipientName}},

This is a notification regarding {{recordTitle}}.
Reference: {{recordReference}}

Regards,
Notification Team'
)
ON DUPLICATE KEY UPDATE
    template_name = VALUES(template_name),
    subject_template = VALUES(subject_template),
    body_html = VALUES(body_html),
    body_text = VALUES(body_text);


-- ============================================================
-- 3. STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- ------------------------------------------------------------
-- Get active records for the Angular screen
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_records()
BEGIN
    SELECT
        id,
        record_reference,
        record_title,
        description,
        created_at
    FROM records
    WHERE is_active = TRUE
    ORDER BY created_at DESC;
END$$


-- ------------------------------------------------------------
-- Get one record's active recipients for preview
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_record_recipients(
    IN p_record_id BIGINT UNSIGNED
)
BEGIN
    SELECT
        p.id AS recipient_id,
        p.recipient_name,
        p.email_address
    FROM record_recipients rr
    JOIN recipients p ON p.id = rr.recipient_id
    JOIN records r ON r.id = rr.record_id
    WHERE rr.record_id = p_record_id
      AND r.is_active = TRUE
      AND p.is_active = TRUE
    ORDER BY p.recipient_name;
END$$


-- ------------------------------------------------------------
-- Get active email templates
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_email_templates()
BEGIN
    SELECT
        id,
        template_code,
        template_name,
        subject_template,
        body_html,
        body_text
    FROM email_templates
    WHERE is_active = TRUE
    ORDER BY template_name;
END$$


-- ------------------------------------------------------------
-- Create a job and snapshot its recipients and template.
--
-- Returns the existing job if the idempotency key has
-- already been used.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_create_email_job(
    IN p_record_id BIGINT UNSIGNED,
    IN p_template_id BIGINT UNSIGNED,
    IN p_idempotency_key VARCHAR(100),
    IN p_created_by VARCHAR(150)
)
main: BEGIN
    DECLARE v_record_reference VARCHAR(100);
    DECLARE v_record_title VARCHAR(255);
    DECLARE v_template_code VARCHAR(100);
    DECLARE v_template_name VARCHAR(200);
    DECLARE v_subject VARCHAR(500);
    DECLARE v_body_html LONGTEXT;
    DECLARE v_body_text LONGTEXT;
    DECLARE v_recipient_count INT DEFAULT 0;
    DECLARE v_job_id BIGINT UNSIGNED;
    DECLARE v_duplicate BOOLEAN DEFAULT FALSE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_idempotency_key IS NULL
       OR TRIM(p_idempotency_key) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Idempotency key is required';
    END IF;

    START TRANSACTION;

    -- Return an already-created job for this key.
    SELECT id INTO v_job_id
    FROM email_jobs
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF v_job_id IS NOT NULL THEN
        COMMIT;
        SELECT id, status, total_recipients, created_at
        FROM email_jobs
        WHERE id = v_job_id;
        LEAVE main;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM records
        WHERE id = p_record_id AND is_active = TRUE
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Record does not exist or is inactive';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM email_templates
        WHERE id = p_template_id AND is_active = TRUE
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Template does not exist or is inactive';
    END IF;

    SELECT record_reference, record_title
    INTO v_record_reference, v_record_title
    FROM records
    WHERE id = p_record_id;

    SELECT template_code, template_name,
           subject_template, body_html, body_text
    INTO v_template_code, v_template_name,
         v_subject, v_body_html, v_body_text
    FROM email_templates
    WHERE id = p_template_id;

    SELECT COUNT(*)
    INTO v_recipient_count
    FROM record_recipients rr
    JOIN recipients p ON p.id = rr.recipient_id
    WHERE rr.record_id = p_record_id
      AND p.is_active = TRUE;

    IF v_recipient_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No active recipients found for this record';
    END IF;

    IF v_recipient_count > 10 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A job cannot contain more than 10 recipients';
    END IF;

    -- The nested handler handles a concurrent request that
    -- inserts the same unique idempotency key.
    BEGIN
        DECLARE CONTINUE HANDLER FOR 1062
            SET v_duplicate = TRUE;

        INSERT INTO email_jobs (
            idempotency_key,
            record_id,
            template_id,
            record_reference_snapshot,
            record_title_snapshot,
            template_code_snapshot,
            template_name_snapshot,
            subject_snapshot,
            body_html_snapshot,
            body_text_snapshot,
            status,
            total_recipients,
            created_by
        )
        VALUES (
            p_idempotency_key,
            p_record_id,
            p_template_id,
            v_record_reference,
            v_record_title,
            v_template_code,
            v_template_name,
            v_subject,
            v_body_html,
            v_body_text,
            'PENDING',
            v_recipient_count,
            p_created_by
        );
    END;

    IF v_duplicate = TRUE THEN
        SELECT id INTO v_job_id
        FROM email_jobs
        WHERE idempotency_key = p_idempotency_key;

        COMMIT;

        SELECT id, status, total_recipients, created_at
        FROM email_jobs
        WHERE id = v_job_id;

        LEAVE main;
    END IF;

    SET v_job_id = LAST_INSERT_ID();

    INSERT INTO email_logs (
        job_id,
        recipient_id,
        recipient_name,
        recipient_email,
        status
    )
    SELECT
        v_job_id,
        p.id,
        p.recipient_name,
        p.email_address,
        'PENDING'
    FROM record_recipients rr
    JOIN recipients p ON p.id = rr.recipient_id
    WHERE rr.record_id = p_record_id
      AND p.is_active = TRUE;

    COMMIT;

    SELECT id, status, total_recipients, created_at
    FROM email_jobs
    WHERE id = v_job_id;
END$$


-- ------------------------------------------------------------
-- Atomically claim a job.
-- A job lease expires after five minutes.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_claim_email_job(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_claimed INT DEFAULT 0;

    UPDATE email_jobs
    SET status = 'PROCESSING',
        started_at = COALESCE(started_at, NOW()),
        locked_until = DATE_ADD(NOW(), INTERVAL 5 MINUTE)
    WHERE id = p_job_id
      AND (
          status = 'PENDING'
          OR (
              status = 'PROCESSING'
              AND locked_until IS NOT NULL
              AND locked_until < NOW()
          )
      );

    SET v_claimed = ROW_COUNT();

    SELECT v_claimed AS claimed;

    IF v_claimed = 1 THEN
        SELECT *
        FROM email_jobs
        WHERE id = p_job_id;
    END IF;
END$$


-- ------------------------------------------------------------
-- Get pending email log rows for a claimed job.
-- This is a read operation; claim each row before sending.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_pending_email_logs(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    SELECT
        id,
        job_id,
        recipient_id,
        recipient_name,
        recipient_email,
        attempt_count
    FROM email_logs
    WHERE job_id = p_job_id
      AND status = 'PENDING'
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY id;
END$$


-- ------------------------------------------------------------
-- Atomically claim one recipient email before SMTP sending.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_claim_email_log(
    IN p_log_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_claimed INT DEFAULT 0;

    UPDATE email_logs
    SET status = 'PROCESSING',
        attempt_count = attempt_count + 1,
        last_attempt_at = NOW(),
        claimed_at = NOW(),
        next_retry_at = NULL,
        error_message = NULL
    WHERE id = p_log_id
      AND status = 'PENDING'
      AND attempt_count < 5
      AND (next_retry_at IS NULL OR next_retry_at <= NOW());

    SET v_claimed = ROW_COUNT();

    SELECT v_claimed AS claimed;

    IF v_claimed = 1 THEN
        SELECT
            id,
            job_id,
            recipient_id,
            recipient_name,
            recipient_email,
            attempt_count
        FROM email_logs
        WHERE id = p_log_id;
    END IF;
END$$


-- ------------------------------------------------------------
-- Record the outcome of one SMTP attempt.
-- p_status must be SENT or FAILED.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_update_email_log(
    IN p_log_id BIGINT UNSIGNED,
    IN p_status VARCHAR(20),
    IN p_is_retryable BOOLEAN,
    IN p_error_message TEXT,
    IN p_next_retry_at DATETIME
)
BEGIN
    IF p_status NOT IN ('SENT', 'FAILED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Status must be SENT or FAILED';
    END IF;

    UPDATE email_logs
    SET status = p_status,
        is_retryable = CASE
            WHEN p_status = 'FAILED' THEN p_is_retryable
            ELSE FALSE
        END,
        error_message = CASE
            WHEN p_status = 'FAILED' THEN p_error_message
            ELSE NULL
        END,
        sent_at = CASE
            WHEN p_status = 'SENT' THEN NOW()
            ELSE NULL
        END,
        next_retry_at = CASE
            WHEN p_status = 'FAILED'
                 AND p_is_retryable = TRUE
                 AND attempt_count < 5
                THEN p_next_retry_at
            ELSE NULL
        END,
        claimed_at = NULL
    WHERE id = p_log_id
      AND status = 'PROCESSING';

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Email log was not in PROCESSING state';
    END IF;
END$$


-- ------------------------------------------------------------
-- Finalize a job after its recipient attempts have finished.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_finalize_email_job(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_sent INT DEFAULT 0;
    DECLARE v_failed INT DEFAULT 0;
    DECLARE v_pending INT DEFAULT 0;
    DECLARE v_processing INT DEFAULT 0;
    DECLARE v_new_status VARCHAR(20);

    SELECT
        COUNT(*),
        COALESCE(SUM(status = 'SENT'), 0),
        COALESCE(SUM(status = 'FAILED'), 0),
        COALESCE(SUM(status = 'PENDING'), 0),
        COALESCE(SUM(status = 'PROCESSING'), 0)
    INTO v_total, v_sent, v_failed, v_pending, v_processing
    FROM email_logs
    WHERE job_id = p_job_id;

    IF v_pending > 0 OR v_processing > 0 THEN
        SET v_new_status = 'PROCESSING';
    ELSEIF v_sent = v_total AND v_total > 0 THEN
        SET v_new_status = 'COMPLETED';
    ELSEIF v_sent > 0 AND v_failed > 0 THEN
        SET v_new_status = 'PARTIAL';
    ELSE
        SET v_new_status = 'FAILED';
    END IF;

    UPDATE email_jobs
    SET status = v_new_status,
        sent_count = v_sent,
        failed_count = v_failed,
        completed_at = CASE
            WHEN v_new_status IN ('COMPLETED', 'PARTIAL', 'FAILED')
                THEN NOW()
            ELSE NULL
        END,
        locked_until = NULL
    WHERE id = p_job_id;

    SELECT
        id,
        status,
        total_recipients,
        sent_count,
        failed_count,
        completed_at
    FROM email_jobs
    WHERE id = p_job_id;
END$$


-- ------------------------------------------------------------
-- Get job details
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_email_job(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    SELECT
        id,
        record_reference_snapshot,
        record_title_snapshot,
        template_name_snapshot,
        subject_snapshot,
        status,
        total_recipients,
        sent_count,
        failed_count,
        created_by,
        created_at,
        started_at,
        completed_at
    FROM email_jobs
    WHERE id = p_job_id;
END$$


-- ------------------------------------------------------------
-- Get individual recipient logs for a job
-- ------------------------------------------------------------

CREATE PROCEDURE sp_get_email_job_logs(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    SELECT
        id,
        recipient_name,
        recipient_email,
        status,
        attempt_count,
        is_retryable,
        last_attempt_at,
        sent_at,
        error_message
    FROM email_logs
    WHERE job_id = p_job_id
    ORDER BY id;
END$$


-- ------------------------------------------------------------
-- Retry eligible failed emails in a finished job.
-- Only retryable failures with fewer than five attempts
-- are reset to PENDING.
-- ------------------------------------------------------------

CREATE PROCEDURE sp_retry_failed_emails(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_job_status VARCHAR(20);
    DECLARE v_reset_count INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status
    INTO v_job_status
    FROM email_jobs
    WHERE id = p_job_id
    FOR UPDATE;

    IF v_job_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Email job not found';
    END IF;

    IF v_job_status NOT IN ('PARTIAL', 'FAILED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only PARTIAL or FAILED jobs can be retried';
    END IF;

    UPDATE email_logs
    SET status = 'PENDING',
        next_retry_at = NULL,
        error_message = NULL,
        claimed_at = NULL
    WHERE job_id = p_job_id
      AND status = 'FAILED'
      AND is_retryable = TRUE
      AND attempt_count < 5;

    SET v_reset_count = ROW_COUNT();

    IF v_reset_count > 0 THEN
        UPDATE email_jobs
        SET status = 'PENDING',
            completed_at = NULL,
            locked_until = NULL
        WHERE id = p_job_id;
    END IF;

    COMMIT;

    SELECT
        p_job_id AS job_id,
        v_reset_count AS emails_queued_for_retry;
END$$

DELIMITER ;


-- ============================================================
-- 4. QUICK TESTS
-- ============================================================

CALL sp_get_records();

-- Replace 1 with a record ID returned above.
CALL sp_get_record_recipients(1);

CALL sp_get_email_templates();

-- Example job creation. Use a new unique key for each
-- intentional send operation.
CALL sp_create_email_job(
    1,
    1,
    'TEST-SEND-2026-001',
    'admin'
);

-- After creating a job, use its returned ID:
-- CALL sp_claim_email_job(1);
-- CALL sp_get_pending_email_logs(1);
-- CALL sp_claim_email_log(1);
-- CALL sp_update_email_log(1, 'SENT', FALSE, NULL, NULL);
-- CALL sp_finalize_email_job(1);
-- CALL sp_get_email_job(1);
-- CALL sp_get_email_job_logs(1);
