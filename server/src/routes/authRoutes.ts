import { Router } from 'express';
import { authenticate, requireRole, requireAdmin, requireSelfOrAdmin, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Authentication endpoints (public)
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, academyCode, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: 'First name is required'
      });
    }

    // Step 1: Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName || ''
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Step 2: Generate username from email
    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7);

    // Step 3: Insert user profile into users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName || '',
        role: role?.toLowerCase() || 'student',
        current_level: 'A1',
        is_active: true,
        preferences: {
          phone: phone || '',
          academy_code: academyCode || 'DEFAULT'
        }
      })
      .select()
      .single();

    if (dbError) {
      // Rollback: Delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      return res.status(500).json({
        success: false,
        message: 'Failed to create user profile: ' + dbError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        role: userData.role.toUpperCase(),
        level: userData.current_level,
        createdAt: userData.created_at
      },
      needsConfirmation: !authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: authError.message
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }

    // Step 2: Fetch user profile from users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (dbError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Step 3: Update last active timestamp
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userData.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
          role: userData.role.toUpperCase(),
          level: userData.current_level,
          academy: userData.preferences?.academy_code || 'DEFAULT',
          createdAt: userData.created_at,
          lastLogin: userData.last_active
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
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
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Fetch user profile from users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', req.user.id)
      .single();

    if (dbError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
        role: userData.role.toUpperCase(),
        level: userData.current_level,
        academy: userData.preferences?.academy_code || 'DEFAULT',
        createdAt: userData.created_at,
        lastLogin: userData.last_active
      }
    });
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
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