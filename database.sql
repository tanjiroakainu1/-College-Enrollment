-- College Enrollment System
-- Full MySQL schema + starter data
-- Database name required by project: enrollmentcollegesystem

CREATE DATABASE IF NOT EXISTS `enrollmentcollegesystem`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `enrollmentcollegesystem`;

-- Users (admin + students)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `photo` VARCHAR(255) DEFAULT NULL,
  `student_number` VARCHAR(40) DEFAULT NULL,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Course/program catalog
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(40) NOT NULL UNIQUE,
  `name` VARCHAR(180) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 40,
  `department` VARCHAR(120) NOT NULL,
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subjects per course
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `code` VARCHAR(40) NOT NULL UNIQUE,
  `name` VARCHAR(180) NOT NULL,
  `units` INT NOT NULL,
  `prerequisite` VARCHAR(40) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  CONSTRAINT `fk_subjects_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Section management
CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `name` VARCHAR(60) NOT NULL,
  `schedule` VARCHAR(120) NOT NULL,
  `room` VARCHAR(80) NOT NULL,
  `student_limit` INT NOT NULL DEFAULT 40,
  `created_at` DATETIME NOT NULL,
  CONSTRAINT `fk_sections_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enrollment lifecycle
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'enrolled') NOT NULL DEFAULT 'pending',
  `submitted_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  CONSTRAINT `fk_enrollments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Subjects selected in each enrollment
CREATE TABLE IF NOT EXISTS `enrollment_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `enrollment_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `section_id` INT DEFAULT NULL,
  CONSTRAINT `fk_enrollment_subjects_enrollment`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_subjects_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_subjects_section`
    FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment records
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `enrollment_id` INT NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_type` VARCHAR(60) NOT NULL DEFAULT 'tuition',
  `payment_method` VARCHAR(60) NOT NULL DEFAULT 'bank_transfer',
  `reference_no` VARCHAR(120) NOT NULL,
  `payer_name` VARCHAR(120) NOT NULL,
  `payment_date` DATE NOT NULL,
  `proof` VARCHAR(180) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'confirmed', 'rejected') NOT NULL DEFAULT 'pending',
  `paid_at` DATETIME NOT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  CONSTRAINT `fk_payments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_enrollment`
    FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Announcement system
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(180) NOT NULL,
  `body` TEXT NOT NULL,
  `target_role` ENUM('all', 'admin', 'student') NOT NULL DEFAULT 'all',
  `created_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Academic grades
CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `grade` VARCHAR(10) NOT NULL,
  `term` VARCHAR(40) NOT NULL,
  `created_at` DATETIME NOT NULL,
  CONSTRAINT `fk_grades_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance indexes are created automatically by db.php (ensure_indexes)

