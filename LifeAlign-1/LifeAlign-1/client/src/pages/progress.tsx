import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/navigation";

export default function Progress() {
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

  // Get completions for the last 7 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: weekCompletions = [] } = useQuery({
    queryKey: ["/api/habit-completions", { startDate, endDate }],
    queryFn: () => fetch(`/api/habit-completions?startDate=${startDate}&endDate=${endDate}`, {
      credentials: "include",
    }).then(res => res.json()),
    enabled: isAuthenticated,
  });

  const { data: progressAssessments = [] } = useQuery({
    queryKey: ["/api/progress-assessments"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated || !blueprint) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" />;
  }

  const focusAreas = Array.isArray(blueprint.focusAreas) ? blueprint.focusAreas : [];
  
  // Calculate overall progress
  const totalHabits = habits.length;
  const completedToday = weekCompletions.filter((completion: any) => 
    completion.date === new Date().toISOString().split('T')[0]
  ).length;
  const overallProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Calculate weekly completion data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
    };
  });

  const dayCompletions = last7Days.map(day => {
    const completions = weekCompletions.filter((completion: any) => completion.date === day.date);
    const rate = totalHabits > 0 ? (completions.length / totalHabits) : 0;
    return {
      ...day,
      completions: completions.length,
      rate,
      status: rate >= 0.8 ? 'great' : rate >= 0.5 ? 'good' : 'future',
    };
  });

  const totalDaysActive = dayCompletions.filter(day => day.completions > 0).length;
  const totalHabitsCompleted = weekCompletions.length;
  const longestStreak = 7; // This would be calculated from completion history

  const handleExportProgress = () => {
    toast({
      title: "Coming Soon",
      description: "Progress export will be available in the next update!",
    });
  };

  const handleStartCheckIn = () => {
    toast({
      title: "Coming Soon",
      description: "Weekly check-in will be available in the next update!",
    });
  };

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
            <h1 className="text-xl font-semibold text-gray-900">Progress Tracking</h1>
          </div>
          <Button
            onClick={handleExportProgress}
            variant="ghost"
            size="sm"
            className="p-2 text-muted"
            data-testid="button-export-progress"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Progress */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Journey</h2>
            <p className="text-muted">{totalDaysActive} days of consistent progress</p>
          </div>

          {/* Circular Progress */}
          <div className="relative flex justify-center mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6"/>
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="6" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * overallProgress / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#6366F1"}}/>
                  <stop offset="100%" style={{stopColor:"#8B5CF6"}}/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary" data-testid="text-overall-progress">
                {overallProgress}%
              </span>
              <span className="text-xs text-muted">Overall</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900" data-testid="text-total-days">
                {totalDaysActive}
              </div>
              <div className="text-xs text-muted">Active Days</div>
            </div>
            <div>
              <div className="text-xl font-bold text-success" data-testid="text-habits-completed">
                {totalHabitsCompleted}
              </div>
              <div className="text-xs text-muted">Habits Done</div>
            </div>
            <div>
              <div className="text-xl font-bold text-secondary" data-testid="text-longest-streak">
                {longestStreak}
              </div>
              <div className="text-xs text-muted">Best Streak</div>
            </div>
          </div>
        </Card>

        {/* Focus Area Progress */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Area Progress</h3>
          
          <div className="space-y-4">
            {focusAreas.map((area: any, index: number) => {
              const colors = [
                { bg: "bg-primary", gradient: "from-primary to-indigo-400", text: "text-primary" },
                { bg: "bg-emerald-500", gradient: "from-emerald-500 to-teal-400", text: "text-emerald-600" },
                { bg: "bg-rose-500", gradient: "from-rose-500 to-pink-400", text: "text-rose-600" },
                { bg: "bg-amber-500", gradient: "from-amber-500 to-orange-400", text: "text-amber-600" },
              ];
              const color = colors[index % colors.length];
              const progress = (area.priority || 3) * 20; // Convert 1-5 scale to percentage
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900" data-testid={`text-focus-area-${index}`}>
                        {area.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${color.text}`}>
                        {progress}%
                      </span>
                      <div className="text-xs text-muted">+5% this week</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-gradient-to-r ${color.gradient} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Activity</h3>
          
          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayCompletions.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-muted mb-2">{day.day}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  day.status === 'great' ? 'bg-success' :
                  day.status === 'good' ? 'bg-amber-500' : 'bg-gray-200'
                }`}>
                  <span className={`text-xs font-bold ${
                    day.status === 'future' ? 'text-gray-500' : 'text-white'
                  }`} data-testid={`text-day-${index}`}>
                    {day.dayNum}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-muted">Great day</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-muted">Good day</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-muted">Future</span>
            </div>
          </div>
        </Card>

        {/* Self Assessment Prompt */}
        <Card className="bg-gradient-to-br from-secondary to-primary rounded-3xl p-6 shadow-lg text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Weekly Check-in</h3>
          </div>
          
          <p className="text-white/90 mb-4 leading-relaxed">
            How do you feel about your progress this week? Take a moment to reflect on your journey.
          </p>
          
          <Button
            onClick={handleStartCheckIn}
            className="bg-white text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            data-testid="button-start-checkin"
          >
            Start Check-in
          </Button>
        </Card>

        {/* Insights & Suggestions */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-2xl border-l-4 border-primary">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Great momentum!</h4>
                  <p className="text-sm text-gray-700" data-testid="text-insight-positive">
                    You've maintained a {totalDaysActive}-day streak. Your consistency is building strong habits that align with your goals.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-2xl border-l-4 border-amber-500">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Focus opportunity</h4>
                  <p className="text-sm text-gray-700" data-testid="text-insight-improvement">
                    Consider creating more specific time blocks for your habits to improve consistency and completion rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Navigation currentPage="progress" />
    </div>
  );
}
