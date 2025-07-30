import { 
  type User, 
  type InsertUser,
  type Assessment,
  type InsertAssessment,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type DailyCheckin,
  type InsertDailyCheckin,
  type AiRecommendation,
  type InsertAiRecommendation,
  type AccountabilityBuddy,
  type CommunityUpdate,
  type InsertCommunityUpdate,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Assessments
  getAssessmentsByUserId(userId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getLatestAssessment(userId: string, type: string): Promise<Assessment | undefined>;

  // Habits
  getHabitsByUserId(userId: string): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;

  // Habit Logs
  getHabitLogsByUserId(userId: string, date?: string): Promise<HabitLog[]>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  getHabitLogByHabitAndDate(habitId: string, date: string): Promise<HabitLog | undefined>;

  // Daily Check-ins
  getDailyCheckinsByUserId(userId: string): Promise<DailyCheckin[]>;
  createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin>;
  getDailyCheckinByDate(userId: string, date: string): Promise<DailyCheckin | undefined>;

  // AI Recommendations
  getAiRecommendationsByUserId(userId: string): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;

  // Accountability & Social
  getAccountabilityBuddiesByUserId(userId: string): Promise<AccountabilityBuddy[]>;
  getCommunityUpdates(limit?: number): Promise<CommunityUpdate[]>;
  createCommunityUpdate(update: InsertCommunityUpdate): Promise<CommunityUpdate>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private assessments: Map<string, Assessment> = new Map();
  private habits: Map<string, Habit> = new Map();
  private habitLogs: Map<string, HabitLog> = new Map();
  private dailyCheckins: Map<string, DailyCheckin> = new Map();
  private aiRecommendations: Map<string, AiRecommendation> = new Map();
  private accountabilityBuddies: Map<string, AccountabilityBuddy> = new Map();
  private communityUpdates: Map<string, CommunityUpdate> = new Map();

  constructor() {
    // Initialize with demo user
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoUser: User = {
      id: "demo-user-1",
      username: "alex_johnson",
      email: "alex@example.com",
      name: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      level: 12,
      overallProgress: 67,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Demo habits
    const demoHabits: Habit[] = [
      {
        id: "habit-1",
        userId: "demo-user-1",
        name: "Morning Meditation",
        description: "10 minutes of mindfulness",
        category: "wellness",
        targetFrequency: "daily",
        timeOfDay: "7:00 AM",
        currentStreak: 23,
        longestStreak: 45,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "habit-2",
        userId: "demo-user-1",
        name: "Read 30 minutes",
        description: "Non-fiction or personal development",
        category: "learning",
        targetFrequency: "daily",
        timeOfDay: "8:00 PM",
        currentStreak: 12,
        longestStreak: 28,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "habit-3",
        userId: "demo-user-1",
        name: "Workout",
        description: "45 minutes strength training",
        category: "fitness",
        targetFrequency: "daily",
        timeOfDay: "6:00 AM",
        currentStreak: 8,
        longestStreak: 15,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    demoHabits.forEach(habit => this.habits.set(habit.id, habit));

    // Demo assessment
    const demoAssessment: Assessment = {
      id: "assessment-1",
      userId: "demo-user-1",
      type: "current_self",
      dimensions: {
        fitness: 45,
        career: 78,
        relationships: 62,
        learning: 34,
      },
      responses: {},
      completedAt: new Date(),
    };
    this.assessments.set(demoAssessment.id, demoAssessment);

    // Demo AI recommendations
    const demoRecommendations: AiRecommendation[] = [
      {
        id: "rec-1",
        userId: "demo-user-1",
        title: "Set bedtime alarm for 10:30 PM",
        description: "Based on your progress, I recommend focusing on consistent sleep schedule",
        category: "wellness",
        impact: "+15% sleep quality improvement",
        priority: 1,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "rec-2",
        userId: "demo-user-1",
        title: "Add protein shake post-workout",
        description: "Increase protein intake for better recovery",
        category: "fitness",
        impact: "+22% muscle recovery",
        priority: 2,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    demoRecommendations.forEach(rec => this.aiRecommendations.set(rec.id, rec));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      level: 1,
      overallProgress: 0,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Assessment methods
  async getAssessmentsByUserId(userId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(a => a.userId === userId);
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id, 
      completedAt: new Date() 
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getLatestAssessment(userId: string, type: string): Promise<Assessment | undefined> {
    const userAssessments = Array.from(this.assessments.values())
      .filter(a => a.userId === userId && a.type === type)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
    
    return userAssessments[0];
  }

  // Habit methods
  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(h => h.userId === userId && h.isActive);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = { 
      ...insertHabit, 
      id, 
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date() 
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit Log methods
  async getHabitLogsByUserId(userId: string, date?: string): Promise<HabitLog[]> {
    const logs = Array.from(this.habitLogs.values()).filter(l => l.userId === userId);
    return date ? logs.filter(l => l.date === date) : logs;
  }

  async createHabitLog(insertLog: InsertHabitLog): Promise<HabitLog> {
    const id = randomUUID();
    const log: HabitLog = { 
      ...insertLog, 
      id, 
      completedAt: new Date() 
    };
    this.habitLogs.set(id, log);
    return log;
  }

  async getHabitLogByHabitAndDate(habitId: string, date: string): Promise<HabitLog | undefined> {
    return Array.from(this.habitLogs.values())
      .find(l => l.habitId === habitId && l.date === date);
  }

  // Daily Check-in methods
  async getDailyCheckinsByUserId(userId: string): Promise<DailyCheckin[]> {
    return Array.from(this.dailyCheckins.values()).filter(c => c.userId === userId);
  }

  async createDailyCheckin(insertCheckin: InsertDailyCheckin): Promise<DailyCheckin> {
    const id = randomUUID();
    const checkin: DailyCheckin = { 
      ...insertCheckin, 
      id, 
      completedAt: new Date() 
    };
    this.dailyCheckins.set(id, checkin);
    return checkin;
  }

  async getDailyCheckinByDate(userId: string, date: string): Promise<DailyCheckin | undefined> {
    return Array.from(this.dailyCheckins.values())
      .find(c => c.userId === userId && c.date === date);
  }

  // AI Recommendation methods
  async getAiRecommendationsByUserId(userId: string): Promise<AiRecommendation[]> {
    return Array.from(this.aiRecommendations.values())
      .filter(r => r.userId === userId && r.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  async createAiRecommendation(insertRec: InsertAiRecommendation): Promise<AiRecommendation> {
    const id = randomUUID();
    const recommendation: AiRecommendation = { 
      ...insertRec, 
      id, 
      createdAt: new Date() 
    };
    this.aiRecommendations.set(id, recommendation);
    return recommendation;
  }

  // Social methods
  async getAccountabilityBuddiesByUserId(userId: string): Promise<AccountabilityBuddy[]> {
    return Array.from(this.accountabilityBuddies.values())
      .filter(b => b.userId === userId && b.status === "active");
  }

  async getCommunityUpdates(limit = 10): Promise<CommunityUpdate[]> {
    const updates = Array.from(this.communityUpdates.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return updates.slice(0, limit);
  }

  async createCommunityUpdate(insertUpdate: InsertCommunityUpdate): Promise<CommunityUpdate> {
    const id = randomUUID();
    const update: CommunityUpdate = { 
      ...insertUpdate, 
      id, 
      likes: 0,
      createdAt: new Date() 
    };
    this.communityUpdates.set(id, update);
    return update;
  }
}

export const storage = new MemStorage();
