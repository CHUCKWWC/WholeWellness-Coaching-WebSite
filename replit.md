# WholeWellness Coaching Platform

## Overview
WholeWellness is a comprehensive nonprofit digital wellness platform designed to provide life coaching services to underserved communities, particularly women survivors of domestic violence. The platform combines AI-powered coaching, professional human coaches, assessment systems, and mental health resources in a unified solution.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**Deployment Fixes Applied (July 29, 2025):**
✓ Created production startup scripts (start.js, build.js, deploy.js) for Replit deployment
✓ Fixed missing @tailwindcss/typography dependency causing build failures  
✓ Corrected file import case sensitivity issue (assessments.tsx)
✓ Updated static file serving path to match build output directory
✓ Temporarily disabled Wix integration to resolve React version conflicts
✓ Confirmed server properly configured for 0.0.0.0:PORT cloud deployment

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite with hot module replacement for fast development
- **UI Components**: Radix UI primitives with Tailwind CSS for consistent, accessible design
- **State Management**: TanStack Query v5 for server state management and caching
- **Client Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Backend Architecture
- **Runtime**: Node.js with Express.js server for RESTful API endpoints
- **Language**: TypeScript with ES modules for consistency with frontend
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Middleware**: Role-based access control with coach/user/admin permissions
- **File Handling**: Multer for profile image uploads and document management

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Supabase for production hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: Comprehensive relational schema supporting users, coaches, assessments, courses, and mental health resources
- **Row Level Security**: Supabase RLS policies for data protection and user isolation

## Key Components

### 1. AI Coaching System
- **6 Specialized AI Coaches**: Nutritionist, Fitness Trainer, Behavior Coach, Wellness Coordinator, Accountability Partner, and Meal Prep Assistant
- **Integration**: OpenAI GPT-4 via n8n workflow automation for external AI processing
- **Memory System**: Persistent chat sessions with conversation history stored in database
- **Personality Adaptation**: Each coach has specialized prompts and response styles

### 2. Professional Coach Management
- **Coach Onboarding**: Multi-step registration with profile, credentials, and banking setup
- **Client Management**: Assignment system matching coaches with clients based on specialization
- **Session Scheduling**: Weekly availability management with Google Meet integration
- **Payment Processing**: Banking information collection for coach revenue sharing (70/30 split)

### 3. Assessment Programs
- **Multi-Assessment System**: 5 different assessment types (wellness, nutrition, fitness, mental health, life balance)
- **Freemium Model**: 3 free assessment results, then payment required via Stripe
- **Dynamic Forms**: JSONB storage for flexible assessment responses
- **Progress Tracking**: User assessment history and analytics

### 4. Certification Course System
- **Course Management**: Professional development modules for coaches
- **Payment Verification**: Stripe integration preventing unpaid access to premium content
- **Google Drive Integration**: Course materials hosted in shared Google Drive folders
- **Progress Tracking**: Module completion status and quiz scoring system

## Data Flow

### Authentication Flow
1. User registration/login via email/password or Google OAuth
2. JWT token generation with user role and permissions
3. Token validation middleware protecting endpoints
4. Role-based access control for coach vs user features

### Assessment Flow
1. User selects assessment type from available options
2. Dynamic form rendering based on assessment configuration
3. Response submission with JSONB storage
4. Payment verification for premium results access
5. AI-powered recommendations based on assessment data

### Coaching Session Flow
1. Client-coach matching based on specialization and availability
2. Session scheduling through integrated calendar system
3. Video session via Google Meet integration
4. Session notes and progress tracking
5. Automated follow-up messaging via n8n workflows

## External Dependencies

### Payment Processing
- **Stripe**: Live payment processing for assessments, donations, and course enrollment
- **Webhook Integration**: Real-time payment status updates

### Email Services
- **Gmail API**: OAuth2-based email delivery for notifications and password resets
- **Automated Templates**: Welcome emails, appointment reminders, and crisis alerts

### AI and Automation
- **OpenAI GPT-4**: AI coaching conversations with specialized prompts
- **n8n Workflows**: Automation platform for AI coaching, messaging, and data processing
- **Webhook Architecture**: Real-time communication between platform and external services

### Video Conferencing
- **Google Meet API**: Professional video sessions for coach-client interactions
- **Calendar Integration**: Automated meeting scheduling and calendar sync

### Content Management
- **Google Drive API**: Course materials storage and sharing
- **Service Account Authentication**: Secure programmatic access to Google services

## Deployment Strategy

### Production Environment
- **Platform**: Replit with auto-scaling deployment
- **Custom Domain**: wholewellnesscoaching.org with SSL/TLS encryption
- **Database**: Supabase managed PostgreSQL with automatic backups
- **CDN**: Static asset delivery through Replit's infrastructure

### Security Measures
- **HTTPS Enforcement**: All traffic encrypted with SSL certificates
- **JWT Security**: HTTP-only cookies preventing XSS attacks
- **Role-Based Access**: Granular permissions for different user types
- **Input Validation**: Zod schema validation preventing malicious input
- **Rate Limiting**: API endpoint protection against abuse

### Monitoring and Analytics
- **Custom Analytics**: User engagement and session tracking
- **Error Handling**: Comprehensive error logging and user feedback
- **Performance Monitoring**: Response time tracking and optimization
- **Crisis Detection**: Automated alerts for high-risk user assessments

The platform is designed as a comprehensive solution serving nonprofit missions while maintaining professional standards for security, scalability, and user experience.

## Recent Deployment Fixes (July 29, 2025)

### Fixed Deployment Issues
✓ Created proper TypeScript configuration (tsconfig.json)
✓ Installed missing dependencies (@supabase/supabase-js, drizzle-orm, React packages, etc.)
✓ Configured server to listen on 0.0.0.0:PORT for deployment compatibility
✓ Created deployment start script (start.js) for production use
✓ Temporarily disabled Wix integration to resolve dependency conflicts
✓ Fixed vite configuration for proper build process

### Deployment Configuration
- **Start Command**: `node start.js` (production-ready server start)
- **Build Command**: `npm run build` (vite build + server compilation)
- **Host Configuration**: Server binds to 0.0.0.0 for cloud deployment
- **Port Configuration**: Uses PORT environment variable with fallback to 5000

### Environment Requirements
- NODE_ENV=production for deployment
- PORT environment variable (set by cloud platform)
- All secret keys configured in environment variables

### Known Issues Resolved
- ✓ Missing .replit configuration (deployment scripts created)
- ✓ Invalid run command (start.js created)
- ✓ Missing build command (build scripts configured)
- ✓ Server host/port configuration (fixed in server/index.ts)

### Deployment Status
The application is now ready for deployment with proper configuration files and startup scripts.