import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const ONBOARDING_QUESTIONS = [
  {
    title: "Who do you want to become?",
    subtitle: "Think about your ideal self. What kind of person do you aspire to be? What traits and qualities matter most to you?",
    prompts: ["I want to be more...", "My ideal day looks like...", "People would describe me as..."]
  },
  {
    title: "What areas of your life do you want to focus on?",
    subtitle: "Consider different aspects like career, relationships, health, personal growth, creativity, or spirituality.",
    prompts: ["I want to improve my...", "I struggle with...", "I'm passionate about..."]
  },
  {
    title: "Where are you right now?",
    subtitle: "Be honest about your current situation. What's working well? What challenges are you facing?",
    prompts: ["Currently I am...", "My biggest challenge is...", "I'm good at..."]
  },
  {
    title: "What daily actions align with your goals?",
    subtitle: "Think about small, consistent actions that would move you toward your ideal self.",
    prompts: ["I should do more...", "If I did this daily...", "My morning could include..."]
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(new Array(ONBOARDING_QUESTIONS.length).fill(""));
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const generateBlueprintMutation = useMutation({
    mutationFn: async (responses: string[]) => {
      return await apiRequest("POST", "/api/blueprints/generate", { responses });
    },
    onSuccess: () => {
      toast({
        title: "Blueprint Created!",
        description: "Your personal blueprint has been generated. Let's start building habits!",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your blueprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentStep] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate blueprint
      const filteredResponses = responses.filter(response => response.trim().length > 0);
      if (filteredResponses.length === 0) {
        toast({
          title: "Please provide some responses",
          description: "We need at least one response to create your blueprint.",
          variant: "destructive",
        });
        return;
      }
      generateBlueprintMutation.mutate(filteredResponses);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleResponseChange(prompt);
  };

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];
  const progressWidth = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Blueprint Creation</h1>
          </div>
          <span className="text-sm text-muted" data-testid="text-current-step">
            Step {currentStep + 1} of {ONBOARDING_QUESTIONS.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progressWidth}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Question Card */}
        <Card className="bg-white rounded-3xl p-8 shadow-lg mb-6">
          <div className="text-center mb-8">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300" 
              alt="Person reflecting" 
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-3" data-testid="text-question-title">
              {currentQuestion.title}
            </h2>
            <p className="text-muted leading-relaxed" data-testid="text-question-subtitle">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <Textarea
              value={responses[currentStep]}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              data-testid="textarea-response"
            />
            
            {/* Suggested Prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Need inspiration? Try these prompts:</p>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    variant="outline"
                    size="sm"
                    className="px-3 py-2 bg-indigo-50 text-primary rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                    data-testid={`button-prompt-${index}`}
                  >
                    "{prompt}"
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="ghost"
            className="px-6 py-3 text-muted font-medium disabled:opacity-50"
            data-testid="button-previous"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={generateBlueprintMutation.isPending}
            className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            data-testid="button-next"
          >
            {generateBlueprintMutation.isPending ? "Creating..." : 
             currentStep === ONBOARDING_QUESTIONS.length - 1 ? "Create Blueprint" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
