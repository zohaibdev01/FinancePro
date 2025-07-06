import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema,
  insertTransactionSchema,
  insertBudgetSchema,
  insertSavingsGoalSchema,
  insertCategorySchema,
  type User 
} from "@shared/schema";

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Simple session store
const sessions = new Map<string, number>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: Function) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const userId = sessions.get(sessionId);
  storage.getUser(userId!).then(user => {
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, user.id);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token: sessionId 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { confirmPassword, ...userData } = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const sessionId = generateSessionId();
      sessions.set(sessionId, user.id);
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token: sessionId 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  // Categories routes
  app.get("/api/categories", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const categories = await storage.getCategories(req.user!.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = insertCategorySchema.parse({ ...req.body, userId: req.user!.id });
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const transactions = await storage.getTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = insertTransactionSchema.parse({ ...req.body, userId: req.user!.id });
      const transaction = await storage.createTransaction(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const transaction = await storage.updateTransaction(id, updates);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.json({ message: "Transaction deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete transaction" });
    }
  });

  // Budgets routes
  app.get("/api/budgets", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const budgets = await storage.getBudgets(req.user!.id);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = insertBudgetSchema.parse({ ...req.body, userId: req.user!.id });
      const budget = await storage.createBudget(data);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.put("/api/budgets/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const budget = await storage.updateBudget(id, updates);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudget(id);
      res.json({ message: "Budget deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete budget" });
    }
  });

  // Savings Goals routes
  app.get("/api/savings-goals", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const goals = await storage.getSavingsGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = insertSavingsGoalSchema.parse({ ...req.body, userId: req.user!.id });
      const goal = await storage.createSavingsGoal(data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid savings goal data" });
    }
  });

  app.put("/api/savings-goals/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateSavingsGoal(id, updates);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update savings goal" });
    }
  });

  app.delete("/api/savings-goals/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavingsGoal(id);
      res.json({ message: "Savings goal deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete savings goal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
