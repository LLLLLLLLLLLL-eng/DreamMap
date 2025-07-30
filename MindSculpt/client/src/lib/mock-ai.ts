// Mock AI service for generating realistic responses and recommendations
// This simulates AI-powered features until real AI integration is implemented

export interface MockAIResponse {
  response: string;
  confidence: number;
  category: string;
}

export interface MockRecommendation {
  title: string;
  description: string;
  category: string;
  impact: string;
  priority: number;
  actionable: boolean;
}

export interface MockInsight {
  title: string;
  description: string;
  type: "strength" | "opportunity" | "warning" | "celebration";
  data?: Record<string, any>;
}

// Mock AI responses for self-assessment questions
export const generateMockAssessmentResponse = (question: string, userInput: string): MockAIResponse => {
  const responses = {
    fitness: [
      "Your fitness goals show a strong focus on sustainable health. Consider incorporating both cardio and strength training for optimal results.",
      "I notice you value functional fitness over aesthetics, which is excellent for long-term health and mobility.",
      "Your approach to fitness seems balanced. Building consistency will be more valuable than intensity at this stage."
    ],
    career: [
      "Your career vision demonstrates clear ambition and practical thinking. Focus on building skills that align with your target role.",
      "I see you value both professional growth and work-life balance, which is a mature perspective on career development.",
      "Your career goals are well-defined. Consider creating a timeline with specific milestones to track your progress."
    ],
    relationships: [
      "Your relationship goals emphasize quality over quantity, which typically leads to more fulfilling connections.",
      "I notice you prioritize emotional intelligence and communication - these are foundational relationship skills.",
      "Your vision for relationships shows emotional maturity and a desire for authentic connections."
    ],
    learning: [
      "Your learning approach combines curiosity with practical application, which is highly effective for skill development.",
      "I see you value both formal and informal learning opportunities, creating a well-rounded growth strategy.",
      "Your commitment to continuous learning will serve you well in achieving your other life goals."
    ],
    wellness: [
      "Your wellness goals show a holistic understanding of mental and physical health integration.",
      "I notice you prioritize preventive wellness practices, which is wise for long-term wellbeing.",
      "Your approach to wellness balances structure with flexibility, creating sustainable habits."
    ]
  };

  const category = inferCategoryFromQuestion(question);
  const categoryResponses = responses[category as keyof typeof responses] || responses.wellness;
  const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

  return {
    response: randomResponse,
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    category
  };
};

// Generate personalized insights based on user data
export const generateMockInsights = (
  userProgress: number,
  habitCount: number,
  streakDays: number,
  energyLevels: number[]
): MockInsight[] => {
  const insights: MockInsight[] = [];
  
  // Progress-based insights
  if (userProgress > 80) {
    insights.push({
      title: "Exceptional Progress",
      description: "You're performing in the top 10% of users. Your consistency is paying off!",
      type: "celebration"
    });
  } else if (userProgress > 60) {
    insights.push({
      title: "Strong Momentum",
      description: "Your progress is above average. Consider adding one challenging goal to accelerate growth.",
      type: "strength"
    });
  } else if (userProgress < 30) {
    insights.push({
      title: "Foundation Building Needed",
      description: "Focus on establishing 1-2 core habits before expanding. Small wins build big victories.",
      type: "opportunity"
    });
  }

  // Habit-based insights
  if (habitCount > 5) {
    insights.push({
      title: "Habit Overload Risk",
      description: "You're tracking many habits. Consider focusing on your top 3 most impactful ones.",
      type: "warning"
    });
  } else if (habitCount < 2) {
    insights.push({
      title: "Expand Your Routine",
      description: "Adding 1-2 more complementary habits could accelerate your progress.",
      type: "opportunity"
    });
  }

  // Streak-based insights
  if (streakDays > 21) {
    insights.push({
      title: "Habit Formation Success",
      description: "Your 21+ day streak indicates strong habit formation. This is neurologically significant!",
      type: "celebration"
    });
  } else if (streakDays > 7) {
    insights.push({
      title: "Building Consistency",
      description: "You're in the critical habit formation phase. Each day strengthens your neural pathways.",
      type: "strength"
    });
  }

  // Energy pattern insights
  if (energyLevels.length > 0) {
    const avgEnergy = energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length;
    const energyVariance = Math.sqrt(energyLevels.reduce((sum, level) => sum + Math.pow(level - avgEnergy, 2), 0) / energyLevels.length);

    if (avgEnergy < 4) {
      insights.push({
        title: "Energy Management Priority",
        description: "Your energy levels are consistently low. Focus on sleep, nutrition, and stress management.",
        type: "warning"
      });
    } else if (energyVariance > 2.5) {
      insights.push({
        title: "Energy Fluctuation Pattern",
        description: "Your energy varies significantly. Tracking patterns may reveal optimization opportunities.",
        type: "opportunity"
      });
    } else if (avgEnergy > 7) {
      insights.push({
        title: "High Energy Utilization",
        description: "Your energy levels are excellent. Consider taking on a challenging new goal.",
        type: "strength"
      });
    }
  }

  return insights.slice(0, 3); // Return top 3 insights
};

