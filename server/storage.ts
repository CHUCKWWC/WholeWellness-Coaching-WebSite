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

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials)
      .where(eq(testimonials.isApproved, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(eq(resources.type, type))
      .orderBy(desc(resources.createdAt));
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(eq(resources.category, category))
      .orderBy(desc(resources.createdAt));
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(insertResource)
      .returning();
    return resource;
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    const [intake] = await db.select().from(weightLossIntakes).where(eq(weightLossIntakes.id, id));
    return intake || undefined;
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    return await db.select().from(weightLossIntakes).orderBy(desc(weightLossIntakes.createdAt));
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    const [intake] = await db
      .insert(weightLossIntakes)
      .values(insertIntake)
      .returning();
    return intake;
  }

  // CMS - Content Pages
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    const [page] = await db.select().from(contentPages).where(eq(contentPages.id, id));
    return page || undefined;
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    const [page] = await db.select().from(contentPages).where(eq(contentPages.slug, slug));
    return page || undefined;
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    return await db.select().from(contentPages).orderBy(desc(contentPages.createdAt));
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    return await db.select().from(contentPages)
      .where(eq(contentPages.isPublished, true))
      .orderBy(desc(contentPages.createdAt));
  }

  async createContentPage(insertPage: InsertContentPage): Promise<ContentPage> {
    const [page] = await db
      .insert(contentPages)
      .values(insertPage)
      .returning();
    return page;
  }

  async updateContentPage(id: number, pageUpdate: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    const [page] = await db
      .update(contentPages)
      .set(pageUpdate)
      .where(eq(contentPages.id, id))
      .returning();
    return page || undefined;
  }

  async deleteContentPage(id: number): Promise<boolean> {
    const result = await db.delete(contentPages).where(eq(contentPages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // CMS - Content Blocks
  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, id));
    return block || undefined;
  }

  async getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]> {
    return await db.select().from(contentBlocks)
      .where(eq(contentBlocks.pageId, pageId))
      .orderBy(asc(contentBlocks.order));
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    const [block] = await db
      .insert(contentBlocks)
      .values(insertBlock)
      .returning();
    return block;
  }

  async updateContentBlock(id: number, blockUpdate: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const [block] = await db
      .update(contentBlocks)
      .set(blockUpdate)
      .where(eq(contentBlocks.id, id))
      .returning();
    return block || undefined;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    const result = await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // CMS - Media Library
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [media] = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id));
    return media || undefined;
  }

  async getAllMediaItems(): Promise<MediaItem[]> {
    return await db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
  }

  async getMediaByCategory(category: string): Promise<MediaItem[]> {
    return await db.select().from(mediaLibrary)
      .where(eq(mediaLibrary.category, category))
      .orderBy(desc(mediaLibrary.createdAt));
  }

  async createMediaItem(insertMedia: InsertMediaItem): Promise<MediaItem> {
    const [media] = await db
      .insert(mediaLibrary)
      .values(insertMedia)
      .returning();
    return media;
  }

  async updateMediaItem(id: number, mediaUpdate: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const [media] = await db
      .update(mediaLibrary)
      .set(mediaUpdate)
      .where(eq(mediaLibrary.id, id))
      .returning();
    return media || undefined;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // CMS - Navigation
  async getNavigationMenu(id: number): Promise<NavigationMenu | undefined> {
    const [menu] = await db.select().from(navigationMenus).where(eq(navigationMenus.id, id));
    return menu || undefined;
  }

  async getNavigationByLocation(location: string): Promise<NavigationMenu[]> {
    return await db.select().from(navigationMenus)
      .where(eq(navigationMenus.menuLocation, location))
      .orderBy(asc(navigationMenus.order));
  }

  async getAllNavigationMenus(): Promise<NavigationMenu[]> {
    return await db.select().from(navigationMenus).orderBy(asc(navigationMenus.order));
  }

  async createNavigationMenu(insertMenu: InsertNavigationMenu): Promise<NavigationMenu> {
    const [menu] = await db
      .insert(navigationMenus)
      .values(insertMenu)
      .returning();
    return menu;
  }

  async updateNavigationMenu(id: number, menuUpdate: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined> {
    const [menu] = await db
      .update(navigationMenus)
      .set(menuUpdate)
      .where(eq(navigationMenus.id, id))
      .returning();
    return menu || undefined;
  }

  async deleteNavigationMenu(id: number): Promise<boolean> {
    const result = await db.delete(navigationMenus).where(eq(navigationMenus.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // CMS - Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(asc(siteSettings.category));
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings)
      .where(eq(siteSettings.category, category))
      .orderBy(asc(siteSettings.key));
  }

  async createSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values(insertSetting)
      .returning();
    return setting;
  }

  async updateSiteSetting(key: string, settingUpdate: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .update(siteSettings)
      .set(settingUpdate)
      .where(eq(siteSettings.key, key))
      .returning();
    return setting || undefined;
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();