import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar, 
  decimal, 
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
  bio: text("bio"), // 200 char max enforced in validation
  rating: integer("rating").default(0), // 0-5 stars, admin-editable
  introVideoUrl: varchar("intro_video_url"),
  keywords: text("keywords").array(), // max 5 keywords, 20 chars each
  preferredCoach: varchar("preferred_coach"),
  googleId: varchar("google_id"),
  provider: varchar("provider").default("local"), // local, google, facebook, apple
  role: varchar("role").default("user"), // user, admin, super_admin, coach, moderator
  permissions: jsonb("permissions"), // JSON array of permission strings
  isActive: boolean("is_active").default(true),
  joinDate: timestamp("join_date").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certification courses that coaches can access
export const certificationCourses = pgTable("certification_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // wellness, nutrition, relationship, behavior, etc.
  level: varchar("level").notNull(), // beginner, intermediate, advanced, master
  duration: integer("duration").notNull(), // in hours
  creditHours: decimal("credit_hours").notNull(), // CE credit hours
  price: decimal("price").notNull(),
  instructorName: varchar("instructor_name").notNull(),
  instructorBio: text("instructor_bio"),
  courseImageUrl: varchar("course_image_url"),
  previewVideoUrl: varchar("preview_video_url"),
  syllabus: jsonb("syllabus"), // Course modules and lessons
  requirements: text("requirements").array(), // Prerequisites
  learningObjectives: text("learning_objectives").array(),
  accreditation: varchar("accreditation"), // Accrediting body
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  enrollmentLimit: integer("enrollment_limit"), // null = unlimited
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach enrollments in certification courses
export const coachEnrollments = pgTable("coach_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: varchar("status").default("enrolled"), // enrolled, in_progress, completed, withdrawn, failed
  progress: decimal("progress").default("0"), // 0-100
  currentModule: integer("current_module").default(1),
  completedModules: integer("completed_modules").array().default([]),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  certificateIssued: boolean("certificate_issued").default(false),
  certificateNumber: varchar("certificate_number"),
  finalGrade: decimal("final_grade"), // 0-100
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course modules/lessons within certification courses
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  moduleNumber: integer("module_number").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  contentType: varchar("content_type").notNull(), // video, text, interactive, quiz, assignment
  contentUrl: varchar("content_url"), // video URL, document URL, etc.
  content: text("content"), // text content or HTML
  quiz: jsonb("quiz"), // Quiz questions and answers
  assignment: jsonb("assignment"), // Assignment details
  resources: jsonb("resources"), // Additional learning resources
  isRequired: boolean("is_required").default(true),
  passingScore: decimal("passing_score").default("70"), // For quizzes/assignments
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach progress through individual modules
export const moduleProgress = pgTable("module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().references(() => coachEnrollments.id),
  moduleId: varchar("module_id").notNull().references(() => courseModules.id),
  status: varchar("status").default("not_started"), // not_started, in_progress, completed, passed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
  attempts: integer("attempts").default(0),
  score: decimal("score"), // For quizzes/assignments
  submissionData: jsonb("submission_data"), // Quiz answers, assignment submissions
  feedback: text("feedback"), // Instructor feedback
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Digital certificates issued to coaches
export const coachCertificates = pgTable("coach_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  enrollmentId: varchar("enrollment_id").notNull().references(() => coachEnrollments.id),
  certificateNumber: varchar("certificate_number").notNull().unique(),
  issuedDate: timestamp("issued_date").defaultNow(),
  expirationDate: timestamp("expiration_date"), // Some certifications expire
  credentialUrl: varchar("credential_url"), // Link to verify certificate
  certificatePdfUrl: varchar("certificate_pdf_url"), // PDF download
  digitalBadgeUrl: varchar("digital_badge_url"), // LinkedIn badge, etc.
  status: varchar("status").default("active"), // active, expired, revoked
  revokedReason: text("revoked_reason"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Continuing education credits tracking
export const ceCredits = pgTable("ce_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").references(() => certificationCourses.id),
  certificateId: varchar("certificate_id").references(() => coachCertificates.id),
  creditHours: decimal("credit_hours").notNull(),
  creditType: varchar("credit_type").notNull(), // course, workshop, conference, self_study
  provider: varchar("provider").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, rejected
  documentUrl: varchar("document_url"), // Supporting documentation
  description: text("description"),
  category: varchar("category"), // wellness, ethics, clinical, etc.
  accreditationBody: varchar("accreditation_body"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Assessment system for paid results
export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assessmentType: varchar("assessment_type").notNull(),
  results: jsonb("results"),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat sessions for AI coach memory
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").notNull().unique(),
  module: varchar("module"), // weight_loss, career, wellness, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Discovery quiz results for onboarding
export const discoveryQuizResults = pgTable("discovery_quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Can be null for anonymous users
  sessionId: varchar("session_id"), // For tracking anonymous sessions
  currentNeeds: text("current_needs").array(), // Up to 3 selections
  situationDetails: jsonb("situation_details"), // Deeper dive responses
  supportPreference: varchar("support_preference"), // live, ai, mix, unsure
  readinessLevel: varchar("readiness_level"), // overwhelmed, managing, motivated, curious
  recommendedPath: jsonb("recommended_path"), // Generated coaching matches
  quizVersion: varchar("quiz_version").default("v1"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach matching logic and tags
export const coachMatchTags = pgTable("coach_match_tags", {
  id: serial("id").primaryKey(),
  tagCombination: varchar("tag_combination").notNull(), // e.g., "divorce+emotionally_lost"
  primaryCoach: varchar("primary_coach"), // Main coach specialty
  supportingCoaches: text("supporting_coaches").array(), // Additional coach types
  aiTools: text("ai_tools").array(), // Recommended AI assistance
  groupSupport: boolean("group_support").default(false),
  priority: integer("priority").default(1), // For matching precedence
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages with summaries
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  role: varchar("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  summary: text("summary"),
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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email"),
  phone: varchar("phone"),
  bio: text("bio"),
  location: varchar("location"),
  linkedIn: varchar("linked_in"),
  credentials: text("credentials"),
  experience: text("experience"),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  yearsOfExperience: integer("years_of_experience"),
  photoUrl: varchar("photo_url"),
  videoUrl: varchar("video_url"),
  resumeUrl: varchar("resume_url"),
  certificationUrls: jsonb("certification_urls").$type<string[]>().default([]),
  philosophy: text("philosophy"), // Coaching philosophy
  methods: text("methods"), // Methods and techniques
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

// Application documents for enhanced coach onboarding
export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  documentType: varchar("document_type").notNull(), // resume, certification, photo, intro_video
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Onboarding steps for tracking progress
export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  stepName: varchar("step_name").notNull(),
  stepType: varchar("step_type").notNull(), // document_upload, form_completion, video_upload, review
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Knowledge Base Tables
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(), // FAQ, Guide, Tutorial, Documentation, Policy
  subcategory: varchar("subcategory"), // Specific topic area
  tags: jsonb("tags").$type<string[]>().default([]),
  status: varchar("status").default("published"), // draft, published, archived
  priority: integer("priority").default(0), // For ordering/importance
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  estimatedReadTime: integer("estimated_read_time"), // in minutes
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  searchKeywords: text("search_keywords"), // Additional search terms
  relatedArticles: jsonb("related_articles").$type<number[]>().default([]),
  featuredImage: text("featured_image"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  authorId: varchar("author_id").references(() => users.id),
  authorName: varchar("author_name").default("Admin"),
  lastReviewedBy: varchar("last_reviewed_by").references(() => users.id),
  lastReviewedAt: timestamp("last_reviewed_at"),
  isPublic: boolean("is_public").default(true),
  requiresAuth: boolean("requires_auth").default(false),
  targetAudience: varchar("target_audience").default("general"), // general, clients, coaches, admin
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBaseCategories = pgTable("knowledge_base_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  icon: varchar("icon"), // Icon name or URL
  color: varchar("color"), // Hex color code
  parentId: integer("parent_id").references(() => knowledgeBaseCategories.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBaseFeedback = pgTable("knowledge_base_feedback", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeBase.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For anonymous feedback
  wasHelpful: boolean("was_helpful").notNull(),
  feedback: text("feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBaseViews = pgTable("knowledge_base_views", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeBase.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For anonymous views
  viewDuration: integer("view_duration"), // in seconds
  completedReading: boolean("completed_reading").default(false),
  exitPoint: varchar("exit_point"), // Where user left the article
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBaseSearch = pgTable("knowledge_base_search", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"), // For anonymous searches
  resultsCount: integer("results_count").default(0),
  selectedResultId: integer("selected_result_id").references(() => knowledgeBase.id),
  wasSuccessful: boolean("was_successful").default(false),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI-Powered Wellness Journey Recommender Tables
export const wellnessJourneys = pgTable("wellness_journeys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  journeyType: varchar("journey_type").notNull(), // comprehensive, targeted, crisis_recovery, maintenance
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").defaultNow(),
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  currentPhase: varchar("current_phase"),
  overallProgress: integer("overall_progress").default(0), // 0-100 percentage
  aiAlgorithmVersion: varchar("ai_algorithm_version").default("v1.0"),
  adaptationCount: integer("adaptation_count").default(0),
  successMetrics: jsonb("success_metrics").$type<Record<string, any>>().default({}),
  userSatisfactionScore: integer("user_satisfaction_score"), // 1-10 rating
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  completionReasons: text("completion_reasons"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellnessGoals = pgTable("wellness_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  category: varchar("category").notNull(), // physical, mental, emotional, spiritual, social, career, financial
  specificGoal: text("specific_goal").notNull(),
  priority: varchar("priority").notNull(), // high, medium, low
  timeline: varchar("timeline").notNull(), // 1_week, 1_month, 3_months, 6_months, 1_year, ongoing
  currentLevel: integer("current_level").notNull(), // 1-10 scale
  targetLevel: integer("target_level").notNull(), // 1-10 scale
  actualLevel: integer("actual_level"), // Updated as user progresses
  obstacles: jsonb("obstacles").$type<string[]>().default([]),
  motivation: text("motivation"),
  progressNotes: text("progress_notes"),
  isAchieved: boolean("is_achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lifestyleAssessments = pgTable("lifestyle_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }).notNull(),
  exerciseFrequency: varchar("exercise_frequency").notNull(), // none, rarely, weekly, several_times, daily
  stressLevel: integer("stress_level").notNull(), // 1-10 scale
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  socialConnection: integer("social_connection").notNull(), // 1-10 scale
  workLifeBalance: integer("work_life_balance").notNull(), // 1-10 scale
  dietQuality: varchar("diet_quality").notNull(), // poor, fair, good, excellent
  majorLifeChanges: jsonb("major_life_changes").$type<string[]>().default([]),
  supportSystem: varchar("support_system").notNull(), // none, limited, moderate, strong
  previousWellnessExperience: text("previous_wellness_experience"),
  healthConcerns: jsonb("health_concerns").$type<string[]>().default([]),
  medications: text("medications"),
  chronicConditions: jsonb("chronic_conditions").$type<string[]>().default([]),
  mentalHealthHistory: text("mental_health_history"),
  substanceUse: jsonb("substance_use").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  learningStyle: varchar("learning_style").notNull(), // visual, auditory, kinesthetic, reading
  sessionDuration: varchar("session_duration").notNull(), // 5_min, 15_min, 30_min, 60_min, 90_min
  frequency: varchar("frequency").notNull(), // daily, every_other_day, weekly, bi_weekly, monthly
  reminderPreferences: jsonb("reminder_preferences").$type<string[]>().default([]), // email, push, sms, none
  preferredTimes: jsonb("preferred_times").$type<string[]>().default([]), // morning, afternoon, evening, late_night
  intensityPreference: varchar("intensity_preference").notNull(), // gentle, moderate, intense
  groupVsIndividual: varchar("group_vs_individual").notNull(), // individual, small_group, large_group, both
  technologyComfort: integer("technology_comfort").notNull(), // 1-10 scale
  communicationStyle: varchar("communication_style"), // direct, supportive, motivational, gentle
  culturalConsiderations: text("cultural_considerations"),
  accessibilityNeeds: jsonb("accessibility_needs").$type<string[]>().default([]),
  languagePreference: varchar("language_preference").default("en"),
  timezone: varchar("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journeyPhases = pgTable("journey_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseName: varchar("phase_name").notNull(),
  phaseDescription: text("phase_description"),
  phaseOrder: integer("phase_order").notNull(),
  estimatedDuration: varchar("estimated_duration"), // "2 weeks", "1 month", etc.
  actualDuration: integer("actual_duration"), // in days
  goals: jsonb("goals").$type<string[]>().default([]),
  milestones: jsonb("milestones").$type<string[]>().default([]),
  successCriteria: jsonb("success_criteria").$type<string[]>().default([]),
  progress: integer("progress").default(0), // 0-100 percentage
  isCurrent: boolean("is_current").default(false),
  isCompleted: boolean("is_completed").default(false),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellnessRecommendations = pgTable("wellness_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseId: varchar("phase_id").references(() => journeyPhases.id),
  type: varchar("type").notNull(), // daily_practice, weekly_goal, monthly_challenge, resource, milestone, adjustment
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  priority: integer("priority").notNull(), // 1-10 priority level
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  difficultyLevel: varchar("difficulty_level").notNull(), // beginner, intermediate, advanced
  aiReasoning: text("ai_reasoning").notNull(),
  actionSteps: jsonb("action_steps").$type<string[]>().default([]),
  successMetrics: jsonb("success_metrics").$type<string[]>().default([]),
  resources: jsonb("resources").$type<Array<{
    type: string;
    title: string;
    url: string;
    duration?: number;
  }>>().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  followUpActions: jsonb("follow_up_actions").$type<string[]>().default([]),
  personalizationFactors: jsonb("personalization_factors").$type<string[]>().default([]),
  expectedOutcomes: jsonb("expected_outcomes").$type<string[]>().default([]),
  progressTracking: jsonb("progress_tracking").$type<{
    method: string;
    frequency: string;
    checkpoints: string[];
  }>(),
  adaptationTriggers: jsonb("adaptation_triggers").$type<string[]>().default([]),
  crisisSupport: boolean("crisis_support").default(false),
  isActive: boolean("is_active").default(true),
  userProgress: integer("user_progress").default(0), // 0-100 percentage
  userRating: integer("user_rating"), // 1-5 stars
  userFeedback: text("user_feedback"),
  timesAccessed: integer("times_accessed").default(0),
  lastAccessed: timestamp("last_accessed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const journeyAdaptations = pgTable("journey_adaptations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  adaptationReason: varchar("adaptation_reason").notNull(), // user_feedback, progress_stalled, life_changes, crisis, goal_achieved
  adaptationType: varchar("adaptation_type").notNull(), // phase_adjustment, goal_modification, pace_change, resource_swap, crisis_intervention
  originalValue: jsonb("original_value"),
  newValue: jsonb("new_value"),
  description: text("description").notNull(),
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  userApproved: boolean("user_approved").default(false),
  effectivenessScore: integer("effectiveness_score"), // 1-10, assessed later
  impactOnProgress: integer("impact_on_progress"), // -10 to +10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journeyMilestones = pgTable("journey_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseId: varchar("phase_id").references(() => journeyPhases.id),
  milestoneType: varchar("milestone_type").notNull(), // goal_achievement, habit_formation, skill_mastery, breakthrough, celebration
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  criteriaForCompletion: jsonb("criteria_for_completion").$type<string[]>().default([]),
  targetDate: timestamp("target_date"),
  isAchieved: boolean("is_achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  celebrationSuggestions: jsonb("celebration_suggestions").$type<string[]>().default([]),
  impactOnJourney: text("impact_on_journey"),
  userReflection: text("user_reflection"),
  nextSteps: jsonb("next_steps").$type<string[]>().default([]),
  difficultyRating: integer("difficulty_rating"), // 1-10 scale, set by user after achievement
  satisfactionRating: integer("satisfaction_rating"), // 1-10 scale, set by user after achievement
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const progressTracking = pgTable("progress_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),  
  recommendationId: varchar("recommendation_id").references(() => wellnessRecommendations.id),
  goalId: varchar("goal_id").references(() => wellnessGoals.id),
  trackingDate: timestamp("tracking_date").defaultNow(),
  progressValue: decimal("progress_value", { precision: 5, scale: 2 }), // flexible numeric value
  progressUnit: varchar("progress_unit"), // percentage, hours, sessions, points, level, etc.
  userNotes: text("user_notes"),
  moodRating: integer("mood_rating"), // 1-10 scale
  energyRating: integer("energy_rating"), // 1-10 scale
  confidenceRating: integer("confidence_rating"), // 1-10 scale
  challengesEncountered: jsonb("challenges_encountered").$type<string[]>().default([]),
  successesCelebrated: jsonb("successes_celebrated").$type<string[]>().default([]),
  adaptationsNeeded: text("adaptations_needed"),
  isAutoTracked: boolean("is_auto_tracked").default(false), // if tracked automatically vs manual entry
  dataSource: varchar("data_source"), // manual, app_integration, wearable, etc.
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, needs_review
  createdAt: timestamp("created_at").defaultNow(),  
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  insightType: varchar("insight_type").notNull(), // pattern_recognition, progress_analysis, recommendation_optimization, risk_assessment, success_prediction
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  dataPoints: jsonb("data_points").$type<Record<string, any>>().default({}), // relevant data that led to insight
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00-1.00
  actionable: boolean("actionable").default(true),
  suggestedActions: jsonb("suggested_actions").$type<string[]>().default([]),
  impactLevel: varchar("impact_level").notNull(), // low, medium, high, critical
  validatedByUser: boolean("validated_by_user"),
  userFeedback: text("user_feedback"),
  algorithmVersion: varchar("algorithm_version").default("v1.0"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Knowledge Base Relations
export const knowledgeBaseRelations = relations(knowledgeBase, ({ one, many }) => ({
  author: one(users, {
    fields: [knowledgeBase.authorId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [knowledgeBase.lastReviewedBy],
    references: [users.id],
  }),
  feedback: many(knowledgeBaseFeedback),
  views: many(knowledgeBaseViews),
}));

export const knowledgeBaseCategoriesRelations = relations(knowledgeBaseCategories, ({ one, many }) => ({
  parent: one(knowledgeBaseCategories, {
    fields: [knowledgeBaseCategories.parentId],
    references: [knowledgeBaseCategories.id],
  }),
  children: many(knowledgeBaseCategories),
}));

export const knowledgeBaseFeedbackRelations = relations(knowledgeBaseFeedback, ({ one }) => ({
  article: one(knowledgeBase, {
    fields: [knowledgeBaseFeedback.articleId],
    references: [knowledgeBase.id],
  }),
  user: one(users, {
    fields: [knowledgeBaseFeedback.userId],
    references: [users.id],
  }),
}));

export const knowledgeBaseViewsRelations = relations(knowledgeBaseViews, ({ one }) => ({
  article: one(knowledgeBase, {
    fields: [knowledgeBaseViews.articleId],
    references: [knowledgeBase.id],
  }),
  user: one(users, {
    fields: [knowledgeBaseViews.userId],
    references: [users.id],
  }),
}));

export const knowledgeBaseSearchRelations = relations(knowledgeBaseSearch, ({ one }) => ({
  selectedResult: one(knowledgeBase, {
    fields: [knowledgeBaseSearch.selectedResultId],
    references: [knowledgeBase.id],
  }),
  user: one(users, {
    fields: [knowledgeBaseSearch.userId],
    references: [users.id],
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

// Knowledge Base Insert Schemas
export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  viewCount: true,
  helpfulCount: true,
  notHelpfulCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseCategorySchema = createInsertSchema(knowledgeBaseCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseFeedbackSchema = createInsertSchema(knowledgeBaseFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseViewSchema = createInsertSchema(knowledgeBaseViews).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseSearchSchema = createInsertSchema(knowledgeBaseSearch).omit({
  id: true,
  createdAt: true,
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

// Knowledge Base Types
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBaseCategory = typeof knowledgeBaseCategories.$inferSelect;
export type InsertKnowledgeBaseCategory = z.infer<typeof insertKnowledgeBaseCategorySchema>;
export type KnowledgeBaseFeedback = typeof knowledgeBaseFeedback.$inferSelect;
export type InsertKnowledgeBaseFeedback = z.infer<typeof insertKnowledgeBaseFeedbackSchema>;
export type KnowledgeBaseView = typeof knowledgeBaseViews.$inferSelect;
export type InsertKnowledgeBaseView = z.infer<typeof insertKnowledgeBaseViewSchema>;
export type KnowledgeBaseSearch = typeof knowledgeBaseSearch.$inferSelect;
export type InsertKnowledgeBaseSearch = z.infer<typeof insertKnowledgeBaseSearchSchema>;

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

// ============================================
// MULTI-ASSESSMENT SYSTEM TABLES
// ============================================

// Assessment types definition
export const assessmentTypes = pgTable("assessment_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "weight_loss_intake", "attachment_style", etc.
  displayName: varchar("display_name").notNull(), // "Weight Loss Intake", "Attachment Style Assessment"
  category: varchar("category").notNull(), // "health", "relationships", "career", etc.
  description: text("description"),
  version: integer("version").default(1),
  fields: jsonb("fields").notNull(), // Field definitions for the form
  coachTypes: text("coach_types").array(), // Which AI coaches can access this data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User completed assessments
export const userAssessments = pgTable("user_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assessmentTypeId: varchar("assessment_type_id").notNull().references(() => assessmentTypes.id),
  responses: jsonb("responses").notNull(), // All form responses
  summary: text("summary"), // AI-generated summary of responses
  tags: text("tags").array(), // Extracted tags for search/matching
  completedAt: timestamp("completed_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI coach access log (tracking which coaches access what data)
export const coachInteractions = pgTable("coach_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  coachType: varchar("coach_type").notNull(), // "weight_loss", "relationship", etc.
  accessedAssessments: text("accessed_assessments").array(), // Array of assessment IDs used
  interactionSummary: text("interaction_summary"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assessment templates/forms
export const assessmentForms = pgTable("assessment_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentTypeId: varchar("assessment_type_id").notNull().references(() => assessmentTypes.id),
  formData: jsonb("form_data").notNull(), // Complete form structure
  validationRules: jsonb("validation_rules"), // Field validation rules
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for assessment system
export const assessmentTypesRelations = relations(assessmentTypes, ({ many }) => ({
  userAssessments: many(userAssessments),
  assessmentForms: many(assessmentForms),
}));

export const userAssessmentsRelations = relations(userAssessments, ({ one }) => ({
  user: one(users, {
    fields: [userAssessments.userId],
    references: [users.id],
  }),
  assessmentType: one(assessmentTypes, {
    fields: [userAssessments.assessmentTypeId],
    references: [assessmentTypes.id],
  }),
}));

export const coachInteractionsRelations = relations(coachInteractions, ({ one }) => ({
  user: one(users, {
    fields: [coachInteractions.userId],
    references: [users.id],
  }),
}));

// Insert schemas for assessment system
export const insertAssessmentTypeSchema = createInsertSchema(assessmentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAssessmentSchema = createInsertSchema(userAssessments).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachInteractionSchema = createInsertSchema(coachInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentFormSchema = createInsertSchema(assessmentForms).omit({
  id: true,
  createdAt: true,
});

// Types for assessment system
export type AssessmentType = typeof assessmentTypes.$inferSelect;
export type InsertAssessmentType = z.infer<typeof insertAssessmentTypeSchema>;

export type UserAssessment = typeof userAssessments.$inferSelect;
export type InsertUserAssessment = z.infer<typeof insertUserAssessmentSchema>;

export type CoachInteraction = typeof coachInteractions.$inferSelect;
export type InsertCoachInteraction = z.infer<typeof insertCoachInteractionSchema>;

export type AssessmentForm = typeof assessmentForms.$inferSelect;
export type InsertAssessmentForm = z.infer<typeof insertAssessmentFormSchema>;

// ============================================
// COACHING PLANS & SUBSCRIPTION TABLES
// ============================================

// Coaching plans that users can subscribe to
export const coachingPlans = pgTable("coaching_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Basic Wellness", "Premium Life Coaching", "Elite Transformation"
  description: text("description").notNull(),
  category: varchar("category").notNull(), // "wellness", "relationship", "career", "health", "comprehensive"
  price: decimal("price").notNull(), // Monthly price in USD
  billingInterval: varchar("billing_interval").default("month"), // month, year
  trialDays: integer("trial_days").default(0), // Free trial period
  features: jsonb("features").notNull(), // Array of features included
  assessmentTypes: text("assessment_types").array(), // Which assessments are included
  coachAccess: jsonb("coach_access").notNull(), // Which AI coaches are available
  sessionLimits: jsonb("session_limits"), // Limits per month if any
  priority: integer("priority").default(0), // Support priority level
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false), // Featured plan
  stripePriceId: varchar("stripe_price_id"), // Stripe price ID for subscriptions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions to coaching plans
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => coachingPlans.id),
  status: varchar("status").notNull(), // active, canceled, past_due, unpaid, trialing, paused
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  canceledAt: timestamp("canceled_at"),
  cancelationReason: text("cancelation_reason"),
  nextBillingDate: timestamp("next_billing_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  totalPaid: decimal("total_paid").default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track user coaching sessions and usage
export const coachingSessionUsage = pgTable("coaching_session_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => userSubscriptions.id),
  coachType: varchar("coach_type").notNull(), // Which AI coach was used
  sessionType: varchar("session_type").notNull(), // assessment, coaching, consultation
  duration: integer("duration"), // Session duration in minutes
  messagesExchanged: integer("messages_exchanged").default(0),
  assessmentsUsed: text("assessments_used").array(), // Assessment IDs accessed
  billingPeriod: varchar("billing_period"), // Which billing period this usage counts towards
  createdAt: timestamp("created_at").defaultNow(),
});

// Plan feature access matrix
export const planFeatures = pgTable("plan_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => coachingPlans.id),
  featureType: varchar("feature_type").notNull(), // coach_access, assessment, session_limit, priority
  featureName: varchar("feature_name").notNull(),
  featureValue: jsonb("feature_value"), // Flexible value storage (boolean, number, string, object)
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for subscription system
export const coachingPlansRelations = relations(coachingPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
  planFeatures: many(planFeatures),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(coachingPlans, {
    fields: [userSubscriptions.planId],
    references: [coachingPlans.id],
  }),
  sessionUsage: many(coachingSessionUsage),
}));

export const coachingSessionUsageRelations = relations(coachingSessionUsage, ({ one }) => ({
  user: one(users, {
    fields: [coachingSessionUsage.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [coachingSessionUsage.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

export const planFeaturesRelations = relations(planFeatures, ({ one }) => ({
  plan: one(coachingPlans, {
    fields: [planFeatures.planId],
    references: [coachingPlans.id],
  }),
}));

// Insert schemas for subscription system
export const insertCoachingPlanSchema = createInsertSchema(coachingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachingSessionUsageSchema = createInsertSchema(coachingSessionUsage).omit({
  id: true,
  createdAt: true,
});

export const insertPlanFeatureSchema = createInsertSchema(planFeatures).omit({
  id: true,
  createdAt: true,
});

// Types for subscription system
export type CoachingPlan = typeof coachingPlans.$inferSelect;
export type InsertCoachingPlan = z.infer<typeof insertCoachingPlanSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type CoachingSessionUsage = typeof coachingSessionUsage.$inferSelect;
export type InsertCoachingSessionUsage = z.infer<typeof insertCoachingSessionUsageSchema>;

export type PlanFeature = typeof planFeatures.$inferSelect;
export type InsertPlanFeature = z.infer<typeof insertPlanFeatureSchema>;
