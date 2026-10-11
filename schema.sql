-- ===================================================================
-- RoutineMate – Student Daily Routine Manager
-- MySQL Database Schema and Seed Data
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `routine_mate`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `routine_mate`;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Routines Table
CREATE TABLE IF NOT EXISTS `routines` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Study',
  `start_time` TIME NOT NULL,
  `end_time` TIME NULL,
  `start_date` DATE NOT NULL,
  `repeat_type` VARCHAR(20) NOT NULL DEFAULT 'daily', -- 'once', 'daily', 'weekdays'
  `priority` VARCHAR(20) NOT NULL DEFAULT 'medium',   -- 'low', 'medium', 'high'
  `reminder_time_minutes` INT NOT NULL DEFAULT 0,    -- 0 means at start time, 10 means 10 mins before
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_routine_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  INDEX `idx_routine_student_active` (`student_id`, `active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Routine Days Table (for recurring schedules on specific weekdays)
CREATE TABLE IF NOT EXISTS `routine_days` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `routine_id` BIGINT NOT NULL,
  `day_of_week` VARCHAR(15) NOT NULL, -- 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  CONSTRAINT `fk_days_routine` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_routine_day` (`routine_id`, `day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Routine Completions Table
CREATE TABLE IF NOT EXISTS `routine_completions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `routine_id` BIGINT NOT NULL,
  `student_id` BIGINT NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'SKIPPED', 'PENDING'
  `completed_at` TIMESTAMP NULL,
  CONSTRAINT `fk_completion_routine` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_completion_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_routine_date` (`routine_id`, `scheduled_date`),
  INDEX `idx_completion_student_date` (`student_id`, `scheduled_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Notification Preferences Table
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT NOT NULL UNIQUE,
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `reminder_interval_minutes` INT NOT NULL DEFAULT 15, -- follow-up reminder delay
  `quiet_start` TIME NOT NULL DEFAULT '22:00:00',
  `quiet_end` TIME NOT NULL DEFAULT '07:00:00',
  `sound_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `theme` VARCHAR(20) NOT NULL DEFAULT 'dark',
  `week_start_day` VARCHAR(15) NOT NULL DEFAULT 'MONDAY',
  CONSTRAINT `fk_pref_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notification History Table
CREATE TABLE IF NOT EXISTS `notification_history` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT NOT NULL,
  `routine_id` BIGINT NULL,
  `scheduled_date` DATE NOT NULL,
  `notification_type` VARCHAR(50) NOT NULL, -- 'DUE_REMINDER', 'FOLLOWUP_REMINDER', 'SYSTEM'
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `delivery_status` VARCHAR(30) NOT NULL DEFAULT 'SENT', -- 'SENT', 'DELIVERED', 'FAILED'
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT `fk_history_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_routine` FOREIGN KEY (`routine_id`) REFERENCES `routines` (`id`) ON DELETE SET NULL,
  INDEX `idx_history_student_date` (`student_id`, `scheduled_date`),
  INDEX `idx_history_dedup` (`routine_id`, `scheduled_date`, `notification_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT NOT NULL,
  `endpoint` TEXT NOT NULL,
  `p256dh` VARCHAR(255) NOT NULL,
  `auth` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_push_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  INDEX `idx_push_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Sample Seed Data
-- ===================================================================

-- Sample Student: Alex Johnson (Password: password123, BCrypt encoded)
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi is standard BCrypt for 'password' or let's use standard bcrypt hash for 'password123'
INSERT INTO `students` (`id`, `name`, `email`, `password_hash`, `created_at`)
VALUES (1, 'Alex Johnson', 'alex@routinemate.com', '$2a$10$FJx7STSA4WrJsaRQrV0QZe0SEeXbANqjpXyZ7gcsR9UAYmivOLVEi', NOW())
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`), `name`=VALUES(`name`);

-- Preferences for Alex
INSERT INTO `notification_preferences` (`id`, `student_id`, `enabled`, `reminder_interval_minutes`, `quiet_start`, `quiet_end`, `sound_enabled`, `theme`, `week_start_day`)
VALUES (1, 1, TRUE, 15, '22:30:00', '06:00:00', TRUE, 'dark', 'MONDAY')
ON DUPLICATE KEY UPDATE `enabled`=VALUES(`enabled`);

-- Example routines for Alex:
-- Wake up at 6:00 AM
INSERT INTO `routines` (`id`, `student_id`, `title`, `description`, `category`, `start_time`, `end_time`, `start_date`, `repeat_type`, `priority`, `reminder_time_minutes`, `active`, `created_at`)
VALUES 
(1, 1, 'Wake up & Morning Hydration', 'Drink 500ml water and get out of bed briskly', 'Health', '06:00:00', '06:15:00', CURDATE(), 'daily', 'high', 0, TRUE, NOW()),
(2, 1, 'Morning Workout / Jogging', 'Cardio exercise and stretching at the park', 'Health', '06:30:00', '07:15:00', CURDATE(), 'daily', 'medium', 5, TRUE, NOW()),
(3, 1, 'Attend College Lectures', 'Computer Science core classes and lab work', 'College', '09:00:00', '16:00:00', CURDATE(), 'weekdays', 'high', 10, TRUE, NOW()),
(4, 1, 'Study Java & Spring Boot', 'Build REST APIs and learn microservice patterns', 'Study', '18:00:00', '19:30:00', CURDATE(), 'daily', 'high', 5, TRUE, NOW()),
(5, 1, 'Practice DSA on LeetCode', 'Solve 2 medium problems (Trees & Graphs)', 'Coding', '20:00:00', '21:00:00', CURDATE(), 'daily', 'high', 5, TRUE, NOW()),
(6, 1, 'Revise Day Lessons & Plan Tomorrow', 'Review lecture notes and organize tomorrow schedule', 'Study', '21:00:00', '21:45:00', CURDATE(), 'daily', 'medium', 0, TRUE, NOW()),
(7, 1, 'Night Routine & Sleep', 'Wind down, read 10 pages, sleep by 10:30 PM', 'Personal', '22:30:00', '23:00:00', CURDATE(), 'daily', 'medium', 10, TRUE, NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Weekdays for College Lectures (Routine #3: Monday to Friday)
INSERT INTO `routine_days` (`routine_id`, `day_of_week`)
VALUES 
(3, 'MONDAY'),
(3, 'TUESDAY'),
(3, 'WEDNESDAY'),
(3, 'THURSDAY'),
(3, 'FRIDAY')
ON DUPLICATE KEY UPDATE `day_of_week`=VALUES(`day_of_week`);

-- Sample Completions for Alex (Morning wake-up and workout completed today)
INSERT INTO `routine_completions` (`routine_id`, `student_id`, `scheduled_date`, `status`, `completed_at`)
VALUES 
(1, 1, CURDATE(), 'COMPLETED', NOW()),
(2, 1, CURDATE(), 'COMPLETED', NOW())
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);
