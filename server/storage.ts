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
      { id: this.currentCategoryId++, name: "Investment", type: "income", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Groceries", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Transportation", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Entertainment", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Shopping", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Bills", type: "expense", userId: defaultUser.id },
      { id: this.currentCategoryId++, name: "Healthcare", type: "expense", userId: defaultUser.id },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Create sample transactions for demo user
    const sampleTransactions = [
      {
        id: this.currentTransactionId++,
        userId: defaultUser.id,
        type: "income",
        amount: "5200.00",
        description: "Monthly Salary",
        categoryId: defaultCategories[0].id,
        date: "2025-01-01",
        recurring: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTransactionId++,
        userId: defaultUser.id,
        type: "expense",
        amount: "350.00",
        description: "Weekly Groceries",
        categoryId: defaultCategories[3].id,
        date: "2025-01-05",
        recurring: false,
        createdAt: new Date(),
      },
      {
        id: this.currentTransactionId++,
        userId: defaultUser.id,
        type: "expense",
        amount: "120.00",
        description: "Gas and Transportation",
        categoryId: defaultCategories[4].id,
        date: "2025-01-03",
        recurring: false,
        createdAt: new Date(),
      },
      {
        id: this.currentTransactionId++,
        userId: defaultUser.id,
        type: "income",
        amount: "800.00",
        description: "Freelance Project",
        categoryId: defaultCategories[1].id,
        date: "2025-01-02",
        recurring: false,
        createdAt: new Date(),
      },
      {
        id: this.currentTransactionId++,
        userId: defaultUser.id,
        type: "expense",
        amount: "85.00",
        description: "Movie and Dinner",
        categoryId: defaultCategories[5].id,
        date: "2025-01-04",
        recurring: false,
        createdAt: new Date(),
      },
    ];

    sampleTransactions.forEach(transaction => {
      this.transactions.set(transaction.id, transaction);
    });

    // Create sample budgets
    const sampleBudgets = [
      {
        id: this.currentBudgetId++,
        userId: defaultUser.id,
        categoryId: defaultCategories[3].id, // Groceries
        amount: "400.00",
        period: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        createdAt: new Date(),
      },
      {
        id: this.currentBudgetId++,
        userId: defaultUser.id,
        categoryId: defaultCategories[4].id, // Transportation
        amount: "200.00",
        period: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        createdAt: new Date(),
      },
      {
        id: this.currentBudgetId++,
        userId: defaultUser.id,
        categoryId: defaultCategories[5].id, // Entertainment
        amount: "150.00",
        period: "monthly",
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        createdAt: new Date(),
      },
    ];

    sampleBudgets.forEach(budget => {
      this.budgets.set(budget.id, budget);
    });

    // Create sample savings goals
    const sampleGoals = [
      {
        id: this.currentSavingsGoalId++,
        userId: defaultUser.id,
        title: "Emergency Fund",
        targetAmount: "10000.00",
        currentAmount: "6800.00",
        targetDate: "2025-12-31",
        createdAt: new Date(),
      },
      {
        id: this.currentSavingsGoalId++,
        userId: defaultUser.id,
        title: "Vacation Trip",
        targetAmount: "3000.00",
        currentAmount: "1200.00",
        targetDate: "2025-08-15",
        createdAt: new Date(),
      },
      {
        id: this.currentSavingsGoalId++,
        userId: defaultUser.id,
        title: "New Laptop",
        targetAmount: "1500.00",
        currentAmount: "500.00",
        targetDate: "2025-06-01",
        createdAt: new Date(),
      },
    ];

    sampleGoals.forEach(goal => {
      this.savingsGoals.set(goal.id, goal);
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
    
    // Create default categories for new user
    const defaultCategories = [
      { name: "Salary", type: "income", userId: id },
      { name: "Freelance", type: "income", userId: id },
      { name: "Investment", type: "income", userId: id },
      { name: "Groceries", type: "expense", userId: id },
      { name: "Transportation", type: "expense", userId: id },
      { name: "Entertainment", type: "expense", userId: id },
      { name: "Shopping", type: "expense", userId: id },
      { name: "Bills", type: "expense", userId: id },
      { name: "Healthcare", type: "expense", userId: id },
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
    
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
