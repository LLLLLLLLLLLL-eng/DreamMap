import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HabitCard } from "@/components/habit-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, BarChart3, Calendar, Flame } from "lucide-react";
import type { InsertHabit } from "@shared/schema";

const DEMO_USER_ID = "demo-user-1";

export default function Habits() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<InsertHabit>>({
    userId: DEMO_USER_ID,
    targetFrequency: "daily",
    category: "wellness"
  });
  const { toast } = useToast();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "habits"],
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "habit-logs"],
    queryParams: { date: new Date().toISOString().split('T')[0] }
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: InsertHabit) => {
      return apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      toast({
        title: "Habit created!",
        description: "Your new habit has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "habits"] });
      setIsDialogOpen(false);
      setNewHabit({ 
        userId: DEMO_USER_ID,
        targetFrequency: "daily",
        category: "wellness"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", "/api/habit-logs", {
        habitId,
        userId: DEMO_USER_ID,
        completed,
        date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "habit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "habits"] });
    },
  });

  const handleCreateHabit = () => {
    if (!newHabit.name?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    createHabitMutation.mutate(newHabit as InsertHabit);
  };

  const handleToggleHabit = (habitId: string, completed: boolean) => {
    toggleHabitMutation.mutate({ habitId, completed });
  };

  const getCompletedStatus = (habitId: string) => {
    return habitLogs.some(log => log.habitId === habitId && log.completed);
  };

  const categories = ["fitness", "wellness", "learning", "career", "relationships", "creativity"];
  const frequencies = ["daily", "weekly"];

  const stats = {
    totalHabits: habits.length,
    completedToday: habitLogs.filter(log => log.completed).length,
    longestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
    averageStreak: habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) : 0
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Habit Tracker</h1>
              <p className="text-neutral-500 mt-1">Build consistent habits to reach your ideal self</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Habit</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Habit Name</label>
                    <Input
                      placeholder="e.g., Morning Meditation"
                      value={newHabit.name || ""}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your habit..."
                      value={newHabit.description || ""}
                      onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newHabit.category} onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Frequency</label>
                      <Select value={newHabit.targetFrequency} onValueChange={(value) => setNewHabit({ ...newHabit, targetFrequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Time of Day (optional)</label>
                    <Input
                      placeholder="e.g., 7:00 AM"
                      value={newHabit.timeOfDay || ""}
                      onChange={(e) => setNewHabit({ ...newHabit, timeOfDay: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleCreateHabit} disabled={createHabitMutation.isPending} className="flex-1">
                      Create Habit
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Total Habits</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalHabits}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Completed Today</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.completedToday}/{stats.totalHabits}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Longest Streak</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.longestStreak}</p>
                  </div>
                  <Flame className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Average Streak</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.averageStreak}</p>
                  </div>
                  <Flame className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habits Grid */}
          <Card>
            <CardHeader>
              <CardTitle>My Habits</CardTitle>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No habits yet</h3>
                  <p className="text-neutral-500 mb-4">Create your first habit to start building consistency</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Habit
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={getCompletedStatus(habit.id)}
                      onToggle={handleToggleHabit}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habits by Category */}
          {habits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Habits by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const categoryHabits = habits.filter(h => h.category === category);
                    if (categoryHabits.length === 0) return null;

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-neutral-900 capitalize">{category}</h3>
                          <Badge variant="secondary">{categoryHabits.length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {categoryHabits.map((habit) => (
                            <div key={habit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{habit.name}</span>
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <span>{habit.currentStreak}</span>
                                <Flame className="w-3 h-3" />
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
