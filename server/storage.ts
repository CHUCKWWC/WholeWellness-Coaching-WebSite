import { 
  users, bookings, testimonials, resources, contacts, weightLossIntakes,
  type User, type Booking, type Testimonial, type Resource, type Contact, type WeightLossIntake,
  type InsertUser, type InsertBooking, type InsertTestimonial, type InsertResource, type InsertContact, type InsertWeightLossIntake
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private testimonials: Map<number, Testimonial>;
  private resources: Map<number, Resource>;
  private contacts: Map<number, Contact>;
  private weightLossIntakes: Map<number, WeightLossIntake>;
  private currentUserId: number;
  private currentBookingId: number;
  private currentTestimonialId: number;
  private currentResourceId: number;
  private currentContactId: number;
  private currentWeightLossIntakeId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.testimonials = new Map();
    this.resources = new Map();
    this.contacts = new Map();
    this.weightLossIntakes = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentTestimonialId = 1;
    this.currentResourceId = 1;
    this.currentContactId = 1;
    this.currentWeightLossIntakeId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed testimonials
    const seedTestimonials: InsertTestimonial[] = [
      {
        name: "Sarah M.",
        initial: "S",
        category: "Domestic Violence Survivor",
        content: "The coaching I received helped me rebuild my confidence and create boundaries I never knew I needed. I'm now living independently and pursuing a career I'm passionate about.",
        rating: 5
      },
      {
        name: "Maria L.",
        initial: "M", 
        category: "Recently Divorced",
        content: "After 20 years of marriage, I felt lost. Through coaching, I rediscovered who I am and what I want from life. I'm now starting my own business and feeling more confident than ever.",
        rating: 5
      },
      {
        name: "Jennifer K.",
        initial: "J",
        category: "Career Transition",
        content: "The career coaching helped me identify my strengths and transition into a field I'm truly passionate about. The affordable rates made it possible when I couldn't afford traditional coaching.",
        rating: 5
      }
    ];

    seedTestimonials.forEach(testimonial => {
      const id = this.currentTestimonialId++;
      const fullTestimonial: Testimonial = {
        ...testimonial,
        id,
        isApproved: true,
        createdAt: new Date()
      };
      this.testimonials.set(id, fullTestimonial);
    });

    // Seed resources
    const seedResources: InsertResource[] = [
      {
        title: "Rebuilding After Domestic Violence: A Step-by-Step Guide",
        type: "article",
        category: "Recovery",
        content: "A comprehensive guide to help survivors of domestic violence rebuild their lives with practical steps and emotional support strategies.",
        url: "/resources/rebuilding-guide",
        isFree: true
      },
      {
        title: "Setting Healthy Boundaries in Relationships",
        type: "video",
        category: "Relationships",
        content: "Learn how to establish and maintain healthy boundaries in all your relationships for better mental health and self-respect.",
        url: "/resources/boundaries-video",
        isFree: true
      },
      {
        title: "Career Planning Worksheet",
        type: "worksheet",
        category: "Career",
        content: "A practical worksheet to help you assess your skills, interests, and goals to plan your next career move.",
        url: "/resources/career-worksheet.pdf",
        isFree: true
      },
      {
        title: "Healing from Loss: Widow and Divorce Support",
        type: "podcast",
        category: "Support",
        content: "Weekly podcast featuring expert interviews and real stories of women who have successfully navigated widowhood and divorce.",
        url: "/resources/healing-podcast",
        isFree: true
      }
    ];

    seedResources.forEach(resource => {
      const id = this.currentResourceId++;
      const fullResource: Resource = {
        ...resource,
        id,
        createdAt: new Date()
      };
      this.resources.set(id, fullResource);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isMember: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      scheduledDate: null,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // Testimonials
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(testimonial => testimonial.isApproved);
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      isApproved: false,
      createdAt: new Date()
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.type === type);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.category === category);
  }

  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = {
      ...insertResource,
      id,
      createdAt: new Date()
    };
    this.resources.set(id, resource);
    return resource;
  }

  // Contacts
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = {
      ...insertContact,
      id,
      status: "new",
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  // Weight Loss Intakes
  async getWeightLossIntake(id: number): Promise<WeightLossIntake | undefined> {
    return this.weightLossIntakes.get(id);
  }

  async getAllWeightLossIntakes(): Promise<WeightLossIntake[]> {
    return Array.from(this.weightLossIntakes.values());
  }

  async createWeightLossIntake(insertIntake: InsertWeightLossIntake): Promise<WeightLossIntake> {
    const id = this.currentWeightLossIntakeId++;
    const intake: WeightLossIntake = {
      ...insertIntake,
      id,
      status: "new",
      createdAt: new Date()
    };
    this.weightLossIntakes.set(id, intake);
    return intake;
  }
}

export const storage = new MemStorage();
