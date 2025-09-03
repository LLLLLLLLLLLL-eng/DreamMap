import {
  users,
  blueprints,
  habits,
  habitCompletions,
  progressAssessments,
  type User,
  type UpsertUser,
  type Blueprint,
  type InsertBlueprint,
  type Habit,
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type ProgressAssessment,
  type InsertProgressAssessment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Blueprint operations
  createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint>;
  getBlueprintByUserId(userId: string): Promise<Blueprint | undefined>;
  updateBlueprint(id: string, blueprint: Partial<InsertBlueprint>): Promise<Blueprint>;
  
  // Habit operations
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabitsByUserId(userId: string): Promise<Habit[]>;
  getHabitsByBlueprint(blueprintId: string): Promise<Habit[]>;
  updateHabit(id: string, habit: Partial<InsertHabit>): Promise<Habit>;
  deleteHabit(id: string): Promise<void>;
  
  // Habit completion operations
  completeHabit(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  uncompleteHabit(habitId: string, userId: string, date: string): Promise<void>;
  getHabitCompletions(userId: string, date: string): Promise<HabitCompletion[]>;
  getHabitCompletionsInRange(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]>;
  
  // Progress assessment operations
  createProgressAssessment(assessment: InsertProgressAssessment): Promise<ProgressAssessment>;
  getProgressAssessmentsByUserId(userId: string): Promise<ProgressAssessment[]>;
  getLatestProgressAssessment(userId: string): Promise<ProgressAssessment | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Blueprint operations
  async createBlueprint(blueprint: InsertBlueprint): Promise<Blueprint> {
    const [result] = await db.insert(blueprints).values(blueprint).returning();
    return result;
  }

  async getBlueprintByUserId(userId: string): Promise<Blueprint | undefined> {
    const [blueprint] = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.userId, userId))
      .orderBy(desc(blueprints.createdAt));
    return blueprint;
  }

  async updateBlueprint(id: string, blueprint: Partial<InsertBlueprint>): Promise<Blueprint> {
    const [result] = await db
      .update(blueprints)
      .set({ ...blueprint, updatedAt: new Date() })
      .where(eq(blueprints.id, id))
      .returning();
    return result;
  }

  // Habit operations
  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [result] = await db.insert(habits).values(habit).returning();
    return result;
  }

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(habits.category, habits.title);
  }

  async getHabitsByBlueprint(blueprintId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(and(eq(habits.blueprintId, blueprintId), eq(habits.isActive, true)))
      .orderBy(habits.category, habits.title);
  }

  async updateHabit(id: string, habit: Partial<InsertHabit>): Promise<Habit> {
    const [result] = await db
      .update(habits)
      .set(habit)
      .where(eq(habits.id, id))
      .returning();
    return result;
  }

  async deleteHabit(id: string): Promise<void> {
    await db.update(habits).set({ isActive: false }).where(eq(habits.id, id));
  }

  // Habit completion operations
  async completeHabit(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const [result] = await db.insert(habitCompletions).values(completion).returning();
    return result;
  }

  async uncompleteHabit(habitId: string, userId: string, date: string): Promise<void> {
    await db
      .delete(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.date, date)
        )
      );
  }

  async getHabitCompletions(userId: string, date: string): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          eq(habitCompletions.date, date)
        )
      );
  }

  async getHabitCompletionsInRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<HabitCompletion[]> {
    return await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.userId, userId),
          gte(habitCompletions.date, startDate),
          lte(habitCompletions.date, endDate)
        )
      );
  }

  // Progress assessment operations
  async createProgressAssessment(assessment: InsertProgressAssessment): Promise<ProgressAssessment> {
    const [result] = await db.insert(progressAssessments).values(assessment).returning();
    return result;
  }

  async getProgressAssessmentsByUserId(userId: string): Promise<ProgressAssessment[]> {
    return await db
      .select()
      .from(progressAssessments)
      .where(eq(progressAssessments.userId, userId))
      .orderBy(desc(progressAssessments.createdAt));
  }

  async getLatestProgressAssessment(userId: string): Promise<ProgressAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(progressAssessments)
      .where(eq(progressAssessments.userId, userId))
      .orderBy(desc(progressAssessments.createdAt))
      .limit(1);
    return assessment;
  }
}

export const storage = new DatabaseStorage();
