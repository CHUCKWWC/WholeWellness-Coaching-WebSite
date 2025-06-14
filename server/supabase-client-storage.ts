import { supabase } from "./supabase";
import { randomUUID } from "crypto";
import type { 
  User, Booking, Testimonial, Resource, Contact, WeightLossIntake,
  InsertUser, InsertBooking, InsertTestimonial, InsertResource, InsertContact, InsertWeightLossIntake,
  ContentPage, ContentBlock, MediaItem, NavigationMenu, SiteSetting,
  InsertContentPage, InsertContentBlock, InsertMediaItem, InsertNavigationMenu, InsertSiteSetting,
  AdminSession, AdminActivityLog, InsertAdminSession, InsertAdminActivityLog,
  Donation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class SupabaseClientStorage implements IStorage {
  
  // Users
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
      
      return data as User;
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
      
      return data as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...insertUser,
          id: randomUUID()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
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
}

export const storage = new SupabaseClientStorage();