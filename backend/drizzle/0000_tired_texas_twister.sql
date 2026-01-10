CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`flow_description` text NOT NULL,
	`expected_result` text NOT NULL,
	`mode` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`success` integer,
	`summary` text,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`phase` text NOT NULL,
	`thinking` text,
	`action` text,
	`result` text,
	`screenshot` blob,
	`duration_ms` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE cascade
);
