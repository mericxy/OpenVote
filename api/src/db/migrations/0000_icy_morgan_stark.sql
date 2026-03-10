CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`topic_id` int NOT NULL,
	`score` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_topic_unique` UNIQUE(`user_id`,`topic_id`)
);
--> statement-breakpoint
ALTER TABLE `topics` ADD CONSTRAINT `topics_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes` ADD CONSTRAINT `votes_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE cascade ON UPDATE no action;