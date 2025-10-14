import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import jwt from 'jsonwebtoken';

type UserRole = 'student' | 'teacher' | 'admin' | 'super_master';

interface User {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No authentication token provided'
      });
    }

    // Verify Supabase JWT token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    }

    // For now, create user object from auth data
    // Later we can query a users table if needed
    const userData: User = {
      id: authUser.id,
      auth_id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      role: (authUser.user_metadata?.role as UserRole) || 'student',
      is_active: true,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || authUser.created_at
    };

    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${allowedRoles.join(' or ')} role`,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin roles that can access most resources
const ADMIN_ROLES: UserRole[] = ['admin', 'super_master'];
const TEACHER_ROLES: UserRole[] = ['teacher', 'admin', 'super_master'];

export const requireAdmin = () => requireRole(ADMIN_ROLES);
export const requireTeacher = () => requireRole([...TEACHER_ROLES]);

// Check if user can access their own or other user's data
export const requireSelfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  const targetUserId = req.params.userId || req.params.id || req.body.userId;

  // Allow access to own data
  if (req.user.id === targetUserId) {
    return next();
  }

  // Allow admin access to any user data
  if (ADMIN_ROLES.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied',
    message: 'You can only access your own data'
  });
};

// Middleware to ensure course/lesson access
export const requireCourseAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access courses'
    });
  }

  // All authenticated users can access courses for now
  // Later we can add enrollment checks
  next();
};

// Middleware for content creation
export const requireContentCreator = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('Content creator access check:', {
      user: req.user ? { id: req.user.id, role: req.user.role, email: req.user.email } : 'No user',
      path: req.path,
      method: req.method
    });

    if (!req.user) {
      console.log('Content creator check failed: No user authenticated');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    const allowedRoles = ['teacher', 'admin', 'super_master'];

    if (!allowedRoles.includes(req.user.role)) {
      console.log('Content creator check failed: Insufficient role', { userRole: req.user.role, requiredRoles: allowedRoles });
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${allowedRoles.join(' or ')} role`,
        userRole: req.user.role
      });
    }

    console.log('Content creator check passed');
    next();
  };
};

// Optional user middleware (doesn't fail if no user)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    // Verify Supabase JWT token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return next();
    }

    // Create user object from auth data
    const userData: User = {
      id: authUser.id,
      auth_id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      role: (authUser.user_metadata?.role as UserRole) || 'student',
      is_active: true,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || authUser.created_at
    };

    req.user = userData;
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};