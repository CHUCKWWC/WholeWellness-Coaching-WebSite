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
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Authenticated admin request interface
export interface AuthenticatedAdminRequest extends Request {
  adminUser?: AdminUser;
}

// Admin OAuth schema - Google OAuth only
export const adminOAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  googleId: z.string().min(1, "Google ID is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional()
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

  // Authenticate admin user via Google OAuth only
  static async authenticateAdminOAuth(oauthData: z.infer<typeof adminOAuthSchema>): Promise<AdminUser | null> {
    try {
      // Hardcoded authorized admin emails
      const authorizedAdmins = [
        'charles.watson@wholewellnesscoaching.org',
        'charles.watson@gmail.com'
      ];

      if (!authorizedAdmins.includes(oauthData.email)) {
        console.log(`Admin OAuth failed - unauthorized email: ${oauthData.email}`);
        return null;
      }

      // Check if user exists in database
      let user = await storage.getUserByEmail(oauthData.email);
      
      // Create admin user if doesn't exist
      if (!user) {
        user = await storage.createUser({
          email: oauthData.email,
          firstName: oauthData.firstName || 'Admin',
          lastName: oauthData.lastName || 'User',
          profileImageUrl: oauthData.profileImageUrl,
          googleId: oauthData.googleId,
          role: 'super_admin', // Default to super admin for authorized emails
          isActive: true,
          provider: 'google'
        });
      } else {
        // Update existing user with OAuth data
        await storage.updateUser(user.id, {
          googleId: oauthData.googleId,
          firstName: oauthData.firstName || user.firstName,
          lastName: oauthData.lastName || user.lastName,
          profileImageUrl: oauthData.profileImageUrl || user.profileImageUrl,
          lastLogin: new Date(),
          role: user.role || 'super_admin',
          isActive: true
        });
        user = await storage.getUserByEmail(oauthData.email); // Refresh user data
      }

      const permissions = this.getUserPermissions(user);

      return {
        id: user.id,
        username: user.email,
        email: user.email,
        role: user.role,
        permissions,
        lastLogin: new Date(),
        isActive: true,
        isSuperAdmin: user.role === 'super_admin',
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      };
    } catch (error) {
      console.error('Admin OAuth authentication error:', error);
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

      // For now, use regular user storage since admin storage may not exist
      const user = await storage.getUser(decoded.adminId);
      
      if (!user || !user.isActive || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return null;
      }

      const permissions = this.getUserPermissions(user);

      return {
        id: user.id,
        username: user.email, // Use email as username for OAuth
        email: user.email,
        role: user.role,
        permissions,
        isActive: user.isActive,
        isSuperAdmin: user.role === 'super_admin'
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

  // Get user permissions based on role
  static getUserPermissions(user: any): Permission[] {
    if (user.role === 'super_admin') {
      return Object.values(PERMISSIONS);
    }
    
    if (user.role === 'admin') {
      return [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.EDIT_COACHES,
        PERMISSIONS.VIEW_DONATIONS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.EDIT_BOOKINGS,
        PERMISSIONS.CONTENT_MANAGEMENT,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MARKETING,
        PERMISSIONS.SEND_NOTIFICATIONS
      ];
    }
    
    return [];
  }
}

// Middleware to require admin authentication via cookie
export const requireAdminAuth = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies?.adminSession;
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const adminUser = await AdminAuthService.validateAdminSession(sessionToken);

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

// Middleware to require admin role (for backwards compatibility)
export const requireAdminRole = (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  if (!req.adminUser) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.adminUser.role !== 'admin' && req.adminUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};