import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDataStore } from '@/store/useFinanceStore';
import Layout from '@/components/layout/Layout';
import StatsCards from '@/components/dashboard/StatsCards';
import MonthlyChart from '@/components/charts/MonthlyChart';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SavingsGoals from '@/components/dashboard/SavingsGoals';
import QuickActions from '@/components/dashboard/QuickActions';
import TransactionForm from '@/components/forms/TransactionForm';
import BudgetForm from '@/components/forms/BudgetForm';
import SavingsGoalForm from '@/components/forms/SavingsGoalForm';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transaction, Category, Budget, SavingsGoal } from '@shared/schema';
import type { DashboardStats, ChartData, BudgetWithSpent } from '@/types/finance';

export default function Dashboard() {
  // Get data from local store instead of API
  const { 
    transactions = [],
    categories = [],
    budgets = [],
    savingsGoals = [],
    setTransactions,
    setCategories,
    setBudgets,
    setSavingsGoals
  } = useDataStore();

  // Sync with server data (fetch once and store locally)
  const { data: serverTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: serverCategories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: serverBudgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ['/api/budgets'],
  });

  const { data: serverSavingsGoals, isLoading: savingsGoalsLoading } = useQuery<SavingsGoal[]>({
    queryKey: ['/api/savings-goals'],
  });

  // Sync server data to local store when available
  React.useEffect(() => {
    if (serverTransactions) setTransactions(serverTransactions);
  }, [serverTransactions, setTransactions]);

  React.useEffect(() => {
    if (serverCategories) setCategories(serverCategories);
  }, [serverCategories, setCategories]);

  React.useEffect(() => {
    if (serverBudgets) setBudgets(serverBudgets);
  }, [serverBudgets, setBudgets]);

  React.useEffect(() => {
    if (serverSavingsGoals) setSavingsGoals(serverSavingsGoals);
  }, [serverSavingsGoals, setSavingsGoals]);

  const isLoading = transactionsLoading || categoriesLoading || budgetsLoading || savingsGoalsLoading;

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    if (!transactions || transactions.length === 0) {
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsProgress: 0,
        incomeChange: 0,
        expenseChange: 0,
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalBalance = transactions.reduce((balance, t) => {
      return balance + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
    }, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsProgress: 68, // Placeholder
      incomeChange: 2.1,
      expenseChange: -1.5,
    };
  };

  // Generate chart data
  const generateChartData = (): ChartData => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const income = [4800, 5200, 4900, 5100, 5250, 5300];
    const expenses = [3200, 3400, 3100, 3300, 3180, 3250];

    return { labels: months, income, expenses };
  };

  // Calculate budget progress
  const calculateBudgetProgress = (): BudgetWithSpent[] => {
    if (!budgets || !categories || !transactions) {
      return [];
    }
    
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const percentage = (spent / parseFloat(budget.amount)) * 100;
      const status = percentage >= 100 ? 'danger' : percentage >= 90 ? 'warning' : 'good';

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: category?.name || 'Unknown',
        amount: parseFloat(budget.amount),
        spent,
        percentage,
        status,
      };
    });
  };

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </Layout>
    );
  }

  const stats = calculateStats();
  const chartData = generateChartData();
  const budgetProgress = calculateBudgetProgress();

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonthlyChart data={chartData} />
          <BudgetProgress budgets={budgetProgress} />
        </div>

        <RecentTransactions transactions={transactions} categories={categories} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SavingsGoals goals={savingsGoals} />
          <QuickActions />
        </div>
      </div>
      
      <TransactionForm />
      <BudgetForm />
      <SavingsGoalForm />
    </Layout>
  );
}
