import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MinusCircle, Edit } from 'lucide-react';
import type { Transaction, Category } from '@shared/schema';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  const getCategoryName = (categoryId: number | null) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
          View All
        </Button>
      </CardHeader>
      <CardContent>
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
              {(transactions || []).slice(0, 5).map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <PlusCircle className="text-green-600" size={16} />
                        ) : (
                          <MinusCircle className="text-red-600" size={16} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{transaction.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {getCategoryName(transaction.categoryId)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm">
                      <Edit size={16} className="text-gray-400 hover:text-gray-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
