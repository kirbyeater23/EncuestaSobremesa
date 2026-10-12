import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const surveyResponses = sqliteTable("survey_responses", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  gender: text("gender").notNull(),
  ageRange: text("age_range").notNull(),
  frequency: text("frequency").notNull(),
  mainContext: text("main_context").notNull(),
  roles: text("roles").notNull(),
  stayReasons: text("stay_reasons").notNull(),
  difficulties: text("difficulties").notNull(),
  feelings: text("feelings").notNull(),
  ending: text("ending").notNull(),
  actorTags: text("actor_tags").notNull(),
});
