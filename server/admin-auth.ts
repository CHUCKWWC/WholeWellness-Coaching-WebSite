// Admin Authentication Service
// Handles role-based permissions and secure admin dashboard access

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './supabase-client-storage.js';
import { verifyPassword } from './auth.js';
import type { 
  User, 
  AdminSession, 
  InsertAdminSession, 
  InsertAdminActivityLog,
  AdminLoginData 
} from '@shared/schema';

// Permission constants
export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  EXPORT_USERS: 'export_users',
  
  // Donation management
  VIEW_DONATIONS: 'view_donations',
  PROCESS_DONATIONS: 'process_donations',
  REFUND_DONATIONS: 'refund_donations',
  
  // Coaching management
  VIEW_COACHES: 'view_coaches',
  MANAGE_COACHES: 'manage_coaches',
  VIEW_BOOKINGS: 'view_bookings',
  ASSIGN_COACHES: 'assign_coaches',
  
  // Content management
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  PUBLISH_CONTENT: 'publish_content',
  
  // System administration
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_SETTINGS: 'system_settings',
  BULK_OPERATIONS: 'bulk_operations',
  VIEW_LOGS: 'view_logs',
  
  // Super admin
  MANAGE_ADMINS: 'manage_admins',
  FULL_ACCESS: 'full_access'
} as const;

// Role definitions with permissions
export const ROLE_PERMISSIONS = {
  user: [],
  moderator: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.VIEW_COACHES,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.VIEW_CONTENT
  ],
  coach: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT
  ],
  admin: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.EXPORT_USERS,
    PERMISSIONS.VIEW_DONATIONS,
    PERMISSIONS.PROCESS_DONATIONS,
    PERMISSIONS.VIEW_COACHES,
    PERMISSIONS.MANAGE_COACHES,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.ASSIGN_COACHES,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.BULK_OPERATIONS,
    PERMISSIONS.VIEW_LOGS
  ],
  super_admin: [
    ...Object.values(PERMISSIONS)
  ]
} as const;

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: User;
  adminSession?: AdminSession;
}

export class AdminAuthService {
  // Generate secure session token
  private static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Get client IP address
  private static getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           'unknown';
  }

  // Admin login
  static async login(loginData: AdminLoginData, req: Request): Promise<{
    success: boolean;
    sessionToken?: string;
    user?: User;
    error?: string;
  }> {
    try {
      const { email, password, rememberMe } = loginData;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user has admin role
      if (!user.role || !['admin', 'super_admin', 'moderator', 'coach'].includes(user.role)) {
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: 'Account is deactivated. Contact administrator.' };
      }

      // Create admin session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      
      // Set expiration: 24 hours for remember me, 8 hours for regular
      expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 24 : 8));

      const sessionData: InsertAdminSession = {
        userId: user.id,
        sessionToken,
        expiresAt,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        isActive: true
      };

      await storage.createAdminSession(sessionData);

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Log admin login
      await this.logActivity(user.id, 'ADMIN_LOGIN', 'admin_session', null, {
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent
      }, req);

      return {
        success: true,
        sessionToken,
        user: { ...user, passwordHash: undefined } as any
      };

    } catch (error) {
      console.error('Admin login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Admin logout
  static async logout(sessionToken: string, req: Request): Promise<boolean> {
    try {
      const session = await storage.getAdminSessionByToken(sessionToken);
      if (!session) return false;

      // Deactivate session
      await storage.updateAdminSession(session.id, { isActive: false });

      // Log admin logout
      await this.logActivity(session.userId, 'ADMIN_LOGOUT', 'admin_session', session.id.toString(), {
        ipAddress: this.getClientIP(req)
      }, req);

      return true;
    } catch (error) {
      console.error('Admin logout failed:', error);
      return false;
    }
  }

  // Validate admin session
  static async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    user?: User;
    session?: AdminSession;
  }> {
    try {
      if (!sessionToken) {
        return { valid: false };
      }

      const session = await storage.getAdminSessionByToken(sessionToken);
      if (!session || !session.isActive) {
        return { valid: false };
      }

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await storage.updateAdminSession(session.id, { isActive: false });
        return { valid: false };
      }

      // Get user data
      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return { valid: false };
      }

      return { valid: true, user, session };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { valid: false };
    }
  }

  // Check if user has specific permission
  static hasPermission(user: User, permission: string): boolean {
    if (!user.role) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    if (!rolePermissions) return false;

    // Check role-based permissions
    if (rolePermissions.includes(permission as any)) return true;

    // Check custom permissions
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    return false;
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  // Log admin activity
  static async logActivity(
    userId: string,
    action: string,
    resource: string,
    resourceId: string | null,
    details: any,
    req: Request
  ): Promise<void> {
    try {
      const logData: InsertAdminActivityLog = {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || 'unknown'
      };

      await storage.createAdminActivityLog(logData);
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  }

  // Get user permissions list
  static getUserPermissions(user: User): string[] {
    if (!user.role) return [];
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    const customPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    
    return [...rolePermissions, ...customPermissions];
  }
}

// Middleware to require admin authentication
export const requireAdminAuth = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7)
      : req.cookies?.adminSession;

    if (!sessionToken) {
      res.status(401).json({ 
        message: 'Admin authentication required',
        code: 'NO_TOKEN'
      });
      return;
    }

    const { valid, user, session } = await AdminAuthService.validateSession(sessionToken);
    
    if (!valid || !user || !session) {
      res.status(401).json({ 
        message: 'Invalid or expired admin session',
        code: 'INVALID_SESSION'
      });
      return;
    }

    req.adminUser = user;
    req.adminSession = session;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to require specific permission
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({ message: 'Admin authentication required' });
      return;
    }

    if (!AdminAuthService.hasPermission(req.adminUser, permission)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// Middleware to require any of the specified permissions
export const requireAnyPermission = (permissions: string[]) => {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({ message: 'Admin authentication required' });
      return;
    }

    if (!AdminAuthService.hasAnyPermission(req.adminUser, permissions)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissions,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// Middleware to require admin role (admin or super_admin)
export const requireAdminRole = (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
  if (!req.adminUser) {
    res.status(401).json({ message: 'Admin authentication required' });
    return;
  }

  if (!['admin', 'super_admin'].includes(req.adminUser.role || '')) {
    res.status(403).json({ 
      message: 'Admin role required',
      code: 'ADMIN_ROLE_REQUIRED'
    });
    return;
  }

  next();
};

// Middleware to require super admin role
export const requireSuperAdmin = (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
  if (!req.adminUser) {
    res.status(401).json({ message: 'Admin authentication required' });
    return;
  }

  if (req.adminUser.role !== 'super_admin') {
    res.status(403).json({ 
      message: 'Super admin access required',
      code: 'SUPER_ADMIN_REQUIRED'
    });
    return;
  }

  next();
};