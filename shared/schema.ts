import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar, 
  decimal, 
  jsonb 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Main users table (consolidated from donation schema)
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
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin, super_admin, coach, moderator
  permissions: jsonb("permissions"), // JSON array of permission strings
  isActive: boolean("is_active").default(true),
  joinDate: timestamp("join_date").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin sessions for secure dashboard access
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin activity log
export const adminActivityLog = pgTable("admin_activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource"), // user, donation, booking, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Role permissions definition
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: varchar("role").notNull(),
  permission: varchar("permission").notNull(),
  resource: varchar("resource"),
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

// Donation system tables
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

export const memberBenefits = pgTable("member_benefits", {
  id: varchar("id").primaryKey(),
  membershipLevel: varchar("membership_level").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const impactMetrics = pgTable("impact_metrics", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  metric: varchar("metric").notNull(), // lives_impacted, sessions_funded, etc
  value: integer("value").notNull(),
  period: varchar("period").default("all-time"), // monthly, yearly, all-time
  lastUpdated: timestamp("last_updated").defaultNow(),
});

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

// Coach system tables
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

// Onboarding System Tables
export const onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").notNull(),
  data: jsonb("data").default({}),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientIntake = pgTable("client_intake", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  primaryGoal: text("primary_goal"),
  specificChallenges: jsonb("specific_challenges").$type<string[]>().default([]),
  previousSupport: text("previous_support"),
  urgencyLevel: varchar("urgency_level"),
  healthConcerns: jsonb("health_concerns").$type<string[]>().default([]),
  medications: text("medications"),
  sleepQuality: integer("sleep_quality"),
  stressLevel: integer("stress_level"),
  exerciseFrequency: varchar("exercise_frequency"),
  coachingStyle: jsonb("coaching_style").$type<string[]>().default([]),
  sessionFrequency: varchar("session_frequency"),
  preferredDays: jsonb("preferred_days").$type<string[]>().default([]),
  preferredTimes: jsonb("preferred_times").$type<string[]>().default([]),
  communicationPreference: varchar("communication_preference"),
  emergencyContact: jsonb("emergency_contact"),
  currentSafetyLevel: integer("current_safety_level"),
  needsImmediateSupport: boolean("needs_immediate_support").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coachApplications = pgTable("coach_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  location: varchar("location"),
  linkedIn: varchar("linked_in"),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  yearsOfExperience: integer("years_of_experience"),
  availability: jsonb("availability"),
  bankingInfo: jsonb("banking_info"),
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  status: varchar("status").default("pending"), // pending, under_review, approved, rejected
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mental Wellness Resource Hub
export const mentalWellnessResources = pgTable("mental_wellness_resources", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // crisis, anxiety, depression, mindfulness, stress, trauma, relationship, self-care
  resourceType: varchar("resource_type").notNull(), // hotline, website, app, article, video, exercise, meditation
  url: text("url"),
  phoneNumber: varchar("phone_number"),
  isEmergency: boolean("is_emergency").default(false),
  availability: varchar("availability"), // 24/7, business-hours, weekdays, etc
  languages: jsonb("languages").$type<string[]>().default(['English']),
  costInfo: varchar("cost_info"), // free, paid, insurance, sliding-scale
  targetAudience: varchar("target_audience"), // general, teens, adults, seniors, lgbtq, women, veterans
  rating: decimal("rating", { precision: 3, scale: 2 }),
  usageCount: integer("usage_count").default(0),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  verificationStatus: varchar("verification_status").default("verified"), // verified, pending, outdated
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const resourceUsageAnalytics = pgTable("resource_usage_analytics", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").references(() => mentalWellnessResources.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // for anonymous users
  accessedAt: timestamp("accessed_at").defaultNow(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: varchar("device_type"), // mobile, desktop, tablet
  accessDuration: integer("access_duration"), // seconds
  wasHelpful: boolean("was_helpful"),
  feedback: text("feedback"),
  followUpAction: varchar("follow_up_action"), // contacted, bookmarked, shared, none
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  organization: varchar("organization"),
  phoneNumber: varchar("phone_number").notNull(),
  textSupport: varchar("text_support"), // text number if available
  description: text("description").notNull(),
  availability: varchar("availability").notNull(),
  languages: jsonb("languages").$type<string[]>().default(['English']),
  specialty: varchar("specialty"), // suicide, domestic-violence, crisis, mental-health
  isNational: boolean("is_national").default(true),
  country: varchar("country").default("US"),
  state: varchar("state"),
  city: varchar("city"),
  website: text("website"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wellnessAssessments = pgTable("wellness_assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // for anonymous users
  assessmentType: varchar("assessment_type").notNull(), // mood, anxiety, depression, stress, crisis-risk
  responses: jsonb("responses").$type<Record<string, any>>().notNull(),
  score: integer("score"),
  riskLevel: varchar("risk_level"), // low, medium, high, crisis
  recommendedResources: jsonb("recommended_resources").$type<number[]>().default([]),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const personalizedRecommendations = pgTable("personalized_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // for anonymous users
  resourceId: integer("resource_id").references(() => mentalWellnessResources.id).notNull(),
  recommendationScore: decimal("recommendation_score", { precision: 5, scale: 2 }),
  reasons: jsonb("reasons").$type<string[]>().default([]),
  algorithmVersion: varchar("algorithm_version").default("v1.0"),
  wasAccessed: boolean("was_accessed").default(false),
  wasHelpful: boolean("was_helpful"),
  feedback: text("feedback"),
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// CMS system tables
export const contentPages = pgTable("content_pages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug").unique().notNull(),
  title: varchar("title").notNull(),
  content: text("content"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isPublished: boolean("is_published").default(true),
  featuredImage: text("featured_image"),
  author: varchar("author").default("Admin"),
  pageType: varchar("page_type").default("page"), // page, blog, service
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentBlocks = pgTable("content_blocks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pageId: integer("page_id").references(() => contentPages.id),
  blockType: varchar("block_type").notNull(), // hero, text, image, testimonial, cta
  title: varchar("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  buttonText: varchar("button_text"),
  buttonUrl: text("button_url"),
  backgroundColor: varchar("background_color"),
  textColor: varchar("text_color"),
  order: integer("order").default(0),
  settings: jsonb("settings"), // Additional flexible settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaLibrary = pgTable("media_library", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  category: varchar("category").default("general"), // testimonial, hero, service, resource
  uploadedBy: varchar("uploaded_by").default("Admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const navigationMenus = pgTable("navigation_menus", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  label: varchar("label").notNull(),
  url: text("url").notNull(),
  parentId: integer("parent_id"),
  order: integer("order").default(0),
  isExternal: boolean("is_external").default(false),
  isActive: boolean("is_active").default(true),
  menuLocation: varchar("menu_location").default("main"), // main, footer, sidebar
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  type: varchar("type").default("text"), // text, boolean, json, number
  category: varchar("category").default("general"), // general, seo, contact, social
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
  campaigns: many(campaigns),
  rewardTransactions: many(rewardTransactions),
  impactMetrics: many(impactMetrics),
  sessions: many(sessions),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  donations: many(donations),
}));

export const coachesRelations = relations(coaches, ({ many }) => ({
  credentials: many(coachCredentials),
  banking: many(coachBanking),
  availability: many(coachAvailability),
  clients: many(coachClients),
  sessionNotes: many(coachSessionNotes),
  messageTemplates: many(coachMessageTemplates),
  communications: many(coachClientCommunications),
  metrics: many(coachMetrics),
}));

export const coachCredentialsRelations = relations(coachCredentials, ({ one }) => ({
  coach: one(coaches, {
    fields: [coachCredentials.coachId],
    references: [coaches.id],
  }),
}));

export const contentPagesRelations = relations(contentPages, ({ many }) => ({
  blocks: many(contentBlocks),
}));

export const contentBlocksRelations = relations(contentBlocks, ({ one }) => ({
  page: one(contentPages, {
    fields: [contentBlocks.pageId],
    references: [contentPages.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaSchema = createInsertSchema(mediaLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertNavigationSchema = createInsertSchema(navigationMenus).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"), // Allow username or email
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Mental Wellness Resource Hub Schemas
export const insertMentalWellnessResourceSchema = createInsertSchema(mentalWellnessResources).omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResourceUsageAnalyticsSchema = createInsertSchema(resourceUsageAnalytics).omit({
  id: true,
  accessedAt: true,
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true,
});

export const insertWellnessAssessmentSchema = createInsertSchema(wellnessAssessments).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertPersonalizedRecommendationSchema = createInsertSchema(personalizedRecommendations).omit({
  id: true,
  generatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type WeightLossIntake = typeof weightLossIntakes.$inferSelect;
export type InsertWeightLossIntake = z.infer<typeof insertWeightLossIntakeSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type InsertRewardTransaction = z.infer<typeof insertRewardTransactionSchema>;
export type MemberBenefit = typeof memberBenefits.$inferSelect;
export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type DonationPreset = typeof donationPresets.$inferSelect;

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

export type ContentPage = typeof contentPages.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;

// Mental Wellness Resource Hub Types
export type MentalWellnessResource = typeof mentalWellnessResources.$inferSelect;
export type InsertMentalWellnessResource = z.infer<typeof insertMentalWellnessResourceSchema>;

export type ResourceUsageAnalytics = typeof resourceUsageAnalytics.$inferSelect;
export type InsertResourceUsageAnalytics = z.infer<typeof insertResourceUsageAnalyticsSchema>;

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export type WellnessAssessment = typeof wellnessAssessments.$inferSelect;
export type InsertWellnessAssessment = z.infer<typeof insertWellnessAssessmentSchema>;

export type PersonalizedRecommendation = typeof personalizedRecommendations.$inferSelect;
export type InsertPersonalizedRecommendation = z.infer<typeof insertPersonalizedRecommendationSchema>;
export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = z.infer<typeof insertMediaSchema>;
export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type InsertNavigationMenu = z.infer<typeof insertNavigationSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Admin types
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;
export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLog.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

// Admin schemas
export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  timestamp: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;
