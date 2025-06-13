import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, bookings, testimonials, resources, contacts, weightLossIntakes,
  type User, type Booking, type Testimonial, type Resource, type Contact, type WeightLossIntake,
  type InsertUser, type InsertBooking, type InsertTestimonial, type InsertResource, type InsertContact, type InsertWeightLossIntake
} from "@shared/schema";
import { eq } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
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
}

export const storage = new DatabaseStorage();