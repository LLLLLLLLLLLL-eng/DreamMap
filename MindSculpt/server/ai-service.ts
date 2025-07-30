import type { User, Habit, Assessment, DailyCheckin } from "@shared/schema";

export interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  type: "text" | "slider";
  min?: number;
  max?: number;
}

export interface AiRecommendation {
  title: string;
  description: string;
  category: string;
  impact: string;
  priority: number;
  isActive: boolean;
}

export async function generateAssessmentQuestions(type: string): Promise<AssessmentQuestion[]> {
  const questions: Record<string, AssessmentQuestion[]> = {
    ideal_self: [
      {
        id: "fitness_goal",
        question: "Describe your ideal fitness level and physical health. What does being physically at your best look like to you?",
        category: "fitness",
        type: "text"
      },
      {
        id: "career_goal", 
        question: "What does your ideal career look like? Describe your dream job, work environment, and professional achievements.",
        category: "career",
        type: "text"
      },
      {
        id: "relationship_goal",
        question: "How do you envision your ideal relationships? What kind of connections do you want with family, friends, and romantic partners?",
        category: "relationships", 
        type: "text"
      },
      {
        id: "learning_goal",
        question: "What knowledge and skills do you want to develop? What subjects fascinate you and how do you want to grow intellectually?",
        category: "learning",
        type: "text"
      },
      {
        id: "wellness_goal",
        question: "Describe your ideal state of mental and emotional wellness. How do you want to feel on a daily basis?",
        category: "wellness",
        type: "text"
      }
    ],
    current_self: [
      {
        id: "fitness_current",
        question: "Rate your current fitness level and physical health (1-100)",
        category: "fitness",
        type: "slider",
        min: 1,
        max: 100
      },
      {
        id: "career_current",
        question: "Rate your current career satisfaction and professional fulfillment (1-100)",
        category: "career", 
        type: "slider",
        min: 1,
        max: 100
      },
      {
        id: "relationship_current",
        question: "Rate your current relationship satisfaction and social connections (1-100)",
        category: "relationships",
        type: "slider", 
        min: 1,
        max: 100
      },
      {
        id: "learning_current",
        question: "Rate your current learning and personal growth (1-100)",
        category: "learning",
        type: "slider",
        min: 1, 
        max: 100
      },
      {
        id: "wellness_current",
        question: "Rate your current mental and emotional wellness (1-100)",
        category: "wellness",
        type: "slider",
        min: 1,
        max: 100
      }
    ]
  };
  
  return questions[type] || [];
}

export async function generateAiRecommendations(
  user: User, 
  habits: Habit[], 
  assessment: Assessment | null, 
  checkins: DailyCheckin[]
): Promise<AiRecommendation[]> {
  const recommendations: AiRecommendation[] = [];
  
  if (!assessment?.dimensions) {
    // If no assessment data, provide general getting started recommendations
    recommendations.push({
      title: "Complete your self-assessment",
      description: "Take the ideal self and current self assessments to get personalized recommendations.",
      category: "general",
      impact: "+50% recommendation accuracy",
      priority: 1,
      isActive: true
    });
    return recommendations;
  }

  const dimensions = assessment.dimensions as Record<string, number>;
  
  // Analyze each dimension and provide specific recommendations
  Object.entries(dimensions).forEach(([dimension, score]) => {
    if (score < 40) {
      // Low score - foundation building recommendations
      recommendations.push(...getLowScoreRecommendations(dimension, score));
    } else if (score < 70) {
      // Medium score - optimization recommendations  
      recommendations.push(...getMediumScoreRecommendations(dimension, score));
    } else {
      // High score - advanced recommendations
      recommendations.push(...getHighScoreRecommendations(dimension, score));
    }
  });

  // Analyze habit patterns
  const habitRecommendations = analyzeHabitPatterns(habits);
  recommendations.push(...habitRecommendations);

  // Analyze check-in patterns
  const checkinRecommendations = analyzeCheckinPatterns(checkins);
  recommendations.push(...checkinRecommendations);

  // Sort by priority and return top recommendations
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 8); // Limit to 8 recommendations
}

