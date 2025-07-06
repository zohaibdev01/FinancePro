import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore, useDataStore } from '@/store/useFinanceStore';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertSavingsGoalSchema } from '@shared/schema';

const savingsGoalFormSchema = insertSavingsGoalSchema.extend({
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional(),
  targetDate: z.string().min(1, "Target date is required"),
});

type SavingsGoalFormData = z.infer<typeof savingsGoalFormSchema>;

export default function SavingsGoalForm() {
  const { savingsGoalModalOpen, setSavingsGoalModalOpen } = useUIStore();
  const { addSavingsGoal } = useDataStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: '',
    },
  });

  const createSavingsGoal = useMutation({
    mutationFn: async (data: SavingsGoalFormData) => {
      console.log('Creating savings goal with data:', data);
      const newId = Date.now();
      const newGoal = {
        id: newId,
        userId: 1,
        title: data.title,
        description: data.description || '',
        targetAmount: parseFloat(data.targetAmount).toString(),
        currentAmount: parseFloat(data.currentAmount || '0').toString(),
        targetDate: data.targetDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Adding savings goal to local store:', newGoal);
      addSavingsGoal(newGoal);
      
      // Return local savings goal immediately - focus on local storage
      return newGoal;
    },
    onSuccess: (data) => {
      console.log('Savings goal saved successfully:', data);
      setSavingsGoalModalOpen(false);
      form.reset();
      toast({
        title: "Savings goal created",
        description: "Your savings goal has been saved to local storage.",
      });
    },
    onError: (error) => {
      console.error('Savings goal save error:', error);
      toast({
        title: "Error",
        description: "Failed to save savings goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SavingsGoalFormData) => {
    console.log('Savings goal form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    createSavingsGoal.mutate(data);
  };

  return (
    <Dialog open={savingsGoalModalOpen} onOpenChange={setSavingsGoalModalOpen}>
      <DialogContent className="max-w-md mx-3 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Emergency Fund" />
                  </FormControl>
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
                    <Textarea {...field} placeholder="Optional description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
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
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount</FormLabel>
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
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSavingsGoalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSavingsGoal.isPending}>
                {createSavingsGoal.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}