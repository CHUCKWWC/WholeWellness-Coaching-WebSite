// Admin API Routes for Wix Velo Integration
// Provides comprehensive admin endpoints for the nonprofit platform

import { Router } from 'express';
import { storage } from './supabase-client-storage.js';
import { coachStorage } from './coach-storage.js';
import { donationStorage } from './donation-storage.js';
import { requireAuth } from './auth.js';

const router = Router();

// Admin Authentication Middleware
const requireAdminAuth = async (req, res, next) => {
  try {
    await requireAuth(req, res, () => {});
    
    const user = req.user;
    
    // Check if user has admin privileges
    const adminUser = await storage.getUserByEmail(user.email);
    if (!adminUser || !['admin', 'super_admin'].includes(adminUser.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Dashboard Metrics
router.get('/metrics', requireAdminAuth, async (req, res) => {
  try {
    const metrics = {
      totalUsers: await getTotalUsers(),
      totalDonations: await getTotalDonations(),
      activeCoaches: await getActiveCoaches(),
      completedSessions: await getCompletedSessions(),
      monthlyRevenue: await getMonthlyRevenue(),
      userGrowth: await getUserGrowth(),
      newUsersToday: await getNewUsersToday(),
      pendingBookings: await getPendingBookings()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Metrics fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch metrics' });
  }
});

// User Management
router.get('/users', requireAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, membershipLevel } = req.query;
    
    let users = await storage.getAllUsers();
    
    // Apply filters
    if (status) {
      users = users.filter(user => user.status === status);
    }
    if (membershipLevel) {
      users = users.filter(user => user.membershipLevel === membershipLevel);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      users: paginatedUsers,
      total: users.length,
      page: parseInt(page),
      totalPages: Math.ceil(users.length / limit)
    });
  } catch (error) {
    console.error('User fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.patch('/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedUser = await storage.updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log admin action
    await logAdminAction(req.user.email, 'UPDATE_USER', { userId: id, updates });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('User update failed:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Donation Management
router.get('/donations', requireAdminAuth, async (req, res) => {
  try {
    const { startDate, endDate, status, userId } = req.query;
    
    let donations = await donationStorage.getAllDonations();
    
    // Apply filters
    if (startDate) {
      donations = donations.filter(d => new Date(d.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      donations = donations.filter(d => new Date(d.createdAt) <= new Date(endDate));
    }
    if (status) {
      donations = donations.filter(d => d.status === status);
    }
    if (userId) {
      donations = donations.filter(d => d.userId === userId);
    }
    
    res.json(donations);
  } catch (error) {
    console.error('Donation fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
});

router.patch('/donations/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedDonation = await donationStorage.updateDonation(id, updates);
    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    await logAdminAction(req.user.email, 'UPDATE_DONATION', { donationId: id, updates });
    
    res.json(updatedDonation);
  } catch (error) {
    console.error('Donation update failed:', error);
    res.status(500).json({ message: 'Failed to update donation' });
  }
});

// Coaching Management
router.get('/coaches', requireAdminAuth, async (req, res) => {
  try {
    const coaches = await coachStorage.getAllCoaches();
    res.json(coaches);
  } catch (error) {
    console.error('Coach fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch coaches' });
  }
});

router.get('/bookings', requireAdminAuth, async (req, res) => {
  try {
    const { status, coachId, startDate, endDate } = req.query;
    
    let bookings = await storage.getAllBookings();
    
    // Apply filters
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    if (coachId) {
      bookings = bookings.filter(b => b.assignedCoach === coachId);
    }
    if (startDate) {
      bookings = bookings.filter(b => new Date(b.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      bookings = bookings.filter(b => new Date(b.createdAt) <= new Date(endDate));
    }
    
    res.json(bookings);
  } catch (error) {
    console.error('Booking fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

router.get('/coaching-sessions', requireAdminAuth, async (req, res) => {
  try {
    const sessions = await coachStorage.getAllCoachingSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Session fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch coaching sessions' });
  }
});

// Bulk Operations
router.post('/bulk-operations', requireAdminAuth, async (req, res) => {
  try {
    const { operation, userIds, data } = req.body;
    const results = [];
    
    switch (operation) {
      case 'update-membership':
        for (const userId of userIds) {
          const updated = await storage.updateUser(userId, { 
            membershipLevel: data.membershipLevel 
          });
          results.push(updated);
        }
        break;
        
      case 'send-email':
        for (const userId of userIds) {
          await queueEmail(userId, data.template, data.subject, data.content);
          results.push({ userId, status: 'queued' });
        }
        break;
        
      case 'add-reward-points':
        for (const userId of userIds) {
          await addRewardPoints(userId, data.points, data.reason);
          results.push({ userId, pointsAdded: data.points });
        }
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    await logAdminAction(req.user.email, 'BULK_OPERATION', { 
      operation, 
      userCount: userIds.length 
    });
    
    res.json({ results, processed: results.length });
  } catch (error) {
    console.error('Bulk operation failed:', error);
    res.status(500).json({ message: 'Bulk operation failed' });
  }
});

// Automated Workflows
router.post('/workflows/:workflowId', requireAdminAuth, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    let result;
    switch (workflowId) {
      case 'process-pending-donations':
        result = await processPendingDonations();
        break;
        
      case 'assign-coaches-to-bookings':
        result = await assignCoachesToBookings();
        break;
        
      case 'send-follow-up-emails':
        result = await sendFollowUpEmails();
        break;
        
      case 'update-user-segments':
        result = await updateUserSegments();
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid workflow' });
    }
    
    await logAdminAction(req.user.email, 'EXECUTE_WORKFLOW', { workflowId });
    
    res.json({ workflow: workflowId, result });
  } catch (error) {
    console.error('Workflow execution failed:', error);
    res.status(500).json({ message: 'Workflow execution failed' });
  }
});

// Reports
router.get('/reports', requireAdminAuth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const reports = {
      users: await generateUserReport(startDate, endDate),
      financial: await generateFinancialReport(startDate, endDate),
      coaching: await generateCoachingReport(startDate, endDate)
    };
    
    if (type) {
      res.json({ [type]: reports[type] });
    } else {
      res.json(reports);
    }
  } catch (error) {
    console.error('Report generation failed:', error);
    res.status(500).json({ message: 'Failed to generate reports' });
  }
});

// System Alerts
router.get('/alerts', requireAdminAuth, async (req, res) => {
  try {
    const alerts = await getSystemAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Alert fetch failed:', error);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

router.post('/notifications', requireAdminAuth, async (req, res) => {
  try {
    const { title, message, severity } = req.body;
    
    const notification = await createAdminNotification({
      title,
      message,
      severity,
      createdBy: req.user.email,
      createdAt: new Date()
    });
    
    res.json(notification);
  } catch (error) {
    console.error('Notification creation failed:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Content Scheduling
router.post('/schedule-content', requireAdminAuth, async (req, res) => {
  try {
    const { contentId, publishDate } = req.body;
    
    const scheduledContent = await scheduleContentPublication(contentId, publishDate);
    
    await logAdminAction(req.user.email, 'SCHEDULE_CONTENT', { 
      contentId, 
      publishDate 
    });
    
    res.json(scheduledContent);
  } catch (error) {
    console.error('Content scheduling failed:', error);
    res.status(500).json({ message: 'Failed to schedule content' });
  }
});

// Helper Functions
async function getTotalUsers() {
  try {
    const users = await storage.getAllUsers();
    return users.length;
  } catch (error) {
    return 0;
  }
}

async function getTotalDonations() {
  try {
    const donations = await donationStorage.getAllDonations();
    return donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  } catch (error) {
    return 0;
  }
}

async function getActiveCoaches() {
  try {
    const coaches = await coachStorage.getActiveCoaches();
    return coaches.length;
  } catch (error) {
    return 0;
  }
}

async function getCompletedSessions() {
  try {
    const sessions = await coachStorage.getAllCoachingSessions();
    return sessions.filter(s => s.status === 'completed').length;
  } catch (error) {
    return 0;
  }
}

async function getMonthlyRevenue() {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const donations = await donationStorage.getAllDonations();
    return donations
      .filter(d => 
        d.status === 'completed' && 
        new Date(d.createdAt) >= startOfMonth
      )
      .map(d => ({
        month: new Date(d.createdAt).toISOString().slice(0, 7),
        revenue: parseFloat(d.amount)
      }));
  } catch (error) {
    return [];
  }
}

async function getUserGrowth() {
  try {
    const users = await storage.getAllUsers();
    const growthData = {};
    
    users.forEach(user => {
      const month = new Date(user.createdAt).toISOString().slice(0, 7);
      growthData[month] = (growthData[month] || 0) + 1;
    });
    
    return Object.entries(growthData).map(([month, newUsers]) => ({
      month,
      newUsers
    }));
  } catch (error) {
    return [];
  }
}

async function getNewUsersToday() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const users = await storage.getAllUsers();
    return users.filter(u => new Date(u.createdAt) >= today).length;
  } catch (error) {
    return 0;
  }
}

async function getPendingBookings() {
  try {
    const bookings = await storage.getAllBookings();
    return bookings.filter(b => b.status === 'pending').length;
  } catch (error) {
    return 0;
  }
}

async function processPendingDonations() {
  try {
    const pendingDonations = await donationStorage.getAllDonations();
    const pending = pendingDonations.filter(d => d.status === 'pending');
    
    let processed = 0;
    for (const donation of pending) {
      // Process donation logic here
      await donationStorage.updateDonation(donation.id, { 
        status: 'completed',
        processedAt: new Date()
      });
      processed++;
    }
    
    return { processed };
  } catch (error) {
    throw error;
  }
}

async function assignCoachesToBookings() {
  try {
    const bookings = await storage.getAllBookings();
    const unassigned = bookings.filter(b => b.status === 'pending' && !b.assignedCoach);
    
    let assigned = 0;
    for (const booking of unassigned) {
      const availableCoach = await findAvailableCoach(booking.coachingArea);
      if (availableCoach) {
        await storage.updateBookingStatus(booking.id, 'assigned', {
          assignedCoach: availableCoach.id
        });
        assigned++;
      }
    }
    
    return { assigned };
  } catch (error) {
    throw error;
  }
}

async function findAvailableCoach(specialtyArea) {
  try {
    const coaches = await coachStorage.getActiveCoaches();
    return coaches
      .filter(c => c.specialties && c.specialties.includes(specialtyArea))
      .sort((a, b) => (a.currentClientCount || 0) - (b.currentClientCount || 0))[0];
  } catch (error) {
    return null;
  }
}

async function sendFollowUpEmails() {
  try {
    const users = await storage.getAllUsers();
    const dormantUsers = users.filter(u => {
      const lastLogin = new Date(u.lastLogin || u.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastLogin < thirtyDaysAgo;
    });
    
    let sent = 0;
    for (const user of dormantUsers) {
      await queueEmail(user.id, 'dormant-user-followup', 
        'We miss you!', 'Come back to your wellness journey');
      sent++;
    }
    
    return { sent };
  } catch (error) {
    throw error;
  }
}

async function updateUserSegments() {
  try {
    const users = await storage.getAllUsers();
    let updated = 0;
    
    for (const user of users) {
      const segments = [];
      
      // High value donors
      if (parseFloat(user.donationTotal || 0) >= 500) {
        segments.push('high-value');
      }
      
      // Active users
      const lastLogin = new Date(user.lastLogin || user.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (lastLogin >= thirtyDaysAgo) {
        segments.push('active');
      } else {
        segments.push('dormant');
      }
      
      await storage.updateUser(user.id, { segments });
      updated++;
    }
    
    return { updated };
  } catch (error) {
    throw error;
  }
}

async function generateUserReport(startDate, endDate) {
  try {
    let users = await storage.getAllUsers();
    
    if (startDate) {
      users = users.filter(u => new Date(u.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      users = users.filter(u => new Date(u.createdAt) <= new Date(endDate));
    }
    
    return users.map(u => ({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      membershipLevel: u.membershipLevel,
      donationTotal: u.donationTotal,
      rewardPoints: u.rewardPoints,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt
    }));
  } catch (error) {
    return [];
  }
}

async function generateFinancialReport(startDate, endDate) {
  try {
    let donations = await donationStorage.getAllDonations();
    
    if (startDate) {
      donations = donations.filter(d => new Date(d.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      donations = donations.filter(d => new Date(d.createdAt) <= new Date(endDate));
    }
    
    return donations.map(d => ({
      date: d.createdAt,
      amount: d.amount,
      donationType: d.donationType,
      status: d.status,
      userEmail: d.userEmail
    }));
  } catch (error) {
    return [];
  }
}

async function generateCoachingReport(startDate, endDate) {
  try {
    let sessions = await coachStorage.getAllCoachingSessions();
    
    if (startDate) {
      sessions = sessions.filter(s => new Date(s.sessionDate) >= new Date(startDate));
    }
    if (endDate) {
      sessions = sessions.filter(s => new Date(s.sessionDate) <= new Date(endDate));
    }
    
    return sessions.map(s => ({
      sessionDate: s.sessionDate,
      coachName: s.coachName,
      clientEmail: s.clientEmail,
      sessionType: s.sessionType,
      duration: s.durationMinutes,
      status: s.status,
      rating: s.sessionRating
    }));
  } catch (error) {
    return [];
  }
}

async function getSystemAlerts() {
  const alerts = [];
  
  try {
    // Check for pending donations
    const pendingDonations = await donationStorage.getAllDonations();
    const pending = pendingDonations.filter(d => d.status === 'pending');
    if (pending.length > 10) {
      alerts.push({
        title: 'High Volume of Pending Donations',
        message: `${pending.length} donations require processing`,
        severity: 'warning',
        createdAt: new Date()
      });
    }
    
    // Check for unassigned bookings
    const bookings = await storage.getAllBookings();
    const unassigned = bookings.filter(b => b.status === 'pending');
    if (unassigned.length > 5) {
      alerts.push({
        title: 'Unassigned Bookings',
        message: `${unassigned.length} bookings need coach assignment`,
        severity: 'info',
        createdAt: new Date()
      });
    }
    
    return alerts;
  } catch (error) {
    return [];
  }
}

async function queueEmail(userId, template, subject, content) {
  // Add email to queue for processing
  try {
    await storage.createEmailQueue({
      userId,
      template,
      subject,
      content,
      status: 'pending',
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Email queue failed:', error);
  }
}

async function addRewardPoints(userId, points, reason) {
  try {
    const user = await storage.getUser(userId);
    const newPoints = (user.rewardPoints || 0) + points;
    
    await storage.updateUser(userId, { rewardPoints: newPoints });
    
    // Log transaction
    await storage.createRewardTransaction({
      userId,
      points,
      type: 'earned',
      reason,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Add reward points failed:', error);
  }
}

async function scheduleContentPublication(contentId, publishDate) {
  try {
    return await storage.createScheduledContent({
      contentId,
      publishDate: new Date(publishDate),
      status: 'scheduled',
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Content scheduling failed:', error);
    throw error;
  }
}

async function createAdminNotification(notification) {
  try {
    return await storage.createAdminNotification(notification);
  } catch (error) {
    console.error('Admin notification failed:', error);
    throw error;
  }
}

async function logAdminAction(adminEmail, action, details) {
  try {
    await storage.createAdminLog({
      adminEmail,
      action,
      details: JSON.stringify(details),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Admin logging failed:', error);
  }
}

export default router;