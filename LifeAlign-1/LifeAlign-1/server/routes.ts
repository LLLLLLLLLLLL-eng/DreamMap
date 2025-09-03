import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateBlueprint, generateHabits, refineBlueprint } from "./services/ai";
import {
  insertBlueprintSchema,
  insertHabitSchema,
  insertHabitCompletionSchema,
  insertProgressAssessmentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Blueprint routes
  app.get('/api/blueprints/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blueprint = await storage.getBlueprintByUserId(userId);
      res.json(blueprint);
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      res.status(500).json({ message: "Failed to fetch blueprint" });
    }
  });

  app.post('/api/blueprints/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { responses } = req.body;
      
      if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({ message: "Responses array is required" });
      }

      const blueprint = await generateBlueprint(responses);
      
      const newBlueprint = await storage.createBlueprint({
        userId,
        identityGoal: blueprint.identityGoal,
        currentState: blueprint.currentState,
        focusAreas: blueprint.focusAreas.map(area => area.name),
      });

      // Generate initial habits for the blueprint
      const habits = await generateHabits(blueprint);
      
      for (const habit of habits) {
        await storage.createHabit({
          userId,
          blueprintId: newBlueprint.id,
          title: habit.title,
          description: habit.description,
          category: habit.category,
          focusArea: habit.focusArea,
          duration: habit.duration,
        });
      }

      res.json(newBlueprint);
    } catch (error) {
      console.error("Error generating blueprint:", error);
      res.status(500).json({ message: "Failed to generate blueprint" });
    }
  });

  app.post('/api/blueprints/:id/refine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { updates } = req.body;

      const blueprint = await storage.getBlueprintByUserId(userId);
      if (!blueprint || blueprint.id !== id) {
        return res.status(404).json({ message: "Blueprint not found" });
      }

      // Convert blueprint to the format expected by refineBlueprint
      const blueprintForRefinement = {
        identityGoal: blueprint.identityGoal,
        currentState: blueprint.currentState,
        focusAreas: (blueprint.focusAreas as string[]).map(name => ({ name, description: "", priority: 3 }))
      };
      
      const refinedBlueprint = await refineBlueprint(blueprintForRefinement, updates);
      
      const updatedBlueprint = await storage.updateBlueprint(id, {
        identityGoal: refinedBlueprint.identityGoal,
        currentState: refinedBlueprint.currentState,
        focusAreas: refinedBlueprint.focusAreas.map(area => area.name),
      });

      // Regenerate habits if requested
      if (updates.regenerateHabits) {
        const habits = await generateHabits(refinedBlueprint);
        
        // Deactivate old habits
        const existingHabits = await storage.getHabitsByBlueprint(id);
        for (const habit of existingHabits) {
          await storage.deleteHabit(habit.id);
        }

        // Create new habits
        for (const habit of habits) {
          await storage.createHabit({
            userId,
            blueprintId: id,
            title: habit.title,
            description: habit.description,
            category: habit.category,
            focusArea: habit.focusArea,
            duration: habit.duration,
          });
        }
      }

      res.json(updatedBlueprint);
    } catch (error) {
      console.error("Error refining blueprint:", error);
      res.status(500).json({ message: "Failed to refine blueprint" });
    }
  });

  // Habit routes
  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabitsByUserId(userId);
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blueprint = await storage.getBlueprintByUserId(userId);
      
      if (!blueprint) {
        return res.status(400).json({ message: "Blueprint required to create habits" });
      }

      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId,
        blueprintId: blueprint.id,
      });

      const habit = await storage.createHabit(validatedData);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  app.delete('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHabit(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Habit completion routes
  app.get('/api/habit-completions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, startDate, endDate } = req.query;

      let completions;
      if (startDate && endDate) {
        completions = await storage.getHabitCompletionsInRange(
          userId,
          startDate as string,
          endDate as string
        );
      } else {
        const queryDate = date as string || new Date().toISOString().split('T')[0];
        completions = await storage.getHabitCompletions(userId, queryDate);
      }

      res.json(completions);
    } catch (error) {
      console.error("Error fetching habit completions:", error);
      res.status(500).json({ message: "Failed to fetch habit completions" });
    }
  });

  app.post('/api/habit-completions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHabitCompletionSchema.parse({
        ...req.body,
        userId,
      });

      const completion = await storage.completeHabit(validatedData);
      res.json(completion);
    } catch (error) {
      console.error("Error completing habit:", error);
      res.status(500).json({ message: "Failed to complete habit" });
    }
  });

  app.delete('/api/habit-completions/:habitId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { habitId } = req.params;
      const { date } = req.query;
      
      const queryDate = date as string || new Date().toISOString().split('T')[0];
      await storage.uncompleteHabit(habitId, userId, queryDate);
      res.json({ success: true });
    } catch (error) {
      console.error("Error uncompleting habit:", error);
      res.status(500).json({ message: "Failed to uncomplete habit" });
    }
  });

  // Progress assessment routes
  app.get('/api/progress-assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getProgressAssessmentsByUserId(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching progress assessments:", error);
      res.status(500).json({ message: "Failed to fetch progress assessments" });
    }
  });

  app.post('/api/progress-assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blueprint = await storage.getBlueprintByUserId(userId);
      
      if (!blueprint) {
        return res.status(400).json({ message: "Blueprint required for progress assessment" });
      }

      const validatedData = insertProgressAssessmentSchema.parse({
        ...req.body,
        userId,
        blueprintId: blueprint.id,
      });

      const assessment = await storage.createProgressAssessment(validatedData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating progress assessment:", error);
      res.status(500).json({ message: "Failed to create progress assessment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
