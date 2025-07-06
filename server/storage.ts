import { 
  users, categories, transactions, budgets, savingsGoals,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Transaction, type InsertTransaction,
  type Budget, type InsertBudget,
  type SavingsGoal, type InsertSavingsGoal
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Budgets
  getBudgets(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Savings Goals
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<SavingsGoal>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentTransactionId: number;
  private currentBudgetId: number;
  private currentSavingsGoalId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentTransactionId = 1;
    this.currentBudgetId = 1;
    this.currentSavingsGoalId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "demo",
      email: "demo@financetracker.com",
      password: "password",
      firstName: "Demo",
      lastName: "User",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create default categories
    const defaultCategories: Category[] = [
      { id: this.currentCategoryId++, name: "Salary", type: "income", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Freelance", type: "income", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Groceries", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Transportation", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Entertainment", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Shopping", type: "expense", userId: defaultUser.id },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
    };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(category => category.userId === userId);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      userId: insertCategory.userId || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
  }

  // Transactions
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.userId === userId);
  }

  async getTransactionsByDateRange(userId: number, startDate: string, endDate: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => 
      transaction.userId === userId && 
      transaction.date >= startDate && 
      transaction.date <= endDate
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date(),
      categoryId: insertTransaction.categoryId || null,
      recurring: insertTransaction.recurring || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
    const existing = this.transactions.get(id);
    if (!existing) {
      throw new Error("Transaction not found");
    }
    const updated = { ...existing, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    this.transactions.delete(id);
  }

  // Budgets
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(budget => budget.userId === userId);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const budget: Budget = { 
      ...insertBudget, 
      id,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    const existing = this.budgets.get(id);
    if (!existing) {
      throw new Error("Budget not found");
    }
    const updated = { ...existing, ...updates };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: number): Promise<void> {
    this.budgets.delete(id);
  }

  // Savings Goals
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(goal => goal.userId === userId);
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentSavingsGoalId++;
    const goal: SavingsGoal = { 
      ...insertGoal, 
      id,
      createdAt: new Date(),
      currentAmount: insertGoal.currentAmount || null,
    };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async updateSavingsGoal(id: number, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const existing = this.savingsGoals.get(id);
    if (!existing) {
      throw new Error("Savings goal not found");
    }
    const updated = { ...existing, ...updates };
    this.savingsGoals.set(id, updated);
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<void> {
    this.savingsGoals.delete(id);
  }
}

export const storage = new MemStorage();
