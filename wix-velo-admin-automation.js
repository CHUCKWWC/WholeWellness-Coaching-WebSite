// Wix Velo Admin Automation System
// Complete admin dashboard automation for nonprofit coaching platform

import { local } from 'wix-storage-frontend';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { permissions, effectivePermissions } from 'wix-auth';
import wixLocation from 'wix-location';
import { timeline } from 'wix-animations';

// Admin Authentication & Access Control
export class AdminAuth {
  static async verifyAdminAccess() {
    try {
      const user = wixUsers.currentUser;
      if (!user.loggedIn) {
        wixLocation.to('/login');
        return false;
      }

      // Check admin role
      const adminRoles = await effectivePermissions.getCurrentUserRoles();
      const isAdmin = adminRoles.some(role => 
        ['Admin', 'Super Admin', 'Platform Manager'].includes(role.name)
      );

      if (!isAdmin) {
        // Check if user is in admin database collection
        const adminCheck = await wixData.query('AdminUsers')
          .eq('email', user.email)
          .eq('status', 'active')
          .find();

        if (adminCheck.items.length === 0) {
          $w('#adminAccessDenied').show();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  }

  static async logAdminAction(action, details = {}) {
    try {
      const user = wixUsers.currentUser;
      await wixData.insert('AdminActivityLog', {
        adminEmail: user.email,
        action: action,
        details: JSON.stringify(details),
        timestamp: new Date(),
        ipAddress: await this.getClientIP()
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

// User Management Automation
export class UserManager {
  static async bulkUserOperations() {
    const operations = {
      async exportUsers() {
        try {
          const users = await wixData.query('Members')
            .limit(1000)
            .find();

          const csvData = this.convertToCSV(users.items);
          this.downloadCSV(csvData, 'users-export.csv');
          
          AdminAuth.logAdminAction('BULK_EXPORT_USERS', { count: users.items.length });
        } catch (error) {
          $w('#adminErrorMessage').text = 'Export failed: ' + error.message;
          $w('#adminErrorMessage').show();
        }
      },

      async bulkUpdateMembership() {
        try {
          const updates = await wixData.query('PendingMembershipUpdates')
            .eq('status', 'pending')
            .find();

          for (const update of updates.items) {
            await wixData.update('Members', {
              _id: update.userId,
              membershipLevel: update.newLevel,
              updatedAt: new Date()
            });

            await wixData.update('PendingMembershipUpdates', {
              _id: update._id,
              status: 'completed',
              processedAt: new Date()
            });
          }

          $w('#bulkUpdateStatus').text = `Updated ${updates.items.length} memberships`;
          AdminAuth.logAdminAction('BULK_UPDATE_MEMBERSHIPS', { count: updates.items.length });
        } catch (error) {
          console.error('Bulk update failed:', error);
        }
      },

      convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(',')
        );
        
        return [headers, ...rows].join('\n');
      },

      downloadCSV(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    };

    return operations;
  }

  static async automatedUserSegmentation() {
    try {
      // Create user segments based on activity and donations
      const segments = {
        highValue: await wixData.query('Members')
          .ge('donationTotal', 500)
          .find(),
        
        activeUsers: await wixData.query('Members')
          .ge('lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .find(),
        
        dormantUsers: await wixData.query('Members')
          .lt('lastLogin', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
          .find()
      };

      // Auto-tag users
      for (const [segmentName, segment] of Object.entries(segments)) {
        for (const user of segment.items) {
          const currentTags = user.tags || [];
          if (!currentTags.includes(segmentName)) {
            await wixData.update('Members', {
              _id: user._id,
              tags: [...currentTags, segmentName]
            });
          }
        }
      }

      AdminAuth.logAdminAction('AUTO_USER_SEGMENTATION', {
        segmentCounts: Object.fromEntries(
          Object.entries(segments).map(([name, seg]) => [name, seg.items.length])
        )
      });

    } catch (error) {
      console.error('User segmentation failed:', error);
    }
  }
}

// Content Management Automation
export class ContentManager {
  static async automatedContentPublishing() {
    try {
      // Auto-publish scheduled content
      const scheduledContent = await wixData.query('ScheduledContent')
        .le('publishDate', new Date())
        .eq('status', 'scheduled')
        .find();

      for (const content of scheduledContent.items) {
        await wixData.update('ContentPages', {
          _id: content.contentId,
          isPublished: true,
          publishedAt: new Date()
        });

        await wixData.update('ScheduledContent', {
          _id: content._id,
          status: 'published'
        });
      }

      AdminAuth.logAdminAction('AUTO_PUBLISH_CONTENT', { count: scheduledContent.items.length });

    } catch (error) {
      console.error('Auto-publishing failed:', error);
    }
  }

  static async contentAnalytics() {
    try {
      const analytics = {
        totalPages: await wixData.query('ContentPages').count(),
        publishedPages: await wixData.query('ContentPages').eq('isPublished', true).count(),
        draftPages: await wixData.query('ContentPages').eq('isPublished', false).count(),
        recentlyUpdated: await wixData.query('ContentPages')
          .ge('updatedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .count()
      };

      // Update dashboard widgets
      $w('#totalPagesCount').text = analytics.totalPages.toString();
      $w('#publishedPagesCount').text = analytics.publishedPages.toString();
      $w('#draftPagesCount').text = analytics.draftPages.toString();
      $w('#recentUpdatesCount').text = analytics.recentlyUpdated.toString();

      return analytics;
    } catch (error) {
      console.error('Content analytics failed:', error);
    }
  }
}

// Donation & Financial Management
export class FinancialManager {
  static async automatedDonationProcessing() {
    try {
      // Process pending donations
      const pendingDonations = await wixData.query('Donations')
        .eq('status', 'pending')
        .find();

      for (const donation of pendingDonations.items) {
        // Update user donation total
        const user = await wixData.get('Members', donation.userId);
        const newTotal = parseFloat(user.donationTotal || 0) + parseFloat(donation.amount);
        
        await wixData.update('Members', {
          _id: donation.userId,
          donationTotal: newTotal.toString(),
          membershipLevel: this.calculateMembershipLevel(newTotal)
        });

        // Award reward points
        const points = this.calculateRewardPoints(donation.amount, donation.donationType);
        await this.addRewardPoints(donation.userId, points, 'Donation reward');

        // Update donation status
        await wixData.update('Donations', {
          _id: donation._id,
          status: 'completed',
          processedAt: new Date()
        });
      }

      AdminAuth.logAdminAction('AUTO_PROCESS_DONATIONS', { count: pendingDonations.items.length });

    } catch (error) {
      console.error('Donation processing failed:', error);
    }
  }

  static calculateMembershipLevel(totalDonated) {
    if (totalDonated >= 1000) return 'guardian';
    if (totalDonated >= 500) return 'champion';
    if (totalDonated >= 100) return 'supporter';
    return 'free';
  }

  static calculateRewardPoints(amount, type) {
    const basePoints = Math.floor(parseFloat(amount));
    const multiplier = type === 'monthly' ? 2 : 1;
    return basePoints * multiplier;
  }

  static async addRewardPoints(userId, points, reason) {
    try {
      // Add to user's total
      const user = await wixData.get('Members', userId);
      const newPoints = (user.rewardPoints || 0) + points;
      
      await wixData.update('Members', {
        _id: userId,
        rewardPoints: newPoints
      });

      // Log transaction
      await wixData.insert('RewardTransactions', {
        userId: userId,
        points: points,
        type: 'earned',
        reason: reason,
        createdAt: new Date()
      });

    } catch (error) {
      console.error('Failed to add reward points:', error);
    }
  }

  static async generateFinancialReports() {
    try {
      const reports = {
        dailyDonations: await this.getDailyDonations(),
        monthlyRevenue: await this.getMonthlyRevenue(),
        membershipDistribution: await this.getMembershipDistribution(),
        topDonors: await this.getTopDonors()
      };

      // Update dashboard charts
      this.updateRevenueChart(reports.monthlyRevenue);
      this.updateMembershipChart(reports.membershipDistribution);

      return reports;
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  }

  static async getDailyDonations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const donations = await wixData.query('Donations')
      .ge('createdAt', today)
      .eq('status', 'completed')
      .find();

    return donations.items.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  }

  static async getMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const donations = await wixData.query('Donations')
      .ge('createdAt', startOfMonth)
      .eq('status', 'completed')
      .find();

    return donations.items.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  }

  static async getMembershipDistribution() {
    const levels = ['free', 'supporter', 'champion', 'guardian'];
    const distribution = {};

    for (const level of levels) {
      const count = await wixData.query('Members')
        .eq('membershipLevel', level)
        .count();
      distribution[level] = count;
    }

    return distribution;
  }

  static async getTopDonors() {
    return await wixData.query('Members')
      .descending('donationTotal')
      .limit(10)
      .find();
  }
}

// Coaching Management Automation
export class CoachingManager {
  static async automatedCoachAssignment() {
    try {
      const unassignedBookings = await wixData.query('Bookings')
        .eq('status', 'pending')
        .isNotEmpty('coachingArea')
        .find();

      for (const booking of unassignedBookings.items) {
        const availableCoach = await this.findAvailableCoach(booking.coachingArea);
        
        if (availableCoach) {
          await wixData.update('Bookings', {
            _id: booking._id,
            assignedCoach: availableCoach._id,
            status: 'assigned'
          });

          // Notify coach
          await this.notifyCoach(availableCoach, booking);
        }
      }

      AdminAuth.logAdminAction('AUTO_ASSIGN_COACHES', { count: unassignedBookings.items.length });

    } catch (error) {
      console.error('Coach assignment failed:', error);
    }
  }

  static async findAvailableCoach(specialtyArea) {
    try {
      const coaches = await wixData.query('Coaches')
        .eq('status', 'active')
        .contains('specialties', specialtyArea)
        .ascending('currentClientCount')
        .limit(1)
        .find();

      return coaches.items.length > 0 ? coaches.items[0] : null;
    } catch (error) {
      console.error('Finding coach failed:', error);
      return null;
    }
  }

  static async notifyCoach(coach, booking) {
    try {
      // Send email notification
      await wixData.insert('EmailQueue', {
        to: coach.email,
        subject: 'New Client Assignment',
        template: 'coach-assignment',
        data: {
          coachName: coach.firstName,
          clientName: booking.fullName,
          clientEmail: booking.email,
          specialtyArea: booking.coachingArea
        },
        status: 'pending'
      });
    } catch (error) {
      console.error('Coach notification failed:', error);
    }
  }

  static async generateCoachingMetrics() {
    try {
      const metrics = {
        totalSessions: await wixData.query('CoachingSessions').count(),
        completedSessions: await wixData.query('CoachingSessions').eq('status', 'completed').count(),
        activeCoaches: await wixData.query('Coaches').eq('status', 'active').count(),
        averageRating: await this.getAverageCoachRating()
      };

      // Update dashboard
      $w('#totalSessionsCount').text = metrics.totalSessions.toString();
      $w('#completedSessionsCount').text = metrics.completedSessions.toString();
      $w('#activeCoachesCount').text = metrics.activeCoaches.toString();
      $w('#averageRatingDisplay').text = metrics.averageRating.toFixed(1);

      return metrics;
    } catch (error) {
      console.error('Coaching metrics failed:', error);
    }
  }

  static async getAverageCoachRating() {
    try {
      const ratings = await wixData.query('CoachRatings').find();
      if (ratings.items.length === 0) return 0;
      
      const sum = ratings.items.reduce((acc, rating) => acc + rating.rating, 0);
      return sum / ratings.items.length;
    } catch (error) {
      return 0;
    }
  }
}

// Email & Communication Automation
export class CommunicationManager {
  static async processEmailQueue() {
    try {
      const pendingEmails = await wixData.query('EmailQueue')
        .eq('status', 'pending')
        .limit(50)
        .find();

      for (const email of pendingEmails.items) {
        try {
          await this.sendEmail(email);
          
          await wixData.update('EmailQueue', {
            _id: email._id,
            status: 'sent',
            sentAt: new Date()
          });
        } catch (error) {
          await wixData.update('EmailQueue', {
            _id: email._id,
            status: 'failed',
            errorMessage: error.message,
            attemptCount: (email.attemptCount || 0) + 1
          });
        }
      }

      AdminAuth.logAdminAction('PROCESS_EMAIL_QUEUE', { processed: pendingEmails.items.length });

    } catch (error) {
      console.error('Email queue processing failed:', error);
    }
  }

  static async sendEmail(emailData) {
    // Integration with email service (SendGrid, Mailgun, etc.)
    const emailServiceAPI = 'https://api.sendgrid.v3/mail/send';
    
    const response = await fetch(emailServiceAPI, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: { email: 'hello@wholewellness.org' },
        content: [{
          type: 'text/html',
          value: await this.renderEmailTemplate(emailData.template, emailData.data)
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }
  }

  static async renderEmailTemplate(templateName, data) {
    // Load and render email templates
    const template = await wixData.query('EmailTemplates')
      .eq('name', templateName)
      .find();

    if (template.items.length === 0) {
      throw new Error(`Template not found: ${templateName}`);
    }

    let html = template.items[0].htmlContent;
    
    // Simple template variable replacement
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return html;
  }

  static async automatedFollowUps() {
    try {
      // Follow up with dormant users
      const dormantUsers = await wixData.query('Members')
        .lt('lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .find();

      for (const user of dormantUsers.items) {
        await wixData.insert('EmailQueue', {
          to: user.email,
          subject: 'We miss you! Come back to your wellness journey',
          template: 'dormant-user-followup',
          data: {
            firstName: user.firstName,
            membershipLevel: user.membershipLevel
          },
          status: 'pending'
        });
      }

      AdminAuth.logAdminAction('AUTO_FOLLOWUP_DORMANT_USERS', { count: dormantUsers.items.length });

    } catch (error) {
      console.error('Automated follow-ups failed:', error);
    }
  }
}

// Main Admin Dashboard Controller
export class AdminDashboard {
  static async initialize() {
    // Verify admin access
    const hasAccess = await AdminAuth.verifyAdminAccess();
    if (!hasAccess) return;

    // Set up real-time updates
    this.setupRealtimeUpdates();
    
    // Load dashboard data
    await this.loadDashboardData();
    
    // Set up automated tasks
    this.scheduleAutomatedTasks();
  }

  static setupRealtimeUpdates() {
    // Update dashboard every 30 seconds
    setInterval(async () => {
      await this.loadDashboardData();
    }, 30000);
  }

  static async loadDashboardData() {
    try {
      // Load all metrics in parallel
      const [
        contentMetrics,
        financialMetrics,
        coachingMetrics,
        userStats
      ] = await Promise.all([
        ContentManager.contentAnalytics(),
        FinancialManager.generateFinancialReports(),
        CoachingManager.generateCoachingMetrics(),
        this.getUserStats()
      ]);

      // Update last refresh time
      $w('#lastRefreshTime').text = new Date().toLocaleTimeString();
      
    } catch (error) {
      console.error('Dashboard load failed:', error);
      $w('#dashboardError').show();
    }
  }

  static async getUserStats() {
    try {
      const stats = {
        totalUsers: await wixData.query('Members').count(),
        newUsersToday: await wixData.query('Members')
          .ge('createdAt', new Date(new Date().setHours(0, 0, 0, 0)))
          .count(),
        activeUsers: await wixData.query('Members')
          .ge('lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .count()
      };

      $w('#totalUsersCount').text = stats.totalUsers.toString();
      $w('#newUsersTodayCount').text = stats.newUsersToday.toString();
      $w('#activeUsersCount').text = stats.activeUsers.toString();

      return stats;
    } catch (error) {
      console.error('User stats failed:', error);
    }
  }

  static scheduleAutomatedTasks() {
    // Run every 5 minutes
    setInterval(async () => {
      await CommunicationManager.processEmailQueue();
      await FinancialManager.automatedDonationProcessing();
      await CoachingManager.automatedCoachAssignment();
    }, 5 * 60 * 1000);

    // Run every hour
    setInterval(async () => {
      await ContentManager.automatedContentPublishing();
      await UserManager.automatedUserSegmentation();
    }, 60 * 60 * 1000);

    // Run daily
    setInterval(async () => {
      await CommunicationManager.automatedFollowUps();
    }, 24 * 60 * 60 * 1000);
  }

  static async performManualSync() {
    try {
      $w('#syncButton').label = 'Syncing...';
      $w('#syncButton').disable();

      await Promise.all([
        CommunicationManager.processEmailQueue(),
        FinancialManager.automatedDonationProcessing(),
        CoachingManager.automatedCoachAssignment(),
        UserManager.automatedUserSegmentation()
      ]);

      await this.loadDashboardData();
      
      $w('#syncButton').label = 'Manual Sync';
      $w('#syncButton').enable();
      $w('#syncStatus').text = 'Sync completed successfully';
      $w('#syncStatus').show();

      AdminAuth.logAdminAction('MANUAL_SYNC_COMPLETED');

    } catch (error) {
      $w('#syncButton').label = 'Manual Sync';
      $w('#syncButton').enable();
      $w('#syncStatus').text = 'Sync failed: ' + error.message;
      $w('#syncStatus').show();
    }
  }
}

// Page Event Handlers for Admin Dashboard
$w.onReady(async function () {
  await AdminDashboard.initialize();
  
  // Button click handlers
  $w('#syncButton').onClick(() => AdminDashboard.performManualSync());
  $w('#exportUsersButton').onClick(() => UserManager.bulkUserOperations().exportUsers());
  $w('#updateMembershipsButton').onClick(() => UserManager.bulkUserOperations().bulkUpdateMembership());
  
  // Setup refresh button
  $w('#refreshDashboardButton').onClick(() => AdminDashboard.loadDashboardData());
  
  // Setup navigation
  $w('#usersTabButton').onClick(() => $w('#adminTabs').changeTab('usersTab'));
  $w('#contentTabButton').onClick(() => $w('#adminTabs').changeTab('contentTab'));
  $w('#financeTabButton').onClick(() => $w('#adminTabs').changeTab('financeTab'));
  $w('#coachingTabButton').onClick(() => $w('#adminTabs').changeTab('coachingTab'));
});