-- Default accounts (aligned with db.php)
-- Admin: admin@gmail.com / admin123
-- Student: student@gmail.com / student123
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `created_at`)
VALUES ('System Admin', 'admin@gmail.com', '$2y$10$lBNxHsdM7iUAW/Yt4a93Su5QCV5uIyGiAfW5y4rZ2DoBmK37oK8DC', 'admin', 'active', NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `created_at`)
VALUES ('Default Student', 'student@gmail.com', '$2y$10$RLPNUKwdeSvjMZfP9v44L.RUa23HVeBskaQk5m24hU0iAvT70bfXS', 'student', 'active', NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`);

-- Starter courses
INSERT INTO `courses` (`code`, `name`, `capacity`, `department`, `created_at`)
SELECT 'BSIT', 'BS Information Technology', 120, 'Computing', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `courses` WHERE `code` = 'BSIT');

INSERT INTO `courses` (`code`, `name`, `capacity`, `department`, `created_at`)
SELECT 'BSBA', 'BS Business Administration', 100, 'Business', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `courses` WHERE `code` = 'BSBA');

INSERT INTO `courses` (`code`, `name`, `capacity`, `department`, `created_at`)
SELECT 'BSED', 'BS Secondary Education', 90, 'Education', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `courses` WHERE `code` = 'BSED');

-- Starter subjects
INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'IT101', 'Introduction to Computing', 3, NULL, NOW()
FROM `courses` c
WHERE c.`code` = 'BSIT'
  AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'IT101');

INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'IT102', 'Programming Fundamentals', 3, 'IT101', NOW()
FROM `courses` c
WHERE c.`code` = 'BSIT'
  AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'IT102');

INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'BA101', 'Principles of Management', 3, NULL, NOW()
FROM `courses` c
WHERE c.`code` = 'BSBA'
  AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'BA101');

INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'ED101', 'Foundations of Education', 3, NULL, NOW()
FROM `courses` c
WHERE c.`code` = 'BSED'
  AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'ED101');

-- Announcements
INSERT INTO `announcements` (`title`, `body`, `target_role`, `created_at`)
SELECT 'Enrollment Open', 'Welcome! Enrollment is now open. Submit your application before the deadline.', 'all', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `announcements` WHERE `title` = 'Enrollment Open');

INSERT INTO `announcements` (`title`, `body`, `target_role`, `created_at`)
SELECT 'Payment Reminder', 'Please upload your proof of payment after enrollment approval.', 'student', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `announcements` WHERE `title` = 'Payment Reminder');

INSERT INTO `announcements` (`title`, `body`, `target_role`, `created_at`)
SELECT 'Schedule Update', 'Check your class schedule under the Student portal.', 'student', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `announcements` WHERE `title` = 'Schedule Update');

-- Extra sample students (password: student123)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `created_at`)
SELECT 'Maria Santos', 'maria.santos@gmail.com', '$2y$10$RLPNUKwdeSvjMZfP9v44L.RUa23HVeBskaQk5m24hU0iAvT70bfXS', 'student', 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'maria.santos@gmail.com');

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `created_at`)
SELECT 'Juan Dela Cruz', 'juan.delacruz@gmail.com', '$2y$10$RLPNUKwdeSvjMZfP9v44L.RUa23HVeBskaQk5m24hU0iAvT70bfXS', 'student', 'active', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'juan.delacruz@gmail.com');

-- Extra BSIT subjects
INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'IT103', 'Database Systems', 3, 'IT102', NOW()
FROM `courses` c WHERE c.`code` = 'BSIT' AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'IT103');

INSERT INTO `subjects` (`course_id`, `code`, `name`, `units`, `prerequisite`, `created_at`)
SELECT c.id, 'IT104', 'Web Development', 3, 'IT102', NOW()
FROM `courses` c WHERE c.`code` = 'BSIT' AND NOT EXISTS (SELECT 1 FROM `subjects` WHERE `code` = 'IT104');

-- Sections
INSERT INTO `sections` (`subject_id`, `name`, `schedule`, `room`, `student_limit`, `created_at`)
SELECT s.id, 'A', 'Mon-Wed 8:00-9:30 AM', 'Lab 201', 40, NOW()
FROM `subjects` s WHERE s.`code` = 'IT101'
  AND NOT EXISTS (SELECT 1 FROM `sections` sec WHERE sec.subject_id = s.id AND sec.name = 'A');

INSERT INTO `sections` (`subject_id`, `name`, `schedule`, `room`, `student_limit`, `created_at`)
SELECT s.id, 'B', 'Tue-Thu 1:00-2:30 PM', 'Lab 202', 40, NOW()
FROM `subjects` s WHERE s.`code` = 'IT101'
  AND NOT EXISTS (SELECT 1 FROM `sections` sec WHERE sec.subject_id = s.id AND sec.name = 'B');

INSERT INTO `sections` (`subject_id`, `name`, `schedule`, `room`, `student_limit`, `created_at`)
SELECT s.id, 'A', 'Mon-Wed 10:00-11:30 AM', 'Lab 203', 35, NOW()
FROM `subjects` s WHERE s.`code` = 'IT102'
  AND NOT EXISTS (SELECT 1 FROM `sections` sec WHERE sec.subject_id = s.id AND sec.name = 'A');

INSERT INTO `sections` (`subject_id`, `name`, `schedule`, `room`, `student_limit`, `created_at`)
SELECT s.id, 'A', 'Fri 9:00-12:00 NN', 'Room 305', 50, NOW()
FROM `subjects` s WHERE s.`code` = 'BA101'
  AND NOT EXISTS (SELECT 1 FROM `sections` sec WHERE sec.subject_id = s.id AND sec.name = 'A');

-- Default student enrollment (student@gmail.com / BSIT / approved)
INSERT INTO `enrollments` (`user_id`, `course_id`, `status`, `submitted_at`, `updated_at`)
SELECT u.id, c.id, 'approved', NOW(), NOW()
FROM `users` u
JOIN `courses` c ON c.`code` = 'BSIT'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `enrollments` e WHERE e.user_id = u.id);

UPDATE `users` u
SET u.`student_number` = CONCAT('S', DATE_FORMAT(NOW(), '%Y'), LPAD(u.id, 5, '0'))
WHERE u.`email` = 'student@gmail.com' AND (u.`student_number` IS NULL OR u.`student_number` = '');

-- Enrollment subjects for default student
INSERT INTO `enrollment_subjects` (`enrollment_id`, `subject_id`, `section_id`)
SELECT e.id, s.id, (SELECT sec.id FROM `sections` sec WHERE sec.subject_id = s.id ORDER BY sec.id ASC LIMIT 1)
FROM `enrollments` e
JOIN `users` u ON u.id = e.user_id
JOIN `subjects` s ON s.`code` = 'IT101'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `enrollment_subjects` es WHERE es.enrollment_id = e.id AND es.subject_id = s.id
  );

INSERT INTO `enrollment_subjects` (`enrollment_id`, `subject_id`, `section_id`)
SELECT e.id, s.id, (SELECT sec.id FROM `sections` sec WHERE sec.subject_id = s.id ORDER BY sec.id ASC LIMIT 1)
FROM `enrollments` e
JOIN `users` u ON u.id = e.user_id
JOIN `subjects` s ON s.`code` = 'IT102'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `enrollment_subjects` es WHERE es.enrollment_id = e.id AND es.subject_id = s.id
  );

INSERT INTO `enrollment_subjects` (`enrollment_id`, `subject_id`, `section_id`)
SELECT e.id, s.id, (SELECT sec.id FROM `sections` sec WHERE sec.subject_id = s.id ORDER BY sec.id ASC LIMIT 1)
FROM `enrollments` e
JOIN `users` u ON u.id = e.user_id
JOIN `subjects` s ON s.`code` = 'IT103'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `enrollment_subjects` es WHERE es.enrollment_id = e.id AND es.subject_id = s.id
  );

-- Sample payments for default student
INSERT INTO `payments` (
  `user_id`, `enrollment_id`, `amount`, `payment_type`, `payment_method`, `reference_no`,
  `payer_name`, `payment_date`, `proof`, `remarks`, `status`, `paid_at`
)
SELECT u.id, e.id, 18500.00, 'tuition', 'gcash', 'GCASH-DEMO-001',
       'Default Student', CURDATE(), 'receipt_tuition_may.pdf', 'Initial tuition payment', 'confirmed', NOW()
FROM `users` u
JOIN `enrollments` e ON e.user_id = u.id
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `payments` p WHERE p.reference_no = 'GCASH-DEMO-001'
  );

INSERT INTO `payments` (
  `user_id`, `enrollment_id`, `amount`, `payment_type`, `payment_method`, `reference_no`,
  `payer_name`, `payment_date`, `proof`, `remarks`, `status`, `paid_at`
)
SELECT u.id, e.id, 2500.00, 'miscellaneous', 'bank_transfer', 'BNK-DEMO-002',
       'Default Student', CURDATE(), 'receipt_misc_pending.jpg', 'Laboratory fee - pending verification', 'pending', NOW()
FROM `users` u
JOIN `enrollments` e ON e.user_id = u.id
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `payments` p WHERE p.reference_no = 'BNK-DEMO-002'
  );

-- Sample grades for default student
INSERT INTO `grades` (`user_id`, `subject_id`, `grade`, `term`, `created_at`)
SELECT u.id, s.id, '1.75', '2026-1st Semester', NOW()
FROM `users` u
JOIN `subjects` s ON s.`code` = 'IT101'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `grades` g WHERE g.user_id = u.id AND g.subject_id = s.id AND g.term = '2026-1st Semester');

INSERT INTO `grades` (`user_id`, `subject_id`, `grade`, `term`, `created_at`)
SELECT u.id, s.id, '2.00', '2026-1st Semester', NOW()
FROM `users` u
JOIN `subjects` s ON s.`code` = 'IT102'
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `grades` g WHERE g.user_id = u.id AND g.subject_id = s.id AND g.term = '2026-1st Semester');

-- Sample notifications for default student
INSERT INTO `notifications` (`user_id`, `message`, `is_read`, `created_at`)
SELECT u.id, 'Your enrollment has been approved.', 0, NOW()
FROM `users` u
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `notifications` n WHERE n.user_id = u.id AND n.message = 'Your enrollment has been approved.');

INSERT INTO `notifications` (`user_id`, `message`, `is_read`, `created_at`)
SELECT u.id, 'Your payment has been confirmed.', 1, NOW()
FROM `users` u
WHERE u.`email` = 'student@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `notifications` n WHERE n.user_id = u.id AND n.message = 'Your payment has been confirmed.');

-- Pending enrollment for Maria Santos (BSBA)
INSERT INTO `enrollments` (`user_id`, `course_id`, `status`, `submitted_at`, `updated_at`)
SELECT u.id, c.id, 'pending', NOW(), NOW()
FROM `users` u
JOIN `courses` c ON c.`code` = 'BSBA'
WHERE u.`email` = 'maria.santos@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM `enrollments` e WHERE e.user_id = u.id);

INSERT INTO `enrollment_subjects` (`enrollment_id`, `subject_id`, `section_id`)
SELECT e.id, s.id, (SELECT sec.id FROM `sections` sec WHERE sec.subject_id = s.id ORDER BY sec.id ASC LIMIT 1)
FROM `enrollments` e
JOIN `users` u ON u.id = e.user_id
JOIN `subjects` s ON s.`code` = 'BA101'
WHERE u.`email` = 'maria.santos@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM `enrollment_subjects` es WHERE es.enrollment_id = e.id AND es.subject_id = s.id
  );
