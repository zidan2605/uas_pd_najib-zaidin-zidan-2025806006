-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 10, 2026 at 05:40 AM
-- Server version: 8.0.30
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `event_php`
--

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_date` date NOT NULL,
  `event_time` time NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quota` int NOT NULL DEFAULT '0',
  `registered_count` int NOT NULL DEFAULT '0',
  `fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('open','closed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `event_time`, `location`, `quota`, `registered_count`, `fee`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Workshop Web Development', 'Belajar membuat website modern dengan HTML, CSS, dan JavaScript', '2026-02-15', '09:00:00', 'Gedung A Lantai 3', 30, 12, '150000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(2, 'Seminar Digital Marketing', 'Strategi pemasaran digital untuk meningkatkan penjualan online', '2026-02-20', '13:00:00', 'Auditorium Utama', 50, 35, '200000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(3, 'Training UI/UX Design', 'Mendesain antarmuka dan pengalaman pengguna yang menarik', '2026-03-01', '10:00:00', 'Lab Komputer 1', 25, 25, '300000.00', 'closed', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(4, 'Bootcamp Python Programming', 'Intensive bootcamp untuk menguasai Python dari dasar hingga advanced', '2026-03-10', '08:00:00', 'Ruang Training Center', 40, 18, '500000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(5, 'Conference Tech Innovation', 'Konferensi teknologi terbaru dan inovasi digital', '2026-03-15', '09:00:00', 'Grand Ballroom', 100, 68, '350000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 17:58:14'),
(6, 'Workshop Mobile App Development', 'Membuat aplikasi mobile dengan React Native', '2026-04-05', '09:00:00', 'Lab Mobile Development', 20, 8, '400000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(7, 'Seminar Cyber Security', 'Keamanan siber dan perlindungan data di era digital', '2026-04-12', '14:00:00', 'Auditorium Lt 2', 60, 42, '250000.00', 'open', 1, '2026-01-09 03:23:02', '2026-01-09 03:23:02'),
(8, 'Training Cloud Computing', 'Pengenalan cloud computing dengan AWS dan Azure', '2026-01-25', '10:00:00', 'Computer Lab 3', 30, 15, '450000.00', 'closed', 1, '2026-01-09 03:23:02', '2026-01-10 05:08:43'),
(9, 'Seminar Fullstack Developer', 'Belajar Ngoding bersama Dosen Unpas Shandika Galih', '2026-01-15', '10:00:00', 'Universitas Pasundan', 1, 0, '10000.00', 'open', 1, '2026-01-10 05:08:32', '2026-01-10 05:12:25');

-- --------------------------------------------------------

--
-- Stand-in structure for view `event_statistics`
-- (See below for the actual view)
--
CREATE TABLE `event_statistics` (
`id` int
,`title` varchar(200)
,`quota` int
,`registered_count` int
,`fee` decimal(10,2)
,`status` enum('open','closed','cancelled')
,`available_slots` bigint
,`occupancy_percentage` decimal(16,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` int NOT NULL,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','approved','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registrations`
--

INSERT INTO `registrations` (`id`, `event_id`, `user_id`, `status`, `registration_date`, `notes`) VALUES
(1, 1, 2, 'approved', '2026-01-09 03:23:02', 'Looking forward to this workshop!'),
(2, 1, 3, 'approved', '2026-01-09 03:23:02', 'Interested in web development'),
(3, 2, 2, 'approved', '2026-01-09 03:23:02', 'Need to improve my marketing skills'),
(4, 2, 4, 'approved', '2026-01-09 03:23:02', 'Great topic!'),
(5, 3, 3, 'approved', '2026-01-09 03:23:02', 'UI/UX is my passion'),
(6, 4, 2, 'pending', '2026-01-09 03:23:02', 'Waiting for approval'),
(7, 5, 4, 'approved', '2026-01-09 03:23:02', 'Excited about tech innovations'),
(8, 8, 2, 'approved', '2026-01-09 03:23:02', 'Cloud computing is the future'),
(9, 5, 5, 'approved', '2026-01-09 17:58:14', 'Pendaftaran melalui web'),
(10, 9, 6, 'cancelled', '2026-01-10 05:11:32', '');

--
-- Triggers `registrations`
--
DELIMITER $$
CREATE TRIGGER `after_registration_delete` AFTER DELETE ON `registrations` FOR EACH ROW BEGIN
    IF OLD.status != 'cancelled' THEN
        UPDATE events 
        SET registered_count = registered_count - 1
        WHERE id = OLD.event_id;
        
        -- Reopen event if it was closed and now has available slots
        UPDATE events 
        SET status = 'open'
        WHERE id = OLD.event_id 
        AND registered_count < quota 
        AND status = 'closed';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_registration_insert` AFTER INSERT ON `registrations` FOR EACH ROW BEGIN
    IF NEW.status != 'cancelled' THEN
        UPDATE events 
        SET registered_count = registered_count + 1
        WHERE id = NEW.event_id;
        
        -- Auto close event if quota is full
        UPDATE events 
        SET status = 'closed'
        WHERE id = NEW.event_id 
        AND registered_count >= quota 
        AND status = 'open';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_registration_update` AFTER UPDATE ON `registrations` FOR EACH ROW BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        UPDATE events 
        SET registered_count = registered_count - 1
        WHERE id = NEW.event_id;
        
        -- Reopen event if it was closed and now has available slots
        UPDATE events 
        SET status = 'open'
        WHERE id = NEW.event_id 
        AND registered_count < quota 
        AND status = 'closed';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `email`, `role`, `created_at`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@event.com', 'admin', '2026-01-09 03:23:02'),
(2, 'john_doe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'john@example.com', 'user', '2026-01-09 03:23:02'),
(3, 'jane_smith', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'jane@example.com', 'user', '2026-01-09 03:23:02'),
(4, 'bob_wilson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Wilson', 'bob@example.com', 'user', '2026-01-09 03:23:02'),
(5, 'yanto', '$2y$10$MiF3G5AQ8VrefB8ZjZJ1pOzp54kHzJ17alRAI6i1S7oy7HOxTqGt2', 'yanto', 'yanto@gmail.com', 'user', '2026-01-09 17:35:48'),
(6, 'yanti', '$2y$10$bOObjt.iTXiPJNJuWpKjxuGM1qJoqzlq5MViRKJN55s8QLJ0CAVFu', 'yanti', 'yanti@gmail.com', 'user', '2026-01-10 05:11:08');

-- --------------------------------------------------------

--
-- Structure for view `event_statistics`
--
DROP TABLE IF EXISTS `event_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `event_statistics`  AS SELECT `e`.`id` AS `id`, `e`.`title` AS `title`, `e`.`quota` AS `quota`, `e`.`registered_count` AS `registered_count`, `e`.`fee` AS `fee`, `e`.`status` AS `status`, (`e`.`quota` - `e`.`registered_count`) AS `available_slots`, round(((`e`.`registered_count` / `e`.`quota`) * 100),2) AS `occupancy_percentage` FROM `events` AS `e``e`  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_registration` (`event_id`,`user_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
