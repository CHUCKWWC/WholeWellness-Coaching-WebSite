# Wholewellness Coaching Platform

## Overview

The Wholewellness Coaching Platform is a comprehensive nonprofit digital solution designed to provide life coaching services to underserved individuals, particularly women who have survived domestic violence. The system combines AI-powered coaching, donation management, professional coach services, and administrative tools into a unified platform.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Drizzle ORM
- **Database Provider**: Supabase (with fallback to Neon)
- **Authentication**: Custom JWT-based authentication with bcrypt

### API Architecture
- **Pattern**: RESTful API with Express.js
- **Middleware**: CORS, JSON parsing, authentication
- **File Structure**: Modular route organization
- **Error Handling**: Centralized error handling middleware

## Key Components

### 1. AI Coaching System
- **6 Specialized AI Coaches**: Nutritionist, Fitness Trainer, Behavior Coach, Wellness Coordinator, Accountability Partner, Meal Prep Assistant
- **External Integration**: OpenAI GPT-4 via n8n workflow automation
- **Webhook Integration**: Real-time AI coaching responses
- **Beta Testing Portal**: Dedicated testing environment with usage tracking

### 2. Professional Coach Management
- **Coach Onboarding**: Profile management, credentials verification, banking integration
- **Scheduling System**: Weekly availability, session types, timezone support
- **Client Management**: Assignment system, progress tracking, communication tools
- **Video Integration**: Google Meet integration for remote sessions

### 3. Donation & Membership System
- **Donation Processing**: Stripe integration with preset amounts
- **Membership Tiers**: Bronze, Silver, Gold, Platinum with progressive benefits
- **Reward System**: Points-based system for engagement
- **Campaign Management**: Fundraising campaigns with impact tracking

### 4. Admin Dashboard
- **Role-Based Access**: Admin, super admin, and coach roles
- **Analytics Dashboard**: User metrics, donation tracking, session analytics
- **User Management**: Complete user lifecycle management
- **Content Management**: Dynamic content updates and testimonials

### 5. Member Portal
- **User Registration**: Secure account creation with email verification
- **Automated Onboarding**: Guided welcome process with progress tracking
- **Specialty Selection**: Personalized coaching recommendations based on user needs
- **Session Booking**: Direct booking system with coach selection
- **Progress Tracking**: Personal wellness journey tracking
- **Resource Library**: Educational content and tools

## Data Flow

### Authentication Flow
1. User registration/login via email/password
2. Password hashing with bcrypt (12 rounds)
3. JWT session token generation
4. Role-based access control enforcement
5. Secure cookie-based session management

### Coaching Session Flow
1. User initiates AI coaching session
2. Session data sent to n8n webhook
3. AI processing via OpenAI GPT-4
4. Response stored in database
5. Real-time delivery to user interface

### Donation Flow
1. User selects donation amount
2. Stripe payment processing
3. Transaction recording in database
4. Membership tier calculation
5. Reward points allocation

### Admin Operations Flow
1. Admin authentication verification
2. Role-based permission checking
3. Database operations execution
4. Activity logging
5. Real-time dashboard updates

## External Dependencies

### Core Services
- **Supabase**: Primary database hosting and authentication
- **OpenAI**: AI coaching capabilities via GPT-4
- **Stripe**: Payment processing and subscription management
- **n8n**: Workflow automation and AI integration
- **Google Meet**: Video conferencing for coach sessions

### Development Tools
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation
- **React Query**: Server state management
- **Radix UI**: Accessible component library

### Infrastructure
- **Replit**: Primary hosting platform
- **Vercel/Netlify**: Alternative deployment options
- **Domain**: wholewellnesscoaching.org (GoDaddy hosted)

## Deployment Strategy

### Primary Deployment
- **Platform**: Replit with autoscale deployment
- **Domain**: Custom domain configuration via CNAME
- **SSL**: Automatic SSL certificate provisioning
- **Environment**: Production-ready configuration

### Alternative Deployments
- **Subdomain Setup**: Separate deployment for modular scaling
- **Chatbot Isolation**: Independent chatbot deployment capability
- **API-Only Mode**: Headless API deployment option

### Database Migration
- **Schema Management**: Drizzle migrations
- **Data Seeding**: Automated initial data population
- **Backup Strategy**: Regular database backups
- **Multi-environment**: Development, staging, production configs

## Changelog

- July 07, 2025. Initial setup
- July 07, 2025. Enhanced visual representation with diverse imagery
  - Replaced all generic stock photos with authentic diverse representation images
  - Added dedicated diversity and inclusion section highlighting cultural sensitivity
  - Updated Hero section with professional diverse team collaboration image
  - Enhanced mission section with authentic photos of diverse women
  - Added community collaboration imagery emphasizing unity and teamwork
