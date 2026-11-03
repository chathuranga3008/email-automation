CREATE DATABASE  IF NOT EXISTS `email_automation` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `email_automation`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: email_automation
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping routines for database 'email_automation'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_claim_email_job` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_claim_email_job`(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_claimed INT DEFAULT 0;

    UPDATE email_jobs
    SET
        status = 'PROCESSING',
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

    SELECT
        v_claimed AS claimed,
        id,
        status,
        total_recipients,
        locked_until
    FROM email_jobs
    WHERE id = p_job_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_claim_email_log` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_claim_email_log`(
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
      AND attempt_count < 5
      AND (
          status = 'PENDING'
          OR (
              status = 'FAILED'
              AND is_retryable = TRUE
          )
      )
      AND (
          next_retry_at IS NULL
          OR next_retry_at <= NOW()
      );

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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_email_job` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_email_job`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_finalize_email_job` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_finalize_email_job`(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_sent INT DEFAULT 0;
    DECLARE v_failed INT DEFAULT 0;
    DECLARE v_pending INT DEFAULT 0;
    DECLARE v_ready_pending INT DEFAULT 0;
    DECLARE v_ready_failed_retry INT DEFAULT 0;
    DECLARE v_waiting_retry INT DEFAULT 0;
    DECLARE v_processing INT DEFAULT 0;
    DECLARE v_next_retry_at DATETIME;
    DECLARE v_new_status VARCHAR(20);

    SELECT
        COUNT(*),
        COALESCE(SUM(status = 'SENT'), 0),
        COALESCE(SUM(status = 'FAILED'), 0),
        COALESCE(SUM(status = 'PENDING'), 0),

        COALESCE(SUM(
            status = 'PENDING'
            AND (
                next_retry_at IS NULL
                OR next_retry_at <= NOW()
            )
        ), 0),

        COALESCE(SUM(
            status = 'FAILED'
            AND is_retryable = TRUE
            AND attempt_count < 5
            AND (
                next_retry_at IS NULL
                OR next_retry_at <= NOW()
            )
        ), 0),

        COALESCE(SUM(
            status = 'FAILED'
            AND is_retryable = TRUE
            AND attempt_count < 5
            AND next_retry_at > NOW()
        ), 0),

        COALESCE(SUM(status = 'PROCESSING'), 0),

        MIN(
            CASE
                WHEN (
                    status = 'PENDING'
                    OR (
                        status = 'FAILED'
                        AND is_retryable = TRUE
                        AND attempt_count < 5
                    )
                )
                AND next_retry_at > NOW()
                THEN next_retry_at
                ELSE NULL
            END
        )

    INTO
        v_total,
        v_sent,
        v_failed,
        v_pending,
        v_ready_pending,
        v_ready_failed_retry,
        v_waiting_retry,
        v_processing,
        v_next_retry_at

    FROM email_logs
    WHERE job_id = p_job_id;

    IF v_total = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Email job has no recipient logs';
    END IF;

    IF v_processing > 0 THEN

        SET v_new_status = 'PROCESSING';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            completed_at = NULL
        WHERE id = p_job_id;

    ELSEIF v_ready_pending > 0
        OR v_ready_failed_retry > 0 THEN

        SET v_new_status = 'PENDING';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            locked_until = NULL,
            completed_at = NULL
        WHERE id = p_job_id;

    ELSEIF v_pending > 0
        OR v_waiting_retry > 0 THEN

        SET v_new_status = 'PROCESSING';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            locked_until = v_next_retry_at,
            completed_at = NULL
        WHERE id = p_job_id;

    ELSEIF v_sent = v_total THEN

        SET v_new_status = 'COMPLETED';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = p_job_id;

    ELSEIF v_sent > 0 THEN

        SET v_new_status = 'PARTIAL';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = p_job_id;

    ELSE

        SET v_new_status = 'FAILED';

        UPDATE email_jobs
        SET status = v_new_status,
            sent_count = v_sent,
            failed_count = v_failed,
            completed_at = NOW(),
            locked_until = NULL
        WHERE id = p_job_id;

    END IF;

    SELECT
        id,
        status,
        total_recipients,
        sent_count,
        failed_count,
        locked_until,
        completed_at
    FROM email_jobs
    WHERE id = p_job_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_claimable_email_jobs` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_claimable_email_jobs`()
BEGIN
    SELECT id
    FROM email_jobs
    WHERE
        status = 'PENDING'
        OR (
            status = 'PROCESSING'
            AND locked_until IS NOT NULL
            AND locked_until < NOW()
        )
    ORDER BY created_at ASC, id ASC
    LIMIT 20;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_claimed_email_log` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_claimed_email_log`(
    IN p_log_id BIGINT UNSIGNED
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
    WHERE id = p_log_id
      AND status = 'PROCESSING';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_email_job` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_email_job`(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    SELECT
        id,
        record_reference_snapshot,
        record_title_snapshot,
        template_name_snapshot,
        subject_snapshot,
        body_html_snapshot,
        body_text_snapshot,
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_email_job_logs` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_email_job_logs`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_email_templates` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_email_templates`()
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_pending_email_logs` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_pending_email_logs`(
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
      AND (
          (
              status = 'PENDING'
              AND (
                  next_retry_at IS NULL
                  OR next_retry_at <= NOW()
              )
          )
          OR
          (
              status = 'FAILED'
              AND is_retryable = TRUE
              AND attempt_count < 5
              AND next_retry_at IS NOT NULL
              AND next_retry_at <= NOW()
          )
      )
    ORDER BY id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_records` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_records`()
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_record_recipients` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_record_recipients`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_recover_stale_email_logs` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recover_stale_email_logs`(
    IN p_job_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_permanently_failed INT DEFAULT 0;
    DECLARE v_recovered INT DEFAULT 0;
    DECLARE v_locked_job_id BIGINT UNSIGNED DEFAULT NULL;

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET v_locked_job_id = NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    /*
      Lock the job row without producing
      an intermediate result set.
    */
    SELECT id
    INTO v_locked_job_id
    FROM email_jobs
    WHERE id = p_job_id
      AND status = 'PROCESSING'
    FOR UPDATE;

    IF v_locked_job_id IS NOT NULL THEN

        /*
          Permanently fail stale logs at maximum attempts.
        */
        UPDATE email_logs
        SET
            status = 'FAILED',
            is_retryable = FALSE,
            next_retry_at = NULL,
            claimed_at = NULL,
            error_message =
                'Processing expired after maximum attempts.',
            updated_at = NOW()
        WHERE job_id = p_job_id
          AND status = 'PROCESSING'
          AND attempt_count >= 5
          AND COALESCE(claimed_at, last_attempt_at)
                < DATE_SUB(NOW(), INTERVAL 5 MINUTE);

        SET v_permanently_failed = ROW_COUNT();

        /*
          Recover stale logs with attempts remaining.
        */
        UPDATE email_logs
        SET
            status = 'PENDING',
            is_retryable = TRUE,
            next_retry_at = NULL,
            claimed_at = NULL,
            error_message =
                'Recovered after processing timeout.',
            updated_at = NOW()
        WHERE job_id = p_job_id
          AND status = 'PROCESSING'
          AND attempt_count < 5
          AND COALESCE(claimed_at, last_attempt_at)
                < DATE_SUB(NOW(), INTERVAL 5 MINUTE);

        SET v_recovered = ROW_COUNT();

    END IF;

    COMMIT;

    /*
      Return only the final result set.
    */
    SELECT
        p_job_id AS job_id,
        v_recovered AS recovered_logs,
        v_permanently_failed AS permanently_failed_logs;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_retry_failed_emails` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_retry_failed_emails`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_email_log` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_email_log`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03 17:33:33
