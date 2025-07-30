import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Share2, 
  Heart, 
  TrendingUp,
  Calendar,
  Target,
  Award
} from "lucide-react";

const DEMO_USER_ID = "demo-user-1";

export default function Accountability() {
  const [shareText, setShareText] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: buddies = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "buddies"],
  });

  const { data: communityUpdates = [] } = useQuery({
    queryKey: ["/api/community/updates"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID],
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "habits"],
  });

  const shareProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/community/updates", data);
    },
    onSuccess: () => {
      toast({
        title: "Progress shared!",
        description: "Your update has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community/updates"] });
      setShareText("");
      setIsShareDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShareProgress = () => {
    if (!shareText.trim()) {
      toast({
        title: "Missing content",
        description: "Please write something to share with the community.",
        variant: "destructive",
      });
      return;
    }

    shareProgressMutation.mutate({
      userId: DEMO_USER_ID,
      content: shareText,
      type: "general",
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeBuddy = {
    id: "buddy-1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612d5c1?w=100&h=100&fit=crop&crop=face",
    status: "online",
    lastMessage: "Completed morning workout! How's your fitness goal going? 💪",
    streak: 12,
    sharedGoals: ["fitness", "wellness"]
  };

  const mockCommunityMembers = [
    {
      id: "user-2",
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      achievement: "30 days of meditation",
      type: "milestone"
    },
    {
      id: "user-3", 
      name: "Emma Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      achievement: "reached ideal career goal",
      type: "achievement"
    },
    {
      id: "user-4",
      name: "Alex Thompson", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      achievement: "completed 50 workouts",
      type: "milestone"
    }
  ];

  const stats = {
    totalBuddies: 1,
    activeConnections: 1,
    postsShared: 8,
    encouragementsGiven: 23
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Accountability</h1>
              <p className="text-neutral-500 mt-1">Connect with others and stay motivated together</p>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share Progress</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Progress</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share an achievement, milestone, or encouragement with the community..."
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleShareProgress} 
                        disabled={shareProgressMutation.isPending}
                        className="flex-1"
                      >
                        Share with Community
                      </Button>
                      <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Find Buddy</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Accountability Buddies</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalBuddies}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Active Connections</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.activeConnections}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Posts Shared</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.postsShared}</p>
                  </div>
                  <Share2 className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Encouragements Given</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.encouragementsGiven}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accountability Buddy */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Accountability Buddy</CardTitle>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activeBuddy ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={activeBuddy.avatar} alt={activeBuddy.name} />
                              <AvatarFallback>{getUserInitials(activeBuddy.name)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{activeBuddy.name}</p>
                            <p className="text-xs text-neutral-500">Your accountability buddy</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-xs text-accent">
                            <Target className="w-3 h-3" />
                            <span>{activeBuddy.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-neutral-600 mb-2">Latest message:</p>
                        <p className="text-sm bg-white p-3 rounded border">{activeBuddy.lastMessage}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-neutral-600 mb-2">Shared goals:</p>
                        <div className="flex space-x-2">
                          {activeBuddy.sharedGoals.map((goal) => (
                            <Badge key={goal} variant="outline" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Progress
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Buddy Progress</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Fitness Goals</p>
                          <p className="font-medium">85% complete</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Check-in Streak</p>
                          <p className="font-medium">12 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No accountability buddy yet</h3>
                    <p className="text-neutral-500 mb-4">Connect with someone to stay motivated together</p>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find a Buddy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Updates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Community Updates</CardTitle>
                  <Badge variant="outline">{mockCommunityMembers.length} active members</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCommunityMembers.map((member, index) => (
                    <div key={member.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{getUserInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                          {member.type === "milestone" && <Award className="w-4 h-4 text-accent" />}
                          {member.type === "achievement" && <Target className="w-4 h-4 text-secondary" />}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {member.type === "milestone" && "🏆 "}
                          {member.type === "achievement" && "🎉 "}
                          {member.achievement}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">{index + 2} hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    View All Updates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Progress Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Overall Progress</h4>
                      <p className="text-2xl font-bold text-primary">{user?.overallProgress || 67}%</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Share Milestone
                  </Button>
                </div>

                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Active Habits</h4>
                      <p className="text-2xl font-bold text-secondary">{habits.length}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Share Achievement
                  </Button>
                </div>

                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Streak Record</h4>
                      <p className="text-2xl font-bold text-accent">23 days</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Celebrate Success
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Find Accountability Partners */}
          <Card>
            <CardHeader>
              <CardTitle>Find Accountability Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Suggested Matches</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Jordan Lee", goals: ["fitness", "learning"], compatibility: 92 },
                      { name: "Taylor Swift", goals: ["wellness", "career"], compatibility: 87 },
                      { name: "Casey Johnson", goals: ["fitness", "wellness"], compatibility: 84 }
                    ].map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{getUserInitials(match.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-neutral-900">{match.name}</p>
                            <div className="flex space-x-1">
                              {match.goals.map((goal) => (
                                <Badge key={goal} variant="secondary" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">{match.compatibility}% match</p>
                          <Button size="sm" variant="outline">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">How It Works</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Get Matched</h5>
                        <p className="text-sm text-neutral-600">AI matches you with people who have similar goals and commitment levels.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Stay Connected</h5>
                        <p className="text-sm text-neutral-600">Regular check-ins, progress sharing, and mutual encouragement.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h5 className="font-medium text-neutral-900">Achieve Together</h5>
                        <p className="text-sm text-neutral-600">Celebrate milestones and support each other through challenges.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
