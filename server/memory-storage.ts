import { randomUUID } from "crypto";
import type { 
  User, Booking, Testimonial, Resource, Contact, WeightLossIntake,
  InsertUser, InsertBooking, InsertTestimonial, InsertResource, InsertContact, InsertWeightLossIntake,
  ContentPage, ContentBlock, MediaItem, NavigationMenu, SiteSetting,
  InsertContentPage, InsertContentBlock, InsertMediaItem, InsertNavigationMenu, InsertSiteSetting
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
        initial: "S.J.",
        category: "Life Coaching",
        content: "Amazing coaching experience! Life-changing results.",
        rating: 5,
        isApproved: true,
        createdAt: new Date()
      },
      {
        id: 2,
        name: "Mike Davis", 
        initial: "M.D.",
        category: "Weight Loss",
        content: "Professional and supportive. Highly recommend!",
        rating: 5,
        isApproved: true,
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
    return this.bookings;
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
    return this.testimonials.filter(t => t.isApproved);
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return this.testimonials;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id: this.testimonials.length + 1,
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
    return this.resources.filter(r => r.type === type);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return this.resources.filter(r => r.category === category);
  }

  async getAllResources(): Promise<Resource[]> {
    return this.resources;
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
    return this.contacts;
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
    return this.weightLossIntakes;
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
    return this.contentPages;
  }

  async getPublishedContentPages(): Promise<ContentPage[]> {
    return this.contentPages.filter(p => p.isPublished);
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
    if (index !== -1) {
      this.contentPages.splice(index, 1);
      return true;
    }
    return false;
  }

  // CMS - Content Blocks
  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    return this.contentBlocks.find(b => b.id === id);
  }

  async getContentBlocksByPageId(pageId: number): Promise<ContentBlock[]> {
    return this.contentBlocks.filter(b => b.pageId === pageId);
  }

  async createContentBlock(insertBlock: InsertContentBlock): Promise<ContentBlock> {
    const block: ContentBlock = {
      ...insertBlock,
      id: this.contentBlocks.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contentBlocks.push(block);
    return block;
  }

  async updateContentBlock(id: number, blockUpdate: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const block = this.contentBlocks.find(b => b.id === id);
    if (block) {
      Object.assign(block, blockUpdate, { updatedAt: new Date() });
    }
    return block;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    const index = this.contentBlocks.findIndex(b => b.id === id);
    if (index !== -1) {
      this.contentBlocks.splice(index, 1);
      return true;
    }
    return false;
  }

  // CMS - Media Library
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    return this.mediaItems.find(m => m.id === id);
  }

  async getAllMediaItems(): Promise<MediaItem[]> {
    return this.mediaItems;
  }

  async getMediaByCategory(category: string): Promise<MediaItem[]> {
    return this.mediaItems.filter(m => m.category === category);
  }

  async createMediaItem(insertMedia: InsertMediaItem): Promise<MediaItem> {
    const media: MediaItem = {
      ...insertMedia,
      id: this.mediaItems.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mediaItems.push(media);
    return media;
  }

  async updateMediaItem(id: number, mediaUpdate: Partial<InsertMediaItem>): Promise<MediaItem | undefined> {
    const media = this.mediaItems.find(m => m.id === id);
    if (media) {
      Object.assign(media, mediaUpdate, { updatedAt: new Date() });
    }
    return media;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const index = this.mediaItems.findIndex(m => m.id === id);
    if (index !== -1) {
      this.mediaItems.splice(index, 1);
      return true;
    }
    return false;
  }

  // CMS - Navigation
  async getNavigationMenu(id: number): Promise<NavigationMenu | undefined> {
    return this.navigationMenus.find(n => n.id === id);
  }

  async getNavigationByLocation(location: string): Promise<NavigationMenu[]> {
    return this.navigationMenus.filter(n => n.menuLocation === location);
  }

  async getAllNavigationMenus(): Promise<NavigationMenu[]> {
    return this.navigationMenus;
  }

  async createNavigationMenu(insertMenu: InsertNavigationMenu): Promise<NavigationMenu> {
    const menu: NavigationMenu = {
      ...insertMenu,
      id: this.navigationMenus.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.navigationMenus.push(menu);
    return menu;
  }

  async updateNavigationMenu(id: number, menuUpdate: Partial<InsertNavigationMenu>): Promise<NavigationMenu | undefined> {
    const menu = this.navigationMenus.find(n => n.id === id);
    if (menu) {
      Object.assign(menu, menuUpdate, { updatedAt: new Date() });
    }
    return menu;
  }

  async deleteNavigationMenu(id: number): Promise<boolean> {
    const index = this.navigationMenus.findIndex(n => n.id === id);
    if (index !== -1) {
      this.navigationMenus.splice(index, 1);
      return true;
    }
    return false;
  }

  // CMS - Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.siteSettings.find(s => s.key === key);
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return this.siteSettings;
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return this.siteSettings.filter(s => s.category === category);
  }

  async createSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const setting: SiteSetting = {
      ...insertSetting,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.siteSettings.push(setting);
    return setting;
  }

  async updateSiteSetting(key: string, settingUpdate: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const setting = this.siteSettings.find(s => s.key === key);
    if (setting) {
      Object.assign(setting, settingUpdate, { updatedAt: new Date() });
    }
    return setting;
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    const index = this.siteSettings.findIndex(s => s.key === key);
    if (index !== -1) {
      this.siteSettings.splice(index, 1);
      return true;
    }
    return false;
  }

  // Helper method for upsert operations
  async createOrUpdateSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(setting.key);
    if (existing) {
      return await this.updateSiteSetting(setting.key, setting) || existing;
    } else {
      return await this.createSiteSetting(setting);
    }
  }
}

export const storage = new MemoryStorage();