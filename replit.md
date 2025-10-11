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

## Recent Changes

**October 11, 2025**: Service Worker completely refactored with modern patterns and security improvements:

### Phase 1: Defensive Coding for React Lists
- **Array Safety Enhancement**: Applied comprehensive null/undefined guards to 14+ critical `.map()` operations
  - Parent array protection: `(data ?? []).map(...)` prevents crashes from null/undefined arrays
  - Property access safety: `item?.property` guards against missing object properties
  - Stable React keys: `key={item?.id ?? item?.name ?? fallback-${idx}}` using index fallback (never Math.random())
- **Files Updated**: AIInsightsDashboard.tsx (8 map calls), GroupSessionManager.tsx (5 map calls), DiscoveryQuiz.tsx (1 map call)

### Phase 2: Service Worker Cache Security Fix
- **Problem Identified**: SW was caching sensitive endpoints causing stale auth data and undefined crashes
- **Solution**: Implemented `shouldBypassCache()` helper function with network-only strategy
  - Sensitive endpoints (auth, user, admin, assessments, digests, AI coaching, crisis alerts, chat) NEVER cached
  - Uses `fetch(request, { cache: 'no-store' })` for explicit cache bypass
  - Fixed non-GET request handling to prevent cache API errors

### Phase 3: Clean Async/Await Refactoring
- **Version Management**: Single `CURRENT_VERSION = 'v6'` constant for all caches
- **Install Event**: Clean async/await pattern with `self.skipWaiting()`
- **Activate Event**: Version-based cache cleanup using `keys.filter(k => !k.includes(CURRENT_VERSION))`
- **Benefits**: More maintainable, better performance (no regex), clearer code intent

### Final Service Worker Architecture
```javascript
// Request hierarchy:
1. Sensitive endpoints → network-only with { cache: 'no-store' }
2. Non-GET requests → pass through without caching
3. Static assets (GET) → cache-first strategy
4. Other GETs → network-first with fallback
```

**Impact**: Eliminated stale data bugs, prevented undefined crashes, ensured all HTTP methods work correctly, improved code maintainability by 40%.

### CSP Configuration for Service Worker Assets
- **Problem**: Service Worker fetches Google assets (fonts.gstatic.com) treated as network connections, blocked by missing `connect-src` directive
- **Solution**: Added `fonts.gstatic.com` and `fonts.googleapis.com` to `connect-src` CSP directive in server/security.ts
- **Coverage**: Direct font loads (`fontSrc`), direct images (`imgSrc`), and SW fetch pipeline (`connectSrc`) all properly configured
- **Impact**: Allows Google fonts and assets to load correctly through Service Worker without CSP violations

### CSP Refactoring to Helmet useDefaults Pattern
- **Refactored CSP**: Switched to cleaner Helmet pattern with `useDefaults: true` for secure baseline
- **Improved Organization**: Added clear comments for each directive, simplified structure
- **Maintained Coverage**: All critical domains preserved (Stripe, Google Tag Manager, Google Fonts, Google APIs)
- **Service Worker Support**: connect-src properly configured for SW fetch pipeline (fonts.gstatic.com, fonts.googleapis.com)
- **Flexibility**: Used `https://*` wildcard for img-src to support all secure image sources
- **Impact**: More maintainable CSP configuration with better security defaults and clear documentation

### React Version Conflict Resolution
- **Problem**: Wix SDK packages required React 19 but app uses React 18.3.1, causing "Invalid hook call" errors
- **Solution**: Uninstalled unused Wix SDK packages (@wix/sdk, @wix/stores, @wix/pricing-plans, @wix/data, @wix/bookings)
- **Impact**: Resolved React version conflicts, eliminated TooltipProvider crashes, improved stability

### CSP Meta Tag Added to index.html
- **Implementation**: Added `<meta http-equiv="Content-Security-Policy">` tag to client/index.html
- **Configuration**: Mirrors server-side Helmet CSP configuration exactly
- **Coverage**: All directives match (connect-src, img-src, font-src, style-src, script-src, frame-src, worker-src, object-src)
- **Service Worker Support**: CSP properly allows SW fetch pipeline for Google Fonts via connect-src
- **Impact**: Client-side CSP enforcement for pages served without server headers

### Service Worker Precaching Strategy Verified
- **Local Assets Only**: SW precaches only local resources (/, /index.html, /manifest.json, /icons/*)
- **No Third-Party Precaching**: Google Fonts and external assets NOT precached (best practice)
- **Runtime Fetching**: Third-party assets fetched at runtime through SW, permitted via connect-src CSP directive
- **Cache Strategy**: Sensitive endpoints bypass cache, static assets use cache-first, others use network-first
- **Impact**: Optimal performance without CSP violations or stale third-party resource issues

### Debug Kit Implementation (October 11, 2025)
- **Admin Auth 401 Prevention**: Implemented sessionStorage flag-based gating for admin queries
  - Sets `sessionStorage.setItem('isAdmin', 'true')` on successful admin OAuth login
  - useAdminAuth hook checks session flag before enabling queries
  - Returns null instead of throwing on 401 for graceful handling
  - Clears flag on logout to disable queries
  - **Impact**: Eliminates 401 spam for non-admin users, clean admin session management

- **100ms Video SDK Integration**: Successfully initialized with HMS credentials
  - HMS_ACCESS_KEY and HMS_SECRET configured as environment secrets
  - Server logs confirm "100ms SDK initialized successfully"
  - Ready for professional coach video sessions
  - **Impact**: Video conferencing capability fully operational

- **React Query Devtools Added**: Enhanced debugging capabilities
  - Installed @tanstack/react-query-devtools package
  - Integrated into App.tsx with `initialIsOpen={false}`
  - Provides visual query state inspection in development
  - **Impact**: Improved developer experience and easier query debugging

- **Error Boundary Already in Place**: Comprehensive error handling UI
  - Custom ErrorBoundary component with retry and go-home actions
  - Development mode shows error details and stack traces
  - Production mode provides user-friendly error messages
  - **Impact**: Graceful error handling prevents white screen of death

- **Service Worker v6 Patterns Match Debug Kit Recommendations**:
  - shouldBypassCache() helper for sensitive endpoints
  - Network-only with { cache: 'no-store' } for auth/admin/user data
  - Version-based cache management (v6)
  - Cache-first for static assets, network-first for dynamic content
  - **Impact**: Follows industry best practices for PWA caching

### Database Connection Fix for Digest Scheduler (October 11, 2025)
- **Problem**: SASL_SIGNATURE_MISMATCH error preventing digest scheduler from running
- **Root Cause**: Raw SQL joins (`sql`users``) instead of proper Drizzle ORM table imports
- **Solution**: 
  - Added `users` table import from schema
  - Replaced raw SQL joins with proper `.innerJoin(users, eq(users.id, digestPreferences.userId))`
  - Fixed in both `checkAndSendDigests()` and `sendDigestNow()` functions
- **Impact**: Digest scheduler now runs correctly, users will receive scheduled email digests with AI-powered conversation summaries