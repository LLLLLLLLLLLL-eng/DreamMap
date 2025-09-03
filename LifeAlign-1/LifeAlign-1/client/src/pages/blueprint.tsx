import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/navigation";

export default function Blueprint() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
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

  if (isLoading || !isAuthenticated || !blueprint) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  const focusAreas = Array.isArray(blueprint.focusAreas) ? blueprint.focusAreas : [];

  const handleAdjustWithAI = () => {
    toast({
      title: "Coming Soon",
      description: "AI blueprint refinement will be available in the next update!",
    });
  };

  const handleEditIdentityGoal = () => {
    toast({
      title: "Coming Soon",
      description: "Identity goal editing will be available in the next update!",
    });
  };

  const handleRegenerateHabits = () => {
    toast({
      title: "Coming Soon",
      description: "AI habit regeneration will be available in the next update!",
    });
  };

  // Group habits by focus area
  const habitsByFocusArea = habits.reduce((acc: any, habit: any) => {
    const focusArea = habit.focusArea || "General";
    if (!acc[focusArea]) {
      acc[focusArea] = [];
    }
    acc[focusArea].push(habit);
    return acc;
  }, {});

  const createdDate = new Date(blueprint.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
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
            <h1 className="text-xl font-semibold text-gray-900">Your Blueprint</h1>
          </div>
          <Button
            onClick={handleAdjustWithAI}
            className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
            data-testid="button-adjust-ai"
          >
            Adjust with AI
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Identity Goal */}
        <Card className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center relative"
            style={{
              backgroundImage: "linear-gradient(rgba(139, 92, 246, 0.8), rgba(99, 102, 241, 0.6)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=300')"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Your Identity Goal</h2>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-900 leading-relaxed mb-4" data-testid="text-identity-goal">
              {blueprint.identityGoal}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Created {createdDate}</span>
              <Button
                onClick={handleEditIdentityGoal}
                variant="ghost"
                size="sm"
                className="text-primary font-medium hover:text-indigo-700"
                data-testid="button-edit-identity-goal"
              >
                Edit
              </Button>
            </div>
          </div>
        </Card>

        {/* Current State */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Where You Are Now</h3>
          </div>
          
          <p className="text-gray-700 leading-relaxed" data-testid="text-current-state">
            {blueprint.currentState}
          </p>
        </Card>

        {/* Focus Areas */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Focus Areas</h3>
            </div>
            <span className="text-sm text-muted" data-testid="text-focus-areas-count">
              {focusAreas.length} areas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {focusAreas.map((area: any, index: number) => {
              const gradients = [
                "from-indigo-50 to-purple-50",
                "from-emerald-50 to-teal-50",
                "from-rose-50 to-pink-50",
                "from-amber-50 to-orange-50",
              ];
              const iconColors = [
                "bg-primary",
                "bg-emerald-500",
                "bg-rose-500",
                "bg-amber-500",
              ];

              return (
                <div key={index} className={`p-4 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 ${iconColors[index % iconColors.length]} rounded-lg flex items-center justify-center`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm" data-testid={`text-focus-area-name-${index}`}>
                    {area.name}
                  </h4>
                  <p className="text-xs text-muted mt-1" data-testid={`text-focus-area-description-${index}`}>
                    {area.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${iconColors[index % iconColors.length].replace('bg-', 'bg-')} h-2 rounded-full`}
                        style={{ width: `${(area.priority || 3) * 20}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${iconColors[index % iconColors.length].replace('bg-', 'text-')}`}>
                      {area.priority || 3}/5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI-Generated Habits */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Generated Habits</h3>
            </div>
            <span className="text-sm text-muted" data-testid="text-habits-count">
              {habits.length} habits
            </span>
          </div>

          <div className="space-y-3">
            {habits.slice(0, 5).map((habit: any) => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${habit.isActive ? 'bg-success' : 'bg-gray-300'} rounded-full`}></div>
                  <span className="text-gray-900" data-testid={`text-habit-title-${habit.id}`}>
                    {habit.title}
                  </span>
                </div>
                <span className="text-xs text-muted" data-testid={`text-habit-focus-area-${habit.id}`}>
                  {habit.focusArea || habit.category}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleRegenerateHabits}
            className="w-full mt-4 bg-gradient-to-r from-secondary to-primary text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            data-testid="button-regenerate-habits"
          >
            🤖 Regenerate Habits with AI
          </Button>
        </Card>
      </div>

      <Navigation currentPage="blueprint" />
    </div>
  );
}
