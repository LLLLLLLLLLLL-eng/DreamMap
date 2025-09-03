interface FocusArea {
  name: string;
  description: string;
  priority: number; // 1-5 scale
}

interface GeneratedBlueprint {
  identityGoal: string;
  currentState: string;
  focusAreas: FocusArea[];
}

interface GeneratedHabit {
  title: string;
  description: string;
  category: string;
  focusArea: string;
  duration: number;
}

export async function generateBlueprint(responses: string[]): Promise<GeneratedBlueprint> {
  // Using placeholder data instead of AI for now
  const sampleBlueprints = [
    {
      identityGoal: "I want to become a more disciplined, creative, and mindful person who consistently works toward my goals and maintains meaningful relationships.",
      currentState: "I'm currently struggling with consistency in my habits but have strong motivation to improve my personal and professional life.",
      focusAreas: [
        { name: "Personal Development", description: "Building self-discipline and consistent habits", priority: 5 },
        { name: "Health & Fitness", description: "Maintaining physical and mental well-being", priority: 4 },
        { name: "Creative Expression", description: "Exploring and developing creative talents", priority: 3 },
        { name: "Mindfulness", description: "Practicing presence and emotional awareness", priority: 4 },
        { name: "Relationships", description: "Nurturing meaningful connections", priority: 3 }
      ]
    },
    {
      identityGoal: "I aspire to be a confident leader who balances professional success with personal well-being and contributes positively to my community.",
      currentState: "I have good skills but need to work on self-confidence and time management to reach my full potential.",
      focusAreas: [
        { name: "Leadership Skills", description: "Developing confidence and communication abilities", priority: 5 },
        { name: "Work-Life Balance", description: "Managing time effectively between work and personal life", priority: 4 },
        { name: "Community Involvement", description: "Contributing meaningfully to my community", priority: 3 },
        { name: "Self-Care", description: "Prioritizing mental and physical health", priority: 4 },
        { name: "Professional Growth", description: "Advancing career skills and opportunities", priority: 4 }
      ]
    },
    {
      identityGoal: "I want to become someone who lives authentically, maintains excellent physical and mental health, and pursues lifelong learning.",
      currentState: "I'm in a transition phase where I'm discovering what truly matters to me and building better daily routines.",
      focusAreas: [
        { name: "Authentic Living", description: "Aligning actions with personal values", priority: 5 },
        { name: "Physical Health", description: "Maintaining fitness and energy levels", priority: 4 },
        { name: "Mental Wellness", description: "Cultivating emotional resilience and clarity", priority: 4 },
        { name: "Continuous Learning", description: "Pursuing new knowledge and skills", priority: 3 },
        { name: "Routine Building", description: "Establishing consistent daily practices", priority: 3 }
      ]
    }
  ];

  // Select a sample blueprint (could be random or based on responses length)
  const selectedBlueprint = sampleBlueprints[responses.length % sampleBlueprints.length];
  
  return selectedBlueprint;
}

export async function generateHabits(blueprint: GeneratedBlueprint): Promise<GeneratedHabit[]> {
  // Using placeholder habits instead of AI for now
  const sampleHabits = [
    {
      title: "Morning Meditation",
      description: "10-minute mindfulness meditation to start the day centered",
      category: "Morning Routine",
      focusArea: "Mindfulness",
      duration: 10
    },
    {
      title: "Daily Journaling",
      description: "Reflect on goals, gratitude, and personal insights",
      category: "Evening Reflection",
      focusArea: "Personal Development",
      duration: 15
    },
    {
      title: "Exercise Session",
      description: "Physical activity to maintain health and energy",
      category: "Health & Wellness",
      focusArea: "Physical Health",
      duration: 30
    },
    {
      title: "Read for Growth",
      description: "Read books or articles related to personal development",
      category: "Growth & Learning",
      focusArea: "Continuous Learning",
      duration: 20
    },
    {
      title: "Creative Practice",
      description: "Engage in a creative activity (writing, art, music, etc.)",
      category: "Growth & Learning",
      focusArea: "Creative Expression",
      duration: 25
    },
    {
      title: "Connect with Others",
      description: "Reach out to friends, family, or colleagues meaningfully",
      category: "Social Connection",
      focusArea: "Relationships",
      duration: 15
    },
    {
      title: "Plan Tomorrow",
      description: "Review goals and set priorities for the next day",
      category: "Evening Reflection",
      focusArea: "Personal Development",
      duration: 10
    }
  ];

  // Return 5-6 habits from the sample list
  return sampleHabits.slice(0, 5 + Math.floor(Math.random() * 2));
}

export async function refineBlueprint(
  currentBlueprint: GeneratedBlueprint, 
  updates: { feedback?: string; newGoals?: string; regenerateHabits?: boolean }
): Promise<GeneratedBlueprint> {
  // For now, just return a slightly modified version of the current blueprint
  return {
    ...currentBlueprint,
    identityGoal: updates.newGoals || currentBlueprint.identityGoal,
    focusAreas: currentBlueprint.focusAreas.map(area => ({
      ...area,
      priority: Math.max(1, Math.min(5, area.priority + (Math.random() > 0.5 ? 1 : -1)))
    }))
  };
}