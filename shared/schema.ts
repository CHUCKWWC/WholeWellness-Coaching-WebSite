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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
