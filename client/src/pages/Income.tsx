import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataStore, useUIStore } from '@/store/useFinanceStore';
import Layout from '@/components/layout/Layout';
import TransactionForm from '@/components/forms/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Transaction, Category } from '@shared/schema';

export default function Income() {
  const { 
    transactions = [], 
    categories = [],
    setTransactions,
    deleteTransaction 
  } = useDataStore();
  const { setTransactionModalOpen } = useUIStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter for income transactions only
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const incomeCategories = categories.filter(c => c.type === 'income');

  // Sync with server data
  const { data: serverTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  React.useEffect(() => {
    if (serverTransactions) setTransactions(serverTransactions);
  }, [serverTransactions, setTransactions]);

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      deleteTransaction(transactionId);
      try {
        await apiRequest('DELETE', `/api/transactions/${transactionId}`, {});
      } catch (error) {
        // If server fails, transaction is still deleted locally
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Transaction deleted",
        description: "Income transaction has been removed successfully.",
      });
    },
  });

  const handleDeleteTransaction = (transactionId: number) => {
    if (confirm('Are you sure you want to delete this income transaction?')) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const lastMonthIncome = incomeTransactions
      .filter(t => {
        const date = new Date(t.date);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return date.getMonth() === lastMonth && date.getFullYear() === year;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;

    return {
      thisMonth: thisMonthIncome,
      lastMonth: lastMonthIncome,
      total: totalIncome,
      average: avgIncome,
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <Layout title="Income">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
            <p className="text-gray-600">Track and manage your income sources</p>
          </div>
          <Button onClick={() => setTransactionModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.thisMonth.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.lastMonth.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.average.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Income Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No income recorded yet</h3>
                  <p className="text-sm">Add your first income transaction to get started</p>
                </div>
                <Button onClick={() => setTransactionModalOpen(true)}>
                  Add First Income
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              {transaction.recurring && (
                                <Badge variant="secondary" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryName(transaction.categoryId)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          +${parseFloat(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <TransactionForm />
      </div>
    </Layout>
  );
}
