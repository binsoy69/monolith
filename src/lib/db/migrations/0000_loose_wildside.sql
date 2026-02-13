CREATE TABLE `budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`period` text DEFAULT 'monthly',
	`start_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `finance_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'PHP' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `finance_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text NOT NULL,
	`icon` text,
	`is_default` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habit_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`log_date` text NOT NULL,
	`completed` integer DEFAULT true,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `habit_logs_habit_id_log_date_unique` ON `habit_logs` (`habit_id`,`log_date`);--> statement-breakpoint
CREATE TABLE `habit_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`habit_id` integer NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer,
	`frequency` text NOT NULL,
	`frequency_value` integer,
	`target_days` text,
	`reminder_time` text,
	`is_archived` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `habit_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`content` text,
	`content_encrypted` integer DEFAULT false,
	`mood` text,
	`is_prompt` integer DEFAULT false,
	`prompt_text` text,
	`front_matter` text,
	`entry_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `journal_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`alt_text` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `journal_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`target` integer NOT NULL,
	`current` integer DEFAULT 0,
	`deadline` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_completed` integer DEFAULT false,
	`priority` integer DEFAULT 0,
	`due_date` text,
	`parent_id` integer,
	`source_file` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`parent_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`category_id` integer,
	`account_id` integer NOT NULL,
	`to_account_id` integer,
	`is_recurring` integer DEFAULT false,
	`recurrence` text,
	`transaction_date` text NOT NULL,
	`tags` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `finance_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_account_id`) REFERENCES `finance_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
