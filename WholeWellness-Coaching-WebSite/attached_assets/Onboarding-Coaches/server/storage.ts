import { 
  coachApplications, 
  type CoachApplication, 
  type InsertCoachApplication,
  applicationDocuments,
  type ApplicationDocument,
  type InsertApplicationDocument,
  onboardingSteps,
  type OnboardingStep,
  type InsertOnboardingStep,
  users,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User methods (for admin login)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Coach application methods
  getAllApplications(): Promise<CoachApplication[]>;
  getApplication(id: number): Promise<CoachApplication | undefined>;
  createApplication(insertApplication: InsertCoachApplication): Promise<CoachApplication>;
  updateApplication(id: number, updates: Partial<InsertCoachApplication>): Promise<CoachApplication | undefined>;
  
  // Document methods
  getDocumentsByApplication(applicationId: number): Promise<ApplicationDocument[]>;
  createDocument(insertDocument: InsertApplicationDocument): Promise<ApplicationDocument>;
  deleteDocument(id: number): Promise<void>;
  
  // Onboarding step methods
  getStepsByApplication(applicationId: number): Promise<OnboardingStep[]>;
  createStep(insertStep: InsertOnboardingStep): Promise<OnboardingStep>;
  updateStep(id: number, updates: Partial<InsertOnboardingStep>): Promise<OnboardingStep | undefined>;
  
  // Analytics
  getApplicationAnalytics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllApplications(): Promise<CoachApplication[]> {
    return await db.select().from(coachApplications).orderBy(desc(coachApplications.submittedAt));
  }

  async getApplication(id: number): Promise<CoachApplication | undefined> {
    const [application] = await db.select().from(coachApplications).where(eq(coachApplications.id, id));
    return application || undefined;
  }

  async createApplication(insertApplication: InsertCoachApplication): Promise<CoachApplication> {
    const [application] = await db
      .insert(coachApplications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async updateApplication(id: number, updates: Partial<InsertCoachApplication>): Promise<CoachApplication | undefined> {
    const [application] = await db
      .update(coachApplications)
      .set(updates)
      .where(eq(coachApplications.id, id))
      .returning();
    return application || undefined;
  }

  async getDocumentsByApplication(applicationId: number): Promise<ApplicationDocument[]> {
    return await db
      .select()
      .from(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, applicationId));
  }

  async createDocument(insertDocument: InsertApplicationDocument): Promise<ApplicationDocument> {
    const [document] = await db
      .insert(applicationDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(applicationDocuments).where(eq(applicationDocuments.id, id));
  }

  async getStepsByApplication(applicationId: number): Promise<OnboardingStep[]> {
    return await db
      .select()
      .from(onboardingSteps)
      .where(eq(onboardingSteps.applicationId, applicationId));
  }

  async createStep(insertStep: InsertOnboardingStep): Promise<OnboardingStep> {
    const [step] = await db
      .insert(onboardingSteps)
      .values(insertStep)
      .returning();
    return step;
  }

  async updateStep(id: number, updates: Partial<InsertOnboardingStep>): Promise<OnboardingStep | undefined> {
    const [step] = await db
      .update(onboardingSteps)
      .set(updates)
      .where(eq(onboardingSteps.id, id))
      .returning();
    return step || undefined;
  }

  async getApplicationAnalytics(): Promise<any> {
    const [analytics] = await db
      .select({
        totalApplications: sql<number>`COUNT(*)`.as('totalApplications'),
        pendingApplications: sql<number>`COUNT(CASE WHEN ${coachApplications.status} = 'pending' THEN 1 END)`.as('pendingApplications'),
        approvedApplications: sql<number>`COUNT(CASE WHEN ${coachApplications.status} = 'approved' THEN 1 END)`.as('approvedApplications'),
        rejectedApplications: sql<number>`COUNT(CASE WHEN ${coachApplications.status} = 'rejected' THEN 1 END)`.as('rejectedApplications'),
      })
      .from(coachApplications);

    return {
      totalApplications: Number(analytics.totalApplications) || 0,
      pendingApplications: Number(analytics.pendingApplications) || 0,
      approvedApplications: Number(analytics.approvedApplications) || 0,
      rejectedApplications: Number(analytics.rejectedApplications) || 0,
    };
  }
}

export const storage = new DatabaseStorage();