import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore, useDataStore } from '@/store/useFinanceStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertBudgetSchema } from '@shared/schema';

const budgetFormSchema = insertBudgetSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.number().min(1, "Category is required"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

export default function BudgetForm() {
  const { budgetModalOpen, setBudgetModalOpen } = useUIStore();
  const { categories = [], addBudget } = useDataStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: 0,
      amount: '',
      period: 'monthly',
    },
  });

  const createBudget = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const newId = Date.now();
      const newBudget = {
        id: newId,
        userId: 1,
        categoryId: data.categoryId,
        amount: parseFloat(data.amount).toString(),
        period: data.period,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      addBudget(newBudget);
      
      try {
        const response = await apiRequest('POST', '/api/budgets', {
          ...data,
          amount: parseFloat(data.amount).toString(),
        });
        return response.json();
      } catch (error) {
        return newBudget;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      setBudgetModalOpen(false);
      form.reset();
      toast({
        title: "Budget created",
        description: "Your budget has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    createBudget.mutate(data);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.length === 0 ? (
                        <SelectItem value="none" disabled>No expense categories available</SelectItem>
                      ) : (
                        expenseCategories.map((category) => (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBudgetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBudget.isPending}>
                {createBudget.isPending ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}