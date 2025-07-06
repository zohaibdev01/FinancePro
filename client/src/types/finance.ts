export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsProgress: number;
  incomeChange: number;
  expenseChange: number;
}

export interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface BudgetWithSpent {
  id: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  spent: number;
  percentage: number;
  status: 'good' | 'warning' | 'danger';
}
