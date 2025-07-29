import { pgTable, text, varchar, timestamp, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chat sessions table for AI coach memory
export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").references(() => users.id),
    coachType: varchar("coach_type").notNull(), // nutritionist, fitness-trainer, etc.
    sessionTitle: varchar("session_title"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    isActive: varchar("is_active").default("true"),
    sessionContext: jsonb("session_context"), // User goals, preferences, etc.
  },
  (table) => [
    index("idx_chat_sessions_user_id").on(table.userId),
    index("idx_chat_sessions_coach_type").on(table.coachType),
    index("idx_chat_sessions_created_at").on(table.createdAt),
  ]
);

// Chat messages table for conversation history
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").references(() => chatSessions.id),
    messageText: text("message_text").notNull(),
    isUser: varchar("is_user").notNull(), // "true" or "false"
    timestamp: timestamp("timestamp").defaultNow(),
    messageContext: jsonb("message_context"), // Additional metadata
  },
  (table) => [
    index("idx_chat_messages_session_id").on(table.sessionId),
    index("idx_chat_messages_timestamp").on(table.timestamp),
  ]
);

// Import users table reference
import { users } from "./schema";

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const insertChatSessionSchema = createInsertSchema(chatSessions);
export const insertChatMessageSchema = createInsertSchema(chatMessages);