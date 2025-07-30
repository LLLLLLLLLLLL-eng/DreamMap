import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, TrendingUp } from "lucide-react";

const DEMO_USER_ID = "demo-user-1";

const moodOptions = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😐", label: "Neutral", value: "😐" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "💪", label: "Energized", value: "💪" },
  { emoji: "🎯", label: "Focused", value: "🎯" },
  { emoji: "😰", label: "Stressed", value: "😰" },
  { emoji: "😢", label: "Sad", value: "😢" },
  { emoji: "🤔", label: "Thoughtful", value: "🤔" },
];

export default function Checkin() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState([7]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: todayCheckin } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "checkins", "today"],
  });

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "checkins"],
  });

  const createCheckinMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/checkins", data);
    },
    onSuccess: () => {
      toast({
        title: "Check-in completed!",
        description: "Your daily check-in has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "checkins"] });
      // Reset form
      setSelectedMood("");
      setEnergyLevel([7]);
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Missing information",
        description: "Please select your mood for today.",
        variant: "destructive",
      });
      return;
    }

    createCheckinMutation.mutate({
      userId: DEMO_USER_ID,
      date: today,
      mood: selectedMood,
      energyLevel: energyLevel[0],
      notes: notes.trim() || undefined,
    });
  };

  const getStreakCount = () => {
    // Calculate streak from recent check-ins
    const sortedCheckins = recentCheckins
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin.date);
      const diffTime = currentDate.getTime() - checkinDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak + 1 || (streak === 0 && diffDays === 0)) {
        streak++;
        currentDate = checkinDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getAverageEnergy = () => {
    if (recentCheckins.length === 0) return 0;
    const total = recentCheckins.reduce((sum, checkin) => sum + checkin.energyLevel, 0);
    return Math.round(total / recentCheckins.length);
  };

  const streak = getStreakCount();
  const averageEnergy = getAverageEnergy();

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Daily Check-in</h1>
              <p className="text-neutral-500 mt-1">How are you feeling today?</p>
            </div>
            <Badge variant={todayCheckin ? "default" : "secondary"} className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{todayCheckin ? "Completed" : "Pending"}</span>
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Check-in Streak</p>
                    <p className="text-2xl font-bold text-neutral-900">{streak} days</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Average Energy</p>
                    <p className="text-2xl font-bold text-neutral-900">{averageEnergy}/10</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Total Check-ins</p>
                    <p className="text-2xl font-bold text-neutral-900">{recentCheckins.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Check-in Form */}
          {!todayCheckin ? (
            <Card>
              <CardHeader>
                <CardTitle>Today's Check-in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          selectedMood === mood.value
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">
                    Energy Level (1-10)
                  </label>
                  <div className="space-y-4">
                    <Slider
                      value={energyLevel}
                      onValueChange={setEnergyLevel}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="text-3xl font-bold text-primary">{energyLevel[0]}</span>
                      <p className="text-sm text-neutral-500 mt-1">
                        {energyLevel[0] <= 3 && "Low energy"}
                        {energyLevel[0] > 3 && energyLevel[0] <= 6 && "Moderate energy"}
                        {energyLevel[0] > 6 && energyLevel[0] <= 8 && "High energy"}
                        {energyLevel[0] > 8 && "Peak energy"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any thoughts, achievements, or reflections for today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedMood || createCheckinMutation.isPending}
                  className="w-full"
                >
                  {createCheckinMutation.isPending ? "Saving..." : "Complete Check-in"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Today's Check-in Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Mood:</span>
                    <span className="text-2xl">{todayCheckin.mood}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Energy Level:</span>
                    <span className="text-xl font-bold text-primary">{todayCheckin.energyLevel}/10</span>
                  </div>
                  {todayCheckin.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium block mb-2">Notes:</span>
                      <p className="text-neutral-600">{todayCheckin.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Check-ins */}
          {recentCheckins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCheckins.slice(0, 7).map((checkin) => (
                    <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{checkin.mood}</span>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {new Date(checkin.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          {checkin.notes && (
                            <p className="text-sm text-neutral-500 truncate max-w-md">
                              {checkin.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        Energy: {checkin.energyLevel}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
