// Admin Dashboard Routes
// Handles authentication, role management, and dashboard access

import { Router } from 'express';
import { 
  AdminAuthService, 
  requireAdminAuth, 
  requirePermission, 
  requireAnyPermission,
  requireAdminRole,
  requireSuperAdmin,
  PERMISSIONS,
  AuthenticatedAdminRequest 
} from './admin-auth.js';
import { storage } from './supabase-client-storage.js';
import { adminLoginSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Admin authentication routes
router.post('/auth/login', async (req, res) => {
  try {
    const loginData = adminLoginSchema.parse(req.body);
    const result = await AdminAuthService.login(loginData, req);
    
    if (result.success && result.sessionToken) {
      // Set secure HTTP-only cookie
      res.cookie('adminSession', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: loginData.rememberMe ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000 // 24h or 8h
      });
      
      res.json({
        success: true,
        user: result.user,
        permissions: AdminAuthService.getUserPermissions(result.user!),
        sessionToken: result.sessionToken
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors
      });
    } else {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

router.post('/auth/logout', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const sessionToken = req.adminSession?.sessionToken;
    if (sessionToken) {
      await AdminAuthService.logout(sessionToken, req);
    }
    
    res.clearCookie('adminSession');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

router.get('/auth/me', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const user = req.adminUser!;
    const permissions = AdminAuthService.getUserPermissions(user);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        lastLogin: user.lastLogin
      },
      permissions,
      session: {
        expiresAt: req.adminSession?.expiresAt
      }
    });
  } catch (error) {
    console.error('Get admin user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Dashboard overview
router.get('/dashboard/overview', requireAdminAuth, requireAnyPermission([
  PERMISSIONS.VIEW_ANALYTICS, 
  PERMISSIONS.VIEW_USERS, 
  PERMISSIONS.VIEW_DONATIONS
]), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const user = req.adminUser!;
    
    // Get dashboard metrics based on user permissions
    const metrics: any = {};
    
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_USERS)) {
      const users = await storage.getAllUsers();
      metrics.totalUsers = users.length;
      metrics.newUsersThisMonth = users.filter(u => {
        const userDate = new Date(u.createdAt!);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return userDate >= monthAgo;
      }).length;
      
      metrics.usersByRole = users.reduce((acc, u) => {
        acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
    
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_DONATIONS)) {
      const donations = await storage.getAllDonations();
      const completedDonations = donations.filter(d => d.status === 'completed');
      
      metrics.totalDonations = completedDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      metrics.donationCount = completedDonations.length;
      metrics.pendingDonations = donations.filter(d => d.status === 'pending').length;
      
      // Monthly revenue
      const monthlyRevenue = completedDonations
        .filter(d => {
          const donationDate = new Date(d.createdAt!);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return donationDate >= monthAgo;
        })
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      metrics.monthlyRevenue = monthlyRevenue;
    }
    
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_BOOKINGS)) {
      const bookings = await storage.getAllBookings();
      metrics.totalBookings = bookings.length;
      metrics.pendingBookings = bookings.filter(b => b.status === 'pending').length;
      metrics.completedBookings = bookings.filter(b => b.status === 'completed').length;
    }
    
    // Log dashboard access
    await AdminAuthService.logActivity(
      user.id,
      'VIEW_DASHBOARD_OVERVIEW',
      'dashboard',
      null,
      { metricsAccessed: Object.keys(metrics) },
      req
    );
    
    res.json({
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to load dashboard overview' });
  }
});

// User management
router.get('/users', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_USERS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;
    
    let users = await storage.getAllUsers();
    
    // Apply filters
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    if (status === 'active') {
      users = users.filter(user => user.isActive);
    } else if (status === 'inactive') {
      users = users.filter(user => !user.isActive);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm))
      );
    }
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedUsers = users.slice(startIndex, startIndex + Number(limit));
    
    // Remove sensitive data
    const sanitizedUsers = paginatedUsers.map(user => ({
      ...user,
      passwordHash: undefined
    }));
    
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'VIEW_USERS',
      'users',
      null,
      { filters: { role, status, search }, resultCount: sanitizedUsers.length },
      req
    );
    
    res.json({
      users: sanitizedUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users.length,
        totalPages: Math.ceil(users.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id', requireAdminAuth, requirePermission(PERMISSIONS.EDIT_USERS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent self-role modification for safety
    if (updates.role && req.adminUser!.id === id && req.adminUser!.role !== 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify your own role' });
    }
    
    // Only super admins can promote to super_admin
    if (updates.role === 'super_admin' && req.adminUser!.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can assign super admin role' });
    }
    
    const updatedUser = await storage.updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'UPDATE_USER',
      'user',
      id,
      { updates },
      req
    );
    
    res.json({
      ...updatedUser,
      passwordHash: undefined
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Role and permission management
router.get('/roles', requireAdminAuth, requirePermission(PERMISSIONS.MANAGE_ADMINS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const roles = [
      {
        name: 'user',
        displayName: 'User',
        description: 'Regular platform user',
        permissions: []
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Can view most data but limited editing',
        permissions: ['view_users', 'view_donations', 'view_coaches', 'view_bookings', 'view_content']
      },
      {
        name: 'coach',
        displayName: 'Coach',
        description: 'Platform coach with client management access',
        permissions: ['view_users', 'view_bookings', 'view_content', 'edit_content']
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full platform management access',
        permissions: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.FULL_ACCESS && p !== PERMISSIONS.MANAGE_ADMINS)
      },
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Complete system access including admin management',
        permissions: Object.values(PERMISSIONS)
      }
    ];
    
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Activity logs
router.get('/activity', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_LOGS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { page = 1, limit = 50, userId, action, resource } = req.query;
    
    let logs = await storage.getAdminActivityLogs();
    
    // Apply filters
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    if (action) {
      logs = logs.filter(log => log.action === action);
    }
    
    if (resource) {
      logs = logs.filter(log => log.resource === resource);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedLogs = logs.slice(startIndex, startIndex + Number(limit));
    
    res.json({
      logs: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: logs.length,
        totalPages: Math.ceil(logs.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Admin sessions management
router.get('/sessions', requireAdminAuth, requireSuperAdmin, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const sessions = await storage.getActiveAdminSessions();
    
    // Enhance with user data
    const sessionsWithUsers = await Promise.all(
      sessions.map(async (session) => {
        const user = await storage.getUser(session.userId);
        return {
          ...session,
          user: user ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          } : null
        };
      })
    );
    
    res.json({ sessions: sessionsWithUsers });
  } catch (error) {
    console.error('Get admin sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch admin sessions' });
  }
});

router.delete('/sessions/:id', requireAdminAuth, requireSuperAdmin, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-session termination
    if (req.adminSession!.id === Number(id)) {
      return res.status(403).json({ error: 'Cannot terminate your own session' });
    }
    
    const success = await storage.updateAdminSession(Number(id), { isActive: false });
    
    if (success) {
      await AdminAuthService.logActivity(
        req.adminUser!.id,
        'TERMINATE_ADMIN_SESSION',
        'admin_session',
        id,
        {},
        req
      );
      
      res.json({ success: true, message: 'Session terminated' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({ error: 'Failed to terminate session' });
  }
});

// Quick access permission check endpoint
router.post('/check-permission', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { permission, permissions } = req.body;
    const user = req.adminUser!;
    
    let result = false;
    
    if (permission) {
      result = AdminAuthService.hasPermission(user, permission);
    } else if (permissions && Array.isArray(permissions)) {
      result = AdminAuthService.hasAnyPermission(user, permissions);
    }
    
    res.json({ 
      hasPermission: result,
      userRole: user.role,
      userPermissions: AdminAuthService.getUserPermissions(user)
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

export default router;