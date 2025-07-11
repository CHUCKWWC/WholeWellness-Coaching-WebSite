import { Router } from "express";
import { storage } from "./supabase-client-storage";
import { 
  AdminAuthService, 
  requireAdminAuth, 
  requirePermission, 
  requireAnyPermission,
  requireSuperAdmin,
  PERMISSIONS,
  type AuthenticatedAdminRequest 
} from "./admin-auth";
import { z } from "zod";

const router = Router();

// Dashboard statistics
router.get('/dashboard/stats', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_DASHBOARD), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const [
      totalUsers,
      totalDonations,
      totalBookings,
      activeCoaches,
      monthlyRevenue,
      newUsersToday,
      pendingBookings,
      completedSessions
    ] = await Promise.all([
      storage.getTotalUsers(),
      storage.getTotalDonations(),
      storage.getTotalBookings(),
      storage.getActiveCoaches(),
      storage.getMonthlyRevenue(),
      storage.getNewUsersToday(),
      storage.getPendingBookings(),
      storage.getCompletedSessions()
    ]);

    res.json({
      totalUsers,
      totalDonations,
      totalBookings,
      activeCoaches,
      monthlyRevenue,
      newUsersToday,
      pendingBookings,
      completedSessions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// User management
router.get('/users', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_USERS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id', requireAdminAuth, requirePermission(PERMISSIONS.EDIT_USERS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await storage.updateUser(id, updateData);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'UPDATE_USER',
      'user',
      id,
      updateData,
      req
    );
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Donation management
router.get('/donations', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_DONATIONS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const donations = await storage.getAllDonationsWithUsers();
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Booking management
router.get('/bookings', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_BOOKINGS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.patch('/bookings/:id', requireAdminAuth, requirePermission(PERMISSIONS.EDIT_BOOKINGS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const booking = await storage.updateBookingStatus(parseInt(id), status);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'UPDATE_BOOKING',
      'booking',
      id,
      { status },
      req
    );
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Coach management
router.get('/coaches', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_COACHES), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const coaches = await storage.getAllCoaches();
    res.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

router.patch('/coaches/:id', requireAdminAuth, requirePermission(PERMISSIONS.EDIT_COACHES), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const coach = await storage.updateCoach(parseInt(id), updateData);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'UPDATE_COACH',
      'coach',
      id,
      updateData,
      req
    );
    
    res.json(coach);
  } catch (error) {
    console.error('Error updating coach:', error);
    res.status(500).json({ error: 'Failed to update coach' });
  }
});

// Activity logs
router.get('/activity', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_LOGS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const activityLogs = await storage.getAdminActivityLogs(limit, offset);
    res.json(activityLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Session management (Super Admin only)
router.get('/sessions', requireAdminAuth, requireSuperAdmin, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const sessions = await storage.getAllAdminSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.delete('/sessions/:id', requireAdminAuth, requireSuperAdmin, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { id } = req.params;
    
    await storage.terminateAdminSession(id);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'TERMINATE_SESSION',
      'admin_session',
      id,
      {},
      req
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({ error: 'Failed to terminate session' });
  }
});

// Reports and analytics
router.get('/reports/users', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const report = await storage.generateUserReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ error: 'Failed to generate user report' });
  }
});

router.get('/reports/financial', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const report = await storage.generateFinancialReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

router.get('/reports/coaching', requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const report = await storage.generateCoachingReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error('Error generating coaching report:', error);
    res.status(500).json({ error: 'Failed to generate coaching report' });
  }
});

// System maintenance
router.post('/maintenance/process-donations', requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const result = await storage.processPendingDonations();
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'PROCESS_DONATIONS',
      'system',
      'maintenance',
      result,
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error processing donations:', error);
    res.status(500).json({ error: 'Failed to process donations' });
  }
});

router.post('/maintenance/assign-coaches', requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const result = await storage.assignCoachesToBookings();
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'ASSIGN_COACHES',
      'system',
      'maintenance',
      result,
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error assigning coaches:', error);
    res.status(500).json({ error: 'Failed to assign coaches' });
  }
});

router.post('/maintenance/send-followups', requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const result = await storage.sendFollowUpEmails();
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'SEND_FOLLOWUPS',
      'system',
      'maintenance',
      result,
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error sending follow-ups:', error);
    res.status(500).json({ error: 'Failed to send follow-ups' });
  }
});

// User segmentation and marketing
router.post('/marketing/update-segments', requireAdminAuth, requirePermission(PERMISSIONS.MARKETING), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const result = await storage.updateUserSegments();
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'UPDATE_SEGMENTS',
      'marketing',
      'segments',
      result,
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating segments:', error);
    res.status(500).json({ error: 'Failed to update user segments' });
  }
});

router.post('/marketing/send-notification', requireAdminAuth, requirePermission(PERMISSIONS.MARKETING), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { userSegment, template, subject, content } = req.body;
    
    const result = await storage.sendMarketingNotification(userSegment, template, subject, content);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'SEND_NOTIFICATION',
      'marketing',
      'notification',
      { userSegment, template, subject },
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Content management
router.get('/content/pages', requireAdminAuth, requirePermission(PERMISSIONS.CONTENT_MANAGEMENT), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const pages = await storage.getAllContentPages();
    res.json(pages);
  } catch (error) {
    console.error('Error fetching content pages:', error);
    res.status(500).json({ error: 'Failed to fetch content pages' });
  }
});

router.post('/content/publish', requireAdminAuth, requirePermission(PERMISSIONS.CONTENT_MANAGEMENT), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { contentId, publishDate } = req.body;
    
    const result = await storage.scheduleContentPublication(contentId, publishDate);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'SCHEDULE_CONTENT',
      'content',
      contentId,
      { publishDate },
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error scheduling content:', error);
    res.status(500).json({ error: 'Failed to schedule content' });
  }
});

// Reward system management
router.post('/rewards/add-points', requireAdminAuth, requirePermission(PERMISSIONS.REWARD_MANAGEMENT), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    const result = await storage.addRewardPoints(userId, points, reason);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'ADD_REWARD_POINTS',
      'user',
      userId,
      { points, reason },
      req
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error adding reward points:', error);
    res.status(500).json({ error: 'Failed to add reward points' });
  }
});

// System alerts and notifications
router.get('/system/alerts', requireAdminAuth, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const alerts = await storage.getSystemAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    res.status(500).json({ error: 'Failed to fetch system alerts' });
  }
});

router.post('/system/notification', requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_ADMIN), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { title, message, severity, targetUsers } = req.body;
    
    const notification = await storage.createAdminNotification({
      title,
      message,
      severity,
      targetUsers,
      createdBy: req.adminUser!.id
    });
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'CREATE_NOTIFICATION',
      'system',
      'notification',
      { title, message, severity },
      req
    );
    
    res.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Export data
router.get('/export/users', requireAdminAuth, requirePermission(PERMISSIONS.DATA_EXPORT), async (req: AuthenticatedAdminRequest, res) => {
  try {
    const format = req.query.format as string || 'csv';
    const userData = await storage.exportUserData(format);
    
    // Log the admin action
    await AdminAuthService.logActivity(
      req.adminUser!.id,
      'EXPORT_DATA',
      'users',
      'export',
      { format },
      req
    );
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
    res.send(userData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

export { router as adminRoutes };