function getLowScoreRecommendations(dimension: string, score: number): AiRecommendation[] {
  const recommendations: Record<string, AiRecommendation[]> = {
    fitness: [
      {
        title: "Start with 10-minute daily walks",
        description: "Begin building fitness habits with low-impact, manageable daily movement.",
        category: "fitness",
        impact: "+25% fitness foundation",
        priority: 1,
        isActive: true
      },
      {
        title: "Track your water intake",
        description: "Proper hydration is fundamental to physical health and energy levels.",
        category: "fitness",
        impact: "+15% energy levels",
        priority: 2,
        isActive: true
      }
    ],
    career: [
      {
        title: "Define your career vision",
        description: "Spend time clarifying what you want from your professional life.",
        category: "career",
        impact: "+30% career clarity",
        priority: 1,
        isActive: true
      },
      {
        title: "Update your LinkedIn profile",
        description: "Ensure your professional presence accurately reflects your current skills and goals.",
        category: "career",
        impact: "+20% networking opportunities",
        priority: 2,
        isActive: true
      }
    ],
    relationships: [
      {
        title: "Schedule weekly friend/family time",
        description: "Block dedicated time for meaningful connections with people you care about.",
        category: "relationships",
        impact: "+35% relationship satisfaction",
        priority: 1,
        isActive: true
      }
    ],
    learning: [
      {
        title: "Read for 15 minutes daily",
        description: "Start a consistent learning habit with just 15 minutes of reading each day.",
        category: "learning",
        impact: "+40% knowledge growth",
        priority: 1,
        isActive: true
      }
    ],
    wellness: [
      {
        title: "Practice 5-minute meditation",
        description: "Begin a mindfulness practice with short, manageable meditation sessions.",
        category: "wellness",
        impact: "+30% stress reduction",
        priority: 1,
        isActive: true
      }
    ]
  };

  return recommendations[dimension] || [];
}

function getMediumScoreRecommendations(dimension: string, score: number): AiRecommendation[] {
  const recommendations: Record<string, AiRecommendation[]> = {
    fitness: [
      {
        title: "Add strength training 2x/week",
        description: "Build on your cardio foundation with resistance training for muscle development.",
        category: "fitness",
        impact: "+20% strength gains",
        priority: 2,
        isActive: true
      }
    ],
    career: [
      {
        title: "Set quarterly professional goals",
        description: "Create specific, measurable goals to advance your career systematically.",
        category: "career",
        impact: "+25% career progression",
        priority: 2,
        isActive: true
      }
    ],
    relationships: [
      {
        title: "Practice active listening",
        description: "Improve relationship quality by focusing on truly understanding others.",
        category: "relationships",
        impact: "+20% relationship depth",
        priority: 2,
        isActive: true
      }
    ],
    learning: [
      {
        title: "Take an online course",
        description: "Deepen your knowledge in an area of interest with structured learning.",
        category: "learning",
        impact: "+30% skill development",
        priority: 2,
        isActive: true
      }
    ],
    wellness: [
      {
        title: "Establish a wind-down routine",
        description: "Create a consistent evening routine to improve sleep quality and mental wellness.",
        category: "wellness",
        impact: "+25% sleep quality",
        priority: 2,
        isActive: true
      }
    ]
  };

  return recommendations[dimension] || [];
}

