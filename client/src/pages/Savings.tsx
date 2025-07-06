import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataStore, useUIStore } from '@/store/useFinanceStore';
import Layout from '@/components/layout/Layout';
import SavingsGoalForm from '@/components/forms/SavingsGoalForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { SavingsGoal } from '@shared/schema';

export default function Savings() {
  const { 
    savingsGoals = [], 
    setSavingsGoals,
    deleteSavingsGoal 
  } = useDataStore();
  const { setSavingsGoalModalOpen } = useUIStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync with server data
  const { data: serverSavingsGoals } = useQuery<SavingsGoal[]>({
    queryKey: ['/api/savings-goals'],
  });

  React.useEffect(() => {
    if (serverSavingsGoals) setSavingsGoals(serverSavingsGoals);
  }, [serverSavingsGoals, setSavingsGoals]);

  const deleteSavingsGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      deleteSavingsGoal(goalId);
      try {
        await apiRequest('DELETE', `/api/savings-goals/${goalId}`, {});
      } catch (error) {
        // If server fails, goal is still deleted locally
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-goals'] });
      toast({
        title: "Savings goal deleted",
        description: "Goal has been removed successfully.",
      });
    },
  });

  const calculateProgress = (goal: SavingsGoal) => {
    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    const percentage = (current / target) * 100;
    const remaining = target - current;
    
    return {
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0),
      achieved: current >= target,
    };
  };

  const handleDeleteGoal = (goalId: number) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteSavingsGoalMutation.mutate(goalId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months left`;
    return `${Math.round(diffDays / 365)} years left`;
  };

  return (
    <Layout title="Savings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600">Set and track your financial goals</p>
          </div>
          <Button onClick={() => setSavingsGoalModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {savingsGoals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No savings goals yet</h3>
                <p className="text-sm">Create your first savings goal to start building your future</p>
              </div>
              <Button onClick={() => setSavingsGoalModalOpen(true)}>
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savingsGoals.map((goal) => {
              const progress = calculateProgress(goal);
              return (
                <Card key={goal.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span className="font-medium">${parseFloat(goal.currentAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target</span>
                        <span className="font-medium">${parseFloat(goal.targetAmount).toFixed(2)}</span>
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <Badge variant={progress.achieved ? 'default' : 'secondary'}>
                          {progress.percentage.toFixed(1)}% complete
                        </Badge>
                        <span className="text-sm text-gray-600">
                          ${progress.remaining.toFixed(2)} to go
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Target Date</span>
                          <span>{formatDate(goal.targetDate)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Time Remaining</span>
                          <span className={getTimeRemaining(goal.targetDate).includes('Overdue') ? 'text-red-500' : ''}>
                            {getTimeRemaining(goal.targetDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <SavingsGoalForm />
      </div>
    </Layout>
  );
}
