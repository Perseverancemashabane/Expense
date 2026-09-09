import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/db';
import budgetRoutes from './routes/budgetRoutes';
import expenseRoutes from './routes/expenseRoutes';
import categoryRoutes from './routes/categoryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { db } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Reset demo data endpoint
app.post('/api/reset', async (req: Request, res: Response) => {
  try {
    await db.expenses.resetToDefault();
    return res.json({ success: true, message: 'Database reset to default student sample data' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Root endpoint info
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Student Budget and Expense Tracker API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/health',
      '/api/budget/current',
      '/api/expenses',
      '/api/categories',
      '/api/analytics/summary',
    ],
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Server Initialization
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Student Budget Tracker Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);

  const dbStatus = await testConnection();
  console.log(`💾 Database Status: ${dbStatus.message}`);
});

export default app;