// Generate contextual recommendations based on user behavior
export const generateContextualRecommendations = (
  lastCheckinDays: number,
  completionRate: number,
  weakestCategory: string,
  timeOfDay: string
): MockRecommendation[] => {
  const recommendations: MockRecommendation[] = [];

  // Check-in frequency recommendations
  if (lastCheckinDays > 3) {
    recommendations.push({
      title: "Resume Daily Check-ins",
      description: "You haven't checked in for several days. Daily reflection is crucial for self-awareness and progress tracking.",
      category: "wellness",
      impact: "+40% self-awareness",
      priority: 1,
      actionable: true
    });
  }

  // Completion rate recommendations
  if (completionRate < 0.5) {
    recommendations.push({
      title: "Simplify Your Routine",
      description: "Your completion rate suggests you may be overcommitted. Consider reducing to 2-3 core habits.",
      category: "general",
      impact: "+60% consistency",
      priority: 1,
      actionable: true
    });
  } else if (completionRate > 0.8) {
    recommendations.push({
      title: "Level Up Your Challenge",
      description: "Your high completion rate indicates readiness for more ambitious goals. Time to push your boundaries!",
      category: "general",
      impact: "+30% growth rate",
      priority: 2,
      actionable: true
    });
  }

  // Category-specific recommendations
  const categoryRecommendations = {
    fitness: {
      title: "Progressive Fitness Challenge",
      description: "Your fitness needs attention. Start with 10-minute daily walks and gradually increase intensity.",
      category: "fitness",
      impact: "+50% physical health",
      priority: 1,
      actionable: true
    },
    career: {
      title: "Professional Skill Development",
      description: "Focus on building one key skill that aligns with your career goals. Consider online courses or mentorship.",
      category: "career",
      impact: "+35% career advancement",
      priority: 1,
      actionable: true
    },
    relationships: {
      title: "Deepen Social Connections",
      description: "Schedule regular quality time with important people in your life. Consistency builds stronger bonds.",
      category: "relationships",
      impact: "+45% relationship satisfaction",
      priority: 1,
      actionable: true
    },
    learning: {
      title: "Structured Learning Path",
      description: "Create a learning routine with specific goals. Reading 20 minutes daily can significantly expand your knowledge.",
      category: "learning",
      impact: "+40% knowledge growth",
      priority: 1,
      actionable: true
    },
    wellness: {
      title: "Mindfulness Integration",
      description: "Your mental wellness could benefit from regular mindfulness practice. Start with 5-minute meditation sessions.",
      category: "wellness",
      impact: "+30% stress reduction",
      priority: 1,
      actionable: true
    }
  };

  if (weakestCategory && categoryRecommendations[weakestCategory as keyof typeof categoryRecommendations]) {
    recommendations.push(categoryRecommendations[weakestCategory as keyof typeof categoryRecommendations]);
  }

  // Time-based recommendations
  const timeBasedRecommendations = {
    morning: {
      title: "Optimize Your Morning Routine",
      description: "Morning habits have the highest success rate. Consider moving your most important habit to the morning.",
      category: "general",
      impact: "+25% habit consistency",
      priority: 2,
      actionable: true
    },
    evening: {
      title: "Evening Reflection Practice",
      description: "End your day with intention. A brief evening review can improve tomorrow's performance.",
      category: "wellness",
      impact: "+20% daily improvement",
      priority: 2,
      actionable: true
    }
  };

  const currentHour = new Date().getHours();
  if (currentHour < 12 && timeBasedRecommendations.morning) {
    recommendations.push(timeBasedRecommendations.morning);
  } else if (currentHour > 18 && timeBasedRecommendations.evening) {
    recommendations.push(timeBasedRecommendations.evening);
  }

  return recommendations.slice(0, 4); // Return top 4 recommendations
};

