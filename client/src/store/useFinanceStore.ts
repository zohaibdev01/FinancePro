import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Transaction, Category, Budget, SavingsGoal } from '@shared/schema';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  transactionModalOpen: boolean;
  budgetModalOpen: boolean;
  savingsGoalModalOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setTransactionModalOpen: (open: boolean) => void;
  setBudgetModalOpen: (open: boolean) => void;
  setSavingsGoalModalOpen: (open: boolean) => void;
}

interface DataState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  setTransactions: (transactions: Transaction[]) => void;
  setCategories: (categories: Category[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setSavingsGoals: (savingsGoals: SavingsGoal[]) => void;
  addTransaction: (transaction: Transaction) => void;
  addCategory: (category: Category) => void;
  addBudget: (budget: Budget) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => void;
  updateBudget: (id: number, budget: Partial<Budget>) => void;
  updateSavingsGoal: (id: number, goal: Partial<SavingsGoal>) => void;
  deleteTransaction: (id: number) => void;
  deleteBudget: (id: number) => void;
  deleteSavingsGoal: (id: number) => void;
  clearData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  transactionModalOpen: false,
  budgetModalOpen: false,
  savingsGoalModalOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTransactionModalOpen: (open) => set({ transactionModalOpen: open }),
  setBudgetModalOpen: (open) => set({ budgetModalOpen: open }),
  setSavingsGoalModalOpen: (open) => set({ savingsGoalModalOpen: open }),
}));

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [
        { id: 1, userId: 1, name: 'Salary', type: 'income', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, userId: 1, name: 'Freelance', type: 'income', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, userId: 1, name: 'Food', type: 'expense', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 4, userId: 1, name: 'Transportation', type: 'expense', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 5, userId: 1, name: 'Entertainment', type: 'expense', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      budgets: [],
      savingsGoals: [],
      setTransactions: (transactions) => set({ transactions }),
      setCategories: (categories) => set({ categories }),
      setBudgets: (budgets) => set({ budgets }),
      setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [...state.transactions, transaction] 
      })),
      addCategory: (category) => set((state) => ({ 
        categories: [...state.categories, category] 
      })),
      addBudget: (budget) => set((state) => ({ 
        budgets: [...state.budgets, budget] 
      })),
      addSavingsGoal: (goal) => set((state) => ({ 
        savingsGoals: [...state.savingsGoals, goal] 
      })),
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map(b => 
          b.id === id ? { ...b, ...updates } : b
        )
      })),
      updateSavingsGoal: (id, updates) => set((state) => ({
        savingsGoals: state.savingsGoals.map(g => 
          g.id === id ? { ...g, ...updates } : g
        )
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id)
      })),
      deleteSavingsGoal: (id) => set((state) => ({
        savingsGoals: state.savingsGoals.filter(g => g.id !== id)
      })),
      clearData: () => set({
        transactions: [],
        categories: [],
        budgets: [],
        savingsGoals: [],
      }),
    }),
    {
      name: 'finance-data',
    }
  )
);
