CREATE TABLE `survey_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`gender` text NOT NULL,
	`age_range` text NOT NULL,
	`frequency` text NOT NULL,
	`main_context` text NOT NULL,
	`roles` text NOT NULL,
	`stay_reasons` text NOT NULL,
	`difficulties` text NOT NULL,
	`feelings` text NOT NULL,
	`ending` text NOT NULL,
	`actor_tags` text NOT NULL
);
