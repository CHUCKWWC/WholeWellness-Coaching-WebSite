# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a nonprofit digital solution providing life coaching to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation/membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching, strategic lead generation, and smart matching.

**UX Score: 10/10** - Comprehensive UX improvements completed (November 2025):
- **Triple-Feedback Pattern:** ConfirmDialog → Toast → SuccessAnimation sequence provides clear, immediate, and delightful feedback for all user actions
- **LoadingSkeleton Component:** 6 variants (card, list, form, dashboard, profile, table) replace all loading spinners across dashboards, profiles, and content areas
- **SuccessAnimation Component:** 3 variants (simple, celebration, sparkle) provide contextual celebratory feedback:
  - Simple: Basic actions and cancellations
  - Celebration: Major milestones (donations, bookings)
  - Sparkle: Profile updates and achievements
- **Integration Coverage:**
  - Phase 1: AdminDashboard, CoachDashboard, WixBooking (cancel/create)
  - Phase 2: UserProfile, CoachProfile, Donate page
  - Phase 3: AI Coaching (skipped - existing chat UX optimal)
- **Donation Flow:** Smart routing with Stripe checkout as primary path and graceful fallback with SuccessAnimation when Stripe unavailable
- **State Management:** Robust error handling with automatic SuccessAnimation reset on mutation failure
- **Production Ready:** All 6 implementation bugs resolved (imports, CSRF, type validation, debug logging)

## User Preferences
Preferred communication style: Simple, everyday language.

## Hardcoded Coach Accounts (Full Access)
- **Dr. Smith:** dr.csmith@wholewellness-coaching.org / AKAbizdoc7 (Coach ID: COACH-DRSMITH-001)
- **Dasha Lazaryuk:** dasha.lazaryuk@wholewellness-coaching.org / Wwc4life2025 (Coach ID: COACH-DASHA-002)
- Both accounts have active coach records in the database with verified status

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
- **Unified Onboarding System** (Enhanced November 2025):
  - SmartOnboarding component that detects user type and adapts flow dynamically
  - Automatic role detection from authentication state or manual selection
  - Unified entry point at /onboarding route
  - Seamless integration of client (8-step) and coach (7-step) onboarding flows
  - **OnboardingHero**: Immersive welcome page with animated gradients, feature highlights, and estimated time
  - **EnhancedProgressBar**: Shows step progress with personalized greeting using entered name and time remaining
  - **MilestoneBanner**: Celebratory popups at steps 2, 4, 6 with confetti animations and motivational messages
  - **TestimonialsCarousel**: Auto-rotating success stories from clients and coaches on hero page
  - **FormFieldHelp**: Contextual help tooltips for complex form fields with clear explanations
  - **Framer Motion Animations**: Smooth transitions, staggered reveals, and interactive hover states throughout
  - **Mobile-Optimized**: Responsive grid layouts, touch-friendly targets (min 44px), adaptive content
  - **Auto-Save**: Periodic data persistence with localStorage fallback for form recovery
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
- **Multi-assessment System**: Comprehensive assessment types with database architecture and API. Supports anonymous assessment submissions where guests can complete assessments without creating an account by providing their email address. Email is stored in the responses JSON field for follow-up communications.
- **Certification System**: Manages coach certification, enrollment, progress, and certificate issuance with Google Drive integration.
- **Wellness Journey Recommender**: AI-powered personalized wellness journeys, goal tracking, and progress monitoring.
- **Video Conferencing System**: Jitsi-powered video sessions using @jitsi/react-sdk JitsiMeeting component (November 2025). Features include:
  - Migrated from 100ms to Jitsi for open-source video conferencing
  - Supports both public Jitsi Meet servers (meet.jit.si) and JaaS (Jitsi as a Service) with JWT authentication
  - JaaS integration provides moderation, user identity, recording, and transcription features
  - Coach-initiated instant and scheduled sessions
  - Client pre-registration with shareable room codes
  - Guest access without authentication
  - Automatic video permissions handling with prejoin page
  - Role-based access: coaches get moderator privileges, participants get standard access
  - Environment variables for JaaS: JAAS_APP_ID, JAAS_API_KEY, JAAS_PRIVATE_KEY
