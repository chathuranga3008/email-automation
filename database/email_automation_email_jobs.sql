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
-- Table structure for table `email_jobs`
--

DROP TABLE IF EXISTS `email_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `idempotency_key` varchar(100) NOT NULL,
  `record_id` bigint unsigned DEFAULT NULL,
  `template_id` bigint unsigned DEFAULT NULL,
  `record_reference_snapshot` varchar(100) NOT NULL,
  `record_title_snapshot` varchar(255) NOT NULL,
  `template_code_snapshot` varchar(100) NOT NULL,
  `template_name_snapshot` varchar(200) NOT NULL,
  `subject_snapshot` varchar(500) NOT NULL,
  `body_html_snapshot` longtext NOT NULL,
  `body_text_snapshot` longtext,
  `status` enum('PENDING','PROCESSING','COMPLETED','PARTIAL','FAILED') NOT NULL DEFAULT 'PENDING',
  `total_recipients` int unsigned NOT NULL DEFAULT '0',
  `sent_count` int unsigned NOT NULL DEFAULT '0',
  `failed_count` int unsigned NOT NULL DEFAULT '0',
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `locked_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email_jobs_idempotency` (`idempotency_key`),
  KEY `idx_email_jobs_status_created` (`status`,`created_at`),
  KEY `idx_email_jobs_record` (`record_id`),
  KEY `fk_jobs_template` (`template_id`),
  CONSTRAINT `fk_jobs_record` FOREIGN KEY (`record_id`) REFERENCES `records` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_template` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_jobs`
--

LOCK TABLES `email_jobs` WRITE;
/*!40000 ALTER TABLE `email_jobs` DISABLE KEYS */;
INSERT INTO `email_jobs` VALUES (3,'render-test-001',1,1,'CASE-2026-001','Annual Compliance Review','STANDARD_NOTIFICATION','Standard Notification','Notification: {{recordReference}}','<html><body>\n        <p>Dear {{recipientName}},</p>\n        <p>This is a notification regarding\n           <strong>{{recordTitle}}</strong>.</p>\n        <p>Reference: {{recordReference}}</p>\n        <p>Regards,<br>Notification Team</p>\n     </body></html>','Dear {{recipientName}},\n\nThis is a notification regarding {{recordTitle}}.\nReference: {{recordReference}}\n\nRegards,\nNotification Team','COMPLETED',2,2,0,NULL,'2026-10-31 21:57:02','2026-10-31 21:57:07','2026-11-03 13:06:22',NULL),(5,'SMTP-BACKGROUND-TEST-001',1,1,'CASE-2026-001','Annual Compliance Review','STANDARD_NOTIFICATION','Standard Notification','Notification: {{recordReference}}','<html><body>\n        <p>Dear {{recipientName}},</p>\n        <p>This is a notification regarding\n           <strong>{{recordTitle}}</strong>.</p>\n        <p>Reference: {{recordReference}}</p>\n        <p>Regards,<br>Notification Team</p>\n     </body></html>','Dear {{recipientName}},\n\nThis is a notification regarding {{recordTitle}}.\nReference: {{recordReference}}\n\nRegards,\nNotification Team','COMPLETED',2,2,0,NULL,'2026-11-03 15:19:10','2026-11-03 15:30:41','2026-11-03 15:30:50',NULL),(6,'RETRY-BACKOFF-TEST-001',2,1,'CASE-2026-002','System Maintenance Notice','STANDARD_NOTIFICATION','Standard Notification','Notification: {{recordReference}}','<html><body>\n        <p>Dear {{recipientName}},</p>\n        <p>This is a notification regarding\n           <strong>{{recordTitle}}</strong>.</p>\n        <p>Reference: {{recordReference}}</p>\n        <p>Regards,<br>Notification Team</p>\n     </body></html>','Dear {{recipientName}},\n\nThis is a notification regarding {{recordTitle}}.\nReference: {{recordReference}}\n\nRegards,\nNotification Team','FAILED',1,0,1,NULL,'2026-11-03 15:44:56','2026-11-03 15:44:58','2026-11-03 16:00:38',NULL),(7,'CRASH-RECOVERY-TEST-001',1,1,'CASE-2026-001','Annual Compliance Review','STANDARD_NOTIFICATION','Standard Notification','Notification: {{recordReference}}','<html><body>\n        <p>Dear {{recipientName}},</p>\n        <p>This is a notification regarding\n           <strong>{{recordTitle}}</strong>.</p>\n        <p>Reference: {{recordReference}}</p>\n        <p>Regards,<br>Notification Team</p>\n     </body></html>','Dear {{recipientName}},\n\nThis is a notification regarding {{recordTitle}}.\nReference: {{recordReference}}\n\nRegards,\nNotification Team','COMPLETED',1,1,0,'Recovery Test','2026-11-03 16:10:35','2026-11-03 16:07:10','2026-11-03 16:15:03',NULL),(8,'SMTP-DB-FAILURE-TEST-001',1,1,'CASE-2026-001','Annual Compliance Review','STANDARD_NOTIFICATION','Standard Notification','Notification: {{recordReference}}','<html><body>\n        <p>Dear {{recipientName}},</p>\n        <p>This is a notification regarding\n           <strong>{{recordTitle}}</strong>.</p>\n        <p>Reference: {{recordReference}}</p>\n        <p>Regards,<br>Notification Team</p>\n     </body></html>','Dear {{recipientName}},\n\nThis is a notification regarding {{recordTitle}}.\nReference: {{recordReference}}\n\nRegards,\nNotification Team','COMPLETED',1,1,0,'SMTP Failure Test','2026-11-03 17:02:30','2026-11-03 17:06:03','2026-11-03 17:17:23',NULL);
/*!40000 ALTER TABLE `email_jobs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-05  0:32:05
