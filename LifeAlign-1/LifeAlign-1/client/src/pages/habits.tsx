import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/navigation";

export default function Habits() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
    enabled: isAuthenticated,
  });

  const { data: todayCompletions = [] } = useQuery({
    queryKey: ["/api/habit-completions"],
    enabled: isAuthenticated,
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, isCompleted }: { habitId: string; isCompleted: boolean }) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (isCompleted) {
        // Uncomplete the habit
        return await apiRequest("DELETE", `/api/habit-completions/${habitId}?date=${today}`);
      } else {
        // Complete the habit
        return await apiRequest("POST", "/api/habit-completions", {
          habitId,
          date: today,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-completions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  const completedHabits = todayCompletions.length;
  const totalHabits = habits.length;
  const completionPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Group habits by category
  const habitsByCategory = habits.reduce((acc: any, habit: any) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {});

  const categoryColors = {
    "Morning Routine": "from-indigo-500 to-purple-600",
    "Growth & Learning": "from-emerald-500 to-teal-600",
    "Health & Wellness": "from-rose-500 to-pink-600",
    "Evening Reflection": "from-amber-500 to-orange-600",
    "Social Connection": "from-blue-500 to-cyan-600",
  };

  const handleToggleHabit = (habitId: string) => {
    const isCompleted = todayCompletions.some((completion: any) => completion.habitId === habitId);
    toggleHabitMutation.mutate({ habitId, isCompleted });
  };

  const todayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="p-2 -ml-2 text-muted"
              data-testid="button-back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Daily Habits</h1>
          </div>
          <div className="text-sm text-muted" data-testid="text-today-date">{todayDate}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Summary */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary" data-testid="text-completion-percent">
                {completionPercent}%
              </div>
              <div className="text-xs text-muted">Complete</div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="relative flex justify-center mb-4">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * completionPercent / 100)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-primary" data-testid="text-completed-count">
                {completedHabits}/{totalHabits}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900" data-testid="text-current-streak">7 days</div>
              <div className="text-muted">Current streak</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900" data-testid="text-best-streak">21 days</div>
              <div className="text-muted">Best streak</div>
            </div>
          </div>
        </Card>

        {/* Habit Categories */}
        <div className="space-y-4">
          {Object.entries(habitsByCategory).map(([category, categoryHabits]: [string, any[]]) => (
            <Card key={category} className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600'} p-4`}>
                <h3 className="text-white font-semibold">{category}</h3>
                <p className="text-white/80 text-sm">
                  {category === "Morning Routine" && "Start your day aligned"}
                  {category === "Growth & Learning" && "Expand your mind"}
                  {category === "Health & Wellness" && "Take care of your body"}
                  {category === "Evening Reflection" && "End your day mindfully"}
                  {category === "Social Connection" && "Build meaningful relationships"}
                </p>
              </div>
              
              <div className="p-4 space-y-3">
                {categoryHabits.map((habit: any) => {
                  const isCompleted = todayCompletions.some((completion: any) => completion.habitId === habit.id);
                  const completedAt = todayCompletions.find((completion: any) => completion.habitId === habit.id)?.completedAt;
                  
                  return (
                    <div key={habit.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                      <Button
                        onClick={() => handleToggleHabit(habit.id)}
                        variant="ghost"
                        size="sm"
                        disabled={toggleHabitMutation.isPending}
                        className={`w-8 h-8 p-0 transition-all ${
                          isCompleted 
                            ? 'bg-success rounded-full hover:bg-success/80' 
                            : 'border-2 border-gray-300 rounded-full hover:border-success'
                        }`}
                        data-testid={`button-toggle-habit-${habit.id}`}
                      >
                        {isCompleted && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className={`font-medium ${isCompleted ? 'text-gray-700 line-through opacity-75' : 'text-gray-900'}`}>
                          {habit.title}
                        </div>
                        <div className="text-sm text-muted">
                          {habit.duration && `${habit.duration} minutes`}
                          {habit.focusArea && ` • ${habit.focusArea}`}
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${isCompleted ? 'text-success' : 'text-muted'}`}>
                        {isCompleted && completedAt 
                          ? new Date(completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                          : 'Pending'
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Add Habit Button */}
        <Button
          onClick={() => {
            toast({
              title: "Coming Soon",
              description: "Habit creation will be available in the next update!",
            });
          }}
          variant="outline"
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:border-primary hover:bg-indigo-50 transition-colors h-auto flex-col"
          data-testid="button-add-habit"
        >
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <div className="font-medium text-gray-900 mb-1">Add New Habit</div>
          <div className="text-sm text-muted">Let AI suggest habits for your goals</div>
        </Button>
      </div>

      <Navigation currentPage="habits" />
    </div>
  );
}
