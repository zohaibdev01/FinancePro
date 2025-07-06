import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { BudgetWithSpent } from '@/types/finance';

interface BudgetProgressProps {
  budgets: BudgetWithSpent[];
}

export default function BudgetProgress({ budgets }: BudgetProgressProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Progress</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget, index) => (
            <div key={budget.id} className={index < budgets.length - 1 ? "border-b border-gray-100 pb-4" : "pb-4"}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{budget.categoryName}</span>
                <span className="text-sm text-gray-600">
                  ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className={`h-2 ${
                  budget.status === 'good' ? '[&>div]:bg-green-500' :
                  budget.status === 'warning' ? '[&>div]:bg-yellow-500' :
                  '[&>div]:bg-red-500'
                }`}
              />
              <p className={`text-xs mt-1 ${
                budget.status === 'good' ? 'text-gray-500' :
                budget.status === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {budget.percentage > 100 
                  ? `$${(budget.spent - budget.amount).toLocaleString()} over budget`
                  : `${Math.round(100 - budget.percentage)}% remaining`
                }
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
