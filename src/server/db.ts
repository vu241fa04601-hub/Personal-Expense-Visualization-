import { MongoClient, Db, Collection } from 'mongodb';
import { Expense } from '../types/expense.js';
import { INITIAL_DEMO_EXPENSES } from '../utils/expenseCalculations.js';

export interface DatabaseStatus {
  connected: boolean;
  isMongo: boolean;
  databaseName: string;
  uriConfigured: boolean;
  error?: string;
  count: number;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

let client: MongoClient | null = null;
let db: Db | null = null;
let expensesCollection: Collection<Expense> | null = null;
let usersCollection: Collection<StoredUser> | null = null;
let isMongoConnected = false;
let connectionError: string | undefined;

const DEFAULT_DEMO_USER: StoredUser = {
  id: 'user-demo-1',
  name: 'Alex Sharma',
  email: 'alex@example.com',
  password: 'password123',
  createdAt: '2026-11-01T00:00:00.000Z',
};

// In-memory fallback if MONGODB_URI is not yet provided or unreachable
let memoryExpenses: Expense[] = [...INITIAL_DEMO_EXPENSES];
let memoryUsers: StoredUser[] = [DEFAULT_DEMO_USER];


export async function initDatabase(): Promise<DatabaseStatus> {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || 'expense_board';

  if (!uri) {
    isMongoConnected = false;
    connectionError = 'MONGODB_URI environment variable not configured';
    return getStatus();
  }

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(dbName);
    expensesCollection = db.collection<Expense>('expenses');
    usersCollection = db.collection<StoredUser>('users');

    // Create indexes for faster queries
    await expensesCollection.createIndex({ id: 1 }, { unique: true });
    await expensesCollection.createIndex({ date: -1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Seed initial demo expenses if collection is empty
    const count = await expensesCollection.countDocuments();
    if (count === 0) {
      await expensesCollection.insertMany(INITIAL_DEMO_EXPENSES);
    }

    // Seed demo user if empty
    const userCount = await usersCollection.countDocuments();
    if (userCount === 0) {
      await usersCollection.insertOne(DEFAULT_DEMO_USER);
    }

    isMongoConnected = true;
    connectionError = undefined;
    console.log(`[MongoDB] Connected successfully to database "${dbName}"`);
  } catch (err: unknown) {
    isMongoConnected = false;
    connectionError = err instanceof Error ? err.message : String(err);
    console.warn(`[MongoDB] Connection failed: ${connectionError}. Operating in in-memory fallback mode.`);
  }

  return getStatus();
}

export async function getStatus(): Promise<DatabaseStatus> {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || 'expense_board';

  let count = memoryExpenses.length;
  if (isMongoConnected && expensesCollection) {
    try {
      count = await expensesCollection.countDocuments();
    } catch {
      // ignore
    }
  }

  return {
    connected: isMongoConnected,
    isMongo: isMongoConnected,
    databaseName: dbName,
    uriConfigured: Boolean(uri),
    error: connectionError,
    count,
  };
}

export async function getAllExpenses(): Promise<Expense[]> {
  if (isMongoConnected && expensesCollection) {
    try {
      const docs = await expensesCollection
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray();
      return docs as Expense[];
    } catch (err) {
      console.error('[MongoDB] Error finding expenses:', err);
    }
  }
  return [...memoryExpenses].sort((a, b) => b.date.localeCompare(a.date));
}

export async function insertExpense(expense: Expense): Promise<Expense> {
  if (isMongoConnected && expensesCollection) {
    try {
      await expensesCollection.insertOne({ ...expense });
      return expense;
    } catch (err) {
      console.error('[MongoDB] Error inserting expense:', err);
    }
  }
  memoryExpenses = [expense, ...memoryExpenses];
  return expense;
}

export async function deleteExpenseById(id: string): Promise<boolean> {
  if (isMongoConnected && expensesCollection) {
    try {
      const res = await expensesCollection.deleteOne({ id });
      return res.deletedCount > 0;
    } catch (err) {
      console.error('[MongoDB] Error deleting expense:', err);
    }
  }
  const prevLen = memoryExpenses.length;
  memoryExpenses = memoryExpenses.filter((e) => e.id !== id);
  return memoryExpenses.length < prevLen;
}

export async function resetExpenses(): Promise<Expense[]> {
  if (isMongoConnected && expensesCollection) {
    try {
      await expensesCollection.deleteMany({});
      await expensesCollection.insertMany(INITIAL_DEMO_EXPENSES);
      const docs = await expensesCollection
        .find({}, { projection: { _id: 0 } })
        .sort({ date: -1 })
        .toArray();
      return docs as Expense[];
    } catch (err) {
      console.error('[MongoDB] Error resetting expenses in MongoDB:', err);
    }
  }
  memoryExpenses = [...INITIAL_DEMO_EXPENSES];
  return [...memoryExpenses];
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  if (isMongoConnected && usersCollection) {
    try {
      const user = await usersCollection.findOne({ email: normalized });
      return user;
    } catch (err) {
      console.error('[MongoDB] Error finding user by email:', err);
    }
  }
  return memoryUsers.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function registerNewUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<StoredUser> {
  const newUser: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    createdAt: new Date().toISOString(),
  };

  if (isMongoConnected && usersCollection) {
    try {
      await usersCollection.insertOne({ ...newUser });
      return newUser;
    } catch (err) {
      console.error('[MongoDB] Error saving new user:', err);
    }
  }

  memoryUsers.push(newUser);
  return newUser;
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.password === password) {
    return user;
  }
  return null;
}

