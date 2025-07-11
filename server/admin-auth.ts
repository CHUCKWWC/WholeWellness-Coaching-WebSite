import { Request, Response, NextFunction } from "express";
import { storage } from "./supabase-client-storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";

// Admin permissions enum
export const PERMISSIONS = {
  // Dashboard and Analytics
  VIEW_DASHBOARD: 'view_dashboard',
  
  // User Management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Coach Management
  VIEW_COACHES: 'view_coaches',
  EDIT_COACHES: 'edit_coaches',
  DELETE_COACHES: 'delete_coaches',
  
  // Donation Management
  VIEW_DONATIONS: 'view_donations',
  EDIT_DONATIONS: 'edit_donations',
  PROCESS_REFUNDS: 'process_refunds',
  
  // Booking Management
  VIEW_BOOKINGS: 'view_bookings',
  EDIT_BOOKINGS: 'edit_bookings',
  CANCEL_BOOKINGS: 'cancel_bookings',
  
  // Content Management
  CONTENT_MANAGEMENT: 'content_management',
  PUBLISH_CONTENT: 'publish_content',
  
  // System Administration
  SYSTEM_ADMIN: 'system_admin',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  VIEW_LOGS: 'view_logs',
  
  // Marketing
  MARKETING: 'marketing',
  SEND_NOTIFICATIONS: 'send_notifications',
  
  // Reports and Analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  DATA_EXPORT: 'data_export',
  
  // Reward System
  REWARD_MANAGEMENT: 'reward_management',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Admin user interface
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: Permission[];
  lastLogin?: Date;
  isActive: boolean;
  isSuperAdmin: boolean;
}

// Authenticated admin request interface
export interface AuthenticatedAdminRequest extends Request {
  adminUser?: AdminUser;
}

// Admin login schema
const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export class AdminAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';

  // Generate JWT token for admin
  static generateToken(adminUser: AdminUser): string {
    return jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        permissions: adminUser.permissions,
        isSuperAdmin: adminUser.isSuperAdmin
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Authenticate admin user
  static async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || !admin.isActive) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      // Get admin permissions
      const permissions = await storage.getAdminPermissions(admin.id);

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions,
        lastLogin: new Date(),
        isActive: admin.isActive,
        isSuperAdmin: admin.role === 'super_admin'
      };
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }

  // Create admin session
  static async createAdminSession(adminId: string, req: Request): Promise<string> {
    const sessionToken = jwt.sign(
      { adminId, type: 'admin_session' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    await storage.createAdminSession({
      id: sessionToken,
      adminId,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActive: true
    });

    return sessionToken;
  }

  // Validate admin session
  static async validateAdminSession(sessionToken: string): Promise<AdminUser | null> {
    try {
      const decoded = this.verifyToken(sessionToken);
      
      if (decoded.type !== 'admin_session') {
        return null;
      }

      const session = await storage.getAdminSession(sessionToken);
      
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      const admin = await storage.getAdminById(session.adminId);
      
      if (!admin || !admin.isActive) {
        return null;
      }

      const permissions = await storage.getAdminPermissions(admin.id);

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions,
        isActive: admin.isActive,
        isSuperAdmin: admin.role === 'super_admin'
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Log admin activity
  static async logActivity(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any,
    req: Request
  ): Promise<void> {
    try {
      await storage.createAdminActivityLog({
        adminId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  // Check if admin has permission
  static hasPermission(adminUser: AdminUser, permission: Permission): boolean {
    // Super admins have all permissions
    if (adminUser.isSuperAdmin) {
      return true;
    }

    return adminUser.permissions.includes(permission);
  }

  // Check if admin has any of the specified permissions
  static hasAnyPermission(adminUser: AdminUser, permissions: Permission[]): boolean {
    // Super admins have all permissions
    if (adminUser.isSuperAdmin) {
      return true;
    }

    return permissions.some(permission => adminUser.permissions.includes(permission));
  }
}

// Middleware to require admin authentication
export const requireAdminAuth = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const token = authHeader.substring(7);
    const adminUser = await AdminAuthService.validateAdminSession(token);

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid or expired admin session' });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ error: 'Admin authentication failed' });
  }
};

// Middleware to require specific permission
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!AdminAuthService.hasPermission(req.adminUser, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to require any of the specified permissions
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    if (!AdminAuthService.hasAnyPermission(req.adminUser, permissions)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to require super admin
export const requireSuperAdmin = (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  if (!req.adminUser) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (!req.adminUser.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }

  next();
};

// Admin login route handler
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = adminLoginSchema.parse(req.body);

    const adminUser = await AdminAuthService.authenticateAdmin(username, password);

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionToken = await AdminAuthService.createAdminSession(adminUser.id, req);

    // Log successful login
    await AdminAuthService.logActivity(
      adminUser.id,
      'LOGIN',
      'admin_session',
      sessionToken,
      { success: true },
      req
    );

    res.json({
      success: true,
      token: sessionToken,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions,
        isSuperAdmin: adminUser.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid login data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Login failed' });
  }
};

// Admin logout route handler
export const adminLogout = async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Deactivate the session
      await storage.deactivateAdminSession(token);
      
      // Log logout activity
      if (req.adminUser) {
        await AdminAuthService.logActivity(
          req.adminUser.id,
          'LOGOUT',
          'admin_session',
          token,
          { success: true },
          req
        );
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};