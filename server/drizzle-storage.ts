import { db } from "./db";
import { users, coaches, coachCredentials, coachAvailability } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User, InsertUser } from "@shared/schema";
import type { IStorage } from "./supabase-client-storage";

class DrizzleStorage implements Partial<IStorage> {
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log('[DrizzleStorage] getUserByEmail called with:', email);
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      console.log('[DrizzleStorage] getUserByEmail result:', result[0] ? `Found user ${result[0].id}` : 'No user found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      console.log('[DrizzleStorage] getUserById called with ID:', id);
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      console.log('[DrizzleStorage] getUserById result:', result[0] ? `Found user ${result[0].email}` : 'No user found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user by ID:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      console.log('[DrizzleStorage] updateUserLastLogin called for:', userId);
      await db
        .update(users)
        .set({ lastLogin: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('[DrizzleStorage] Error updating last login:', error);
    }
  }
}

export const drizzleStorage = new DrizzleStorage();
