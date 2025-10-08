# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a comprehensive nonprofit digital solution providing life coaching services to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation and membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching journeys, including strategic lead generation and smart matching.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**October 8, 2025**: Implemented social-style profile pages for coaches and members:
- Created CoachProfileView and UserProfileView components with Facebook-inspired layouts adapted to platform's teal aesthetic
- Added public profile routes `/coach/:coachId` and `/user/:userId` with lazy loading
- Integrated with existing backend API endpoints for profile data (GET /api/coach/profile/:coachId and GET /api/user/profile/:userId)
- Profile features include: cover photos, profile images, bio, social links (Instagram, LinkedIn, Twitter, Facebook), certifications, achievements, specialties
- Implemented responsive layouts with Cards, Badges, and Skeleton loading states
- Added role-based UI (own profile shows edit buttons, others show message/book buttons)

**August 1, 2025**: Resolved 403 Forbidden asset loading errors for production deployment:
- Updated CORS configuration to include production domains (wellness-central-charleswatson6.replit.app, wholewellnesscoaching.org)
- Enhanced Content Security Policy to allow assets from production domains
- Added specialized asset handling middleware for /assets/* routes with proper headers
- Implemented clean build process ensuring asset hash consistency
- Verified production server correctly serves CSS (index-C-rDCszs.css) and JS (index-8fIgh_68.js) assets
- Deployment status: Asset serving issues resolved, ready for production deployment

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built with Vite.
- **UI Components**: Radix UI with Tailwind CSS for a custom design system.
- **State Management**: TanStack Query for server state.
- **Styling**: Tailwind CSS.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL via Drizzle ORM, hosted on Supabase (with Neon fallback).
- **Authentication**: Custom JWT-based authentication with bcrypt.
- **API**: RESTful API with modular route organization, CORS, JSON parsing, and centralized error handling.

### Key Features
- **AI Coaching System**: Features 6 specialized AI coaches (Charlene - Mindfulness, Lisa - Behavior, Dasha - Wellness, Charles - Relationship, Bobby - Mental Health, Aria - Weight Loss) fully integrated with OpenAI Assistants API for persistent conversations. Each coach has a unique assistant ID and customizable tone/persona (supportive, motivational, analytical, gentle). Assistant responses are now working correctly with text format and thread persistence.
- **Professional Coach Management**: Supports coach onboarding, profile management, scheduling, client assignment, progress tracking, and Google Meet integration for sessions. Features social-style public profile pages for coaches displaying certifications, specialties, bio, and social links.
- **Donation & Membership System**: Integrates Stripe for donation processing, manages membership tiers, and includes a points-based reward system and campaign management.
- **Admin Dashboard**: Provides role-based access for admins, super admins, and coaches with analytics, user management, and dynamic content updates.
- **Member Portal**: Offers secure registration, automated onboarding, specialty selection, session booking, progress tracking, and a resource library. Includes social-style public profile pages displaying member achievements, wellness journey, and personal background.
- **Multi-assessment System**: Implements comprehensive assessment types (e.g., weight loss, attachment style, mental health screening) with database architecture and API.
- **Certification System**: Manages coach certification courses, enrollment, progress tracking, and certificate issuance, including integration with Google Drive for course content.
- **Wellness Journey Recommender**: An AI-powered system for personalized wellness journeys, goal tracking, and progress monitoring.
- **UX Optimization**: Features guided welcome flows, smart navigation, quick-start dashboards, guided tours, and visual progress indicators.

## External Dependencies

### Core Services
- **Supabase**: Primary database hosting, authentication, and storage.
- **OpenAI**: AI coaching capabilities via GPT-4.
- **Stripe**: Payment processing and subscription management.
- **n8n**: Workflow automation and AI integration.
- **Google Meet**: Video conferencing for professional coach sessions.
- **Google OAuth**: Social login and admin authentication.
- **Gmail API**: Email sending for notifications and account management.

### Development Tools
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **React Query**: Server state management.
- **Radix UI**: Accessible component library.

### Infrastructure
- **Replit**: Primary hosting platform.
- **Vercel/Netlify**: Alternative deployment options.
- **GoDaddy**: Domain hosting for wholewellnesscoaching.org.
- **Wix SDK (Conditional)**: Potential future integration for specific functionalities, with robust error handling for graceful fallback.