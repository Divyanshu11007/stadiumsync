CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`alertType` enum('announcement','gate_change','emergency','special_offer','info') NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`targetZones` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crowdDensity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zoneId` int NOT NULL,
	`venueId` int NOT NULL,
	`density` enum('low','medium','high') NOT NULL DEFAULT 'low',
	`estimatedCount` int DEFAULT 0,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crowdDensity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventMoments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`timestamp` timestamp NOT NULL,
	`momentType` enum('goal','score','timeout','period_end','announcement') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventMoments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`eventType` enum('sports','concert','conference','other') NOT NULL,
	`status` enum('scheduled','live','completed') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`zoneId` int,
	`name` varchar(255) NOT NULL,
	`facilityType` enum('concession','restroom','first_aid','information','parking','entrance','exit') NOT NULL,
	`coordinates` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`zoneId` int NOT NULL,
	`sectionNumber` varchar(50) NOT NULL,
	`rowNumber` varchar(50) NOT NULL,
	`seatNumber` varchar(50) NOT NULL,
	`coordinates` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`venueId` int,
	`savedSeatSection` varchar(255),
	`savedSeatNumber` varchar(255),
	`notificationsEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`capacity` int,
	`mapUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `venues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitTimes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` int NOT NULL,
	`venueId` int NOT NULL,
	`waitMinutes` int NOT NULL DEFAULT 0,
	`status` enum('low','medium','high') NOT NULL DEFAULT 'low',
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waitTimes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`zoneType` enum('seating','concourse','entrance','exit') NOT NULL,
	`coordinates` json,
	`crowdDensity` enum('low','medium','high') NOT NULL DEFAULT 'low',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('attendee','staff','admin') NOT NULL DEFAULT 'attendee';--> statement-breakpoint
ALTER TABLE `users` ADD `venueId` int;