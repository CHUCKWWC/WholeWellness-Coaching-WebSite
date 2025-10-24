# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a nonprofit digital solution providing life coaching to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation/membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching, strategic lead generation, and smart matching.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend Framework**: React with TypeScript, built with Vite.
- **UI Components**: Radix UI with Tailwind CSS for a custom design system.
- **Styling**: Tailwind CSS.
- **UX Optimization**: Guided welcome flows, smart navigation, quick-start dashboards, guided tours, and visual progress indicators.
- **Navigation System**: 
  - Role-aware navigation that adapts menu items based on user role (guest, user/member, coach, admin, super_admin)
  - Unified login system with automatic role detection and smart redirects
  - DashboardRouter component for automatic role-based dashboard routing
  - Breadcrumb navigation on key pages for location awareness
  - Mobile-optimized quick access navigation with role-specific items
- **User Guidance**:
  - HelpTooltip component for contextual inline help
  - EmptyState component with clear CTAs for empty data states
  - Role-specific quick actions and dashboard layouts
  - Consolidated duplicate pages for cleaner navigation (unified login, single assessments page)
- **Unified Onboarding System**:
  - SmartOnboarding component that detects user type and adapts flow dynamically
  - Automatic role detection from authentication state or manual selection
  - Unified entry point at /onboarding route
  - Seamless integration of client (8-step) and coach (7-step) onboarding flows
- **Progress Indicators**:
  - StepProgressIndicator with visual milestones for multi-step processes
  - CompactProgressIndicator for tight spaces
  - MilestoneProgressIndicator for journey tracking
  - Color-coded states: completed (green), current (purple), upcoming (gray)
  - Integrated into all onboarding flows for clear position awareness

### Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, ES modules.
- **Database**: PostgreSQL via Drizzle ORM, hosted on Neon (local development database).
- **Authentication**: Custom JWT-based authentication with bcrypt, migrated to local PostgreSQL database.
  - Centralized storage system (app-storage.ts) with proxy pattern
  - DrizzleStorage implementation for local database operations
  - Seamless fallback to Supabase for unimplemented features
  - All core user operations (login, registration, session management) use local database
- **API**: RESTful API with modular routes, CORS, JSON parsing, and centralized error handling.
- **AI Coaching System**: 6 specialized AI coaches using OpenAI Assistants API for persistent, customizable conversations with a modern chat UI.
- **Conversation Intelligence**: AI-powered summarization, emotion detection, key topic extraction, personalized insights, and automated email delivery.
- **Mental Health Safety**: Crisis detection system with admin alerts, human handoff, and emergency resources.
- **Multi-assessment System**: Comprehensive assessment types with database architecture and API.
- **Certification System**: Manages coach certification, enrollment, progress, and certificate issuance with Google Drive integration.
- **Wellness Journey Recommender**: AI-powered personalized wellness journeys, goal tracking, and progress monitoring.
- **Video Conferencing System**: 100ms-powered video sessions with coach-initiated session creation, client pre-registration with auth tokens, recording, transcription, and AI summaries. Features instant video sessions with shareable room codes, guest access without authentication, and comprehensive camera/microphone permission prompts to ensure smooth user experience.
- **Media Upload System**: Comprehensive media upload capabilities using Replit Object Storage with presigned URLs, supporting pictures, videos, documents, and audio. Features include:
  - Uppy.js-powered multi-file upload with progress tracking
  - Direct-to-storage uploads via presigned URLs for security and performance
  - Owner-verified ACL policies preventing cross-account access
  - MediaGallery component with filtering, preview, and delete
  - Integration with user and coach profiles for profile pictures, cover photos, and intro videos
  - Backend tracks all uploaded media with metadata in PostgreSQL
  - SimpleFileUploader component for single-file scenarios

### System Design Choices
- **Security**: Helmet middleware for CSP, HSTS, X-Content-Type-Options; strict CORS; short-lifetime, SameSite, HttpOnly, Secure tokens; tiered rate limiting; environment variables for secrets; webhook signature verification.
- **Performance**: Initial JS bundle <200KB gzipped, code splitting, WebP/AVIF images with responsive srcset, Gzip/brotli compression, CDN caching, indexed database fields.

## External Dependencies

- **Neon (PostgreSQL)**: Primary database for development and production (via DATABASE_URL environment variable)
- **Supabase**: Legacy fallback for features not yet migrated to local storage.
- **OpenAI**: AI coaching, conversation summarization, and insights generation.
- **SendGrid**: Transactional email service.
- **Stripe**: Payment processing and subscription management.
- **n8n**: Workflow automation and AI integration.
- **100ms**: Video conferencing infrastructure for live coach-client sessions with recording and transcription capabilities.
- **Google OAuth**: Social login and admin authentication.
- **Gmail API**: Email sending for notifications.
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component library.
- **Replit**: Primary hosting platform.
- **GoDaddy**: Domain hosting.