import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach profiles table
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  coachId: varchar("coach_id").unique().notNull(), // Professional coach ID
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  experience: integer("experience"), // years of experience
  status: varchar("status").default("pending"), // pending, approved, active, suspended
  isVerified: boolean("is_verified").default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  timezone: varchar("timezone"),
  languages: jsonb("languages").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach credentials and certifications
export const coachCredentials = pgTable("coach_credentials", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  credentialType: varchar("credential_type").notNull(), // license, certification, degree
  title: varchar("title").notNull(),
  issuingOrganization: varchar("issuing_organization").notNull(),
  issueDate: timestamp("issue_date"),
  expirationDate: timestamp("expiration_date"),
  credentialNumber: varchar("credential_number"),
  documentUrl: text("document_url"), // uploaded document
  verificationStatus: varchar("verification_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coach banking information for QuickBooks integration
export const coachBanking = pgTable("coach_banking", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  bankName: varchar("bank_name"),
  accountType: varchar("account_type"), // checking, savings
  accountNumber: text("account_number"), // encrypted
  routingNumber: varchar("routing_number"),
  accountHolderName: varchar("account_holder_name"),
  quickbooksVendorId: varchar("quickbooks_vendor_id"),
  quickbooksAccountId: varchar("quickbooks_account_id"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach availability scheduling
export const coachAvailability = pgTable("coach_availability", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // HH:mm format
  endTime: varchar("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  sessionType: varchar("session_type"), // individual, group, crisis
  maxClients: integer("max_clients").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coach-client relationships
export const coachClients = pgTable("coach_clients", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  status: varchar("status").default("active"), // active, completed, transferred
  specialtyArea: varchar("specialty_area"),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  nextScheduledSession: timestamp("next_scheduled_session"),
  totalSessions: integer("total_sessions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach session notes and client progress
export const coachSessionNotes = pgTable("coach_session_notes", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  sessionType: varchar("session_type"), // individual, group, crisis, follow-up
  duration: integer("duration"), // minutes
  notes: text("notes"),
  goals: jsonb("goals").$type<string[]>().default([]),
  outcomes: text("outcomes"),
  nextSteps: text("next_steps"),
  clientProgress: integer("client_progress"), // 1-10 scale
  riskAssessment: varchar("risk_assessment"), // low, medium, high, crisis
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDate: timestamp("follow_up_date"),
  isConfidential: boolean("is_confidential").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication templates for text messaging
export const coachMessageTemplates = pgTable("coach_message_templates", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  templateName: varchar("template_name").notNull(),
  messageType: varchar("message_type").notNull(), // reminder, check-in, crisis, motivation
  messageContent: text("message_content").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client communication log
export const coachClientCommunications = pgTable("coach_client_communications", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  communicationType: varchar("communication_type").notNull(), // sms, email, call, in-person
  direction: varchar("direction").notNull(), // inbound, outbound
  content: text("content"),
  templateId: integer("template_id").references(() => coachMessageTemplates.id),
  isAutomated: boolean("is_automated").default(false),
  n8nWorkflowId: varchar("n8n_workflow_id"), // for automation tracking
  deliveryStatus: varchar("delivery_status"), // sent, delivered, read, failed
  clientResponse: text("client_response"),
  requiresFollowUp: boolean("requires_follow_up").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach performance metrics
export const coachMetrics = pgTable("coach_metrics", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalClients: integer("total_clients").default(0),
  averageSessionRating: decimal("average_session_rating", { precision: 3, scale: 2 }),
  clientRetentionRate: decimal("client_retention_rate", { precision: 5, scale: 2 }),
  responseTime: integer("response_time"), // average response time in minutes
  completedGoals: integer("completed_goals").default(0),
  crisisSessions: integer("crisis_sessions").default(0),
  clientSatisfactionScore: decimal("client_satisfaction_score", { precision: 3, scale: 2 }),
  hoursWorked: decimal("hours_worked", { precision: 8, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema validation
export const insertCoachSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachCredentialSchema = createInsertSchema(coachCredentials).omit({
  id: true,
  createdAt: true,
});

export const insertCoachBankingSchema = createInsertSchema(coachBanking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachAvailabilitySchema = createInsertSchema(coachAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertCoachClientSchema = createInsertSchema(coachClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachSessionNotesSchema = createInsertSchema(coachSessionNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachMessageTemplateSchema = createInsertSchema(coachMessageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachClientCommunicationSchema = createInsertSchema(coachClientCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;

export type CoachCredential = typeof coachCredentials.$inferSelect;
export type InsertCoachCredential = z.infer<typeof insertCoachCredentialSchema>;

export type CoachBanking = typeof coachBanking.$inferSelect;
export type InsertCoachBanking = z.infer<typeof insertCoachBankingSchema>;

export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = z.infer<typeof insertCoachAvailabilitySchema>;

export type CoachClient = typeof coachClients.$inferSelect;
export type InsertCoachClient = z.infer<typeof insertCoachClientSchema>;

export type CoachSessionNotes = typeof coachSessionNotes.$inferSelect;
export type InsertCoachSessionNotes = z.infer<typeof insertCoachSessionNotesSchema>;

export type CoachMessageTemplate = typeof coachMessageTemplates.$inferSelect;
export type InsertCoachMessageTemplate = z.infer<typeof insertCoachMessageTemplateSchema>;

export type CoachClientCommunication = typeof coachClientCommunications.$inferSelect;
export type InsertCoachClientCommunication = z.infer<typeof insertCoachClientCommunicationSchema>;

export type CoachMetrics = typeof coachMetrics.$inferSelect;