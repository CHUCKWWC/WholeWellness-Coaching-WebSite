import { 
  type User, type Booking, type Testimonial, type Resource, type Contact, type WeightLossIntake,
  type InsertUser, type InsertBooking, type InsertTestimonial, type InsertResource, type InsertContact, type InsertWeightLossIntake,
  type ContentPage, type ContentBlock, type MediaItem, type NavigationMenu, type SiteSetting,
  type InsertContentPage, type InsertContentBlock, type InsertMediaItem, type InsertNavigationMenu, type InsertSiteSetting,
  type Program, type InsertProgram, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage
} from "@shared/schema";
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
}

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private bookings: Booking[] = [];
  private testimonials: Testimonial[] = [];
  private resources: Resource[] = [];
  private contacts: Contact[] = [];
  private weightLossIntakes: WeightLossIntake[] = [];
  private contentPages: ContentPage[] = [];
  private contentBlocks: ContentBlock[] = [];
  private mediaItems: MediaItem[] = [];
  private navigationMenus: NavigationMenu[] = [];
  private siteSettings: SiteSetting[] = [];

  constructor() {
    // Initialize with sample data for testing
    this.testimonials = [
      {
        id: 1,
        name: "Sarah Johnson",
        content: "Amazing coaching experience! Life-changing results.",
        rating: 5,
        isApproved: true,
        location: "New York",
        serviceType: "Life Coaching",
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Mike Davis", 
        content: "Professional and supportive. Highly recommend!",
        rating: 5,
        isApproved: true,
        location: "California",
        serviceType: "Weight Loss",
        createdAt: new Date()
      }
    ];

    this.resources = [
      {
        id: 1,
        title: "Healthy Eating Guide",
        description: "Complete guide to nutritious eating",
        type: "guide",
        category: "nutrition",
        url: "/resources/healthy-eating",
        isFeatured: true,
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Workout Routines",
        description: "Beginner-friendly exercise plans", 
        type: "workout",
        category: "fitness",
        url: "/resources/workouts",
        isFeatured: true,
        createdAt: new Date()
      }
    ];

    this.contentPages = [
      {
        id: 1,
        title: "About Us",
        slug: "about",
        content: "Learn about our mission and values",
        metaTitle: null,
        metaDescription: null,
        isPublished: true,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: "Services", 
        slug: "services",
        content: "Discover our coaching services",
        metaTitle: null,
        metaDescription: null,
        isPublished: true,
        authorId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.find(b => b.id === id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return [...this.bookings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      ...insertBooking,
      id: this.bookings.length + 1,
      createdAt: new Date()
    };
    this.bookings.push(booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
    }
    return booking;
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.find(t => t.id === id);
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return this.testimonials
      .filter(t => t.isApproved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return [...this.testimonials].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id: this.testimonials.length + 1,
      isApproved: false,
      createdAt: new Date()
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.find(r => r.id === id);
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return this.resources
      .filter(r => r.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return this.resources
      .filter(r => r.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllResources(): Promise<Resource[]> {
    return [...this.resources].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const resource: Resource = {
      ...insertResource,
      id: this.resources.length + 1,
      createdAt: new Date()
    };
    this.resources.push(resource);
    return resource;
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.find(c => c.id === id);
  }

  async getAllContacts(): Promise<Contact[]> {
    return [...this.contacts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      ...insertContact,
      id: this.contacts.length + 1,
      createdAt: new Date()
    };
    this.contacts.push(contact);
    return contact;
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    return this.weightLossIntakes.find(w => w.id === id);
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    return [...this.weightLossIntakes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    const intake: WeightLossIntake = {
      ...insertIntake,
      id: this.weightLossIntakes.length + 1,
      createdAt: new Date()
    };
    this.weightLossIntakes.push(intake);
    return intake;
  }

  // CMS - Content Pages
  async getContentPage(id: number): Promise<ContentPage | undefined> {
    return this.contentPages.find(p => p.id === id);
  }

  async getContentPageBySlug(slug: string): Promise<ContentPage | undefined> {
    return this.contentPages.find(p => p.slug === slug);
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    return [...this.contentPages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    return this.contentPages
      .filter(p => p.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createContentPage(insertPage: InsertContentPage): Promise<ContentPage> {
    const page: ContentPage = {
      ...insertPage,
      id: this.contentPages.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contentPages.push(page);
    return page;
  }

  async updateContentPage(id: number, pageUpdate: Partial<InsertContentPage>): Promise<ContentPage | undefined> {
    const page = this.contentPages.find(p => p.id === id);
    if (page) {
      Object.assign(page, pageUpdate, { updatedAt: new Date() });
    }
    return page;
  }

  async deleteContentPage(id: number): Promise<boolean> {
    const index = this.contentPages.findIndex(p => p.id === id);
    if (index > -1) {
      this.contentPages.splice(index, 1);
      return true;
    }
    return false;
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

export const storage = new MemoryStorage();