// Generate motivational messages based on context
export const generateMotivationalMessage = (
  progressPercent: number,
  streakDays: number,
  completedToday: number,
  totalHabits: number
): string => {
  const messages = {
    high_progress: [
      "You're crushing your goals! Your dedication is truly inspiring. 🌟",
      "Exceptional progress! You're in the top tier of achievers. Keep this momentum! 🚀",
      "Your consistency is paying off in a big way. You're becoming the person you envisioned! ✨"
    ],
    good_progress: [
      "Solid progress! You're building something meaningful here. 💪",
      "You're on the right track. Each day forward is a victory worth celebrating! 🎯",
      "Your commitment is showing results. Trust the process and keep going! 🌱"
    ],
    building_momentum: [
      "Every journey starts with a single step. You're building something important! 🛤️",
      "Progress isn't always linear, but you're moving in the right direction! 📈",
      "Small steps lead to big changes. Your consistency will compound over time! 🔄"
    ],
    streak_celebration: [
      `${streakDays} days of consistency! You're proving your commitment to yourself! 🔥`,
      `Your ${streakDays}-day streak is evidence of your dedication. That's real character! 💎`,
      `${streakDays} consecutive days! You're building unbreakable momentum! ⚡`
    ],
    daily_encouragement: [
      `${completedToday}/${totalHabits} habits done today. You're making it happen! ✅`,
      "Every habit completed is a promise kept to your future self! 🤝",
      "You showed up today, and that's what matters most! 🌅"
    ]
  };

  // Select message type based on context
  if (streakDays >= 21) {
    return messages.streak_celebration[Math.floor(Math.random() * messages.streak_celebration.length)];
  } else if (progressPercent >= 75) {
    return messages.high_progress[Math.floor(Math.random() * messages.high_progress.length)];
  } else if (progressPercent >= 50) {
    return messages.good_progress[Math.floor(Math.random() * messages.good_progress.length)];
  } else if (completedToday > 0) {
    return messages.daily_encouragement[Math.floor(Math.random() * messages.daily_encouragement.length)];
  } else {
    return messages.building_momentum[Math.floor(Math.random() * messages.building_momentum.length)];
  }
};

// Helper function to infer category from question text
function inferCategoryFromQuestion(question: string): string {
  const keywords = {
    fitness: ['fitness', 'exercise', 'workout', 'physical', 'health', 'body', 'strength'],
    career: ['career', 'job', 'work', 'professional', 'business', 'skill', 'promotion'],
    relationships: ['relationship', 'family', 'friend', 'social', 'connection', 'love', 'partner'],
    learning: ['learn', 'education', 'knowledge', 'skill', 'study', 'course', 'book', 'growth'],
    wellness: ['wellness', 'mental', 'emotional', 'mindfulness', 'stress', 'anxiety', 'peace']
  };

  const lowerQuestion = question.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerQuestion.includes(word))) {
      return category;
    }
  }
  
  return 'general';
}

// Generate AI chat responses for interactive features
export const generateAIChatResponse = (userMessage: string, context?: any): string => {
  const responses = {
    greeting: [
      "Hello! I'm here to help you on your journey to your ideal self. What would you like to work on today?",
      "Hi there! Ready to make some progress toward your goals? I'm here to support you!",
      "Welcome back! I've been analyzing your patterns and I have some insights to share. What's on your mind?"
    ],
    progress_question: [
      "Based on your recent activity, you're making steady progress! Your consistency in [habit] is particularly impressive. What challenges are you facing?",
      "I've noticed you're doing well with your [category] goals. Would you like some suggestions for the next level?",
      "Your progress data shows some interesting patterns. Let me share what I've observed..."
    ],
    motivation: [
      "Remember, every small action compounds over time. You're building the foundation for lasting change!",
      "Your future self will thank you for the consistency you're showing today. Keep going!",
      "Progress isn't always visible day-to-day, but your data shows you're moving in the right direction!"
    ],
    suggestions: [
      "Based on your patterns, I recommend focusing on [specific area]. Would you like a detailed plan?",
      "I see an opportunity to optimize your routine. Here's what I suggest...",
      "Your weakest area seems to be [category]. Let's create a strategy to improve it!"
    ]
  };

  // Simple keyword matching for demo purposes
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
    return responses.progress_question[Math.floor(Math.random() * responses.progress_question.length)];
  } else if (lowerMessage.includes('motivated') || lowerMessage.includes('encourage')) {
    return responses.motivation[Math.floor(Math.random() * responses.motivation.length)];
  } else if (lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
    return responses.suggestions[Math.floor(Math.random() * responses.suggestions.length)];
  } else {
    return "I understand you're asking about your personal development journey. Let me analyze your data and provide some personalized insights...";
  }
};
