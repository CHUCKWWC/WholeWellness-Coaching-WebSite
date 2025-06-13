import { db } from "./db";
import { 
  users, bookings, testimonials, resources, contacts, weightLossIntakes,
  contentPages, contentBlocks, mediaLibrary, navigationMenus, siteSettings,
  type User, type Booking, type Testimonial, type Resource, type Contact, type WeightLossIntake,
  type InsertUser, type InsertBooking, type InsertTestimonial, type InsertResource, type InsertContact, type InsertWeightLossIntake,
  type ContentPage, type ContentBlock, type MediaItem, type NavigationMenu, type SiteSetting,
  type InsertContentPage, type InsertContentBlock, type InsertMediaItem, type InsertNavigationMenu, type InsertSiteSetting
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

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
}

export class SupabaseStorage implements IStorage {
  
  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          id: randomUUID()
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
      return booking || undefined;
    } catch (error) {
      console.error('Error getting booking:', error);
      return undefined;
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      return await db.select().from(bookings);
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      const [booking] = await db
        .insert(bookings)
        .values(insertBooking)
        .returning();
      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    try {
      const [booking] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, id))
        .returning();
      return booking || undefined;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    try {
      const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
      return testimonial || undefined;
    } catch (error) {
      console.error('Error getting testimonial:', error);
      return undefined;
    }
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    try {
      return await db.select().from(testimonials).where(eq(testimonials.isApproved, true));
    } catch (error) {
      console.error('Error getting approved testimonials:', error);
      return [];
    }
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      return await db.select().from(testimonials);
    } catch (error) {
      console.error('Error getting all testimonials:', error);
      return [];
    }
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    try {
      const [testimonial] = await db
        .insert(testimonials)
        .values(insertTestimonial)
        .returning();
      return testimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    try {
      const [resource] = await db.select().from(resources).where(eq(resources.id, id));
      return resource || undefined;
    } catch (error) {
      console.error('Error getting resource:', error);
      return undefined;
    }
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    try {
      return await db.select().from(resources).where(eq(resources.type, type));
    } catch (error) {
      console.error('Error getting resources by type:', error);
      return [];
    }
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    try {
      return await db.select().from(resources).where(eq(resources.category, category));
    } catch (error) {
      console.error('Error getting resources by category:', error);
      return [];
    }
  }

  async getAllResources(): Promise<Resource[]> {
    try {
      return await db.select().from(resources);
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    try {
      const [resource] = await db
        .insert(resources)
        .values(insertResource)
        .returning();
      return resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    try {
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
      return contact || undefined;
    } catch (error) {
      console.error('Error getting contact:', error);
      return undefined;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      return await db.select().from(contacts);
    } catch (error) {
      console.error('Error getting all contacts:', error);
      return [];
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    try {
      const [contact] = await db
        .insert(contacts)
        .values(insertContact)
        .returning();
      return contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    try {
      const [intake] = await db.select().from(weightLossIntakes).where(eq(weightLossIntakes.id, id));
      return intake || undefined;
    } catch (error) {
      console.error('Error getting weight loss intake:', error);
      return undefined;
    }
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    try {
      return await db.select().from(weightLossIntakes);
    } catch (error) {
      console.error('Error getting all weight loss intakes:', error);
      return [];
    }
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    try {
      const [intake] = await db
        .insert(weightLossIntakes)
        .values(insertIntake)
        .returning();
      return intake;
    } catch (error) {
      console.error('Error creating weight loss intake:', error);
      throw error;
    }
  }

  // CMS - Content Pages
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    try {
      const [page] = await db.select().from(contentPages).where(eq(contentPages.id, id));
      return page || undefined;
    } catch (error) {
      console.error('Error getting content page:', error);
      return undefined;
    }
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    try {
      const [page] = await db.select().from(contentPages).where(eq(contentPages.slug, slug));
      return page || undefined;
    } catch (error) {
      console.error('Error getting content page by slug:', error);
      return undefined;
    }
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    try {
      return await db.select().from(contentPages);
    } catch (error) {
      console.error('Error getting all content pages:', error);
      return [];
    }
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    try {
      return await db.select().from(contentPages).where(eq(contentPages.isPublished, true));
    } catch (error) {
      console.error('Error getting published content pages:', error);
      return [];
    }
  }

  async createContentPage(insertPage: InsertContentPage): Promise<ContentPage> {
    try {
      const [page] = await db
        .insert(contentPages)
        .values(insertPage)
        .returning();
      return page;
    } catch (error) {
      console.error('Error creating content page:', error);
      throw error;
    }
  }

  async updateContentPage(id: number, pageUpdate: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    try {
      const [page] = await db
        .update(contentPages)
        .set({ ...pageUpdate, updatedAt: new Date() })
        .where(eq(contentPages.id, id))
        .returning();
      return page || undefined;
    } catch (error) {
      console.error('Error updating content page:', error);
      return undefined;
    }
  }

  async deleteContentPage(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(contentPages)
        .where(eq(contentPages.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting content page:', error);
      return false;
    }
  }

  // CMS - Content Blocks
  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    try {
      const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, id));
      return block || undefined;
    } catch (error) {
      console.error('Error getting content block:', error);
      return undefined;
    }
  }

  async getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]> {
    try {
      return await db.select().from(contentBlocks).where(eq(contentBlocks.pageId, pageId));
    } catch (error) {
      console.error('Error getting content blocks by page ID:', error);
      return [];
    }
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    try {
      const [block] = await db
        .insert(contentBlocks)
        .values(insertBlock)
        .returning();
      return block;
    } catch (error) {
      console.error('Error creating content block:', error);
      throw error;
    }
  }

  async updateContentBlock(id: number, blockUpdate: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    try {
      const [block] = await db
        .update(contentBlocks)
        .set({ ...blockUpdate, updatedAt: new Date() })
        .where(eq(contentBlocks.id, id))
        .returning();
      return block || undefined;
    } catch (error) {
      console.error('Error updating content block:', error);
      return undefined;
    }
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(contentBlocks)
        .where(eq(contentBlocks.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting content block:', error);
      return false;
    }
  }

  // CMS - Media Library
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    try {
      const [media] = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id));
      return media || undefined;
    } catch (error) {
      console.error('Error getting media item:', error);
      return undefined;
    }
  }

  async getAllMediaItems(): Promise<MediaItem[]> {
    try {
      return await db.select().from(mediaLibrary);
    } catch (error) {
      console.error('Error getting all media items:', error);
      return [];
    }
  }

  async getMediaByCategory(category: string): Promise<MediaItem[]> {
    try {
      return await db.select().from(mediaLibrary).where(eq(mediaLibrary.category, category));
    } catch (error) {
      console.error('Error getting media by category:', error);
      return [];
    }
  }

  async createMediaItem(insertMedia: InsertMediaItem): Promise<MediaItem> {
    try {
      const [media] = await db
        .insert(mediaLibrary)
        .values(insertMedia)
        .returning();
      return media;
    } catch (error) {
      console.error('Error creating media item:', error);
      throw error;
    }
  }

  async updateMediaItem(id: number, mediaUpdate: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    try {
      const [media] = await db
        .update(mediaLibrary)
        .set({ ...mediaUpdate, updatedAt: new Date() })
        .where(eq(mediaLibrary.id, id))
        .returning();
      return media || undefined;
    } catch (error) {
      console.error('Error updating media item:', error);
      return undefined;
    }
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(mediaLibrary)
        .where(eq(mediaLibrary.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting media item:', error);
      return false;
    }
  }

  // CMS - Navigation
  async getNavigationMenu(id: number): Promise<NavigationMenu | undefined> {
    try {
      const [menu] = await db.select().from(navigationMenus).where(eq(navigationMenus.id, id));
      return menu || undefined;
    } catch (error) {
      console.error('Error getting navigation menu:', error);
      return undefined;
    }
  }

  async getNavigationByLocation(location: string): Promise<NavigationMenu[]> {
    try {
      return await db.select().from(navigationMenus).where(eq(navigationMenus.menuLocation, location));
    } catch (error) {
      console.error('Error getting navigation by location:', error);
      return [];
    }
  }

  async getAllNavigationMenus(): Promise<NavigationMenu[]> {
    try {
      return await db.select().from(navigationMenus);
    } catch (error) {
      console.error('Error getting all navigation menus:', error);
      return [];
    }
  }

  async createNavigationMenu(insertMenu: InsertNavigationMenu): Promise<NavigationMenu> {
    try {
      const [menu] = await db
        .insert(navigationMenus)
        .values(insertMenu)
        .returning();
      return menu;
    } catch (error) {
      console.error('Error creating navigation menu:', error);
      throw error;
    }
  }

  async updateNavigationMenu(id: number, menuUpdate: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined> {
    try {
      const [menu] = await db
        .update(navigationMenus)
        .set({ ...menuUpdate, updatedAt: new Date() })
        .where(eq(navigationMenus.id, id))
        .returning();
      return menu || undefined;
    } catch (error) {
      console.error('Error updating navigation menu:', error);
      return undefined;
    }
  }

  async deleteNavigationMenu(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(navigationMenus)
        .where(eq(navigationMenus.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting navigation menu:', error);
      return false;
    }
  }

  // CMS - Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    try {
      const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
      return setting || undefined;
    } catch (error) {
      console.error('Error getting site setting:', error);
      return undefined;
    }
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    try {
      return await db.select().from(siteSettings);
    } catch (error) {
      console.error('Error getting all site settings:', error);
      return [];
    }
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    try {
      return await db.select().from(siteSettings).where(eq(siteSettings.category, category));
    } catch (error) {
      console.error('Error getting site settings by category:', error);
      return [];
    }
  }

  async createSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    try {
      const [setting] = await db
        .insert(siteSettings)
        .values(insertSetting)
        .returning();
      return setting;
    } catch (error) {
      console.error('Error creating site setting:', error);
      throw error;
    }
  }

  async updateSiteSetting(key: string, settingUpdate: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    try {
      const [setting] = await db
        .update(siteSettings)
        .set({ ...settingUpdate, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return setting || undefined;
    } catch (error) {
      console.error('Error updating site setting:', error);
      return undefined;
    }
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    try {
      const result = await db
        .delete(siteSettings)
        .where(eq(siteSettings.key, key));
      return true;
    } catch (error) {
      console.error('Error deleting site setting:', error);
      return false;
    }
  }
}

export const storage = new SupabaseStorage();