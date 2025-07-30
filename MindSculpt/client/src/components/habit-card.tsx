import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit } from "@shared/schema";

interface HabitCardProps {
  habit: Habit;
  isCompleted?: boolean;
  onToggle?: (habitId: string, completed: boolean) => void;
}

export function HabitCard({ habit, isCompleted = false, onToggle }: HabitCardProps) {
  const handleToggle = (checked: boolean) => {
    onToggle?.(habit.id, checked);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={handleToggle}
            className="w-5 h-5"
          />
          <span className={cn(
            "font-medium",
            isCompleted 
              ? "line-through text-neutral-500" 
              : "text-neutral-900"
          )}>
            {habit.name}
          </span>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-1">
          <span className="text-xs font-medium">{habit.currentStreak}</span>
          <Flame className="w-3 h-3" />
        </Badge>
      </div>
      
      {habit.description && (
        <p className="text-xs text-neutral-500 mb-2">{habit.description}</p>
      )}
      
      {habit.timeOfDay && (
        <div className="flex items-center text-xs text-neutral-400">
          <Clock className="w-3 h-3 mr-1" />
          <span>{habit.timeOfDay}</span>
        </div>
      )}
    </div>
  );
}
