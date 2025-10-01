CREATE TABLE `staff_shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`user_id` text NOT NULL,
	`clock_in` integer NOT NULL,
	`clock_out` integer,
	`break_start` integer,
	`break_end` integer,
	`total_sales` real DEFAULT 0 NOT NULL,
	`total_tips` real DEFAULT 0 NOT NULL,
	`order_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`table_number` integer NOT NULL,
	`section_name` text NOT NULL,
	`capacity` integer DEFAULT 4 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`current_order_id` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`current_order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);
