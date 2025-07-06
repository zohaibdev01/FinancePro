import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import type { SavingsGoal } from '@shared/schema';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

export default function SavingsGoals({ goals }: SavingsGoalsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return Math.round((currentAmount / targetAmount) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount || "0", goal.targetAmount);
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className="text-sm text-gray-600">
                    ${parseFloat(goal.currentAmount || "0").toLocaleString()} / ${parseFloat(goal.targetAmount).toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="h-3 mb-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progress}% complete</span>
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          <Plus size={16} className="mr-2" />
          Add New Goal
        </Button>
      </CardContent>
    </Card>
  );
}
