CREATE TABLE `dailyHealthLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`glucose` decimal(6,1),
	`systolicPressure` int,
	`diastolicPressure` int,
	`steps` int,
	`sleepHours` decimal(4,1),
	`waterMl` int,
	`movementMinutes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyHealthLogs_id` PRIMARY KEY(`id`)
);
