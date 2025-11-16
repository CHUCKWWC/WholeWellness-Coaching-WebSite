# Wholewellness Coaching Platform

## Overview
The Wholewellness Coaching Platform is a nonprofit digital solution providing life coaching to underserved individuals, particularly women who have survived domestic violence. It integrates AI-powered coaching, professional coach services, donation/membership management, and administrative tools. The platform aims to expand access to wellness support, foster community, and empower individuals through personalized coaching, strategic lead generation, and smart matching.

**UX Score: 9/10** - Priority 1 UX improvements implemented (November 2025):
- Reusable ConfirmDialog component for destructive actions with loading states
- LoadingSkeleton component with 6 variants (card, list, form, dashboard, profile, table)
- SuccessAnimation component with 3 variants (simple, celebration, sparkle)
- Admin tutorial system with 3 comprehensive slides and mockups
- Integrated into MediaGallery for delete confirmations, loading states, and success feedback

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
- **Multi-assessment System**: Comprehensive assessment types with database architecture and API. Supports anonymous assessment submissions where guests can complete assessments without creating an account by providing their email address. Email is stored in the responses JSON field for follow-up communications.
- **Certification System**: Manages coach certification, enrollment, progress, and certificate issuance with Google Drive integration.
- **Wellness Journey Recommender**: AI-powered personalized wellness journeys, goal tracking, and progress monitoring.
- **Video Conferencing System**: 100ms-powered video sessions using HMSPrebuilt component for battle-tested reliability. Features include:
  - Migrated from custom implementation to @100mslive/roomkit-react HMSPrebuilt component (October 2025)
  - 90% code reduction in VideoSession component (483 → 150 lines)
  - Room codes generated via 100ms Management API instead of random strings
  - Coach-initiated instant and scheduled sessions
  - Client pre-registration with shareable room codes
  - Guest access without authentication
  - Automatic video permissions handling
  - Recording, transcription, and AI summaries
  - Reliable error recovery and network resilience
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
  - **CSP Configuration for 100ms Video**: Both server (server/security.ts) and client (client/index.html meta tag) CSP policies configured to allow 100ms video conferencing domains:
    - `https://*.100ms.live` (wildcard for all 100ms subdomains)
    - `https://auth.100ms.live` (authentication endpoint - explicit)
    - `https://prod-init.100ms.live` (initialization endpoint - explicit)
    - `https://api.100ms.live` (API endpoint - explicit)
    - `wss://*.100ms.live` (WebSocket connections)
    - `media-src 'self' blob: https://*.100ms.live` (CRITICAL for iOS video/audio streams)
  - Critical fix (October 2025): Updated client-side CSP meta tag to match server policy, preventing "Endpoint is not reachable" errors
  - iOS compatibility fix (October 2025): Added `media-src` directive to CSP for camera/microphone access on iOS devices
  - **Video Error Logging**: Comprehensive connection error tracking with iOS-specific diagnostics (/api/video/log-error endpoint)
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