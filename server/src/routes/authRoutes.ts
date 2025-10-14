import { Router } from 'express';
import { authenticate, requireRole, requireAdmin, requireSelfOrAdmin, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Authentication endpoints (public)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data.user,
      needsConfirmation: !data.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const { error } = await supabase.auth.admin.signOut(token);
      if (error) {
        console.error('Logout error:', error);
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Protected endpoints
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    res.json({
      user: req.user,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { name }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Profile updated successfully',
      user: data.user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin endpoints
router.get('/users', authenticate, requireAdmin(), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error } = await supabase.auth.admin.listUsers({
      page: Number(page),
      perPage: Number(limit)
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      users: data.users,
      total: data.total,
      page: Number(page),
      totalPages: Math.ceil(data.total / Number(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

router.get('/users/:id', authenticate, requireSelfOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: data.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;