import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getStatus,
  getAllExpenses,
  insertExpense,
  deleteExpenseById,
  resetExpenses,
  findUserByEmail,
  registerNewUser,
  verifyUserCredentials,
} from './src/server/db.js';
import { validateExpenseInput } from './src/utils/expenseCalculations.js';
import { Expense } from './src/types/expense.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize MongoDB connection on server start
  await initDatabase();

  // Authentication API Routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await verifyUserCredentials(String(email), String(password));
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: `session-${user.id}-${Date.now()}`,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Login failed due to server error' });
    }
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const user = await registerNewUser({ name, email, password });
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: `session-${user.id}-${Date.now()}`,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Registration failed due to server error' });
    }
  });

  app.get('/api/auth/demo-user', async (_req: Request, res: Response) => {
    const demo = await findUserByEmail('alex@example.com');
    if (demo) {
      return res.json({
        user: { id: demo.id, name: demo.name, email: demo.email },
        token: `demo-token-${Date.now()}`,
      });
    }
    res.json({
      user: { id: 'user-demo-1', name: 'Alex Sharma', email: 'alex@example.com' },
      token: `demo-token-${Date.now()}`,
    });
  });

  // Database status
  app.get('/api/db-status', async (_req: Request, res: Response) => {
    try {
      const status = await getStatus();
      res.json(status);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to retrieve database status' });
    }
  });

  app.get('/api/expenses', async (_req: Request, res: Response) => {
    try {
      const expenses = await getAllExpenses();
      res.json(expenses);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to fetch expenses from database' });
    }
  });

  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const { description, amount, category, date, note } = req.body;
      const validation = validateExpenseInput({
        description: description || '',
        amount: String(amount ?? ''),
        category,
        date: date || '',
        note,
      });

      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }

      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: description.trim(),
        amount: validation.parsedAmount,
        category,
        date,
        note: note ? String(note).trim() : undefined,
      };

      const saved = await insertExpense(newExpense);
      res.status(201).json(saved);
    } catch (err: unknown) {
      console.error('Error creating expense:', err);
      res.status(500).json({ error: 'Failed to save expense' });
    }
  });

  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteExpenseById(id);
      if (!success) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ success: true, deletedId: id });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  app.post('/api/expenses/reset', async (_req: Request, res: Response) => {
    try {
      const resetList = await resetExpenses();
      res.json(resetList);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to reset demo expenses' });
    }
  });

  // Vite integration: Dev middleware or Production static files
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Ledgerline server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error during startup:', err);
  process.exit(1);
});
