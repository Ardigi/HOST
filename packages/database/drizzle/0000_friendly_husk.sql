CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`barcode` text,
	`category` text NOT NULL,
	`subcategory` text,
	`unit_type` text NOT NULL,
	`unit_size` real,
	`unit_size_uom` text,
	`units_per_case` integer,
	`quantity_on_hand` real DEFAULT 0 NOT NULL,
	`par_level` real,
	`reorder_point` real,
	`reorder_quantity` real,
	`unit_cost` real NOT NULL,
	`case_cost` real,
	`last_cost` real,
	`average_cost` real,
	`primary_vendor` text,
	`vendor_item_code` text,
	`storage_location` text,
	`storage_temp` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory_purchase_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_order_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`quantity_ordered` real NOT NULL,
	`quantity_received` real DEFAULT 0 NOT NULL,
	`unit_cost` real NOT NULL,
	`total_cost` real NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `inventory_purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`order_number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`order_date` integer NOT NULL,
	`expected_delivery_date` integer,
	`actual_delivery_date` integer,
	`subtotal` real DEFAULT 0 NOT NULL,
	`tax` real DEFAULT 0 NOT NULL,
	`shipping_cost` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`notes` text,
	`received_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`supplier_id`) REFERENCES `inventory_suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`zip_code` text,
	`account_number` text,
	`payment_terms` text,
	`minimum_order` real,
	`delivery_days` text,
	`is_active` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`transaction_type` text NOT NULL,
	`quantity_change` real NOT NULL,
	`balance_after` real NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`reason` text,
	`unit_cost_at_time` real,
	`performed_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`display_order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_categories_venue_id_slug_unique` ON `menu_categories` (`venue_id`,`slug`);--> statement-breakpoint
CREATE TABLE `menu_item_modifier_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`group_id` text NOT NULL,
	`display_order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `menu_modifier_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`image_url` text,
	`calories` integer,
	`is_vegetarian` integer DEFAULT false,
	`is_vegan` integer DEFAULT false,
	`is_gluten_free` integer DEFAULT false,
	`preparation_time` integer,
	`display_order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_venue_id_slug_unique` ON `menu_items` (`venue_id`,`slug`);--> statement-breakpoint
CREATE TABLE `menu_modifier_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`name` text NOT NULL,
	`display_order` integer NOT NULL,
	`selection_type` text NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`min_selections` integer,
	`max_selections` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_modifiers` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`price_adjustment` real NOT NULL,
	`display_order` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `menu_modifier_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `order_item_modifiers` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text NOT NULL,
	`modifier_id` text NOT NULL,
	`name` text NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`menu_item_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	`modifier_total` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`sent_to_kitchen_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` integer NOT NULL,
	`venue_id` text NOT NULL,
	`server_id` text NOT NULL,
	`table_number` integer,
	`guest_count` integer DEFAULT 1,
	`status` text DEFAULT 'open' NOT NULL,
	`order_type` text DEFAULT 'dine_in' NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`tax` real DEFAULT 0 NOT NULL,
	`tip` real DEFAULT 0,
	`discount` real DEFAULT 0,
	`total` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`server_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`order_id` text NOT NULL,
	`amount` real NOT NULL,
	`tip_amount` real DEFAULT 0 NOT NULL,
	`payment_method` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`card_last_four` text,
	`card_brand` text,
	`processor` text,
	`processor_transaction_id` text,
	`processor_fee` real,
	`is_refunded` integer DEFAULT false NOT NULL,
	`refund_amount` real,
	`refund_reason` text,
	`refunded_at` integer,
	`refunded_by` text,
	`comp_reason` text,
	`comp_by` text,
	`processed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`keycloak_id` text NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'server' NOT NULL,
	`pin_code_hash` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_keycloak_id_unique` ON `users` (`keycloak_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`zip_code` text,
	`country` text DEFAULT 'US',
	`timezone` text DEFAULT 'America/New_York',
	`currency` text DEFAULT 'USD',
	`tax_rate` integer DEFAULT 825 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `venues_slug_unique` ON `venues` (`slug`);