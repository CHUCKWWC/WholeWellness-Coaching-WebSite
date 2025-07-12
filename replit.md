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

## User Preferences

Preferred communication style: Simple, everyday language.