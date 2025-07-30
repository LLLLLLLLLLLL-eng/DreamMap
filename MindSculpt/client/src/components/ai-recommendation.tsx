import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle } from "lucide-react";
import type { AiRecommendation } from "@shared/schema";

interface AiRecommendationProps {
  recommendation: AiRecommendation;
}

export function AiRecommendationCard({ recommendation }: AiRecommendationProps) {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-red-100 text-red-800";
      case 2: return "bg-orange-100 text-orange-800"; 
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-blue-100 text-blue-800";
      case 5: return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIconBg = (category: string) => {
    switch (category) {
      case 'fitness': return 'bg-blue-100';
      case 'wellness': return 'bg-green-100';
      case 'career': return 'bg-purple-100';
      case 'learning': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'text-blue-600';
      case 'wellness': return 'text-green-600'; 
      case 'career': return 'text-purple-600';
      case 'learning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="gradient-card border border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(recommendation.category)}`}>
            <CheckCircle className={`w-4 h-4 ${getIconColor(recommendation.category)}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-neutral-900">{recommendation.title}</h4>
              <Badge className={getPriorityColor(recommendation.priority)}>
                Priority {recommendation.priority}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600 mb-2">{recommendation.description}</p>
            <p className="text-xs text-green-600 font-medium">{recommendation.impact}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
