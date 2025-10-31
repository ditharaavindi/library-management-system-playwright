import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import reservationsRoutes from './routes/reservations';

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL encoded bodies

// Routes
app.use('/api', authRoutes);
app.use('/api', booksRoutes);
app.use('/api/reservations', reservationsRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Library Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Library Management System API',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check',
      'POST /api/login - User authentication',
      'GET /api/books - Get all books',
      'POST /api/books - Add a new book',
      'GET /api/books/:id - Get book by ID',
      'POST /api/books/:id/reserve - Create book reservation',
      'GET /api/reservations - Get all reservations',
      'PUT /api/reservations/:id/approve - Approve reservation',
      'PUT /api/reservations/:id/reject - Reject reservation',
      'PUT /api/reservations/:id/complete - Mark reservation as completed'
    ]
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Library Management System API running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;