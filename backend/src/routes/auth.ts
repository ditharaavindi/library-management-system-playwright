import express, { Request, Response } from 'express';
import { LoginRequest, LoginResponse, User } from '../types';

const router = express.Router();

// Static user data for demo purposes
const DEMO_USERS: User[] = [
  {
    email: 'admin@library.com',
    password: 'admin123',
    name: 'Library Admin',
    role: 'admin'
  },
  {
    email: 'librarian@library.com',
    password: 'librarian123',
    name: 'Head Librarian',
    role: 'librarian'
  },
  {
    email: 'user@library.com',
    password: 'user123',
    name: 'Library User',
    role: 'user'
  }
];

// POST /api/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      } as LoginResponse);
    }

    // Find user
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as LoginResponse);
    }

    // Success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    } as LoginResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as LoginResponse);
  }
});

export default router;