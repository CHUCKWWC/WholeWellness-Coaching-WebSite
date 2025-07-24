import { supabase } from "./supabase";
import { randomUUID } from "crypto";
import type { 
  User, Booking, Testimonial, Resource, Contact, WeightLossIntake,
  InsertUser, InsertBooking, InsertTestimonial, InsertResource, InsertContact, InsertWeightLossIntake,
  ContentPage, ContentBlock, MediaItem, NavigationMenu, SiteSetting,
  InsertContentPage, InsertContentBlock, InsertMediaItem, InsertNavigationMenu, InsertSiteSetting,
  AdminSession, AdminActivityLog, InsertAdminSession, InsertAdminActivityLog,
  Donation, MentalWellnessResource, InsertMentalWellnessResource,
  EmergencyContact, InsertEmergencyContact, WellnessAssessment, InsertWellnessAssessment,
  PersonalizedRecommendation, InsertPersonalizedRecommendation,
  ResourceUsageAnalytics, InsertResourceUsageAnalytics,
  Program, InsertProgram, ChatSession, InsertChatSession, ChatMessage, InsertChatMessage,
  AssessmentType, InsertAssessmentType, UserAssessment, InsertUserAssessment,
  CoachInteraction, InsertCoachInteraction
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Testimonials
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Resources
  getResource(id: number): Promise<Resource | undefined>;
  getResourcesByType(type: string): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getAllResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Contacts
  getContact(id: number): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Weight Loss Intakes
  getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined>;
  getAllWeightLossIntakes(): Promise<WeightLossIntake[]>;
  createWeightLossIntake(intake: InsertWeightLossIntake): Promise<WeightLossIntake>;
  
  // CMS - Content Pages
  getContentPage(id: number): Promise<ContentPage | undefined>;
  getContentPageBySlug(slug: string): Promise<ContentPage | undefined>;
  getAllContentPages(): Promise<ContentPage[]>;
  getPublishedContentPages(): Promise<ContentPage[]>;
  createContentPage(page: InsertContentPage): Promise<ContentPage>;
  updateContentPage(id: number, page: Partial<InsertContentPage>): Promise<ContentPage | undefined>;
  deleteContentPage(id: number): Promise<boolean>;
  
  // CMS - Content Blocks
  getContentBlock(id: number): Promise<ContentBlock | undefined>;
  getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(id: number, block: Partial<InsertContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: number): Promise<boolean>;
  
  // CMS - Media Library
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  getAllMediaItems(): Promise<MediaItem[]>;
  getMediaByCategory(category: string): Promise<MediaItem[]>;
  createMediaItem(media: InsertMediaItem): Promise<MediaItem>;
  updateMediaItem(id: number, media: Partial<InsertMediaItem>): Promise<MediaItem | undefined>;
  deleteMediaItem(id: number): Promise<boolean>;
  
  // CMS - Navigation
  getNavigationMenu(id: number): Promise<NavigationMenu | undefined>;
  getNavigationByLocation(location: string): Promise<NavigationMenu[]>;
  getAllNavigationMenus(): Promise<NavigationMenu[]>;
  createNavigationMenu(menu: InsertNavigationMenu): Promise<NavigationMenu>;
  updateNavigationMenu(id: number, menu: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined>;
  deleteNavigationMenu(id: number): Promise<boolean>;
  
  // CMS - Site Settings
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  getSiteSettingsByCategory(category: string): Promise<SiteSetting[]>;
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(key: string, setting: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined>;
  deleteSiteSetting(key: string): Promise<boolean>;
  createOrUpdateSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;

  // Admin Authentication
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getAdminSessionByToken(token: string): Promise<AdminSession | undefined>;
  updateAdminSession(id: number, updates: Partial<AdminSession>): Promise<AdminSession | undefined>;
  getActiveAdminSessions(): Promise<AdminSession[]>;
  createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog>;
  getAdminActivityLogs(): Promise<AdminActivityLog[]>;
  
  // Additional user methods
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllDonations(): Promise<Donation[]>;

  // Comprehensive Admin Portal Methods
  getTotalUsers(): Promise<number>;
  getTotalDonations(): Promise<number>;
  getTotalBookings(): Promise<number>;
  getActiveCoaches(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
  getNewUsersToday(): Promise<number>;
  getPendingBookings(): Promise<number>;
  getCompletedSessions(): Promise<number>;
  getAllDonationsWithUsers(): Promise<any[]>;
  getAllCoaches(): Promise<any[]>;
  updateCoach(id: number, data: any): Promise<any>;
  getAdminActivityLogs(limit: number, offset: number): Promise<any[]>;
  getAllAdminSessions(): Promise<any[]>;
  terminateAdminSession(id: string): Promise<void>;
  generateUserReport(startDate: string, endDate: string): Promise<any>;
  generateFinancialReport(startDate: string, endDate: string): Promise<any>;
  generateCoachingReport(startDate: string, endDate: string): Promise<any>;
  processPendingDonations(): Promise<any>;
  assignCoachesToBookings(): Promise<any>;
  sendFollowUpEmails(): Promise<any>;
  updateUserSegments(): Promise<any>;
  sendMarketingNotification(userSegment: string, template: string, subject: string, content: string): Promise<any>;
  scheduleContentPublication(contentId: string, publishDate: string): Promise<any>;
  addRewardPoints(userId: string, points: number, reason: string): Promise<any>;
  getSystemAlerts(): Promise<any[]>;
  createAdminNotification(data: any): Promise<any>;
  exportUserData(format: string): Promise<string>;

  // Admin Authentication Extended
  getAdminByUsername(username: string): Promise<any>;
  updateAdminLastLogin(adminId: string): Promise<void>;
  getAdminPermissions(adminId: string): Promise<string[]>;
  createAdminSession(session: any): Promise<void>;
  getAdminSession(token: string): Promise<any>;
  getAdminById(adminId: string): Promise<any>;
  createAdminActivityLog(log: any): Promise<void>;
  deactivateAdminSession(token: string): Promise<void>;

  // User Authentication Extended
  getUserById(id: string): Promise<any>;

  // Assessment Programs
  getProgram(id: string): Promise<Program | undefined>;
  getUserPrograms(userId: string): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessionByThreadId(threadId: string): Promise<ChatSession | undefined>;

  // Chat Messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateUserLastLogin(userId: string): Promise<void>;

  // Mental Wellness Resource Hub
  getMentalWellnessResources(filters?: {
    category?: string;
    targetAudience?: string;
    resourceType?: string;
    isEmergency?: boolean;
  }): Promise<MentalWellnessResource[]>;
  getMentalWellnessResource(id: number): Promise<MentalWellnessResource | undefined>;
  createMentalWellnessResource(resource: InsertMentalWellnessResource): Promise<MentalWellnessResource>;
  updateMentalWellnessResource(id: number, updates: Partial<InsertMentalWellnessResource>): Promise<MentalWellnessResource | undefined>;
  incrementResourceUsage(id: number): Promise<void>;

  getEmergencyContacts(filters?: {
    specialty?: string;
    location?: string;
  }): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;

  createWellnessAssessment(assessment: InsertWellnessAssessment): Promise<WellnessAssessment>;
  getWellnessAssessment(id: number): Promise<WellnessAssessment | undefined>;
  getUserWellnessAssessments(userId: string): Promise<WellnessAssessment[]>;

  getPersonalizedRecommendations(filters: {
    userId?: string;
    sessionId?: string;
    category?: string;
    assessmentType?: string;
  }): Promise<PersonalizedRecommendation[]>;
  createPersonalizedRecommendation(recommendation: InsertPersonalizedRecommendation): Promise<PersonalizedRecommendation>;

  trackResourceUsage(usage: InsertResourceUsageAnalytics): Promise<ResourceUsageAnalytics>;
  getResourceUsageAnalytics(resourceId: number): Promise<ResourceUsageAnalytics[]>;

  getQuickAccessResources(): Promise<{
    emergency: EmergencyContact[];
    crisis: MentalWellnessResource[];
    popular: MentalWellnessResource[];
    featured: MentalWellnessResource[];
  }>;

  // Coach Portal Methods
  getCoachProfile(userId: string): Promise<any>;
  updateCoachProfile(userId: string, data: any): Promise<any>;
  getCoachClients(userId: string): Promise<any[]>;
  getCoachClient(userId: string, clientId: string): Promise<any>;
  updateCoachClient(userId: string, clientId: string, data: any): Promise<any>;
  getCoachSessionNotes(userId: string, options: any): Promise<any[]>;
  createSessionNote(data: any): Promise<any>;
  getSessionNote(userId: string, noteId: number): Promise<any>;
  updateSessionNote(userId: string, noteId: number, data: any): Promise<any>;
  getCoachAvailability(userId: string): Promise<any>;
  updateCoachAvailability(userId: string, data: any): Promise<any>;
  getCoachMessageTemplates(userId: string): Promise<any[]>;
  createMessageTemplate(data: any): Promise<any>;
  updateMessageTemplate(userId: string, templateId: number, data: any): Promise<any>;
  deleteMessageTemplate(userId: string, templateId: number): Promise<void>;
  getCoachClientCommunications(userId: string, options: any): Promise<any[]>;
  createClientCommunication(data: any): Promise<any>;
  getCoachMetrics(userId: string, period: string): Promise<any>;
  getCoachTotalClients(userId: string): Promise<number>;
  getCoachActiveSessions(userId: string): Promise<number>;
  getCoachCompletedSessions(userId: string): Promise<number>;
  getCoachAverageRating(userId: string): Promise<number>;
  getCoachMonthlyRevenue(userId: string): Promise<number>;
  getCoachUpcomingSessions(userId: string): Promise<any[]>;
  getCoachRecentActivity(userId: string): Promise<any[]>;
  getCoachCredentials(userId: string): Promise<any[]>;
  createCoachCredential(data: any): Promise<any>;
  getCoachBanking(userId: string): Promise<any>;
  updateCoachBanking(userId: string, data: any): Promise<any>;
  getCoachSchedule(userId: string, startDate: string, endDate: string): Promise<any>;
  blockCoachTime(userId: string, startTime: string, endTime: string, reason: string): Promise<any>;
  exportCoachClientData(userId: string, format: string): Promise<string>;
  exportCoachSessionData(userId: string, format: string, startDate: string, endDate: string): Promise<string>;

  // Donation Portal Methods
  getDonationPresets(): Promise<any[]>;
  getActiveCampaigns(): Promise<any[]>;
  getMembershipBenefits(): Promise<any[]>;
  getImpactMetrics(): Promise<any>;
  getUserDonations(userId: string): Promise<any[]>;
  createDonation(data: any): Promise<any>;
  updateDonation(donationId: string, data: any): Promise<any>;
  getDonationByStripeSession(sessionId: string): Promise<any>;
  createCampaign(data: any): Promise<any>;
  updateCampaign(campaignId: string, data: any): Promise<any>;
  getTotalDonationsRaised(): Promise<number>;
  getTotalDonors(): Promise<number>;
  getAverageDonationAmount(): Promise<number>;
  getMonthlyDonationTrend(): Promise<any[]>;
  getTopCampaigns(): Promise<any[]>;
  getMembershipDistribution(): Promise<any>;
  getUserTotalContributed(userId: string): Promise<number>;
  getUserRewardPoints(userId: string): Promise<number>;
  getUserMembershipLevel(userId: string): Promise<string>;
  getUserImpactMetrics(userId: string): Promise<any>;
  getUserDonationHistory(userId: string): Promise<any[]>;
  getAvailableRewards(userId: string): Promise<any[]>;
  redeemRewardPoints(userId: string, rewardId: string, pointsCost: number): Promise<any>;
  updateDonationSubscription(userId: string, subscriptionId: string, data: any): Promise<any>;
  updateUserMembershipLevel(userId: string): Promise<void>;

  // Onboarding & Account Management Methods
  createUserOnboardingSteps(userId: string, steps: any[]): Promise<void>;
  getUserOnboardingSteps(userId: string): Promise<any[]>;
  updateOnboardingStep(userId: string, stepId: string, updates: any): Promise<void>;
  markUserOnboardingComplete(userId: string): Promise<void>;
  updateUserCoachingPreferences(userId: string, preferences: string[]): Promise<void>;
  createEmailVerificationToken(userId: string, token: string): Promise<void>;
  getEmailVerificationToken(token: string): Promise<any>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  markEmailAsVerified(userId: string): Promise<void>;
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<any>;
  deletePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
}

export class SupabaseClientStorage implements IStorage {
  
  // Users
  // Google OAuth Methods
  async getUserByGoogleId(googleId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user by Google ID:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error getting user by Google ID:', err);
      return null;
    }
  }

  async updateUserGoogleId(userId: string, googleId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          google_id: googleId,
          provider: 'google',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user Google ID:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error updating user Google ID:', err);
      throw err;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting user:', error);
        return undefined;
      }
      
      // Map snake_case response to camelCase
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error('Error getting user by email:', error);
        return undefined;
      }
      
      // Map snake_case response to camelCase
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Map camelCase fields to snake_case for database
      const dbUser = {
        id: randomUUID(),
        email: insertUser.email,
        password_hash: insertUser.passwordHash,
        first_name: insertUser.firstName,
        last_name: insertUser.lastName,
        membership_level: insertUser.membershipLevel || 'free',
        donation_total: insertUser.donationTotal || 0,
        reward_points: insertUser.rewardPoints || 0,
        stripe_customer_id: insertUser.stripeCustomerId || null,
        profile_image_url: insertUser.profileImageUrl || null,
        google_id: insertUser.googleId || null,
        provider: insertUser.provider || 'local',
        role: insertUser.role || 'user',
        permissions: insertUser.permissions || null,
        is_active: insertUser.isActive !== undefined ? insertUser.isActive : true,
        join_date: new Date(),
        last_login: insertUser.lastLogin || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(dbUser)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      // Map snake_case response back to camelCase
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      // Map camelCase fields to snake_case for database
      const dbUpdates: any = {};
      
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.passwordHash !== undefined) dbUpdates.password_hash = updates.passwordHash;
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.membershipLevel !== undefined) dbUpdates.membership_level = updates.membershipLevel;
      if (updates.donationTotal !== undefined) dbUpdates.donation_total = updates.donationTotal;
      if (updates.rewardPoints !== undefined) dbUpdates.reward_points = updates.rewardPoints;
      if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;
      if (updates.profileImageUrl !== undefined) dbUpdates.profile_image_url = updates.profileImageUrl;
      if (updates.googleId !== undefined) dbUpdates.google_id = updates.googleId;
      if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.lastLogin !== undefined) dbUpdates.last_login = updates.lastLogin;
      if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;

      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        return undefined;
      }
      
      // Map snake_case response back to camelCase
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }
      
      return data.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        passwordHash: user.password_hash,
        membershipLevel: user.membership_level,
        rewardPoints: user.reward_points,
        donationTotal: user.donation_total,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        provider: user.provider,
        role: user.role,
        isActive: user.is_active !== false,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: user.permissions
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user role:', error);
        return undefined;
      }
      
      // Map snake_case response back to camelCase
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as User;
    } catch (error) {
      console.error('Error updating user role:', error);
      return undefined;
    }
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting booking:', error);
        return undefined;
      }
      
      return data as Booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (error) {
        console.error('Error getting all bookings:', error);
        return [];
      }
      
      return data as Booking[];
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(insertBooking)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
      
      return data as Booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating booking status:', error);
        return undefined;
      }
      
      return data as Booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting testimonial:', error);
        return undefined;
      }
      
      return data as Testimonial;
    } catch (error) {
      console.error('Error getting testimonial:', error);
      return undefined;
    }
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true);
      
      if (error) {
        console.error('Error getting approved testimonials:', error);
        return [];
      }
      
      return data as Testimonial[];
    } catch (error) {
      console.error('Error getting approved testimonials:', error);
      return [];
    }
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*');
      
      if (error) {
        console.error('Error getting all testimonials:', error);
        return [];
      }
      
      return data as Testimonial[];
    } catch (error) {
      console.error('Error getting all testimonials:', error);
      return [];
    }
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(insertTestimonial)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating testimonial:', error);
        throw error;
      }
      
      return data as Testimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting resource:', error);
        return undefined;
      }
      
      return data as Resource;
    } catch (error) {
      console.error('Error getting resource:', error);
      return undefined;
    }
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('type', type);
      
      if (error) {
        console.error('Error getting resources by type:', error);
        return [];
      }
      
      return data as Resource[];
    } catch (error) {
      console.error('Error getting resources by type:', error);
      return [];
    }
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('category', category);
      
      if (error) {
        console.error('Error getting resources by category:', error);
        return [];
      }
      
      return data as Resource[];
    } catch (error) {
      console.error('Error getting resources by category:', error);
      return [];
    }
  }

  async getAllResources(): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*');
      
      if (error) {
        console.error('Error getting all resources:', error);
        return [];
      }
      
      return data as Resource[];
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(insertResource)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating resource:', error);
        throw error;
      }
      
      return data as Resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting contact:', error);
        return undefined;
      }
      
      return data as Contact;
    } catch (error) {
      console.error('Error getting contact:', error);
      return undefined;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) {
        console.error('Error getting all contacts:', error);
        return [];
      }
      
      return data as Contact[];
    } catch (error) {
      console.error('Error getting all contacts:', error);
      return [];
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(insertContact)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }
      
      return data as Contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Discovery Quiz Results Management
  async saveDiscoveryQuizResult(quizData: any): Promise<any> {
    try {
      // First check if table exists, if not, create a fallback response
      const { data, error } = await supabase
        .from('discovery_quiz_results')
        .insert({
          user_id: quizData.userId,
          session_id: quizData.sessionId,
          current_needs: quizData.currentNeeds,
          situation_details: quizData.situationDetails,
          support_preference: quizData.supportPreference,
          readiness_level: quizData.readinessLevel,
          recommended_path: quizData.recommendedPath,
          quiz_version: quizData.quizVersion,
          completed: quizData.completed
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving discovery quiz result:', error);
        // If table doesn't exist, return a success response for demo purposes
        if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation') || error.code === 'PGRST116') {
          console.log('Discovery quiz table does not exist - returning demo response for UI testing');
          return {
            id: `demo_quiz_${Date.now()}`,
            user_id: quizData.userId,
            session_id: quizData.sessionId,
            current_needs: quizData.currentNeeds,
            situation_details: quizData.situationDetails,
            support_preference: quizData.supportPreference,
            readiness_level: quizData.readinessLevel,
            recommended_path: quizData.recommendedPath,
            quiz_version: quizData.quizVersion || 'v1',
            completed: quizData.completed,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error saving discovery quiz result:', err);
      // Return demo data for UI testing if database table isn't set up
      console.log('Returning demo response for quiz functionality testing');
      return {
        id: `demo_quiz_${Date.now()}`,
        user_id: quizData.userId,
        session_id: quizData.sessionId,
        current_needs: quizData.currentNeeds,
        situation_details: quizData.situationDetails,
        support_preference: quizData.supportPreference,
        readiness_level: quizData.readinessLevel,
        recommended_path: quizData.recommendedPath,
        quiz_version: quizData.quizVersion || 'v1',
        completed: quizData.completed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async getUserQuizHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('discovery_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user quiz history:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Error getting user quiz history:', err);
      return [];
    }
  }

  async getQuizResultBySession(sessionId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('discovery_quiz_results')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error getting quiz result by session:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error getting quiz result by session:', err);
      return null;
    }
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    try {
      const { data, error } = await supabase
        .from('weight_loss_intakes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting weight loss intake:', error);
        return undefined;
      }
      
      return data as WeightLossIntake;
    } catch (error) {
      console.error('Error getting weight loss intake:', error);
      return undefined;
    }
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    try {
      const { data, error } = await supabase
        .from('weight_loss_intakes')
        .select('*');
      
      if (error) {
        console.error('Error getting all weight loss intakes:', error);
        return [];
      }
      
      return data as WeightLossIntake[];
    } catch (error) {
      console.error('Error getting all weight loss intakes:', error);
      return [];
    }
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    try {
      const { data, error } = await supabase
        .from('weight_loss_intakes')
        .insert(insertIntake)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating weight loss intake:', error);
        throw error;
      }
      
      return data as WeightLossIntake;
    } catch (error) {
      console.error('Error creating weight loss intake:', error);
      throw error;
    }
  }

  // CMS - Content Pages
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting content page:', error);
        return undefined;
      }
      
      return data as ContentPage;
    } catch (error) {
      console.error('Error getting content page:', error);
      return undefined;
    }
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Error getting content page by slug:', error);
        return undefined;
      }
      
      return data as ContentPage;
    } catch (error) {
      console.error('Error getting content page by slug:', error);
      return undefined;
    }
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*');
      
      if (error) {
        console.error('Error getting all content pages:', error);
        return [];
      }
      
      return data as ContentPage[];
    } catch (error) {
      console.error('Error getting all content pages:', error);
      return [];
    }
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('is_published', true);
      
      if (error) {
        console.error('Error getting published content pages:', error);
        return [];
      }
      
      return data as ContentPage[];
    } catch (error) {
      console.error('Error getting published content pages:', error);
      return [];
    }
  }

  async createContentPage(insertPage: InsertContentPage): Promise<ContentPage> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .insert(insertPage)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating content page:', error);
        throw error;
      }
      
      return data as ContentPage;
    } catch (error) {
      console.error('Error creating content page:', error);
      throw error;
    }
  }

  async updateContentPage(id: number, pageUpdate: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .update({ ...pageUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating content page:', error);
        return undefined;
      }
      
      return data as ContentPage;
    } catch (error) {
      console.error('Error updating content page:', error);
      return undefined;
    }
  }

  async deleteContentPage(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting content page:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting content page:', error);
      return false;
    }
  }

  // Placeholder implementations for remaining CMS methods
  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    console.log('getContentBlock not yet implemented for Supabase client');
    return undefined;
  }

  async getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]> {
    console.log('getContentBlocksByPageId not yet implemented for Supabase client');
    return [];
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    console.log('createContentBlock not yet implemented for Supabase client');
    throw new Error('Not implemented');
  }

  async updateContentBlock(id: number, blockUpdate: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    console.log('updateContentBlock not yet implemented for Supabase client');
    return undefined;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    console.log('deleteContentBlock not yet implemented for Supabase client');
    return false;
  }

  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    console.log('getMediaItem not yet implemented for Supabase client');
    return undefined;
  }

  async getAllMediaItems(): Promise<MediaItem[]> {
    console.log('getAllMediaItems not yet implemented for Supabase client');
    return [];
  }

  async getMediaByCategory(category: string): Promise<MediaItem[]> {
    console.log('getMediaByCategory not yet implemented for Supabase client');
    return [];
  }

  async createMediaItem(insertMedia: InsertMediaItem): Promise<MediaItem> {
    console.log('createMediaItem not yet implemented for Supabase client');
    throw new Error('Not implemented');
  }

  async updateMediaItem(id: number, mediaUpdate: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    console.log('updateMediaItem not yet implemented for Supabase client');
    return undefined;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    console.log('deleteMediaItem not yet implemented for Supabase client');
    return false;
  }

  async getNavigationMenu(id: number): Promise<NavigationMenu | undefined> {
    console.log('getNavigationMenu not yet implemented for Supabase client');
    return undefined;
  }

  async getNavigationByLocation(location: string): Promise<NavigationMenu[]> {
    console.log('getNavigationByLocation not yet implemented for Supabase client');
    return [];
  }

  async getAllNavigationMenus(): Promise<NavigationMenu[]> {
    console.log('getAllNavigationMenus not yet implemented for Supabase client');
    return [];
  }

  async createNavigationMenu(insertMenu: InsertNavigationMenu): Promise<NavigationMenu> {
    console.log('createNavigationMenu not yet implemented for Supabase client');
    throw new Error('Not implemented');
  }

  async updateNavigationMenu(id: number, menuUpdate: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined> {
    console.log('updateNavigationMenu not yet implemented for Supabase client');
    return undefined;
  }

  async deleteNavigationMenu(id: number): Promise<boolean> {
    console.log('deleteNavigationMenu not yet implemented for Supabase client');
    return false;
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    console.log('getSiteSetting not yet implemented for Supabase client');
    return undefined;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    console.log('getAllSiteSettings not yet implemented for Supabase client');
    return [];
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    console.log('getSiteSettingsByCategory not yet implemented for Supabase client');
    return [];
  }

  async createSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    console.log('createSiteSetting not yet implemented for Supabase client');
    throw new Error('Not implemented');
  }

  async updateSiteSetting(key: string, settingUpdate: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    console.log('updateSiteSetting not yet implemented for Supabase client');
    return undefined;
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    console.log('deleteSiteSetting not yet implemented for Supabase client');
    return false;
  }

  async createOrUpdateSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    console.log('createOrUpdateSiteSetting not yet implemented for Supabase client');
    throw new Error('Not implemented');
  }

  // Admin Authentication Methods
  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating admin session:', error);
        throw new Error('Failed to create admin session');
      }
      
      return data as AdminSession;
    } catch (error) {
      console.error('Error creating admin session:', error);
      throw new Error('Failed to create admin session');
    }
  }

  async getAdminSessionByToken(token: string): Promise<AdminSession | undefined> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('is_active', true)
        .single();
      
      if (error) {
        return undefined;
      }
      
      return data as AdminSession;
    } catch (error) {
      console.error('Error getting admin session by token:', error);
      return undefined;
    }
  }

  async updateAdminSession(id: number, updates: Partial<AdminSession>): Promise<AdminSession | undefined> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating admin session:', error);
        return undefined;
      }
      
      return data as AdminSession;
    } catch (error) {
      console.error('Error updating admin session:', error);
      return undefined;
    }
  }

  async getActiveAdminSessions(): Promise<AdminSession[]> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting active admin sessions:', error);
        return [];
      }
      
      return data as AdminSession[];
    } catch (error) {
      console.error('Error getting active admin sessions:', error);
      return [];
    }
  }

  async createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .insert(log)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating admin activity log:', error);
        throw new Error('Failed to create admin activity log');
      }
      
      return data as AdminActivityLog;
    } catch (error) {
      console.error('Error creating admin activity log:', error);
      throw new Error('Failed to create admin activity log');
    }
  }

  // ============================================
  // MULTI-ASSESSMENT SYSTEM METHODS
  // ============================================

  // Assessment Types Management
  async getActiveAssessmentTypes(): Promise<AssessmentType[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name');
      
      if (error) {
        console.error('Error getting assessment types:', error);
        return [];
      }
      
      return data as AssessmentType[];
    } catch (error) {
      console.error('Error getting assessment types:', error);
      return [];
    }
  }

  async getAssessmentTypeById(id: string): Promise<AssessmentType | undefined> {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error getting assessment type by id:', error);
        return undefined;
      }
      
      return data as AssessmentType;
    } catch (error) {
      console.error('Error getting assessment type by id:', error);
      return undefined;
    }
  }

  async createAssessmentType(assessmentType: InsertAssessmentType): Promise<AssessmentType> {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .insert(assessmentType)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating assessment type:', error);
        throw new Error('Failed to create assessment type');
      }
      
      return data as AssessmentType;
    } catch (error) {
      console.error('Error creating assessment type:', error);
      throw new Error('Failed to create assessment type');
    }
  }

  // User Assessment Management
  async createUserAssessment(assessment: InsertUserAssessment): Promise<UserAssessment> {
    try {
      const { data, error } = await supabase
        .from('user_assessments')
        .insert(assessment)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user assessment:', error);
        throw new Error('Failed to create user assessment');
      }
      
      return data as UserAssessment;
    } catch (error) {
      console.error('Error creating user assessment:', error);
      throw new Error('Failed to create user assessment');
    }
  }

  async getUserAssessments(userId: string): Promise<UserAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('user_assessments')
        .select(`
          *,
          assessment_types(name, display_name, category)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user assessments:', error);
        return [];
      }
      
      return data as UserAssessment[];
    } catch (error) {
      console.error('Error getting user assessments:', error);
      return [];
    }
  }

  async getAssessmentsForCoach(userId: string, coachType: string): Promise<UserAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('user_assessments')
        .select(`
          *,
          assessment_types!inner(name, display_name, category, coach_types)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .contains('assessment_types.coach_types', [coachType])
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting assessments for coach:', error);
        return [];
      }
      
      return data as UserAssessment[];
    } catch (error) {
      console.error('Error getting assessments for coach:', error);
      return [];
    }
  }

  async getUserAssessmentSummary(userId: string): Promise<any> {
    try {
      const assessments = await this.getUserAssessments(userId);
      
      // Create a summary organized by category
      const summary = assessments.reduce((acc, assessment) => {
        const category = assessment.assessment_types?.category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: assessment.id,
          type: assessment.assessment_types?.display_name,
          completedAt: assessment.completed_at,
          summary: assessment.summary,
          tags: assessment.tags,
        });
        return acc;
      }, {} as Record<string, any[]>);
      
      return {
        userId,
        totalAssessments: assessments.length,
        categories: summary,
        lastAssessment: assessments[0]?.completed_at,
      };
    } catch (error) {
      console.error('Error getting user assessment summary:', error);
      return {
        userId,
        totalAssessments: 0,
        categories: {},
        lastAssessment: null,
      };
    }
  }

  // Coach Interaction Tracking
  async createCoachInteraction(interaction: InsertCoachInteraction): Promise<CoachInteraction> {
    try {
      const { data, error } = await supabase
        .from('coach_interactions')
        .insert(interaction)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating coach interaction:', error);
        throw new Error('Failed to create coach interaction');
      }
      
      return data as CoachInteraction;
    } catch (error) {
      console.error('Error creating coach interaction:', error);
      throw new Error('Failed to create coach interaction');
    }
  }

  async getCoachInteractionHistory(userId: string, coachType?: string): Promise<CoachInteraction[]> {
    try {
      let query = supabase
        .from('coach_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (coachType) {
        query = query.eq('coach_type', coachType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error getting coach interaction history:', error);
        return [];
      }
      
      return data as CoachInteraction[];
    } catch (error) {
      console.error('Error getting coach interaction history:', error);
      return [];
    }
  }

  async getAdminActivityLogs(): Promise<AdminActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) {
        console.error('Error getting admin activity logs:', error);
        return [];
      }
      
      return data as AdminActivityLog[];
    } catch (error) {
      console.error('Error getting admin activity logs:', error);
      return [];
    }
  }

  // Additional User Methods
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting all users:', error);
        return [];
      }
      
      return data as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        return undefined;
      }
      
      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getAllDonations(): Promise<Donation[]> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting all donations:', error);
        return [];
      }
      
      return data as Donation[];
    } catch (error) {
      console.error('Error getting all donations:', error);
      return [];
    }
  }

  // Comprehensive Admin Portal Methods Implementation
  async getTotalUsers(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error getting total users:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0;
    }
  }

  async getTotalDonations(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error getting total donations:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting total donations:', error);
      return 0;
    }
  }

  async getTotalBookings(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error getting total bookings:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting total bookings:', error);
      return 0;
    }
  }

  async getActiveCoaches(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) {
        console.error('Error getting active coaches:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting active coaches:', error);
      return 0;
    }
  }

  async getMonthlyRevenue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq('status', 'completed');
      
      if (error) {
        console.error('Error getting monthly revenue:', error);
        return 0;
      }
      
      return data.reduce((total, donation) => total + (donation.amount || 0), 0);
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return 0;
    }
  }

  async getNewUsersToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      if (error) {
        console.error('Error getting new users today:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting new users today:', error);
      return 0;
    }
  }

  async getPendingBookings(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error getting pending bookings:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting pending bookings:', error);
      return 0;
    }
  }

  async getCompletedSessions(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('coaching_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      if (error) {
        console.error('Error getting completed sessions:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error getting completed sessions:', error);
      return 0;
    }
  }

  async getAllDonationsWithUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting donations with users:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting donations with users:', error);
      return [];
    }
  }

  async getAllCoaches(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting all coaches:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting all coaches:', error);
      return [];
    }
  }

  async updateCoach(id: number, updateData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating coach:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating coach:', error);
      throw error;
    }
  }

  async getAdminActivityLogs(limit: number, offset: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin_users (
            username,
            email
          )
        `)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error getting admin activity logs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting admin activity logs:', error);
      return [];
    }
  }

  // Stub implementations for comprehensive functionality
  async getAllAdminSessions(): Promise<any[]> { return []; }
  async terminateAdminSession(id: string): Promise<void> { }
  async generateUserReport(startDate: string, endDate: string): Promise<any> { return {}; }
  async generateFinancialReport(startDate: string, endDate: string): Promise<any> { return {}; }
  async generateCoachingReport(startDate: string, endDate: string): Promise<any> { return {}; }
  async processPendingDonations(): Promise<any> { return { processed: 0 }; }
  async assignCoachesToBookings(): Promise<any> { return { assigned: 0 }; }
  async sendFollowUpEmails(): Promise<any> { return { sent: 0 }; }
  async updateUserSegments(): Promise<any> { return { updated: 0 }; }
  async sendMarketingNotification(userSegment: string, template: string, subject: string, content: string): Promise<any> { return { sent: 0 }; }
  async scheduleContentPublication(contentId: string, publishDate: string): Promise<any> { return { scheduled: true }; }
  async addRewardPoints(userId: string, points: number, reason: string): Promise<any> { return { success: true }; }
  async getSystemAlerts(): Promise<any[]> { return []; }
  async createAdminNotification(data: any): Promise<any> { return data; }
  async exportUserData(format: string): Promise<string> { return format === 'csv' ? 'name,email\n' : '[]'; }

  // Admin Authentication Extended
  async getAdminByUsername(username: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) {
        console.error('Error getting admin by username:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting admin by username:', error);
      return null;
    }
  }

  async updateAdminLastLogin(adminId: string): Promise<void> {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminId);
    } catch (error) {
      console.error('Error updating admin last login:', error);
    }
  }

  async getAdminPermissions(adminId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('admin_id', adminId);
      
      if (error) {
        console.error('Error getting admin permissions:', error);
        return [];
      }
      
      return data.map(p => p.permission);
    } catch (error) {
      console.error('Error getting admin permissions:', error);
      return [];
    }
  }

  async createAdminSession(session: any): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .insert(session);
    } catch (error) {
      console.error('Error creating admin session:', error);
    }
  }

  async getAdminSession(token: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('id', token)
        .single();
      
      if (error) {
        console.error('Error getting admin session:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting admin session:', error);
      return null;
    }
  }

  async getAdminById(adminId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', adminId)
        .single();
      
      if (error) {
        console.error('Error getting admin by id:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting admin by id:', error);
      return null;
    }
  }

  async createAdminActivityLog(log: any): Promise<void> {
    try {
      await supabase
        .from('admin_activity_log')
        .insert(log);
    } catch (error) {
      console.error('Error creating admin activity log:', error);
    }
  }

  async deactivateAdminSession(token: string): Promise<void> {
    try {
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('id', token);
    } catch (error) {
      console.error('Error deactivating admin session:', error);
    }
  }

  // User Authentication Extended
  async getUserById(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting user by id:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user last login:', error);
    }
  }

  // Coach Portal stub implementations
  async getCoachProfile(userId: string): Promise<any> { return {}; }
  async updateCoachProfile(userId: string, data: any): Promise<any> { return data; }
  async getCoachClients(userId: string): Promise<any[]> { return []; }
  async getCoachClient(userId: string, clientId: string): Promise<any> { return {}; }
  async updateCoachClient(userId: string, clientId: string, data: any): Promise<any> { return data; }
  async getCoachSessionNotes(userId: string, options: any): Promise<any[]> { return []; }
  async createSessionNote(data: any): Promise<any> { return data; }
  async getSessionNote(userId: string, noteId: number): Promise<any> { return {}; }
  async updateSessionNote(userId: string, noteId: number, data: any): Promise<any> { return data; }
  async getCoachAvailability(userId: string): Promise<any> { return {}; }
  async updateCoachAvailability(userId: string, data: any): Promise<any> { return data; }
  async getCoachMessageTemplates(userId: string): Promise<any[]> { return []; }
  async createMessageTemplate(data: any): Promise<any> { return data; }
  async updateMessageTemplate(userId: string, templateId: number, data: any): Promise<any> { return data; }
  async deleteMessageTemplate(userId: string, templateId: number): Promise<void> { }
  async getCoachClientCommunications(userId: string, options: any): Promise<any[]> { return []; }
  async createClientCommunication(data: any): Promise<any> { return data; }
  async getCoachMetrics(userId: string, period: string): Promise<any> { return {}; }
  async getCoachTotalClients(userId: string): Promise<number> { return 0; }
  async getCoachActiveSessions(userId: string): Promise<number> { return 0; }
  async getCoachCompletedSessions(userId: string): Promise<number> { return 0; }
  async getCoachAverageRating(userId: string): Promise<number> { return 0; }
  async getCoachMonthlyRevenue(userId: string): Promise<number> { return 0; }
  async getCoachUpcomingSessions(userId: string): Promise<any[]> { return []; }
  async getCoachRecentActivity(userId: string): Promise<any[]> { return []; }
  async getCoachCredentials(userId: string): Promise<any[]> { return []; }
  async createCoachCredential(data: any): Promise<any> { return data; }
  async getCoachBanking(userId: string): Promise<any> { return {}; }
  async updateCoachBanking(userId: string, data: any): Promise<any> { return data; }
  async getCoachSchedule(userId: string, startDate: string, endDate: string): Promise<any> { return {}; }
  async blockCoachTime(userId: string, startTime: string, endTime: string, reason: string): Promise<any> { return {}; }
  async exportCoachClientData(userId: string, format: string): Promise<string> { return format === 'csv' ? 'name,email\n' : '[]'; }
  async exportCoachSessionData(userId: string, format: string, startDate: string, endDate: string): Promise<string> { return format === 'csv' ? 'date,client,duration\n' : '[]'; }

  // Donation Portal stub implementations
  async getDonationPresets(): Promise<any[]> { return [{ amount: 25 }, { amount: 50 }, { amount: 100 }]; }
  async getActiveCampaigns(): Promise<any[]> { return []; }
  async getMembershipBenefits(): Promise<any[]> { return []; }
  async getImpactMetrics(): Promise<any> { return {}; }
  async getUserDonations(userId: string): Promise<any[]> { return []; }
  async createDonation(data: any): Promise<any> { return { ...data, id: randomUUID() }; }
  async updateDonation(donationId: string, data: any): Promise<any> { return data; }
  async getDonationByStripeSession(sessionId: string): Promise<any> { return {}; }
  async createCampaign(data: any): Promise<any> { return data; }
  async updateCampaign(campaignId: string, data: any): Promise<any> { return data; }
  async getTotalDonationsRaised(): Promise<number> { return 0; }
  async getTotalDonors(): Promise<number> { return 0; }
  async getAverageDonationAmount(): Promise<number> { return 0; }
  async getMonthlyDonationTrend(): Promise<any[]> { return []; }
  async getTopCampaigns(): Promise<any[]> { return []; }
  async getMembershipDistribution(): Promise<any> { return {}; }
  async getUserTotalContributed(userId: string): Promise<number> { return 0; }
  async getUserRewardPoints(userId: string): Promise<number> { return 0; }
  async getUserMembershipLevel(userId: string): Promise<string> { return 'free'; }
  async getUserImpactMetrics(userId: string): Promise<any> { return {}; }
  async getUserDonationHistory(userId: string): Promise<any[]> { return []; }
  async getAvailableRewards(userId: string): Promise<any[]> { return []; }
  async redeemRewardPoints(userId: string, rewardId: string, pointsCost: number): Promise<any> { return {}; }
  async updateDonationSubscription(userId: string, subscriptionId: string, data: any): Promise<any> { return data; }
  async updateUserMembershipLevel(userId: string): Promise<void> { }

  // Onboarding & Account Management Implementation
  async createUserOnboardingSteps(userId: string, steps: any[]): Promise<void> {
    try {
      const stepsWithUserId = steps.map(step => ({ ...step, userId }));
      await supabase.from('user_onboarding_steps').insert(stepsWithUserId);
    } catch (error) {
      console.error('Error creating onboarding steps:', error);
    }
  }

  async getUserOnboardingSteps(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding_steps')
        .select('*')
        .eq('userId', userId)
        .order('order', { ascending: true });
      
      if (error) {
        console.error('Error getting onboarding steps:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting onboarding steps:', error);
      return [];
    }
  }

  async updateOnboardingStep(userId: string, stepId: string, updates: any): Promise<void> {
    try {
      await supabase
        .from('user_onboarding_steps')
        .update(updates)
        .eq('userId', userId)
        .eq('id', stepId);
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  }

  async markUserOnboardingComplete(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  }

  async updateUserCoachingPreferences(userId: string, preferences: string[]): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ coaching_preferences: preferences })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating coaching preferences:', error);
    }
  }

  async createEmailVerificationToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('email_verification_tokens')
        .insert({
          userId,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
    } catch (error) {
      console.error('Error creating email verification token:', error);
    }
  }

  async getEmailVerificationToken(token: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .gte('expiresAt', new Date().toISOString())
        .single();
      
      if (error) {
        console.error('Error getting email verification token:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting email verification token:', error);
      return null;
    }
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    try {
      await supabase
        .from('email_verification_tokens')
        .delete()
        .eq('token', token);
    } catch (error) {
      console.error('Error deleting email verification token:', error);
    }
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ email_verified: true, email_verified_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error marking email as verified:', error);
    }
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      await supabase
        .from('password_reset_tokens')
        .insert({
          userId,
          token,
          expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Error creating password reset token:', error);
    }
  }

  async getPasswordResetToken(token: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .gte('expiresAt', new Date().toISOString())
        .single();
      
      if (error) {
        console.error('Error getting password reset token:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting password reset token:', error);
      return null;
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    try {
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token);
    } catch (error) {
      console.error('Error deleting password reset token:', error);
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ passwordHash: hashedPassword, password_reset_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating user password:', error);
    }
  }

  // Mental Wellness Resource Hub Implementation
  async getMentalWellnessResources(filters?: {
    category?: string;
    targetAudience?: string;
    resourceType?: string;
    isEmergency?: boolean;
  }): Promise<MentalWellnessResource[]> {
    try {
      let query = supabase
        .from('mental_wellness_resources')
        .select('*')
        .eq('is_active', true);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.targetAudience) {
        query = query.eq('target_audience', filters.targetAudience);
      }
      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters?.isEmergency !== undefined) {
        query = query.eq('is_emergency', filters.isEmergency);
      }

      const { data, error } = await query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
      
      if (error) {
        console.error('Error getting mental wellness resources:', error);
        return [];
      }
      
      return data as MentalWellnessResource[];
    } catch (error) {
      console.error('Error getting mental wellness resources:', error);
      return [];
    }
  }

  async getMentalWellnessResource(id: number): Promise<MentalWellnessResource | undefined> {
    try {
      const { data, error } = await supabase
        .from('mental_wellness_resources')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting mental wellness resource:', error);
        return undefined;
      }
      
      return data as MentalWellnessResource;
    } catch (error) {
      console.error('Error getting mental wellness resource:', error);
      return undefined;
    }
  }

  async createMentalWellnessResource(resource: InsertMentalWellnessResource): Promise<MentalWellnessResource> {
    try {
      const { data, error } = await supabase
        .from('mental_wellness_resources')
        .insert(resource)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating mental wellness resource:', error);
        throw error;
      }
      
      return data as MentalWellnessResource;
    } catch (error) {
      console.error('Error creating mental wellness resource:', error);
      throw error;
    }
  }

  async updateMentalWellnessResource(id: number, updates: Partial<InsertMentalWellnessResource>): Promise<MentalWellnessResource | undefined> {
    try {
      const { data, error } = await supabase
        .from('mental_wellness_resources')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating mental wellness resource:', error);
        return undefined;
      }
      
      return data as MentalWellnessResource;
    } catch (error) {
      console.error('Error updating mental wellness resource:', error);
      return undefined;
    }
  }

  async incrementResourceUsage(id: number): Promise<void> {
    try {
      await supabase.rpc('increment_resource_usage', { resource_id: id });
    } catch (error) {
      console.error('Error incrementing resource usage:', error);
    }
  }

  async getEmergencyContacts(filters?: {
    specialty?: string;
    location?: string;
  }): Promise<EmergencyContact[]> {
    try {
      let query = supabase
        .from('emergency_contacts')
        .select('*')
        .eq('is_active', true);

      if (filters?.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters?.location) {
        query = query.or(`state.eq.${filters.location},city.eq.${filters.location},is_national.eq.true`);
      }

      const { data, error } = await query.order('sort_order').order('name');
      
      if (error) {
        console.error('Error getting emergency contacts:', error);
        return [];
      }
      
      return data as EmergencyContact[];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting emergency contact:', error);
        return undefined;
      }
      
      return data as EmergencyContact;
    } catch (error) {
      console.error('Error getting emergency contact:', error);
      return undefined;
    }
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating emergency contact:', error);
        throw error;
      }
      
      return data as EmergencyContact;
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      throw error;
    }
  }

  async createWellnessAssessment(assessment: InsertWellnessAssessment): Promise<WellnessAssessment> {
    try {
      const { data, error } = await supabase
        .from('wellness_assessments')
        .insert(assessment)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating wellness assessment:', error);
        throw error;
      }
      
      return data as WellnessAssessment;
    } catch (error) {
      console.error('Error creating wellness assessment:', error);
      throw error;
    }
  }

  async getWellnessAssessment(id: number): Promise<WellnessAssessment | undefined> {
    try {
      const { data, error } = await supabase
        .from('wellness_assessments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting wellness assessment:', error);
        return undefined;
      }
      
      return data as WellnessAssessment;
    } catch (error) {
      console.error('Error getting wellness assessment:', error);
      return undefined;
    }
  }

  async getUserWellnessAssessments(userId: string): Promise<WellnessAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('wellness_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user wellness assessments:', error);
        return [];
      }
      
      return data as WellnessAssessment[];
    } catch (error) {
      console.error('Error getting user wellness assessments:', error);
      return [];
    }
  }

  async getPersonalizedRecommendations(filters: {
    userId?: string;
    sessionId?: string;
    category?: string;
    assessmentType?: string;
  }): Promise<PersonalizedRecommendation[]> {
    try {
      let query = supabase
        .from('personalized_recommendations')
        .select(`
          *,
          mental_wellness_resources (*)
        `)
        .gte('expires_at', new Date().toISOString());

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      const { data, error } = await query
        .order('recommendation_score', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error getting personalized recommendations:', error);
        return [];
      }
      
      return data as PersonalizedRecommendation[];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  async createPersonalizedRecommendation(recommendation: InsertPersonalizedRecommendation): Promise<PersonalizedRecommendation> {
    try {
      const { data, error } = await supabase
        .from('personalized_recommendations')
        .insert(recommendation)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating personalized recommendation:', error);
        throw error;
      }
      
      return data as PersonalizedRecommendation;
    } catch (error) {
      console.error('Error creating personalized recommendation:', error);
      throw error;
    }
  }

  async trackResourceUsage(usage: InsertResourceUsageAnalytics): Promise<ResourceUsageAnalytics> {
    try {
      const { data, error } = await supabase
        .from('resource_usage_analytics')
        .insert(usage)
        .select()
        .single();
      
      if (error) {
        console.error('Error tracking resource usage:', error);
        throw error;
      }
      
      // Increment usage count for the resource
      await this.incrementResourceUsage(usage.resourceId);
      
      return data as ResourceUsageAnalytics;
    } catch (error) {
      console.error('Error tracking resource usage:', error);
      throw error;
    }
  }

  async getResourceUsageAnalytics(resourceId: number): Promise<ResourceUsageAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('resource_usage_analytics')
        .select('*')
        .eq('resource_id', resourceId)
        .order('accessed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting resource usage analytics:', error);
        return [];
      }
      
      return data as ResourceUsageAnalytics[];
    } catch (error) {
      console.error('Error getting resource usage analytics:', error);
      return [];
    }
  }

  async getQuickAccessResources(): Promise<{
    emergency: EmergencyContact[];
    crisis: MentalWellnessResource[];
    popular: MentalWellnessResource[];
    featured: MentalWellnessResource[];
  }> {
    try {
      const [emergency, crisis, popular, featured] = await Promise.all([
        this.getEmergencyContacts(),
        this.getMentalWellnessResources({ category: 'crisis' }),
        supabase
          .from('mental_wellness_resources')
          .select('*')
          .eq('is_active', true)
          .order('usage_count', { ascending: false })
          .limit(6)
          .then(({ data }) => data as MentalWellnessResource[] || []),
        this.getMentalWellnessResources({ isEmergency: false })
          .then(resources => resources.filter(r => r.isFeatured).slice(0, 6))
      ]);

      return {
        emergency: emergency.slice(0, 3),
        crisis: crisis.slice(0, 4),
        popular: popular.slice(0, 6),
        featured: featured.slice(0, 6)
      };
    } catch (error) {
      console.error('Error getting quick access resources:', error);
      return {
        emergency: [],
        crisis: [],
        popular: [],
        featured: []
      };
    }
  }

  // Assessment Programs
  async getProgram(id: string): Promise<Program | undefined> {
    try {
      const { data, error } = await supabase
        .from('assessment_programs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting program:', error);
        return undefined;
      }
      
      return data as Program;
    } catch (error) {
      console.error('Error getting program:', error);
      return undefined;
    }
  }

  async getUserPrograms(userId: string): Promise<Program[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user programs:', error);
        return [];
      }
      
      return data as Program[];
    } catch (error) {
      console.error('Error getting user programs:', error);
      return [];
    }
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    try {
      const dbProgram = {
        id: randomUUID(),
        user_id: program.userId,
        program_type: program.programType,
        results: program.results,
        payment_required: program.paymentRequired || false,
        payment_completed: program.paymentCompleted || false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('assessment_programs')
        .insert(dbProgram)
        .select()
        .single();

      if (error) {
        console.error('Error creating program:', error);
        throw new Error('Failed to create program');
      }

      return {
        id: data.id,
        userId: data.user_id,
        programType: data.program_type,
        results: data.results,
        paymentRequired: data.payment_required,
        paymentCompleted: data.payment_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as Program;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined> {
    try {
      const updateData = {
        ...(program.programType && { program_type: program.programType }),
        ...(program.results && { results: program.results }),
        ...(program.paymentRequired !== undefined && { payment_required: program.paymentRequired }),
        ...(program.paymentCompleted !== undefined && { payment_completed: program.paymentCompleted }),
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('assessment_programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating program:', error);
        return undefined;
      }

      return {
        id: data.id,
        userId: data.user_id,
        programType: data.program_type,
        results: data.results,
        paymentRequired: data.payment_required,
        paymentCompleted: data.payment_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as Program;
    } catch (error) {
      console.error('Error updating program:', error);
      return undefined;
    }
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting chat session:', error);
        return undefined;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ChatSession;
    } catch (error) {
      console.error('Error getting chat session:', error);
      return undefined;
    }
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user chat sessions:', error);
        return [];
      }
      
      return data.map(session => ({
        id: session.id,
        userId: session.user_id,
        threadId: session.thread_id,
        sessionType: session.session_type,
        metadata: session.metadata,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      })) as ChatSession[];
    } catch (error) {
      console.error('Error getting user chat sessions:', error);
      return [];
    }
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    try {
      const dbSession = {
        id: randomUUID(),
        user_id: session.userId,
        thread_id: session.threadId,
        session_type: session.sessionType,
        metadata: session.metadata || {},
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(dbSession)
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        throw new Error('Failed to create chat session');
      }

      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ChatSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  async getChatSessionByThreadId(threadId: string): Promise<ChatSession | undefined> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('thread_id', threadId)
        .single();
      
      if (error) {
        console.error('Error getting chat session by thread ID:', error);
        return undefined;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ChatSession;
    } catch (error) {
      console.error('Error getting chat session by thread ID:', error);
      return undefined;
    }
  }

  // Chat Messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error getting chat message:', error);
        return undefined;
      }
      
      return {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        content: data.content,
        messageType: data.message_type,
        metadata: data.metadata,
        createdAt: data.created_at
      } as ChatMessage;
    } catch (error) {
      console.error('Error getting chat message:', error);
      return undefined;
    }
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error getting chat messages:', error);
        return [];
      }
      
      return data.map(message => ({
        id: message.id,
        sessionId: message.session_id,
        userId: message.user_id,
        content: message.content,
        messageType: message.message_type,
        metadata: message.metadata,
        createdAt: message.created_at
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const dbMessage = {
        id: randomUUID(),
        session_id: message.sessionId,
        user_id: message.userId,
        content: message.content,
        message_type: message.messageType,
        metadata: message.metadata || {},
        created_at: new Date()
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(dbMessage)
        .select()
        .single();

      if (error) {
        console.error('Error creating chat message:', error);
        throw new Error('Failed to create chat message');
      }

      return {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        content: data.content,
        messageType: data.message_type,
        metadata: data.metadata,
        createdAt: data.created_at
      } as ChatMessage;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseClientStorage();