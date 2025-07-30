import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertAssessmentSchema,
  insertHabitSchema,
  insertHabitLogSchema,
  insertDailyCheckinSchema,
  insertAiRecommendationSchema,
  insertCommunityUpdateSchema,
} from "@shared/schema";
import { generateAiRecommendations, generateAssessmentQuestions } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assessment routes
  app.get("/api/assessments/questions/:type", async (req, res) => {
    try {
      const questions = await generateAssessmentQuestions(req.params.type);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate assessment questions" });
    }
  });

  app.get("/api/users/:userId/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByUserId(req.params.userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assessment data" });
    }
  });

  app.get("/api/users/:userId/assessments/latest/:type", async (req, res) => {
    try {
      const assessment = await storage.getLatestAssessment(req.params.userId, req.params.type);
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Habit routes
  app.get("/api/users/:userId/habits", async (req, res) => {
    try {
      const habits = await storage.getHabitsByUserId(req.params.userId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const updates = req.body;
      const habit = await storage.updateHabit(req.params.id, updates);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteHabit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Habit Log routes
  app.get("/api/users/:userId/habit-logs", async (req, res) => {
    try {
      const date = req.query.date as string;
      const logs = await storage.getHabitLogsByUserId(req.params.userId, date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/habit-logs", async (req, res) => {
    try {
      const logData = insertHabitLogSchema.parse(req.body);
      
      // Check if log already exists for this habit and date
      const existingLog = await storage.getHabitLogByHabitAndDate(logData.habitId, logData.date);
      if (existingLog) {
        return res.status(409).json({ message: "Habit already logged for this date" });
      }
      
      const log = await storage.createHabitLog(logData);
      
      // Update habit streak if completed
      if (logData.completed) {
        const habit = await storage.updateHabit(logData.habitId, {
          currentStreak: (await storage.getHabitsByUserId(logData.userId))
            .find(h => h.id === logData.habitId)?.currentStreak! + 1
        });
      }
      
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit log data" });
    }
  });

  // Daily Check-in routes
  app.get("/api/users/:userId/checkins", async (req, res) => {
    try {
      const checkins = await storage.getDailyCheckinsByUserId(req.params.userId);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/checkins", async (req, res) => {
    try {
      const checkinData = insertDailyCheckinSchema.parse(req.body);
      
      // Check if checkin already exists for this date
      const existingCheckin = await storage.getDailyCheckinByDate(checkinData.userId, checkinData.date);
      if (existingCheckin) {
        return res.status(409).json({ message: "Check-in already completed for this date" });
      }
      
      const checkin = await storage.createDailyCheckin(checkinData);
      res.status(201).json(checkin);
    } catch (error) {
      res.status(400).json({ message: "Invalid check-in data" });
    }
  });

  app.get("/api/users/:userId/checkins/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkin = await storage.getDailyCheckinByDate(req.params.userId, today);
      res.json(checkin);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Recommendation routes
  app.get("/api/users/:userId/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getAiRecommendationsByUserId(req.params.userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/recommendations/generate", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const habits = await storage.getHabitsByUserId(userId);
      const assessment = await storage.getLatestAssessment(userId, "current_self");
      const checkins = await storage.getDailyCheckinsByUserId(userId);
      
      const newRecommendations = await generateAiRecommendations(user, habits, assessment, checkins);
      
      // Store recommendations
      const storedRecommendations = await Promise.all(
        newRecommendations.map(rec => storage.createAiRecommendation({
          ...rec,
          userId
        }))
      );
      
      res.json(storedRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Social/Accountability routes
  app.get("/api/users/:userId/buddies", async (req, res) => {
    try {
      const buddies = await storage.getAccountabilityBuddiesByUserId(req.params.userId);
      res.json(buddies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/community/updates", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const updates = await storage.getCommunityUpdates(limit);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/community/updates", async (req, res) => {
    try {
      const updateData = insertCommunityUpdateSchema.parse(req.body);
      const update = await storage.createCommunityUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ message: "Invalid community update data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simple AI service implementation
async function generateAssessmentQuestions(type: string) {
  const questions = {
    ideal_self: [
      {
        id: "fitness_goal",
        question: "Describe your ideal fitness level and physical health",
        category: "fitness",
        type: "text"
      },
      {
        id: "career_goal", 
        question: "What does your ideal career look like?",
        category: "career",
        type: "text"
      },
      {
        id: "relationship_goal",
        question: "How do you envision your ideal relationships?",
        category: "relationships", 
        type: "text"
      },
      {
        id: "learning_goal",
        question: "What knowledge and skills do you want to develop?",
        category: "learning",
        type: "text"
      }
    ],
    current_self: [
      {
        id: "fitness_current",
        question: "Rate your current fitness level (1-100)",
        category: "fitness",
        type: "slider",
        min: 1,
        max: 100
      },
      {
        id: "career_current",
        question: "Rate your current career satisfaction (1-100)",
        category: "career", 
        type: "slider",
        min: 1,
        max: 100
      },
      {
        id: "relationship_current",
        question: "Rate your current relationship satisfaction (1-100)",
        category: "relationships",
        type: "slider", 
        min: 1,
        max: 100
      },
      {
        id: "learning_current",
        question: "Rate your current learning and growth (1-100)",
        category: "learning",
        type: "slider",
        min: 1, 
        max: 100
      }
    ]
  };
  
  return questions[type as keyof typeof questions] || [];
}

async function generateAiRecommendations(user: any, habits: any[], assessment: any, checkins: any[]) {
  // Simple AI logic based on user data
  const recommendations = [];
  
  // Analyze fitness dimension
  if (assessment?.dimensions?.fitness < 50) {
    recommendations.push({
      title: "Increase daily movement",
      description: "Add 10-minute walks after meals to boost fitness gradually",
      category: "fitness",
      impact: "+20% fitness improvement",
      priority: 1,
      isActive: true
    });
  }
  
  // Analyze habit consistency
  const habitWithLowestStreak = habits.sort((a, b) => a.currentStreak - b.currentStreak)[0];
  if (habitWithLowestStreak && habitWithLowestStreak.currentStreak < 7) {
    recommendations.push({
      title: `Focus on ${habitWithLowestStreak.name}`,
      description: `Your ${habitWithLowestStreak.name} habit needs attention. Try habit stacking with an existing routine.`,
      category: habitWithLowestStreak.category,
      impact: "+30% habit consistency",
      priority: 2,
      isActive: true
    });
  }
  
  // Analyze energy levels from check-ins
  const recentCheckins = checkins.slice(-7); // Last 7 days
  const avgEnergy = recentCheckins.reduce((sum, c) => sum + c.energyLevel, 0) / recentCheckins.length;
  
  if (avgEnergy < 6) {
    recommendations.push({
      title: "Optimize sleep schedule",
      description: "Your energy levels suggest improving sleep quality. Set a consistent bedtime routine.",
      category: "wellness",
      impact: "+25% energy levels",
      priority: 1,
      isActive: true
    });
  }
  
  return recommendations;
}
