import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/schema';

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
