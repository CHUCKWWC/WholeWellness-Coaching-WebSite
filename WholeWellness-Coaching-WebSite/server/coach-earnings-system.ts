import { storage } from "./supabase-client-storage";

export interface CoachEarnings {
  userId: string;
  totalEarnings: number;
  lastUpdated: Date;
  roleUpgraded: boolean;
}

export class CoachEarningsSystem {
  
  /**
   * Track earnings for a coach and automatically upgrade role when they reach $99
   */
  static async trackEarnings(userId: string, amount: number, source: string = 'session'): Promise<void> {
    try {
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Calculate new earnings total
      const currentEarnings = user.donationTotal || 0;
      const newEarnings = currentEarnings + amount;

      // Check if user should be upgraded to coach role
      const shouldUpgrade = newEarnings >= 99.00 && user.role !== 'coach';

      if (shouldUpgrade) {
        // Upgrade user to coach role
        await storage.updateUser(userId, {
          role: 'coach',
          donationTotal: newEarnings,
          updatedAt: new Date()
        });

        // Log the role upgrade
        console.log(`🎉 User ${userId} (${user.email}) upgraded to coach role after earning $${newEarnings}`);
        
        // Create activity log
        await this.logCoachUpgrade(userId, newEarnings, source);
        
        // Notify user of role upgrade (optional - could send email)
        await this.notifyRoleUpgrade(userId, user.email, newEarnings);
        
      } else {
        // Just update earnings without role change
        await storage.updateUser(userId, {
          donationTotal: newEarnings,
          updatedAt: new Date()
        });
      }

      console.log(`💰 Earnings tracked for user ${userId}: $${amount} (Total: $${newEarnings})`);
      
    } catch (error) {
      console.error('Error tracking coach earnings:', error);
      throw error;
    }
  }

  /**
   * Log coach role upgrade for audit trail
   */
  private static async logCoachUpgrade(userId: string, totalEarnings: number, source: string): Promise<void> {
    try {
      // This would typically go to an admin activity log table
      console.log(`COACH_ROLE_UPGRADE: User ${userId} upgraded to coach role with $${totalEarnings} earnings from ${source}`);
      
      // Could also create a database record for tracking
      // await storage.createAdminActivityLog({
      //   action: 'COACH_ROLE_UPGRADE',
      //   userId: userId,
      //   details: { totalEarnings, source },
      //   timestamp: new Date()
      // });
      
    } catch (error) {
      console.error('Error logging coach upgrade:', error);
    }
  }

  /**
   * Notify user of role upgrade (email notification)
   */
  private static async notifyRoleUpgrade(userId: string, email: string | null, totalEarnings: number): Promise<void> {
    try {
      if (!email) return;
      
      console.log(`📧 Would send coach upgrade notification to ${email} for earning $${totalEarnings}`);
      
      // This could integrate with your email service
      // await emailService.sendCoachUpgradeNotification(email, {
      //   totalEarnings,
      //   upgradeDate: new Date(),
      //   coachPortalUrl: 'https://wholewellnesscoaching.org/coach-profile'
      // });
      
    } catch (error) {
      console.error('Error sending role upgrade notification:', error);
    }
  }

  /**
   * Check if user qualifies for coach role based on earnings
   */
  static async checkCoachEligibility(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;
      
      return (user.donationTotal || 0) >= 99.00;
    } catch (error) {
      console.error('Error checking coach eligibility:', error);
      return false;
    }
  }

  /**
   * Get coach earnings summary
   */
  static async getEarningsSummary(userId: string): Promise<CoachEarnings | null> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;
      
      return {
        userId: user.id,
        totalEarnings: user.donationTotal || 0,
        lastUpdated: user.updatedAt || new Date(),
        roleUpgraded: user.role === 'coach'
      };
    } catch (error) {
      console.error('Error getting earnings summary:', error);
      return null;
    }
  }

  /**
   * Manually upgrade user to coach role (admin function)
   */
  static async manualCoachUpgrade(adminUserId: string, targetUserId: string, reason: string = 'Manual upgrade'): Promise<void> {
    try {
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        throw new Error('Target user not found');
      }

      await storage.updateUser(targetUserId, {
        role: 'coach',
        updatedAt: new Date()
      });

      console.log(`🔧 Manual coach upgrade: ${targetUserId} upgraded by admin ${adminUserId}. Reason: ${reason}`);
      
      await this.logCoachUpgrade(targetUserId, targetUser.donationTotal || 0, `manual_by_${adminUserId}`);
      
    } catch (error) {
      console.error('Error in manual coach upgrade:', error);
      throw error;
    }
  }
}