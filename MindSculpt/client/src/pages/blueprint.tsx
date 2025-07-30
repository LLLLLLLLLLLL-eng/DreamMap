import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiRecommendationCard } from "@/components/ai-recommendation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, RefreshCw, TrendingUp, Target, Lightbulb } from "lucide-react";

const DEMO_USER_ID = "demo-user-1";

export default function Blueprint() {
  const { toast } = useToast();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "recommendations"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID],
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "habits"],
  });

  const { data: assessment } = useQuery({
    queryKey: ["/api/users", DEMO_USER_ID, "assessments", "latest", "current_self"],
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/users/${DEMO_USER_ID}/recommendations/generate`, {});
    },
    onSuccess: () => {
      toast({
        title: "Blueprint updated!",
        description: "New AI recommendations have been generated based on your latest data.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "recommendations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate new recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRecommendationsByCategory = () => {
    const categories = ["fitness", "wellness", "career", "learning", "relationships"];
    return categories.map(category => ({
      category,
      recommendations: recommendations.filter(rec => rec.category === category),
    })).filter(group => group.recommendations.length > 0);
  };

  const getOverallScore = () => {
    if (!assessment?.dimensions) return 0;
    const dimensions = Object.values(assessment.dimensions) as number[];
    return Math.round(dimensions.reduce((sum, val) => sum + val, 0) / dimensions.length);
  };

  const getWeakestArea = () => {
    if (!assessment?.dimensions) return null;
    const dimensions = assessment.dimensions as Record<string, number>;
    const entries = Object.entries(dimensions);
    const weakest = entries.reduce((min, current) => 
      current[1] < min[1] ? current : min
    );
    return weakest[0];
  };

  const getActiveHabitsCount = () => {
    return habits.filter(h => h.isActive).length;
  };

  const overallScore = getOverallScore();
  const weakestArea = getWeakestArea();
  const recommendationGroups = getRecommendationsByCategory();
  const activeHabitsCount = getActiveHabitsCount();

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
              <h1 className="text-2xl font-bold text-neutral-900">AI Blueprint</h1>
              <p className="text-neutral-500 mt-1">Personalized recommendations to bridge your gap</p>
            </div>
            <Button 
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${generateRecommendationsMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Refresh Blueprint</span>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Blueprint Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{overallScore}/100</p>
                  </div>
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Active Recommendations</p>
                    <p className="text-2xl font-bold text-neutral-900">{recommendations.length}</p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Active Habits</p>
                    <p className="text-2xl font-bold text-neutral-900">{activeHabitsCount}</p>
                  </div>
                  <Target className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Focus Area</p>
                    <p className="text-lg font-bold text-neutral-900 capitalize">{weakestArea || "Balanced"}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="gradient-card border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Current Focus</h4>
                  <p className="text-neutral-600">
                    {weakestArea ? (
                      `Your ${weakestArea} dimension needs attention. I've prioritized recommendations in this area to help you make progress.`
                    ) : (
                      "Your dimensions are well-balanced. Focus on maintaining consistency across all areas."
                    )}
                  </p>
                </div>
                
                {overallScore < 50 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Building Foundation</h4>
                    <p className="text-orange-700 text-sm">
                      Start with 1-2 small habits to build momentum. Consistency is more important than intensity at this stage.
                    </p>
                  </div>
                )}

                {overallScore >= 50 && overallScore < 75 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Gaining Momentum</h4>
                    <p className="text-blue-700 text-sm">
                      Great progress! You can now focus on optimizing existing habits and adding complementary ones.
                    </p>
                  </div>
                )}

                {overallScore >= 75 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Advanced Optimization</h4>
                    <p className="text-green-700 text-sm">
                      Excellent! Focus on fine-tuning and maintaining your high-performing habits while pushing boundaries.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations by Category */}
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No recommendations yet</h3>
                <p className="text-neutral-500 mb-4">
                  Complete your assessments and check-ins to get personalized AI recommendations.
                </p>
                <Button onClick={() => generateRecommendationsMutation.mutate()}>
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {recommendationGroups.map(({ category, recommendations: categoryRecs }) => (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{category} Recommendations</CardTitle>
                      <Badge variant="secondary">{categoryRecs.length} suggestions</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryRecs.map((recommendation) => (
                        <AiRecommendationCard 
                          key={recommendation.id} 
                          recommendation={recommendation} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Items */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>This Week's Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations
                    .filter(rec => rec.priority <= 2)
                    .slice(0, 3)
                    .map((rec, index) => (
                      <div key={rec.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{rec.title}</h4>
                          <p className="text-sm text-neutral-600 mt-1">{rec.description}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {rec.impact}
                          </Badge>
                        </div>
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
