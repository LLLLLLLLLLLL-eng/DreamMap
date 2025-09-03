import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();

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

  const { data: blueprint } = useQuery({
    queryKey: ["/api/blueprints/me"],
    enabled: isAuthenticated,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
    enabled: isAuthenticated,
  });

  const { data: todayCompletions = [] } = useQuery({
    queryKey: ["/api/habit-completions"],
    enabled: isAuthenticated,
  });

  // Redirect to onboarding if no blueprint exists
  useEffect(() => {
    if (isAuthenticated && blueprint === null) {
      console.log("Redirecting to onboarding - no blueprint found");
      navigate("/onboarding");
    }
  }, [isAuthenticated, blueprint, navigate]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  if (blueprint === null) {
    // This will trigger the redirect to onboarding
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  if (!blueprint) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  const completedHabits = Array.isArray(todayCompletions) ? todayCompletions.length : 0;
  const totalHabits = Array.isArray(habits) ? habits.length : 0;
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const userName = (user as any)?.firstName || "there";
  const userInitials = (user as any)?.firstName?.charAt(0) || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900" data-testid="text-greeting">
              Good morning, {userName}
            </h1>
            <p className="text-sm text-muted">Ready to align with your goals?</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.href = "/api/logout"}
              className="text-sm text-muted hover:text-gray-900 transition-colors"
              data-testid="button-logout"
            >
              Logout
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm" data-testid="text-user-initials">
                {userInitials}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Identity Goal Card */}
        <Card className="relative overflow-hidden bg-white rounded-3xl shadow-lg">
          <div 
            className="h-40 bg-cover bg-center relative"
            style={{
              backgroundImage: "linear-gradient(rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.5)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400')"
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center p-6 text-center">
              <div className="mb-3">
                <svg className="w-8 h-8 text-white mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Your North Star</h2>
              <p className="text-white/90 text-sm leading-relaxed" data-testid="text-identity-goal">
                {(blueprint as any)?.identityGoal}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="text-current-streak">7</div>
                <div className="text-xs text-muted">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success" data-testid="text-completion-rate">
                  {completionRate}%
                </div>
                <div className="text-xs text-muted">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary" data-testid="text-focus-areas">
                  {Array.isArray((blueprint as any)?.focusAreas) ? (blueprint as any).focusAreas.length : 0}
                </div>
                <div className="text-xs text-muted">Focus Areas</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Habits Preview */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Habits</h3>
            <span className="text-sm text-muted" data-testid="text-habits-complete">
              {completedHabits} of {totalHabits} complete
            </span>
          </div>

          <div className="space-y-3">
            {Array.isArray(habits) ? habits.slice(0, 3).map((habit: any) => {
              const isCompleted = Array.isArray(todayCompletions) ? todayCompletions.some((completion: any) => completion.habitId === habit.id) : false;
              return (
                <div key={habit.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  {isCompleted ? (
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span className={`flex-1 ${isCompleted ? 'text-gray-700 line-through' : 'text-gray-900'}`}>
                    {habit.title}
                  </span>
                  <span className={`text-xs font-medium ${isCompleted ? 'text-success' : 'text-muted'}`}>
                    {isCompleted ? 'Complete' : 'Pending'}
                  </span>
                </div>
              );
            }) : null}
          </div>

          <Button
            onClick={() => navigate("/habits")}
            className="w-full mt-4 bg-indigo-50 text-primary py-3 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
            data-testid="button-view-all-habits"
          >
            View All Habits
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/blueprint")}
            variant="outline"
            className="bg-white p-6 rounded-3xl shadow-lg text-center hover:shadow-xl transition-shadow h-auto flex-col"
            data-testid="button-navigate-blueprint"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Blueprint</h4>
            <p className="text-sm text-muted mt-1">Review & adjust</p>
          </Button>

          <Button
            onClick={() => navigate("/progress")}
            variant="outline"
            className="bg-white p-6 rounded-3xl shadow-lg text-center hover:shadow-xl transition-shadow h-auto flex-col"
            data-testid="button-navigate-progress"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">Progress</h4>
            <p className="text-sm text-muted mt-1">View metrics</p>
          </Button>
        </div>
      </div>

      <Navigation currentPage="dashboard" />
    </div>
  );
}
