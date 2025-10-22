/**
 * Centralized storage module for the application
 * Uses Drizzle with local PostgreSQL database, with fallback to Supabase for methods not yet implemented
 */
import { storage as supabaseStorage } from "./supabase-client-storage";
import { drizzleStorage } from "./drizzle-storage";

// Create a proxy that uses Drizzle storage first, then falls back to Supabase
export const storage = new Proxy(drizzleStorage, {
  get(target: any, prop: string) {
    // Check if Drizzle storage has this method (checks prototype chain)
    const drizzleMethod = target[prop];
    if (typeof drizzleMethod === 'function') {
      // Bind the method to preserve 'this' context
      return drizzleMethod.bind(target);
    }
    // Fall back to Supabase storage
    const supabaseMethod = supabaseStorage[prop];
    if (typeof supabaseMethod === 'function') {
      return (supabaseMethod as any).bind(supabaseStorage);
    }
    return drizzleMethod || supabaseMethod;
  }
}) as typeof supabaseStorage;
