# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a nonprofit digital solution providing life coaching to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation/membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching, strategic lead generation, and smart matching.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend**: React with TypeScript and Vite.
- **UI Components**: Radix UI with Tailwind CSS for a custom design system.
- **Navigation**: Role-aware navigation system with distinct experiences for guests and authenticated users, including main items, wellness tools, connect & support, and admin/coach tools. Dashboard routing is role-specific.
- **User Guidance**: HelpTooltips, EmptyState components, and role-specific quick actions.
- **Onboarding**: Unified, dynamic SmartOnboarding component with automatic role detection, animated elements, milestone banners, testimonials, and auto-save.
- **"Commitment First" Fitness Checkout**: Combined registration and payment flow integrated with Stripe for Premium Wellness Membership, including email notifications.
- **Progress Indicators**: Various visual progress indicators for multi-step processes and journey tracking.

### Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript.
- **Database**: PostgreSQL via Drizzle ORM.
- **Authentication**: Custom JWT-based authentication with bcrypt, utilizing a local PostgreSQL database.
- **API**: RESTful API with modular routes, CORS, and centralized error handling.
- **AI Coaching System**: 6 specialized AI coaches using OpenAI Assistants API for customizable conversations.
- **Conversation Intelligence**: AI-powered summarization, emotion detection, and insights.
- **Mental Health Safety**: Crisis detection system with alerts and human handoff.
- **Multi-assessment System**: Supports various assessment types, including anonymous submissions.
- **Certification System**: Manages coach certification and progress.
- **Wellness Journey Recommender**: AI-powered personalized wellness journeys.
- **Video Conferencing**: Google Meet-powered sessions via Google Calendar API, allowing coaches to generate Meet links.
- **Media Upload System**: Comprehensive media upload using Replit Object Storage with presigned URLs, supporting various file types and integrated with profiles.
- **Settings & Preferences System**: User-configurable profile, privacy, and appearance settings (light/dark mode).
- **Wellness Resources Database**: Populated with articles, worksheets, videos, and podcasts.
- **Knowledge Base System**: Contains help articles across multiple categories.
- **Tutorial & Help System**: Interactive, HTML mockup-based tutorial system with numbered click targets and contextual tips, accessible to users and coaches.

### System Design Choices
- **Security**: Helmet middleware (CSP, HSTS), strict CORS, JWT security (SameSite, HttpOnly, Secure), tiered rate limiting, environment variables, webhook signature verification, and CSP configuration for Google Meet.
- **Performance**: Optimized for fast loading with code splitting, image optimization, compression, CDN caching, and indexed database fields.

## External Dependencies

- **Neon (PostgreSQL)**: Primary database.
- **Supabase**: Legacy fallback for certain features.
- **OpenAI**: AI coaching, summarization, and insights.
- **SendGrid**: Transactional email service.
- **Stripe**: Payment processing and subscription management.
- **n8n**: Workflow automation and AI integration.
- **Google Meet**: Enterprise video conferencing via Google Calendar API.
- **Google OAuth**: Social login and admin authentication.
- **Gmail API**: Email notifications.
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component library.
- **Replit**: Primary hosting platform.
- **GoDaddy**: Domain hosting.