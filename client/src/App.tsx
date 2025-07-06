import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useFinanceStore";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Income from "@/pages/Income";
import Expenses from "@/pages/Expenses";
import Budget from "@/pages/Budget";
import Savings from "@/pages/Savings";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Configure query client with auth headers
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    queryFn: async ({ queryKey }) => {
      const token = useAuthStore.getState().token;
      const response = await fetch(queryKey[0] as string, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/" /> : <RegisterPage />}
      </Route>
      
      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/income">
        <ProtectedRoute>
          <Income />
        </ProtectedRoute>
      </Route>
      <Route path="/expenses">
        <ProtectedRoute>
          <Expenses />
        </ProtectedRoute>
      </Route>
      <Route path="/budget">
        <ProtectedRoute>
          <Budget />
        </ProtectedRoute>
      </Route>
      <Route path="/savings">
        <ProtectedRoute>
          <Savings />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set up API request interceptor for auth
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = useAuthStore.getState().token;
      
      if (typeof input === 'string' && input.startsWith('/api')) {
        init = init || {};
        init.headers = {
          'Content-Type': 'application/json',
          ...init.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      }
      
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
