ALTER TABLE `predictions` MODIFY COLUMN `modelVersion` varchar(64) NOT NULL DEFAULT 'pima-rf-xgb-ensemble-v1';--> statement-breakpoint
ALTER TABLE `assessments` ADD `pregnancies` int;--> statement-breakpoint
ALTER TABLE `assessments` ADD `skinThickness` decimal(6,1);--> statement-breakpoint
ALTER TABLE `assessments` ADD `insulin` decimal(7,1);--> statement-breakpoint
ALTER TABLE `assessments` ADD `diabetesPedigree` decimal(6,4);