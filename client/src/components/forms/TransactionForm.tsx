import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore, useAuthStore, useDataStore } from '@/store/useFinanceStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertTransactionSchema } from '@shared/schema';
import type { Category } from '@shared/schema';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.number().min(1, "Please select a category"),
  date: z.string().min(1, "Date is required"),
  recurring: z.boolean().optional(),
  recurringPeriod: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export default function TransactionForm() {
  const { transactionModalOpen, setTransactionModalOpen } = useUIStore();
  const { token, user } = useAuthStore();
  const { categories = [], addTransaction } = useDataStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      categoryId: 3, // Default to "Food" expense category
      date: new Date().toISOString().split('T')[0],
      recurring: false,
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      console.log('Creating transaction with data:', data);
      
      // Create a unique ID for the transaction
      const newId = Date.now();
      const newTransaction = {
        id: newId,
        userId: 1, // Use default user ID for local storage
        type: data.type,
        description: data.description,
        amount: parseFloat(data.amount).toString(),
        categoryId: data.categoryId,
        date: data.date,
        recurring: data.recurring || false,
        recurringPeriod: data.recurringPeriod || 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Adding transaction to local store:', newTransaction);
      // Add to local store - this is the primary storage now
      addTransaction(newTransaction);
      
      // Don't depend on server - return local transaction immediately
      return newTransaction;
    },
    onSuccess: (data) => {
      console.log('Transaction saved successfully:', data);
      setTransactionModalOpen(false);
      form.reset({
        type: 'expense',
        amount: '',
        description: '',
        categoryId: 3, // Default to "Food" expense category
        date: new Date().toISOString().split('T')[0],
        recurring: false,
      });
      toast({
        title: "Transaction added",
        description: "Your transaction has been saved to local storage.",
      });
    },
    onError: (error) => {
      console.error('Transaction save error:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    
    // Force submit even if there are minor validation errors - focus on local storage
    createTransaction.mutate(data);
  };

  const transactionType = form.watch('type');
  const filteredCategories = categories.filter(cat => cat.type === transactionType);
  


  return (
    <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <SelectItem value="none" disabled>No categories available</SelectItem>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring transaction</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setTransactionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? 'Saving...' : 'Save Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
