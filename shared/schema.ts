import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isMember: boolean("is_member").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  coachingArea: text("coaching_area").notNull(),
  message: text("message"),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightLossIntakes = pgTable("weight_loss_intakes", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: integer("age").notNull(),
  height: text("height").notNull(),
  currentWeight: text("current_weight").notNull(),
  goalWeight: text("goal_weight").notNull(),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  allergies: text("allergies"),
  digestiveIssues: text("digestive_issues"),
  physicalLimitations: text("physical_limitations"),
  weightLossMedications: text("weight_loss_medications"),
  weightHistory: text("weight_history"),
  previousAttempts: text("previous_attempts"),
  challengingAspects: text("challenging_aspects"),
  currentEatingHabits: text("current_eating_habits"),
  lifestyle: text("lifestyle"),
  activityLevel: text("activity_level"),
  mindsetFactors: text("mindset_factors"),
  goalsExpectations: text("goals_expectations"),
  interestedInSupplements: boolean("interested_in_supplements").default(false),
  status: text("status").default("new"), // new, reviewed, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initial: text("initial").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // article, video, worksheet, podcast
  category: text("category").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  isFree: boolean("is_free").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, replied, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  scheduledDate: true,
  createdAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  isApproved: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertWeightLossIntakeSchema = createInsertSchema(weightLossIntakes).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  phone: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  digestiveIssues: z.string().optional(),
  physicalLimitations: z.string().optional(),
  weightLossMedications: z.string().optional(),
  weightHistory: z.string().optional(),
  previousAttempts: z.string().optional(),
  challengingAspects: z.string().optional(),
  currentEatingHabits: z.string().optional(),
  lifestyle: z.string().optional(),
  activityLevel: z.string().optional(),
  mindsetFactors: z.string().optional(),
  goalsExpectations: z.string().optional(),
  interestedInSupplements: z.boolean().optional().default(false),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertWeightLossIntake = z.infer<typeof insertWeightLossIntakeSchema>;

export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type WeightLossIntake = typeof weightLossIntakes.$inferSelect;
