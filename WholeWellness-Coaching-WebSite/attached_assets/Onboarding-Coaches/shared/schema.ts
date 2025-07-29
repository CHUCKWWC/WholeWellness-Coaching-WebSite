import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach applications for onboarding
export const coachApplications = pgTable("coach_applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  bio: text("bio").notNull(),
  credentials: text("credentials").notNull(),
  experience: text("experience").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  photoUrl: text("photo_url"),
  resumeUrl: text("resume_url"),
  certificationUrls: jsonb("certification_urls").$type<string[]>().default([]),
  introVideoUrl: text("intro_video_url"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
});

// Documents uploaded during onboarding
export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  documentType: text("document_type").notNull(), // resume, certification, photo, intro_video
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Onboarding checklist steps
export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  stepName: text("step_name").notNull(),
  stepType: text("step_type").notNull(), // document_upload, form_completion, video_upload, review
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const coachApplicationsRelations = relations(coachApplications, ({ many }) => ({
  documents: many(applicationDocuments),
  onboardingSteps: many(onboardingSteps),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(coachApplications, {
    fields: [applicationDocuments.applicationId],
    references: [coachApplications.id],
  }),
}));

export const onboardingStepsRelations = relations(onboardingSteps, ({ one }) => ({
  application: one(coachApplications, {
    fields: [onboardingSteps.applicationId],
    references: [coachApplications.id],
  }),
}));

// Insert schemas
export const insertCoachApplicationSchema = createInsertSchema(coachApplications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export const insertApplicationDocumentSchema = createInsertSchema(applicationDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertOnboardingStepSchema = createInsertSchema(onboardingSteps).omit({
  id: true,
  createdAt: true,
});

// Types
export type CoachApplication = typeof coachApplications.$inferSelect;
export type InsertCoachApplication = z.infer<typeof insertCoachApplicationSchema>;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type InsertApplicationDocument = z.infer<typeof insertApplicationDocumentSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = z.infer<typeof insertOnboardingStepSchema>;

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
