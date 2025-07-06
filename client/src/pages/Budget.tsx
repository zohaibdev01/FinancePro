import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataStore, useUIStore } from '@/store/useFinanceStore';
import Layout from '@/components/layout/Layout';
import BudgetForm from '@/components/forms/BudgetForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Budget, Category, Transaction } from '@shared/schema';

export default function Budget() {
  const { 
    budgets = [], 
    categories = [], 
    transactions = [],
    setBudgets,
    deleteBudget 
  } = useDataStore();
  const { setBudgetModalOpen } = useUIStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync with server data
  const { data: serverBudgets } = useQuery<Budget[]>({
    queryKey: ['/api/budgets'],
  });

  const { data: serverCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: serverTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  React.useEffect(() => {
    if (serverBudgets) setBudgets(serverBudgets);
  }, [serverBudgets, setBudgets]);

  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      deleteBudget(budgetId);
      try {
        await apiRequest('DELETE', `/api/budgets/${budgetId}`, {});
      } catch (error) {
        // If server fails, budget is still deleted locally
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      toast({
        title: "Budget deleted",
        description: "Budget has been removed successfully.",
      });
    },
  });

  const calculateBudgetProgress = (budget: Budget) => {
    const category = categories.find(c => c.id === budget.categoryId);
    const spent = transactions
      .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const percentage = (spent / parseFloat(budget.amount)) * 100;
    const status = percentage >= 100 ? 'danger' : percentage >= 90 ? 'warning' : 'good';

    return {
      categoryName: category?.name || 'Unknown',
      spent,
      percentage: Math.min(percentage, 100),
      status,
      remaining: Math.max(parseFloat(budget.amount) - spent, 0),
    };
  };

  const handleDeleteBudget = (budgetId: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudgetMutation.mutate(budgetId);
    }
  };

  return (
    <Layout title="Budget">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Planning</h1>
            <p className="text-gray-600">Set and manage your monthly budgets</p>
          </div>
          <Button onClick={() => setBudgetModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>

        {budgets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No budgets created yet</h3>
                <p className="text-sm">Create your first budget to start tracking your spending</p>
              </div>
              <Button onClick={() => setBudgetModalOpen(true)}>
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const progress = calculateBudgetProgress(budget);
              return (
                <Card key={budget.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{progress.categoryName}</CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Spent</span>
                        <span className="font-medium">${progress.spent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Budget</span>
                        <span className="font-medium">${parseFloat(budget.amount).toFixed(2)}</span>
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className={`h-2 ${
                          progress.status === 'danger' ? 'bg-red-100' :
                          progress.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      />
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          progress.status === 'danger' ? 'destructive' :
                          progress.status === 'warning' ? 'secondary' : 'default'
                        }>
                          {progress.percentage.toFixed(1)}% used
                        </Badge>
                        <span className="text-sm text-gray-600">
                          ${progress.remaining.toFixed(2)} remaining
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <BudgetForm />
      </div>
    </Layout>
  );
}
