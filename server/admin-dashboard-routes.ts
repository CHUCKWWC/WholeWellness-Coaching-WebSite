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
// No longer using password-based login schema
import { z } from 'zod';

const router = Router();

// Admin Google OAuth authentication route
router.post('/auth/oauth-login', async (req, res) => {
  try {
    const oauthData = req.body;
    
    // Authenticate admin via Google OAuth
    const adminUser = await AdminAuthService.authenticateAdminOAuth(oauthData);
    
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: 'Admin access denied. Only authorized administrators can access this area.'
      });
    }
    
    // Create admin session
    const sessionToken = await AdminAuthService.createAdminSession(adminUser.id, req);
    
    // Set secure HTTP-only cookie
    res.cookie('adminSession', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        firstName: oauthData.firstName,
        lastName: oauthData.lastName,
        profileImageUrl: oauthData.profileImageUrl
      },
      permissions: adminUser.permissions,
      sessionToken
    });
  } catch (error) {
    console.error('Admin OAuth login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
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
    
    // Course enrollment and payment metrics
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
      try {
        // Get course enrollment data
        const courseEnrollments = await storage.query(`
          SELECT COUNT(*) as total_enrollments,
                 COUNT(CASE WHEN payment_status = 'succeeded' THEN 1 END) as active_enrollments,
                 SUM(CASE WHEN payment_status = 'succeeded' THEN amount ELSE 0 END) as course_revenue,
                 AVG(CASE WHEN progress IS NOT NULL THEN progress ELSE 0 END) as avg_completion
          FROM course_enrollment_payments
        `);
        
        if (courseEnrollments && courseEnrollments.length > 0) {
          const data = courseEnrollments[0];
          metrics.totalCourseEnrollments = parseInt(data.total_enrollments) || 0;
          metrics.activeCourseEnrollments = parseInt(data.active_enrollments) || 0;
          metrics.courseRevenue = parseFloat(data.course_revenue) || 0;
          metrics.averageCourseCompletion = Math.round(parseFloat(data.avg_completion) || 0);
        }
        
        // Get coupon usage stats
        const couponStats = await storage.query(`
          SELECT COUNT(*) as total_coupons_used
          FROM coupon_redemptions
          WHERE status = 'active'
        `);
        
        if (couponStats && couponStats.length > 0) {
          metrics.totalCouponsUsed = parseInt(couponStats[0].total_coupons_used) || 0;
        }
      } catch (error) {
        console.warn('Course metrics error:', error);
        // Set default values if queries fail
        metrics.totalCourseEnrollments = 0;
        metrics.activeCourseEnrollments = 0;
        metrics.courseRevenue = 0;
        metrics.averageCourseCompletion = 0;
        metrics.totalCouponsUsed = 0;
      }
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
// Course enrollment management
router.get('/course-enrollments', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    let query = `
      SELECT 
        cep.id,
        cep.user_id,
        cep.course_id,
        cep.amount as payment_amount,
        cep.payment_status,
        cep.created_at as enrollment_date,
        cr.coupon_id,
        c.code as coupon_used,
        ce.progress,
        ce.completion_date,
        u.email,
        u.first_name,
        u.last_name,
        'Course ' || cep.course_id as course_name
      FROM course_enrollment_payments cep
      LEFT JOIN coupon_redemptions cr ON cep.coupon_redemption_id = cr.id
      LEFT JOIN coupons c ON cr.coupon_id = c.id
      LEFT JOIN course_enrollments ce ON cep.enrollment_id = ce.id
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status && status !== 'all') {
      query += ` AND cep.payment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY cep.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const enrollments = await storage.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM course_enrollment_payments cep
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    if (status && status !== 'all') {
      countQuery += ` AND cep.payment_status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (u.email ILIKE $${countParamIndex} OR u.first_name ILIKE $${countParamIndex} OR u.last_name ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await storage.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'VIEW_COURSE_ENROLLMENTS',
      'course_enrollments',
      null,
      { filters: { status, search }, resultCount: enrollments.length },
      req
    );
    
    res.json({
      enrollments: enrollments.map(e => ({
        id: e.id,
        userId: e.user_id,
        courseId: e.course_id,
        courseName: e.course_name,
        enrollmentDate: e.enrollment_date,
        paymentStatus: e.payment_status,
        paymentAmount: parseFloat(e.payment_amount),
        couponUsed: e.coupon_used,
        progress: e.progress || 0,
        completionDate: e.completion_date,
        user: {
          firstName: e.first_name,
          lastName: e.last_name,
          email: e.email
        }
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total),
        totalPages: Math.ceil(parseInt(total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch course enrollments' });
  }
});

// Payment transactions management
router.get('/payments', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    let query = `
      SELECT 
        cep.id,
        cep.user_id,
        cep.course_id,
        cep.amount,
        cep.currency,
        cep.payment_method,
        cep.payment_intent_id,
        cep.payment_status as status,
        cep.created_at,
        cr.discount_amount,
        c.code as coupon_code,
        u.email,
        u.first_name,
        u.last_name
      FROM course_enrollment_payments cep
      LEFT JOIN coupon_redemptions cr ON cep.coupon_redemption_id = cr.id
      LEFT JOIN coupons c ON cr.coupon_id = c.id
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status && status !== 'all') {
      query += ` AND cep.payment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR cep.payment_intent_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY cep.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    
    const payments = await storage.query(query, params);
    
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'VIEW_PAYMENTS',
      'payments',
      null,
      { filters: { status, search }, resultCount: payments.length },
      req
    );
    
    res.json({
      payments: payments.map(p => ({
        id: p.id,
        userId: p.user_id,
        courseId: p.course_id,
        amount: parseFloat(p.amount),
        currency: p.currency,
        paymentMethod: p.payment_method,
        paymentIntentId: p.payment_intent_id,
        status: p.status,
        couponCode: p.coupon_code,
        discountAmount: p.discount_amount ? parseFloat(p.discount_amount) : null,
        createdAt: p.created_at,
        user: {
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email
        }
      }))
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Enhanced dashboard stats endpoint
router.get('/dashboard/stats', requireAdminAuth, requireAnyPermission([
  PERMISSIONS.VIEW_ANALYTICS, 
  PERMISSIONS.VIEW_USERS, 
  PERMISSIONS.VIEW_DONATIONS
]), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const user = req.adminUser!;
    const stats: any = {};
    
    // Get basic user stats
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_USERS)) {
      const users = await storage.getAllUsers();
      stats.totalUsers = users.length;
      stats.newUsersToday = users.filter(u => {
        const userDate = new Date(u.createdAt!);
        const today = new Date();
        return userDate.toDateString() === today.toDateString();
      }).length;
      
      stats.activeCoaches = users.filter(u => u.role === 'coach' && u.isActive).length;
    }
    
    // Get donation stats
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_DONATIONS)) {
      const donations = await storage.getAllDonations();
      const completedDonations = donations.filter(d => d.status === 'completed');
      stats.totalDonations = completedDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      const monthlyRevenue = completedDonations
        .filter(d => {
          const donationDate = new Date(d.createdAt!);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return donationDate >= monthAgo;
        })
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      stats.monthlyRevenue = monthlyRevenue;
    }
    
    // Get booking stats
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_BOOKINGS)) {
      const bookings = await storage.getAllBookings();
      stats.totalBookings = bookings.length;
      stats.pendingBookings = bookings.filter(b => b.status === 'pending').length;
      stats.completedSessions = bookings.filter(b => b.status === 'completed').length;
    }
    
    // Get course and payment stats
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
      try {
        const courseStats = await storage.query(`
          SELECT 
            COUNT(*) as total_enrollments,
            COUNT(CASE WHEN payment_status = 'succeeded' THEN 1 END) as active_enrollments,
            SUM(CASE WHEN payment_status = 'succeeded' THEN amount ELSE 0 END) as course_revenue,
            AVG(CASE WHEN ce.progress IS NOT NULL THEN ce.progress ELSE 0 END) as avg_completion
          FROM course_enrollment_payments cep
          LEFT JOIN course_enrollments ce ON cep.enrollment_id = ce.id
        `);
        
        if (courseStats && courseStats.length > 0) {
          const data = courseStats[0];
          stats.totalCourseEnrollments = parseInt(data.total_enrollments) || 0;
          stats.activeCourseEnrollments = parseInt(data.active_enrollments) || 0;
          stats.courseRevenue = parseFloat(data.course_revenue) || 0;
          stats.averageCourseCompletion = Math.round(parseFloat(data.avg_completion) || 0);
        }
        
        const couponStats = await storage.query(`
          SELECT COUNT(*) as total_used
          FROM coupon_redemptions
          WHERE status = 'active'
        `);
        
        stats.totalCouponsUsed = couponStats[0]?.total_used || 0;
      } catch (error) {
        console.warn('Course stats error:', error);
        stats.totalCourseEnrollments = 0;
        stats.activeCourseEnrollments = 0;
        stats.courseRevenue = 0;
        stats.averageCourseCompletion = 0;
        stats.totalCouponsUsed = 0;
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

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