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
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `recipient_id` bigint unsigned DEFAULT NULL,
  `recipient_name` varchar(200) NOT NULL,
  `recipient_email` varchar(254) NOT NULL,
  `status` enum('PENDING','PROCESSING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  `attempt_count` int unsigned NOT NULL DEFAULT '0',
  `is_retryable` tinyint(1) NOT NULL DEFAULT '1',
  `next_retry_at` datetime DEFAULT NULL,
  `last_attempt_at` datetime DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `error_message` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_job_status` (`job_id`,`status`),
  KEY `idx_logs_retry` (`status`,`next_retry_at`),
  KEY `idx_logs_recipient` (`recipient_id`),
  CONSTRAINT `fk_logs_job` FOREIGN KEY (`job_id`) REFERENCES `email_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logs_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `recipients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_logs`
--

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
INSERT INTO `email_logs` VALUES (5,3,1,'Amal Perera','amal@example.com','SENT',1,0,NULL,'2026-10-31 21:57:07',NULL,'2026-10-31 22:06:11',NULL,'2026-10-31 21:57:02','2026-10-31 22:06:11'),(6,3,2,'Kamal Silva','kamal@example.com','FAILED',1,1,'2026-10-31 22:11:45','2026-10-31 21:57:07',NULL,NULL,'Test failure - SMTP connection unavailable','2026-10-31 21:57:02','2026-10-31 22:06:45');
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-01  2:15:07
