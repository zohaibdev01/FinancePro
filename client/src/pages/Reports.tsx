import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDataStore } from '@/store/useFinanceStore';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import type { Transaction, Category } from '@shared/schema';

export default function Reports() {
  const { 
    transactions = [], 
    categories = [],
    setTransactions,
    setCategories
  } = useDataStore();

  const [selectedPeriod, setSelectedPeriod] = React.useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  // Sync with server data
  const { data: serverTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: serverCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  React.useEffect(() => {
    if (serverTransactions) setTransactions(serverTransactions);
    if (serverCategories) setCategories(serverCategories);
  }, [serverTransactions, serverCategories, setTransactions, setCategories]);

  const getFilteredTransactions = () => {
    const now = new Date();
    let filtered = [...transactions];

    // Filter by period
    switch (selectedPeriod) {
      case 'thisMonth':
        filtered = filtered.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        break;
      case 'lastMonth':
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        filtered = filtered.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
        break;
      case 'thisYear':
        filtered = filtered.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === now.getFullYear();
        });
        break;
      case 'all':
      default:
        break;
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(selectedCategory));
    }

    return filtered;
  };

  const generateReports = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netIncome = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => t.categoryId === category.id);
      const amount = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return {
        name: category.name,
        type: category.type,
        amount,
        count: categoryTransactions.length,
      };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        transactionCount: filteredTransactions.length,
      },
      categoryBreakdown,
    };
  };

  const reports = generateReports();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportToCSV = () => {
    const filteredTransactions = getFilteredTransactions();
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'],
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
        t.description,
        t.amount,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">View detailed financial reports and analytics</p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(reports.summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(reports.summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                reports.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(reports.summary.netIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.summary.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.categoryBreakdown.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.categoryBreakdown.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                          {category.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{category.count}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        category.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {category.type === 'income' ? '+' : '-'}{formatCurrency(category.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
