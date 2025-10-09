# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a comprehensive nonprofit digital solution providing life coaching services to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation and membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching journeys, including strategic lead generation and smart matching.

## User Preferences
Preferred communication style: Simple, everyday language.

## Coding Standards & Best Practices

### Architecture Principles
- **Frontend/Backend Separation**: Clear API boundary between React frontend and Express backend
- **Lazy Loading**: Routes and heavy components loaded on demand to reduce initial bundle
- **Database Access**: All data operations through Drizzle ORM; migrations are single source of truth
- **Payment Processing**: Stripe integration with server-side webhook verification
- **Caching Strategy**: In-memory/Redis caching for frequent GET requests

### Code Style & Patterns
- **Validation**: Use Zod for all input validation (body, query, params)
- **React Components**: Functional components with hooks; avoid large monolithic components
- **Exports**: Named exports preferred; fully typed interfaces; minimal `any` usage
- **Styling**: Tailwind CSS with utility classes; CSS modules for custom styles
- **Icons**: Individual imports from lucide-react for tree shaking
- **Error Handling**: Try-catch blocks with structured error logging

### Security Requirements
- **Headers**: Helmet middleware for CSP, HSTS, X-Content-Type-Options
- **CORS**: Strict allowlist of known frontend origins
- **Sessions/Tokens**: Short lifetimes, SameSite, HttpOnly, Secure flags
- **Rate Limiting**: Tiered protection with proper precedence
  - Auth endpoints: 10 req/15min (authLimiter on /api/auth/login, /api/auth/register, /api/auth/request-reset)
  - General API: 100 req/15min (generalApiLimiter on /api/*, skips auth routes via req.baseUrl + req.path)
  - Payment endpoints: 3 req/15min (paymentLimiter)
  - Sensitive ops: 5 req/15min (strictApiLimiter)
- **Secrets**: Environment variables only; no hardcoded credentials
- **Webhooks**: Signature verification and idempotency handling

### Performance Goals
- **Bundle Size**: Initial JS bundle <200KB gzipped
- **Code Splitting**: Defer non-critical components (charts, admin tools)
- **Images**: WebP/AVIF formats with responsive srcset
- **Compression**: Gzip/brotli enabled; leverage CDN caching
- **Database**: Indexed fields (userId, createdAt, purchaseId)

### Development Workflow
- **Commands**: 
  - `npm run dev` - Start frontend + backend in development
  - `npm run build` - Production build
  - `npm run start` - Serve production build
  - `npm run db:push` - Push schema changes to database
- **Testing**: Unit tests for business logic; E2E for critical flows
- **CI/CD**: Lint → typecheck → test → build → deploy pipeline
- **Observability**: Structured logs with request IDs, metrics, error tracking

## Recent Changes
**October 9, 2025** (Late Evening): Fixed critical security gap in authentication rate limiting:
- **Rate Limiting Enhancement**: Implemented proper rate limiting precedence for authentication endpoints
  - Applied authLimiter (10 req/15min) to POST /api/auth/login, POST /api/auth/register, and POST /api/auth/request-reset
  - Fixed generalApiLimiter skip function to use `req.baseUrl + req.path` for reliable route exclusion when middleware is mounted at '/api'
  - Verified auth endpoints blocked at 10 requests (HTTP 429) while non-auth endpoints maintain 100 req/15min limit
  - Eliminated double-counting issue where both limiters were incrementing counters on auth traffic
- **Security Impact**: Prevents brute-force attacks on authentication endpoints with stricter rate limits than general API access

**October 9, 2025** (Evening): Enhanced platform with mobile optimization, documentation, and strategic planning:
- **Mobile Optimization**: Implemented full mobile responsiveness with auto-detection (768px breakpoint)
  - Settings and digest preferences: Responsive padding, mobile-friendly controls, adaptive text sizes
  - Crisis alerts dashboard: Card view on mobile (<768px), table view on desktop
  - All conversation intelligence features optimized for touch interfaces
  - Dialog modals scale properly on small screens (w-[95vw])
- **Documentation & Planning**: Created comprehensive improvement blueprint
  - Added AUDIT.md with security, performance, UX, and workflow recommendations
  - Enhanced replit.md with coding standards and best practices
  - Prioritized implementation roadmap with phased approach
  - Backup created (replit.md.backup) for rollback capability

**October 9, 2025** (Earlier): Implemented complete conversation intelligence system with AI summarization, automated digests, and crisis management:
- **AI Chat Summarization**: GPT-4 powered conversation analysis with action item extraction, emotional tone detection, key topic identification, and personalized insights
- **Automated Email Digests**: Cron-based scheduling system sends daily/weekly/biweekly/monthly digests with user-configurable preferences (frequency, time, timezone, content options)
- **Crisis Detection & Safety**: Real-time mental health keyword scanning with severity assessment (low/medium/high/critical), automatic admin alerts via email, and comprehensive crisis management dashboard
- **User Interface**:
  - Settings page with digest preference configuration (route: /settings)
  - Admin crisis alerts dashboard for monitoring and resolving mental health emergencies (route: /admin-crisis-alerts)
  - Full WCAG 2.1 AA accessibility compliance with testid attributes
- **Database Schema**: ✅ ALL TABLES CREATED - chat_summaries, digest_preferences, sent_digests, crisis_alerts tables deployed to Supabase via SQL script (supabase-conversation-tables.sql)
- **API Endpoints**: ✅ FULLY OPERATIONAL
  - POST /api/chat/summarize - Generate conversation summaries
  - GET/POST /api/digest/preferences - Manage user digest settings
  - POST /api/digest/send-now - Manual digest trigger
  - GET /api/digest/crisis-alerts - Crisis alert management (admin only)
  - PUT /api/digest/crisis-alerts/update - Update crisis alert status (admin only)
  - POST /api/ai-coaching/chat - Send message to AI coach
  - GET /api/ai-coaching/history/:sessionId - Get chat history
  - GET /api/ai-coaching/sessions/:userId - Get user sessions
- **Email Service**: SendGrid integration with professional HTML templates for digests and crisis notifications
- **Automated Scheduler**: ✅ ACTIVE - node-cron runs hourly to send digests based on user preferences with timezone support
- **ModernChatInterface**: Built BrainBox-inspired accessible chat UI component (available for integration)
- **Production Status**: ✅ ALL SERVICES OPERATIONAL - Server running, database tables deployed, routes enabled, scheduler active
- **Test User**: charles.watson@wholewellness-coaching.org configured for system validation

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
- **AI Coaching System**: Features 6 specialized AI coaches (Charlene - Mindfulness, Lisa - Behavior, Dasha - Wellness, Charles - Relationship, Bobby - Mental Health, Aria - Weight Loss) fully integrated with OpenAI Assistants API for persistent conversations. Each coach has a unique assistant ID and customizable tone/persona (supportive, motivational, analytical, gentle). Assistant responses are now working correctly with text format and thread persistence. Includes modern BrainBox-inspired chat UI with WCAG 2.1 AA accessibility, emotion-aware messaging, and real-time typing indicators.
- **Conversation Intelligence**: AI-powered conversation summarization generates daily/weekly digests with action items, emotional tone detection, key topic extraction, and personalized insights. Automated email delivery via SendGrid with user-configurable frequency (daily/weekly/biweekly/monthly) and timezone preferences.
- **Mental Health Safety**: Built-in crisis detection system scans for mental health keywords, assesses severity levels, and automatically alerts admins via email. Includes human handoff options and emergency resource information (988 Suicide Lifeline, Crisis Text Line, Domestic Violence Hotline).
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
- **OpenAI**: AI coaching capabilities via GPT-4, conversation summarization, and insights generation.
- **SendGrid**: Transactional email service for daily/weekly digests, crisis alerts, and notifications.
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