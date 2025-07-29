// Wix Velo Backend Integration
// Connects Wix admin dashboard with Express.js platform via API

import { fetch } from 'wix-fetch';
import { local, session } from 'wix-storage-frontend';

// API Configuration
const API_BASE_URL = 'https://your-replit-domain.replit.app/api';

export class BackendIntegration {
  static async makeAPIRequest(endpoint, method = 'GET', data = null) {
    try {
      const token = session.getItem('adminToken');
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async syncUserData() {
    try {
      // Get all users from Express platform
      const users = await this.makeAPIRequest('/admin/users');
      
      // Sync with Wix data collections
      for (const user of users) {
        await wixData.save('SyncedUsers', {
          platformUserId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          membershipLevel: user.membershipLevel,
          donationTotal: user.donationTotal,
          rewardPoints: user.rewardPoints,
          lastSyncAt: new Date()
        });
      }

      return { synced: users.length, timestamp: new Date() };
    } catch (error) {
      console.error('User sync failed:', error);
      throw error;
    }
  }

  static async syncDonationData() {
    try {
      const donations = await this.makeAPIRequest('/admin/donations');
      
      for (const donation of donations) {
        await wixData.save('SyncedDonations', {
          platformDonationId: donation.id,
          userId: donation.userId,
          amount: donation.amount,
          currency: donation.currency,
          status: donation.status,
          donationType: donation.donationType,
          createdAt: donation.createdAt,
          lastSyncAt: new Date()
        });
      }

      return { synced: donations.length, timestamp: new Date() };
    } catch (error) {
      console.error('Donation sync failed:', error);
      throw error;
    }
  }

  static async syncCoachingData() {
    try {
      const [bookings, coaches, sessions] = await Promise.all([
        this.makeAPIRequest('/admin/bookings'),
        this.makeAPIRequest('/admin/coaches'),
        this.makeAPIRequest('/admin/coaching-sessions')
      ]);

      // Sync bookings
      for (const booking of bookings) {
        await wixData.save('SyncedBookings', {
          platformBookingId: booking.id,
          fullName: booking.fullName,
          email: booking.email,
          coachingArea: booking.coachingArea,
          status: booking.status,
          assignedCoach: booking.assignedCoach,
          createdAt: booking.createdAt,
          lastSyncAt: new Date()
        });
      }

      // Sync coaches
      for (const coach of coaches) {
        await wixData.save('SyncedCoaches', {
          platformCoachId: coach.id,
          coachId: coach.coachId,
          email: coach.email,
          firstName: coach.firstName,
          lastName: coach.lastName,
          specialties: coach.specialties,
          status: coach.status,
          lastSyncAt: new Date()
        });
      }

      return { 
        bookings: bookings.length, 
        coaches: coaches.length, 
        sessions: sessions.length,
        timestamp: new Date() 
      };
    } catch (error) {
      console.error('Coaching sync failed:', error);
      throw error;
    }
  }
}

// Real-time Dashboard Updates
export class RealtimeDashboard {
  static async startRealtimeUpdates() {
    // Update every 30 seconds
    setInterval(async () => {
      await this.updateDashboardMetrics();
    }, 30000);

    // Update every 5 minutes
    setInterval(async () => {
      await this.syncPlatformData();
    }, 5 * 60 * 1000);
  }

  static async updateDashboardMetrics() {
    try {
      const metrics = await BackendIntegration.makeAPIRequest('/admin/metrics');
      
      // Update Wix dashboard elements
      $w('#totalUsersMetric').text = metrics.totalUsers.toString();
      $w('#totalDonationsMetric').text = `$${metrics.totalDonations}`;
      $w('#activeCoachesMetric').text = metrics.activeCoaches.toString();
      $w('#completedSessionsMetric').text = metrics.completedSessions.toString();
      
      // Update charts with new data
      this.updateRevenueChart(metrics.monthlyRevenue);
      this.updateUserGrowthChart(metrics.userGrowth);
      
      $w('#lastUpdateTime').text = `Last updated: ${new Date().toLocaleTimeString()}`;
      
    } catch (error) {
      console.error('Metrics update failed:', error);
      $w('#metricsError').text = 'Failed to update metrics';
      $w('#metricsError').show();
    }
  }

  static async syncPlatformData() {
    try {
      $w('#syncStatus').text = 'Syncing...';
      $w('#syncStatus').show();
      
      const [userSync, donationSync, coachingSync] = await Promise.all([
        BackendIntegration.syncUserData(),
        BackendIntegration.syncDonationData(),
        BackendIntegration.syncCoachingData()
      ]);
      
      $w('#syncStatus').text = `Synced: ${userSync.synced} users, ${donationSync.synced} donations, ${coachingSync.bookings} bookings`;
      
      // Hide status after 5 seconds
      setTimeout(() => {
        $w('#syncStatus').hide();
      }, 5000);
      
    } catch (error) {
      $w('#syncStatus').text = 'Sync failed: ' + error.message;
    }
  }

  static updateRevenueChart(revenueData) {
    $w('#revenueChart').data = revenueData.map(item => ({
      label: item.month,
      value: item.revenue
    }));
  }

  static updateUserGrowthChart(growthData) {
    $w('#userGrowthChart').data = growthData.map(item => ({
      label: item.month,
      value: item.newUsers
    }));
  }
}

// Automated Actions
export class AutomatedActions {
  static async processAutomatedWorkflows() {
    try {
      // Trigger automated workflows on platform
      const workflows = [
        'process-pending-donations',
        'assign-coaches-to-bookings', 
        'send-follow-up-emails',
        'update-user-segments'
      ];

      for (const workflow of workflows) {
        await BackendIntegration.makeAPIRequest(`/admin/workflows/${workflow}`, 'POST');
      }

      $w('#workflowStatus').text = `${workflows.length} workflows executed successfully`;
      $w('#workflowStatus').show();

    } catch (error) {
      console.error('Workflow execution failed:', error);
      $w('#workflowStatus').text = 'Workflow execution failed';
    }
  }

  static async bulkUserOperations(operation, userIds = []) {
    try {
      const result = await BackendIntegration.makeAPIRequest('/admin/bulk-operations', 'POST', {
        operation: operation,
        userIds: userIds,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Bulk operation failed:', error);
      throw error;
    }
  }

  static async scheduleContentPublication(contentId, publishDate) {
    try {
      await BackendIntegration.makeAPIRequest('/admin/schedule-content', 'POST', {
        contentId: contentId,
        publishDate: publishDate
      });

      $w('#contentScheduleStatus').text = 'Content scheduled successfully';
      $w('#contentScheduleStatus').show();

    } catch (error) {
      console.error('Content scheduling failed:', error);
      $w('#contentScheduleStatus').text = 'Scheduling failed: ' + error.message;
    }
  }
}

// Export & Reporting
export class ReportingSystem {
  static async generateReports() {
    try {
      const reports = await BackendIntegration.makeAPIRequest('/admin/reports');
      
      // Generate downloadable reports
      this.createUserReport(reports.users);
      this.createFinancialReport(reports.financial);
      this.createCoachingReport(reports.coaching);
      
      return reports;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw error;
    }
  }

  static createUserReport(userData) {
    const csv = this.convertToCSV(userData, [
      'email', 'firstName', 'lastName', 'membershipLevel', 
      'donationTotal', 'rewardPoints', 'lastLogin'
    ]);
    
    this.downloadFile(csv, 'user-report.csv', 'text/csv');
  }

  static createFinancialReport(financialData) {
    const csv = this.convertToCSV(financialData, [
      'date', 'amount', 'donationType', 'status', 'userEmail'
    ]);
    
    this.downloadFile(csv, 'financial-report.csv', 'text/csv');
  }

  static createCoachingReport(coachingData) {
    const csv = this.convertToCSV(coachingData, [
      'sessionDate', 'coachName', 'clientEmail', 'sessionType', 
      'duration', 'status', 'rating'
    ]);
    
    this.downloadFile(csv, 'coaching-report.csv', 'text/csv');
  }

  static convertToCSV(data, columns) {
    if (!data.length) return '';
    
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col] || '';
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

// Notification System
export class NotificationSystem {
  static async checkSystemAlerts() {
    try {
      const alerts = await BackendIntegration.makeAPIRequest('/admin/alerts');
      
      if (alerts.length > 0) {
        this.displayAlerts(alerts);
      }
      
      return alerts;
    } catch (error) {
      console.error('Alert check failed:', error);
    }
  }

  static displayAlerts(alerts) {
    const alertContainer = $w('#systemAlerts');
    alertContainer.html = '';
    
    alerts.forEach(alert => {
      const alertElement = `
        <div class="alert alert-${alert.severity}">
          <strong>${alert.title}</strong>
          <p>${alert.message}</p>
          <small>${new Date(alert.createdAt).toLocaleString()}</small>
        </div>
      `;
      alertContainer.html += alertElement;
    });
    
    alertContainer.show();
  }

  static async sendAdminNotification(title, message, severity = 'info') {
    try {
      await BackendIntegration.makeAPIRequest('/admin/notifications', 'POST', {
        title: title,
        message: message,
        severity: severity,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Notification send failed:', error);
    }
  }
}

// Main page initialization
$w.onReady(async function () {
  try {
    // Initialize admin dashboard
    await RealtimeDashboard.startRealtimeUpdates();
    
    // Setup button handlers
    $w('#syncDataButton').onClick(async () => {
      await RealtimeDashboard.syncPlatformData();
    });
    
    $w('#runWorkflowsButton').onClick(async () => {
      await AutomatedActions.processAutomatedWorkflows();
    });
    
    $w('#generateReportsButton').onClick(async () => {
      await ReportingSystem.generateReports();
    });
    
    $w('#exportUsersButton').onClick(async () => {
      const users = await BackendIntegration.makeAPIRequest('/admin/users');
      ReportingSystem.createUserReport(users);
    });
    
    // Setup periodic checks
    setInterval(async () => {
      await NotificationSystem.checkSystemAlerts();
    }, 2 * 60 * 1000); // Check every 2 minutes
    
    // Initial load
    await RealtimeDashboard.updateDashboardMetrics();
    await NotificationSystem.checkSystemAlerts();
    
  } catch (error) {
    console.error('Admin dashboard initialization failed:', error);
    $w('#initializationError').text = 'Dashboard initialization failed: ' + error.message;
    $w('#initializationError').show();
  }
});

// Export all classes for use in other Wix pages
export {
  BackendIntegration,
  RealtimeDashboard,
  AutomatedActions,
  ReportingSystem,
  NotificationSystem
};