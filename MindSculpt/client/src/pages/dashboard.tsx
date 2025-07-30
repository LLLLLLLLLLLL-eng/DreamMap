import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HabitCard } from "@/components/habit-card";
import { AiRecommendationCard } from "@/components/ai-recommendation";
import { 
  TrendingUp, 
  Flame, 
  CheckCircle, 
  Brain,
  Bell,
  Menu,
  UserCheck,
  PlusCircle,
  BarChart3,
  Bot
} from "lucide-react";
import { useState } from "react";

const DEMO_USER_ID = "demo-user-1";

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState("😊");
  const [energyLevel, setEnergyLevel] = useState(7);

  const { data: user } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID],
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "habits"],
  });

  const { data: assessment } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "assessments", "latest", "current_self"],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "recommendations"],
  });

  const { data: todayCheckin } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "checkins", "today"],
  });

  const dimensions = assessment?.dimensions ? [
    { name: "Fitness", current: assessment.dimensions.fitness, icon: "💪", color: "bg-blue-100" },
    { name: "Career", current: assessment.dimensions.career, icon: "💼", color: "bg-green-100" },
    { name: "Relationships", current: assessment.dimensions.relationships, icon: "❤️", color: "bg-purple-100" },
    { name: "Learning", current: assessment.dimensions.learning, icon: "📚", color: "bg-orange-100" },
  ] : [];

  const completedHabitsToday = 2; // Would calculate from habit logs
  const totalHabits = habits.length;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Good morning, {user?.name || 'Alex'}! 🌟
              </h1>
              <p className="text-neutral-500 mt-1">
                You're {user?.overallProgress || 67}% closer to your ideal self than last month
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Overall Progress</p>
                    <p className="text-2xl font-bold text-neutral-900">{user?.overallProgress || 67}%</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-primary w-6 h-6" />
                  </div>
                </div>
                <Progress value={user?.overallProgress || 67} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Daily Streak</p>
                    <p className="text-2xl font-bold text-neutral-900">23 days</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Flame className="text-secondary w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-secondary">🔥 Personal best!</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Habits Completed</p>
                    <p className="text-2xl font-bold text-neutral-900">{completedHabitsToday}/{totalHabits}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-accent w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-neutral-500">{totalHabits - completedHabitsToday} more to complete today</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Blueprint Score</p>
                    <p className="text-2xl font-bold text-neutral-900">8.4/10</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-purple-600">AI suggests {recommendations.length} optimizations</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart & Daily Check-in */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current vs Ideal Self */}
            <Card>
              <CardHeader>
                <CardTitle>Current vs Ideal Self</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dimensions.map((dimension) => (
                  <div key={dimension.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${dimension.color}`}>
                        <span className="text-sm">{dimension.icon}</span>
                      </div>
                      <span className="font-medium text-neutral-900">{dimension.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={dimension.current} className="w-20 h-2" />
                      <span className="text-sm text-neutral-500 w-8">{dimension.current}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Daily Check-in */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Check-in</CardTitle>
                  <Badge variant={todayCheckin ? "default" : "secondary"}>
                    {todayCheckin ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-900 mb-2">How are you feeling today?</p>
                  <div className="flex space-x-2">
                    {["😊", "😐", "😴", "💪", "🎯"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedMood(emoji)}
                        className={`w-10 h-10 rounded-lg border-2 text-lg transition-colors ${
                          selectedMood === emoji
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white hover:bg-gray-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-neutral-900 mb-2">Energy Level (1-10)</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-neutral-900 w-6">{energyLevel}</span>
                  </div>
                </div>

                <Button className="w-full">
                  Complete Check-in
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Today's Habits */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Habits</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.slice(0, 3).map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={habit.name === "Morning Meditation" || habit.name === "Workout"}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Blueprint & Social */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Blueprint */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Blueprint</CardTitle>
                  <Button variant="ghost" size="sm">Refresh</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 gradient-card rounded-lg border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-1">Week Focus: Physical Health</h4>
                      <p className="text-sm text-neutral-600">
                        Based on your progress, I recommend focusing on consistent sleep schedule and increasing protein intake.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-neutral-900">Recommended Actions:</h5>
                  {recommendations.slice(0, 2).map((rec) => (
                    <AiRecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Accountability */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accountability</CardTitle>
                  <Button variant="ghost" size="sm">Find Buddy</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-neutral-900">Sarah Chen</p>
                        <p className="text-xs text-neutral-500">Your accountability buddy</p>
                      </div>
                    </div>
                    <span className="w-3 h-3 bg-secondary rounded-full"></span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    "Completed morning workout! How's your fitness goal going? 💪"
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Respond</Button>
                    <Button variant="outline" size="sm">Share Progress</Button>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-neutral-900 mb-3">Community Updates</h5>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-900">
                          <span className="font-medium">Mike R.</span> completed 30 days of meditation! 🧘‍♂️
                        </p>
                        <p className="text-xs text-neutral-500">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <UserCheck className="w-6 h-6" />
                  <span className="text-sm">Self Assessment</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <PlusCircle className="w-6 h-6" />
                  <span className="text-sm">Add Habit</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">View Analytics</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Bot className="w-6 h-6" />
                  <span className="text-sm">Chat with AI</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
