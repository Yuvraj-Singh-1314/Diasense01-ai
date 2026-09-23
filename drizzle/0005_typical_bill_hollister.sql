CREATE TABLE `dailyReminderNotices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`settingId` int NOT NULL,
	`reminderDate` varchar(10) NOT NULL,
	`message` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`seenAt` timestamp,
	CONSTRAINT `dailyReminderNotices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyReminderSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`reminderTime` varchar(5) NOT NULL DEFAULT '19:30',
	`timezoneOffsetMinutes` int NOT NULL DEFAULT 0,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyReminderSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `dailyReminderSettings_userId_unique` UNIQUE(`userId`)
);
