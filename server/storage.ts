import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, bookings, testimonials, resources, contacts, weightLossIntakes,
  type User, type Booking, type Testimonial, type Resource, type Contact, type WeightLossIntake,
  type InsertUser, type InsertBooking, type InsertTestimonial, type InsertResource, type InsertContact, type InsertWeightLossIntake
} from "@shared/schema";
import {
  contentPages,
  contentBlocks,
  mediaLibrary,
  navigationMenus,
  siteSettings,
  type ContentPage,
  type ContentBlock,
  type MediaItem,
  type NavigationMenu,
  type SiteSetting,
  type InsertContentPage,
  type InsertContentBlock,
  type InsertMediaItem,
  type InsertNavigationMenu,
  type InsertSiteSetting,
} from "@shared/cms-schema";
import { eq, desc, asc } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(client);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  getSiteSettingsByCategory(category: string): Promise<SiteSetting[]>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  createOrUpdateSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
    this.createCMSTables();
  }

  private async createCMSTables() {
    try {
      // Create CMS tables if they don't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS content_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          page_type VARCHAR(50) DEFAULT 'page',
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS content_blocks (
          id SERIAL PRIMARY KEY,
          page_id INTEGER REFERENCES content_pages(id) ON DELETE CASCADE,
          block_type VARCHAR(50) NOT NULL,
          content TEXT,
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS media_library (
          id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          alt_text VARCHAR(255),
          category VARCHAR(50) DEFAULT 'image',
          file_size INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS navigation_menus (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          label VARCHAR(255) NOT NULL,
          url VARCHAR(255) NOT NULL,
          parent_id INTEGER REFERENCES navigation_menus(id) ON DELETE SET NULL,
          "order" INTEGER DEFAULT 0,
          is_external BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          menu_location VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS site_settings (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'general',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("CMS tables created successfully");
    } catch (error) {
      console.log("CMS tables already exist or error creating:", error);
    }
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingTestimonials = await db.select().from(testimonials).limit(1);
      if (existingTestimonials.length > 0) return;

      // Seed testimonials
      await db.insert(testimonials).values([
        {
          name: "Sarah M.",
          initial: "S",
          category: "Domestic Violence Survivor",
          content: "Finding Whole Wellness Coaching changed my life. After leaving an abusive relationship, I didn't know where to start. My coach helped me rebuild my confidence and create a safety plan. Now I'm living independently with my children and feel stronger than ever.",
          rating: 5,
          isApproved: true
        },
        {
          name: "Jennifer L.",
          initial: "J",
          category: "Recently Divorced",
          content: "The divorce support program gave me hope when I felt lost. My coach understood exactly what I was going through and helped me navigate the emotional and practical challenges. I've rediscovered who I am and I'm excited about my future.",
          rating: 5,
          isApproved: true
        },
        {
          name: "Maria R.",
          initial: "M",
          category: "Career Transition",
          content: "After being out of the workforce for 15 years, I thought it was impossible to find meaningful work. The career development coaching helped me identify my skills and land a job I love. The sliding scale pricing made it accessible when money was tight.",
          rating: 5,
          isApproved: true
        }
      ]);

      // Seed resources
      await db.insert(resources).values([
        {
          title: "Safety Planning Guide",
          type: "guide",
          category: "Safety",
          content: "Comprehensive guide for creating a personalized safety plan for domestic violence survivors.",
          url: "/resources/safety-planning",
          isFree: true
        },
        {
          title: "Divorce Recovery Workbook", 
          type: "workbook",
          category: "Healing",
          content: "Step-by-step workbook to help process emotions and plan for life after divorce.",
          url: "/resources/divorce-workbook",
          isFree: false
        },
        {
          title: "Career Assessment Tool",
          type: "assessment", 
          category: "Career",
          content: "Interactive tool to identify skills, interests, and potential career paths.",
          url: "/resources/career-assessment",
          isFree: true
        },
        {
          title: "Financial Independence Planner",
          type: "planner",
          category: "Financial",
          content: "Tools and worksheets for creating financial stability and independence.",
          url: "/resources/financial-planner",
          isFree: false
        },
        {
          title: "Healing Journey Podcast",
          type: "podcast",
          category: "Support",
          content: "Weekly podcast featuring expert interviews and real stories of women who have successfully navigated widowhood and divorce.",
          url: "/resources/healing-podcast",
          isFree: true
        }
      ]);
    } catch (error) {
      console.log("Seed data already exists or tables not ready");
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(insertBooking).returning();
    return result[0];
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const result = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
    return result[0];
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.isApproved, true));
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await db.insert(testimonials).values(insertTestimonial).returning();
    return result[0];
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return result[0];
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.type, type));
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.category, category));
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const result = await db.insert(resources).values(insertResource).returning();
    return result[0];
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(insertContact).returning();
    return result[0];
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    const result = await db.select().from(weightLossIntakes).where(eq(weightLossIntakes.id, id)).limit(1);
    return result[0];
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    return await db.select().from(weightLossIntakes);
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    const result = await db.insert(weightLossIntakes).values(insertIntake).returning();
    return result[0];
  }

  // CMS - Content Pages
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    const [page] = await db.select().from(contentPages).where(eq(contentPages.id, id));
    return page;
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    const [page] = await db.select().from(contentPages).where(eq(contentPages.slug, slug));
    return page;
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    return await db.select().from(contentPages).orderBy(desc(contentPages.updatedAt));
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    return await db.select().from(contentPages).where(eq(contentPages.isPublished, true)).orderBy(desc(contentPages.updatedAt));
  }

  async createContentPage(insertPage: InsertContentPage): Promise<ContentPage> {
    const [page] = await db.insert(contentPages).values(insertPage).returning();
    return page;
  }

  async updateContentPage(id: number, updatePage: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    const [page] = await db.update(contentPages)
      .set({ ...updatePage, updatedAt: new Date() })
      .where(eq(contentPages.id, id))
      .returning();
    return page;
  }

  async deleteContentPage(id: number): Promise<boolean> {
    const result = await db.delete(contentPages).where(eq(contentPages.id, id));
    return result.rowCount > 0;
  }

  // CMS - Content Blocks
  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, id));
    return block;
  }

  async getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]> {
    return await db.select().from(contentBlocks)
      .where(eq(contentBlocks.pageId, pageId))
      .orderBy(asc(contentBlocks.order));
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    const [block] = await db.insert(contentBlocks).values(insertBlock).returning();
    return block;
  }

  async updateContentBlock(id: number, updateBlock: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const [block] = await db.update(contentBlocks)
      .set({ ...updateBlock, updatedAt: new Date() })
      .where(eq(contentBlocks.id, id))
      .returning();
    return block;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    const result = await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
    return result.rowCount > 0;
  }

  // CMS - Media Library
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [media] = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id));
    return media;
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
    const [media] = await db.insert(mediaLibrary).values(insertMedia).returning();
    return media;
  }

  async updateMediaItem(id: number, updateMedia: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const [media] = await db.update(mediaLibrary)
      .set(updateMedia)
      .where(eq(mediaLibrary.id, id))
      .returning();
    return media;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
    return result.rowCount > 0;
  }

  // CMS - Navigation
  async getNavigationMenu(id: number): Promise<NavigationMenu | undefined> {
    const [menu] = await db.select().from(navigationMenus).where(eq(navigationMenus.id, id));
    return menu;
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
    const [menu] = await db.insert(navigationMenus).values(insertMenu).returning();
    return menu;
  }

  async updateNavigationMenu(id: number, updateMenu: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined> {
    const [menu] = await db.update(navigationMenus)
      .set(updateMenu)
      .where(eq(navigationMenus.id, id))
      .returning();
    return menu;
  }

  async deleteNavigationMenu(id: number): Promise<boolean> {
    const result = await db.delete(navigationMenus).where(eq(navigationMenus.id, id));
    return result.rowCount > 0;
  }

  // CMS - Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).where(eq(siteSettings.category, category));
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async createOrUpdateSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db.insert(siteSettings)
      .values(insertSetting)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: insertSetting.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();