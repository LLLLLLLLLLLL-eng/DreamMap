import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";

const DEMO_USER_ID = "demo-user-1";

interface Question {
  id: string;
  question: string;
  category: string;
  type: "text" | "slider";
  min?: number;
  max?: number;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentType, setAssessmentType] = useState<"ideal_self" | "current_self">("ideal_self");
  const [responses, setResponses] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/assessments/questions", assessmentType],
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/assessments", data);
    },
    onSuccess: () => {
      toast({
        title: "Assessment completed!",
        description: "Your responses have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "assessments"] });
      
      // Move to next assessment type or finish
      if (assessmentType === "ideal_self") {
        setAssessmentType("current_self");
        setCurrentStep(0);
        setResponses({});
      } else {
        // Redirect to dashboard or next step
        window.location.href = "/";
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate dimensions from responses
    const dimensions: Record<string, number> = {};
    
    questions.forEach((question) => {
      const response = responses[question.id];
      if (question.type === "slider" && typeof response === "number") {
        dimensions[question.category] = response;
      } else if (question.type === "text" && response) {
        // For text responses, assign a default score or use AI to analyze
        dimensions[question.category] = 50; // Default middle score
      }
    });

    createAssessmentMutation.mutate({
      userId: DEMO_USER_ID,
      type: assessmentType,
      dimensions,
      responses,
    });
  };

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const currentQuestion = questions[currentStep];

  if (!currentQuestion) {
    return (
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading assessment questions...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {assessmentType === "ideal_self" ? "Define Your Ideal Self" : "Assess Your Current State"}
            </h1>
            <p className="text-neutral-600">
              {assessmentType === "ideal_self" 
                ? "Let's explore what your ideal future looks like across different areas of life."
                : "Now let's evaluate where you currently stand in each area."
              }
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-600">Question {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm text-neutral-600">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === "text" ? (
                <Textarea
                  placeholder="Share your thoughts..."
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                  className="min-h-32"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-neutral-600 w-16">
                      {currentQuestion.min || 1}
                    </span>
                    <Slider
                      value={[responses[currentQuestion.id] || 50]}
                      onValueChange={(value) => updateResponse(currentQuestion.id, value[0])}
                      min={currentQuestion.min || 1}
                      max={currentQuestion.max || 100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-neutral-600 w-16 text-right">
                      {currentQuestion.max || 100}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      {responses[currentQuestion.id] || 50}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={!responses[currentQuestion.id] || createAssessmentMutation.isPending}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStep === totalSteps - 1 ? "Complete Assessment" : "Next"}
              </span>
              {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Assessment Type Indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
              <div className={`w-2 h-2 rounded-full ${assessmentType === "ideal_self" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span className="text-sm text-neutral-600">Ideal Self</span>
              <div className={`w-2 h-2 rounded-full ${assessmentType === "current_self" ? "bg-primary" : "bg-gray-300"}`}></div>
              <span className="text-sm text-neutral-600">Current Self</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
