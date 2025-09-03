import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blueprints table - stores user's identity goals and current state
export const blueprints = pgTable("blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  identityGoal: text("identity_goal").notNull(),
  currentState: text("current_state").notNull(),
  focusAreas: jsonb("focus_areas").notNull(), // Array of focus area objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Habits table - stores AI-generated and user habits
export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blueprintId: varchar("blueprint_id").notNull().references(() => blueprints.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // Morning Routine, Growth & Learning, Health & Wellness, etc.
  focusArea: varchar("focus_area"), // Career Growth, Relationships, etc.
  duration: integer("duration"), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Habit completions table - tracks daily habit completions
export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow(),
  date: varchar("date").notNull(), // YYYY-MM-DD format for easy querying
});

// Progress assessments table - stores weekly self-assessments
export const progressAssessments = pgTable("progress_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blueprintId: varchar("blueprint_id").notNull().references(() => blueprints.id, { onDelete: "cascade" }),
  focusAreaProgress: jsonb("focus_area_progress").notNull(), // Progress for each focus area
  overallRating: integer("overall_rating").notNull(), // 1-10 scale
  notes: text("notes"),
  weekOf: varchar("week_of").notNull(), // YYYY-MM-DD format for week start
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertBlueprintSchema = createInsertSchema(blueprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Blueprint = typeof blueprints.$inferSelect;

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
  completedAt: true,
});
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

export const insertProgressAssessmentSchema = createInsertSchema(progressAssessments).omit({
  id: true,
  createdAt: true,
});
export type InsertProgressAssessment = z.infer<typeof insertProgressAssessmentSchema>;
export type ProgressAssessment = typeof progressAssessments.$inferSelect;
