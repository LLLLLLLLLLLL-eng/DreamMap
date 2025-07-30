import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  level: integer("level").default(1),
  overallProgress: integer("overall_progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // "ideal_self" | "current_self"
  dimensions: jsonb("dimensions").notNull(), // {fitness: 50, career: 80, relationships: 60, learning: 40}
  responses: jsonb("responses").notNull(), // AI assessment responses
  completedAt: timestamp("completed_at").defaultNow(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "fitness", "career", "relationships", "learning", etc.
  targetFrequency: text("target_frequency").notNull(), // "daily", "weekly"
  timeOfDay: text("time_of_day"), // "7:00 AM"
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitLogs = pgTable("habit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").references(() => habits.id),
  userId: varchar("user_id").references(() => users.id),
  completed: boolean("completed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  date: text("date").notNull(), // "2025-01-30"
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: text("date").notNull(), // "2025-01-30"
  mood: text("mood").notNull(), // emoji
  energyLevel: integer("energy_level").notNull(), // 1-10
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  impact: text("impact").notNull(), // "+15% sleep quality improvement"
  priority: integer("priority").default(1), // 1-5
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountabilityBuddies = pgTable("accountability_buddies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  buddyId: varchar("buddy_id").references(() => users.id),
  status: text("status").default("active"), // "active", "pending", "inactive"
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityUpdates = pgTable("community_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // "achievement", "milestone", "general"
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  completedAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
  completedAt: true,
});

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  completedAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityUpdateSchema = createInsertSchema(communityUpdates).omit({
  id: true,
  likes: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;

export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

export type AccountabilityBuddy = typeof accountabilityBuddies.$inferSelect;

export type CommunityUpdate = typeof communityUpdates.$inferSelect;
export type InsertCommunityUpdate = z.infer<typeof insertCommunityUpdateSchema>;
