# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a comprehensive nonprofit digital solution providing life coaching services to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation and membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching journeys, including strategic lead generation and smart matching.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **AI Coaching System**: Features 6 specialized AI coaches fully integrated with OpenAI Assistants API for persistent conversations, unique assistant IDs, and customizable tones. Includes a modern, accessible chat UI with emotion-aware messaging and real-time typing indicators.
- **Conversation Intelligence**: AI-powered summarization generates daily/weekly digests with action items, emotional tone detection, key topic extraction, and personalized insights. Automated email delivery with user-configurable frequency and timezone preferences.
- **Mental Health Safety**: Crisis detection system scans for mental health keywords, assesses severity, and automatically alerts admins via email. Includes human handoff options and emergency resources.
- **Professional Coach Management**: Supports coach onboarding, profile management, scheduling, client assignment, progress tracking, and Google Meet integration. Features social-style public profile pages.
- **Donation & Membership System**: Integrates Stripe for donation processing, manages membership tiers, and includes a points-based reward system and campaign management.
- **Admin Dashboard**: Provides role-based access for admins, super admins, and coaches with analytics, user management, and dynamic content updates.
- **Member Portal**: Offers secure registration, automated onboarding, specialty selection, session booking, progress tracking, and a resource library. Includes social-style public profile pages.
- **Multi-assessment System**: Implements comprehensive assessment types with database architecture and API.
- **Certification System**: Manages coach certification courses, enrollment, progress tracking, and certificate issuance, including Google Drive integration.
- **Wellness Journey Recommender**: An AI-powered system for personalized wellness journeys, goal tracking, and progress monitoring.
- **UX Optimization**: Features guided welcome flows, smart navigation, quick-start dashboards, guided tours, and visual progress indicators.

### Security Requirements
- **Headers**: Helmet middleware for CSP, HSTS, X-Content-Type-Options.
- **CORS**: Strict allowlist of known frontend origins.
- **Sessions/Tokens**: Short lifetimes, SameSite, HttpOnly, Secure flags.
- **Rate Limiting**: Tiered protection for auth endpoints (10 req/15min) and general API (100 req/15min), payment endpoints (3 req/15min), and sensitive ops (5 req/15min).
- **Secrets**: Environment variables only.
- **Webhooks**: Signature verification and idempotency handling.

### Performance Goals
- **Bundle Size**: Initial JS bundle <200KB gzipped.
- **Code Splitting**: Defer non-critical components.
- **Images**: WebP/AVIF formats with responsive srcset.
- **Compression**: Gzip/brotli enabled; leverage CDN caching.
- **Database**: Indexed fields (userId, createdAt, purchaseId).

## External Dependencies

### Core Services
- **Supabase**: Primary database hosting, authentication, and storage.
- **OpenAI**: AI coaching capabilities via GPT-4, conversation summarization, and insights generation.
- **SendGrid**: Transactional email service for digests, crisis alerts, and notifications.
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
- **Wix SDK (Conditional)**: Potential future integration.