function getHighScoreRecommendations(dimension: string, score: number): AiRecommendation[] {
  const recommendations: Record<string, AiRecommendation[]> = {
    fitness: [
      {
        title: "Train for a fitness challenge",
        description: "Set an ambitious fitness goal like a race or competition to push your limits.",
        category: "fitness",
        impact: "+15% performance optimization",
        priority: 3,
        isActive: true
      }
    ],
    career: [
      {
        title: "Mentor someone in your field",
        description: "Share your expertise by mentoring others while deepening your own knowledge.",
        category: "career",
        impact: "+20% leadership skills",
        priority: 3,
        isActive: true
      }
    ],
    relationships: [
      {
        title: "Plan meaningful experiences",
        description: "Create lasting memories by organizing special activities with loved ones.",
        category: "relationships",
        impact: "+15% relationship richness",
        priority: 3,
        isActive: true
      }
    ],
    learning: [
      {
        title: "Teach others what you know",
        description: "Solidify your knowledge by teaching or creating content in your areas of expertise.",
        category: "learning",
        impact: "+25% knowledge retention",
        priority: 3,
        isActive: true
      }
    ],
    wellness: [
      {
        title: "Explore advanced mindfulness",
        description: "Deepen your practice with advanced meditation techniques or retreats.",
        category: "wellness",
        impact: "+20% mindfulness mastery",
        priority: 3,
        isActive: true
      }
    ]
  };

  return recommendations[dimension] || [];
}

function analyzeHabitPatterns(habits: Habit[]): AiRecommendation[] {
  const recommendations: AiRecommendation[] = [];

  // Find the habit with the lowest streak
  const sortedByStreak = habits.sort((a, b) => a.currentStreak - b.currentStreak);
  const weakestHabit = sortedByStreak[0];

  if (weakestHabit && weakestHabit.currentStreak < 7) {
    recommendations.push({
      title: `Strengthen your ${weakestHabit.name} habit`,
      description: `Your ${weakestHabit.name} habit needs attention. Try habit stacking by linking it to an existing strong routine.`,
      category: weakestHabit.category,
      impact: "+40% habit consistency",
      priority: 1,
      isActive: true
    });
  }

  // Check for missing categories
  const categories = new Set(habits.map(h => h.category));
  const allCategories = ["fitness", "wellness", "learning", "career", "relationships"];
  const missingCategories = allCategories.filter(cat => !categories.has(cat));

  if (missingCategories.length > 0) {
    const missingCategory = missingCategories[0];
    recommendations.push({
      title: `Add a ${missingCategory} habit`,
      description: `You don't have any ${missingCategory} habits yet. Consider adding one to create a more balanced routine.`,
      category: missingCategory,
      impact: "+30% life balance",
      priority: 2,
      isActive: true
    });
  }

  return recommendations;
}

function analyzeCheckinPatterns(checkins: DailyCheckin[]): AiRecommendation[] {
  const recommendations: AiRecommendation[] = [];

  if (checkins.length === 0) {
    recommendations.push({
      title: "Start daily check-ins",
      description: "Regular self-reflection through daily check-ins will help track your emotional patterns and progress.",
      category: "wellness",
      impact: "+50% self-awareness",
      priority: 1,
      isActive: true
    });
    return recommendations;
  }

  // Analyze recent energy levels
  const recentCheckins = checkins.slice(-7); // Last 7 check-ins
  if (recentCheckins.length > 0) {
    const avgEnergy = recentCheckins.reduce((sum, checkin) => sum + checkin.energyLevel, 0) / recentCheckins.length;

    if (avgEnergy < 5) {
      recommendations.push({
        title: "Improve your energy management",
        description: "Your recent energy levels are below average. Focus on sleep, nutrition, and stress management.",
        category: "wellness",
        impact: "+30% daily energy",
        priority: 1,
        isActive: true
      });
    }

    // Check for consistency in check-ins
    const daysSinceLastCheckin = Math.floor((new Date().getTime() - new Date(recentCheckins[0].date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastCheckin > 2) {
      recommendations.push({
        title: "Maintain consistent check-ins",
        description: "Regular check-ins help you stay aware of your patterns and progress. Try setting a daily reminder.",
        category: "wellness",
        impact: "+25% self-awareness",
        priority: 2,
        isActive: true
      });
    }
  }

  return recommendations;
}
