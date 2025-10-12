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

### Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, ES modules.
- **Database**: PostgreSQL via Drizzle ORM, hosted on Supabase (with Neon fallback).
- **Authentication**: Custom JWT-based authentication with bcrypt.
- **API**: RESTful API with modular routes, CORS, JSON parsing, and centralized error handling.
- **AI Coaching System**: 6 specialized AI coaches using OpenAI Assistants API for persistent, customizable conversations with a modern chat UI.
- **Conversation Intelligence**: AI-powered summarization, emotion detection, key topic extraction, personalized insights, and automated email delivery.
- **Mental Health Safety**: Crisis detection system with admin alerts, human handoff, and emergency resources.
- **Multi-assessment System**: Comprehensive assessment types with database architecture and API.
- **Certification System**: Manages coach certification, enrollment, progress, and certificate issuance with Google Drive integration.
- **Wellness Journey Recommender**: AI-powered personalized wellness journeys, goal tracking, and progress monitoring.

### System Design Choices
- **Security**: Helmet middleware for CSP, HSTS, X-Content-Type-Options; strict CORS; short-lifetime, SameSite, HttpOnly, Secure tokens; tiered rate limiting; environment variables for secrets; webhook signature verification.
- **Performance**: Initial JS bundle <200KB gzipped, code splitting, WebP/AVIF images with responsive srcset, Gzip/brotli compression, CDN caching, indexed database fields.

## External Dependencies

- **Supabase**: Database hosting, authentication, and storage.
- **OpenAI**: AI coaching, conversation summarization, and insights generation.
- **SendGrid**: Transactional email service.
- **Stripe**: Payment processing and subscription management.
- **n8n**: Workflow automation and AI integration.
- **Google Meet**: Video conferencing for coach sessions.
- **Google OAuth**: Social login and admin authentication.
- **Gmail API**: Email sending for notifications.
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component library.
- **Replit**: Primary hosting platform.
- **GoDaddy**: Domain hosting.