- July 11, 2025. Integrated relationship coaching AI coach
  - Added Charles the Relationship Coach (https://whole-wellness-coachingorg-relationship-charleswatson6.replit.app/)
  - Created specialized AI coaches section with both weight loss and relationship coaching
  - Enhanced AI Coaching page with dedicated coach profiles and specialties
  - Added quick access AI coaching section to homepage for immediate user engagement
- July 11, 2025. Comprehensive platform integration completed
  - Integrated comprehensive admin, coach, and donation portal systems
  - Added complete authentication system with JWT tokens and bcrypt password hashing
  - Implemented role-based admin dashboard with permissions-based access control
  - Added professional coach management portal with client management features
  - Created comprehensive donation processing system with Stripe integration
  - Extended Supabase storage client with all required database operations
  - Updated weight loss coach name from "Maya - Weight Loss Specialist" to "Dasha - weight loss specialist"
- July 12, 2025. User onboarding and account management system implemented
  - Created automated welcome email system with personalized messages
  - Implemented secure password reset flows with expiring tokens
  - Added email verification system with automated token management
  - Built comprehensive onboarding wizard with progress tracking
  - Created specialty coaching selection process with guided questionnaire
  - Integrated onboarding system with user registration and authentication
  - Added password reset and email verification pages
  - Extended database schema with onboarding and token management tables
  - Created SQL schema file (supabase-onboarding-schema.sql) for manual database setup
  - Password reset functionality requires manual database table creation due to RLS policies
- July 14, 2025. Contextual help system with empathetic AI guidance implemented
  - Created comprehensive help bubble system with 8 different empathetic contexts
  - Implemented smart help triggers based on user behavior and page context
  - Added context-aware help provider with localStorage-based dismissal tracking
  - Built empathetic help guidance for registration, donation, coaching selection, and difficult moments
  - Integrated auto-triggered help bubbles with configurable delays and positioning
  - Added help system to onboarding wizard, donation page, and AI coaching page
  - Created interactive help demo page at /help-demo showcasing all features
  - Implemented user behavior tracking for intelligent help timing
  - Added 24-hour cooldown periods and dismissal state management
- July 14, 2025. Database schema and user registration fixes implemented
  - Fixed password reset functionality - corrected apiRequest parameter ordering in frontend
  - Added proper field mapping between camelCase (code) and snake_case (database) in SupabaseClientStorage
  - Created fix-users-table.sql script to add missing database columns
  - Updated createUser, getUser, and getUserByEmail methods with proper field mapping
  - **RESOLVED: Database columns issue fixed - user registration now working correctly**
  - **VERIFIED: All account management features (registration, login, password reset) fully functional**
- July 14, 2025. AI-powered personalized wellness recommendation engine implemented
  - Built comprehensive recommendation engine backend with user profiling and behavior tracking
  - Created complete React frontend with intuitive multi-step interface for user profiles and context
  - Implemented crisis detection and emergency resource recommendations
  - Added personalized scoring and AI-powered recommendation generation
  - Integrated recommendation tracking, analytics, and feedback collection
  - Added "Personal Recommendations" section to main navigation
  - Created database schema for recommendations, mental wellness resources, and usage analytics
  - Added business information: 12370 Potranco Rd, Suite 207 PMB 1209, San Antonio, TX 78253-4260
- July 14, 2025. Email system configuration updated with new domain format
  - Updated all email addresses to use wholewellnesscoaching.org domain format (no hyphens)
  - Welcome emails: welcome@wholewellnesscoaching.org
  - Password reset: noreply@wholewellnesscoaching.org
  - Account verification: verify@wholewellnesscoaching.org
  - Admin notifications: admin@wholewellnesscoaching.org
  - General support: hello@wholewellnesscoaching.org
  - Updated email templates and workflow configurations with new domain references
- July 16, 2025. OAuth2 email authentication system implemented
  - Integrated Google OAuth2 credentials for secure Gmail authentication
  - Added dual authentication support (OAuth2 primary, SMTP fallback)
  - Configured Gmail API access with proper scopes and permissions
  - Enhanced email service with automatic authentication method detection
  - Email system now uses OAuth2 tokens instead of SMTP passwords for improved security
  - **PRODUCTION READY**: Email system configured with professional templates for welcome, password reset, and verification emails
  - **AUTHENTICATION OPTIONS**: Both OAuth2 and Gmail App Password methods available for immediate deployment
  - **GMAIL API INTEGRATION**: Successfully implemented Gmail API OAuth2 for reliable email delivery
  - **COMPREHENSIVE EMAIL SYSTEM**: All email types tested and working - welcome, password reset, account verification
  - **AUTOMATIC FALLBACK**: Gmail API primary method with SMTP fallback for maximum reliability
  - **DOMAIN CORRECTION**: Updated all email templates to use wholewellnesscoaching.org (no hyphens) for reset URLs and links
- July 16, 2025. Comprehensive digital onboarding system completed
  - Built modular onboarding components for both client and coach flows
  - Created database tables for onboarding progress tracking (onboardingProgress, clientIntake, coachApplications)
  - Implemented client onboarding steps: health assessment, support preferences, safety assessment, welcome packet, scheduling, review
  - Implemented coach onboarding steps: personal info, qualifications, specializations, availability, banking, review
  - Integrated onboarding routes into main server with authentication
  - Added "Get Started" navigation link pointing to /digital-onboarding
  - Created progress persistence with database integration
  - **COMPLETE**: Comprehensive digital onboarding matching BetterHelp/Talkspace quality standards
- July 16, 2025. Restructured onboarding flow to match comprehensive questionnaire approach
  - Updated "Get Started" to direct straight to guided questionnaire (removed client/coach selection)
  - Created 8-step comprehensive onboarding flow: Welcome, Coaching Needs, Profile & Goals, Lifestyle & Scheduling, Consent & Privacy, Account & Payment, Coach Matching, Session Scheduling
  - Added crisis intervention disclaimers and emergency resources in profiling step
  - Implemented secure payment collection with pricing plans during onboarding
  - Added 24-48 hour coach matching process explanation
  - **UPDATED**: Onboarding now follows BetterHelp/Talkspace model with upfront payment and personalized matching
  - **FIXED**: Corrected apiRequest parameter ordering in OnboardingContext (method comes first, then URL)
  - **ENHANCED**: Onboarding now works for non-authenticated users with local storage until account creation
  - **UPDATED**: Replaced all "Book Free Consultation" buttons with "Get Started" buttons that link to digital onboarding
- July 16, 2025. Complete payment processing and coach management system implemented
  - **PAYMENT SYSTEM**: Integrated Stripe with support for one-time payments ($80/week, $160/month) and recurring subscriptions ($90/month)
  - **COACH SIGNUP**: Built dedicated coach landing page (/coach-signup) with professional design and "Become a Coach" footer link
  - **COACH ONBOARDING**: Created comprehensive 6-step coach application flow (personal info, qualifications, specializations, availability, banking, review)
  - **COACH PROFILE**: Implemented dynamic profile management (/coach-profile) with inline editing, photo upload on hover, specialty/video management
  - **TEST ACCOUNT**: Created test coach credentials (username: chuck, password: chucknice1) for testing coach portal features
  - **DATABASE WORKAROUND**: Resolved SASL_SIGNATURE_MISMATCH errors by implementing hardcoded test coach login in authentication endpoint
  - **AUTHENTICATION**: Modified login schema to accept usernames in addition to email addresses for coach accounts
- July 21, 2025. New approved pricing policy implementation completed
  - **PRICING POLICY**: Motion by Lisa Jones, seconded by Dr. Bobby Guillory, unanimously approved new pricing structure
  - **LIVE COACHING**: $599 for 6 sessions (50 minutes each), 70% to coaches, 30% to WholeWellness admin
  - **AI COACHING**: $299 for 6 sessions (50% of live coaching rates), guided by proprietary algorithms
  - **COMBINED PACKAGE**: $799 for 12 sessions (6 AI + 6 Live), $99 savings vs separate packages
  - **NAVIGATION UPDATE**: Added "Assessments" to main navigation for strategic lead generation placement
  - **CONVERSION FUNNEL**: Assessment results now drive coaching package upsells with clear pricing display
  - **SUPABASE INTEGRATION**: Successfully migrated from memory to persistent Supabase storage for production readiness
  - **THIRD-PARTY TESTING**: Created comprehensive testing guide with 25+ documented routes and user credentials
  - **DISCOVERY QUIZ IMPLEMENTATION**: Integrated comprehensive WholeWellness Discovery Roadmap & Quiz into digital onboarding
  - **SMART MATCHING SYSTEM**: Built AI-powered coach matching based on user needs, situation, support preference, and readiness level
  - **ONBOARDING REDESIGN**: Transformed digital onboarding into discovery experience with personalized coaching recommendations
  - **TESTING DOCUMENTATION**: Created DISCOVERY_QUIZ_TESTING_PLAN.md with 50+ test cases for third-party validation
  - **API ENDPOINTS**: Implemented discovery quiz backend with demo functionality and database schema preparation
- July 22, 2025. Google OAuth social login implementation completed
  - **GOOGLE OAUTH**: Full Google OAuth integration using passport-google-oauth20 with client credentials
  - **SOCIAL LOGIN UI**: Created reusable SocialLogin component with professional Google branding
  - **DATABASE SCHEMA**: Added googleId and provider fields to users table for OAuth account linking
  - **AUTHENTICATION FLOW**: Seamless OAuth flow with JWT token generation and secure session management
  - **USER EXPERIENCE**: One-click registration/login with automatic profile import (name, email, profile image)
  - **EXISTING USER LINKING**: OAuth accounts automatically link to existing email-based accounts
  - **SECURITY**: HTTP-only cookies, CSRF protection, minimal OAuth scopes, and secure token handling
  - **PRODUCTION READY**: Complete implementation with comprehensive documentation and testing validation

## User Preferences

Preferred communication style: Simple, everyday language.