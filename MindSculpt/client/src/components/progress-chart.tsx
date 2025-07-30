import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Dimension {
  name: string;
  current: number;
  icon: string;
  color: string;
}

interface ProgressChartProps {
  dimensions: Dimension[];
}

export function ProgressChart({ dimensions }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current vs Ideal Self</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((dimension) => (
          <div key={dimension.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mr-3",
                dimension.color
              )}>
                <span className="text-sm">{dimension.icon}</span>
              </div>
              <span className="font-medium text-neutral-900">{dimension.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Progress 
                value={dimension.current} 
                className="w-20 h-2"
              />
              <span className="text-sm text-neutral-500 w-8">{dimension.current}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
