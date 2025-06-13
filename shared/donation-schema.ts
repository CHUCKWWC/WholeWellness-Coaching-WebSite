import { pgTable, varchar, integer, decimal, timestamp, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with authentication and member data
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  membershipLevel: varchar("membership_level").default("free"), // free, supporter, champion, guardian
  donationTotal: decimal("donation_total").default("0"),
  rewardPoints: integer("reward_points").default(0),
  stripeCustomerId: varchar("stripe_customer_id"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  joinDate: timestamp("join_date").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donations table
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  amount: decimal("amount").notNull(),
  currency: varchar("currency").default("USD"),
  donationType: varchar("donation_type").notNull(), // one-time, monthly, yearly
  paymentMethod: varchar("payment_method"), // stripe, paypal, etc
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").default("pending"), // pending, completed, failed, refunded
  dedicatedTo: varchar("dedicated_to"), // person or cause
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  campaignId: varchar("campaign_id"),
  rewardPointsEarned: integer("reward_points_earned").default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fundraising campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  goalAmount: decimal("goal_amount").notNull(),
  raisedAmount: decimal("raised_amount").default("0"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"),
  category: varchar("category"), // emergency, program, general
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reward points transactions
export const rewardTransactions = pgTable("reward_transactions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  points: integer("points").notNull(),
  type: varchar("type").notNull(), // earned, redeemed
  reason: varchar("reason").notNull(), // donation, milestone, redemption
  donationId: varchar("donation_id").references(() => donations.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member benefits and rewards
export const memberBenefits = pgTable("member_benefits", {
  id: varchar("id").primaryKey(),
  membershipLevel: varchar("membership_level").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// User sessions for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Impact tracking for donors
export const impactMetrics = pgTable("impact_metrics", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  metric: varchar("metric").notNull(), // lives_impacted, sessions_funded, etc
  value: integer("value").notNull(),
  period: varchar("period").default("all-time"), // monthly, yearly, all-time
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Quick donation presets
export const donationPresets = pgTable("donation_presets", {
  id: varchar("id").primaryKey(),
  amount: decimal("amount").notNull(),
  label: varchar("label").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  isPopular: boolean("is_popular").default(false),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRewardTransactionSchema = createInsertSchema(rewardTransactions).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type InsertRewardTransaction = z.infer<typeof insertRewardTransactionSchema>;
export type MemberBenefit = typeof memberBenefits.$inferSelect;
export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type DonationPreset = typeof donationPresets.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;