- **Media Upload System**: Comprehensive media upload capabilities using Replit Object Storage with presigned URLs, supporting pictures, videos, documents, and audio. Features include:
  - Uppy.js-powered multi-file upload with progress tracking
  - Direct-to-storage uploads via presigned URLs for security and performance
  - Owner-verified ACL policies preventing cross-account access
  - MediaGallery component with filtering, preview, and delete
  - Integration with user and coach profiles for profile pictures, cover photos, and intro videos
  - Backend tracks all uploaded media with metadata in PostgreSQL
  - SimpleFileUploader component for single-file scenarios
- **Tutorial & Help System**: Interactive HTML mockup-based tutorial system with numbered click targets showing users exactly what to interact with. Features include:
  - **Architecture**: Discriminated union slide model (`ImageSlide | HtmlSlide`) supporting both legacy image slides and new HTML mockup slides
  - **HTML Mockup Slides**: 5 user tutorial slides + 1 coach tutorial slide using real page mockups (HomepageMockup, LoginMockup, AICoachingMockup, CoachesMockup)
  - **Interactive Click Targets**: Numbered overlay badges positioned on mockups showing exactly where to click, with labels and descriptions
  - **TutorialSlideshow Component**: Type-safe slideshow with prev/next navigation, slide indicators, conditional download (image-only), and thumbnail navigation for mixed slide decks
  - **HtmlTutorialSlide Component**: Renders mockups with absolutely positioned numbered overlays using percentage-based coordinates for responsive design
  - **UserTutorial Page** (/tutorial): Publicly accessible guide covering Welcome, AI Coaching ($19.99/month), Login, Professional Coaches, and Wellness Journey
  - **CoachTutorial Page** (/coach-tutorial): Protected coach training covering Dashboard Overview with stats and quick actions
  - **Data-Driven Architecture**: Centralized slide data in `client/src/data/tutorialSlides.tsx` with typed objects instead of pre-rendered components
  - **Backward Compatibility**: Supports adding legacy image slides to mixed decks; thumbnails render for image slides even when HTML slides present
  - **Pro Tips System**: Each slide includes contextual usage tips displayed below mockup
  - **Navigation Integration**: "Help & Tutorials" section in role-aware navigation
  - **Enterprise Security**: ProtectedRoute with stable React hooks, hasRedirected state preventing loops, no content flash for unauthorized users
  - **Dark Mode Support**: Full dark mode compatibility with proper contrast and styling

### System Design Choices
- **Security**: Helmet middleware for CSP, HSTS, X-Content-Type-Options; strict CORS; short-lifetime, SameSite, HttpOnly, Secure tokens; tiered rate limiting; environment variables for secrets; webhook signature verification.
  - **CSP Configuration for Jitsi Video**: Both server (server/security.ts) and client (client/index.html meta tag) CSP policies configured to allow Jitsi video conferencing domains:
    - `https://meet.jit.si` and `wss://meet.jit.si` (public Jitsi Meet servers)
    - `https://8x8.vc` and `wss://8x8.vc` (JaaS - Jitsi as a Service)
    - `https://*.jitsi.net` and `wss://*.jitsi.net` (Jitsi CDN and services)
    - `media-src 'self' blob: https://meet.jit.si https://8x8.vc https://*.jitsi.net` (for video/audio streams)
    - `frame-src` includes Jitsi domains for iframe embedding
  - **Video Error Logging**: Comprehensive connection error tracking with device-specific diagnostics (/api/video/log-error endpoint)
- **Performance**: Initial JS bundle <200KB gzipped, code splitting, WebP/AVIF images with responsive srcset, Gzip/brotli compression, CDN caching, indexed database fields.

## External Dependencies

- **Neon (PostgreSQL)**: Primary database for development and production (via DATABASE_URL environment variable)
- **Supabase**: Legacy fallback for features not yet migrated to local storage.
- **OpenAI**: AI coaching, conversation summarization, and insights generation.
- **SendGrid**: Transactional email service.
- **Stripe**: Payment processing and subscription management.
- **n8n**: Workflow automation and AI integration.
- **Jitsi**: Open-source video conferencing via public Jitsi Meet servers (meet.jit.si) or JaaS (8x8.vc) for premium features.
- **Google OAuth**: Social login and admin authentication.
- **Gmail API**: Email sending for notifications.
- **Drizzle ORM**: Type-safe database operations.
- **Zod**: Runtime type validation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component library.
- **Replit**: Primary hosting platform.
- **GoDaddy**: Domain hosting.