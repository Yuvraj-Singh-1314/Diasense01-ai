CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileId` int,
	`age` int NOT NULL,
	`heightCm` decimal(5,1) NOT NULL,
	`weightKg` decimal(5,1) NOT NULL,
	`bmi` decimal(4,1) NOT NULL,
	`bloodPressure` varchar(32),
	`glucose` decimal(6,1),
	`familyHistory` boolean NOT NULL DEFAULT false,
	`activity` enum('low','moderate','high') NOT NULL DEFAULT 'moderate',
	`pregnancyStatus` enum('no','yes','unknown'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`riskPercentage` int NOT NULL,
	`confidence` int NOT NULL,
	`healthScore` int NOT NULL,
	`category` enum('Low risk','Moderate risk','High risk') NOT NULL,
	`modelVersion` varchar(64) NOT NULL DEFAULT 'ensemble-rf-xgb',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`heightCm` decimal(5,1),
	`weightKg` decimal(5,1),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`predictionId` int NOT NULL,
	`diet` text NOT NULL,
	`exercise` text NOT NULL,
	`lifestyle` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`storageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_reportId_unique` UNIQUE(`reportId`)
);
