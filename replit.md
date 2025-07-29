# Whole Wellness Coaching Platform

## Overview

This is a comprehensive nonprofit wellness coaching platform designed to serve underserved communities, particularly women who have survived domestic violence. The platform combines AI-powered coaching, professional human coaches, mental health resources, and donation management into a unified solution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: Radix UI components styled with Tailwind CSS
- **State Management**: TanStack Query v5 for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: JWT-based tokens with bcrypt password hashing
- **Database ORM**: Drizzle for type-safe database operations
- **File Upload**: Multer for handling file uploads
- **Email Service**: Gmail API with OAuth2 for reliable email delivery

### Database Strategy
- **Primary Database**: PostgreSQL hosted on Supabase
- **Schema Management**: Drizzle ORM with TypeScript schema definitions
- **Data Storage**: Persistent storage for user profiles, assessments, coaching sessions, and donations
- **Security**: Row Level Security (RLS) policies for data protection

## Key Components

### 1. Authentication System
- Traditional email/password registration and login
- Google OAuth social login integration
- JWT token-based session management
- Role-based access control (user, coach, admin)
- Password reset functionality with email verification

### 2. AI Coaching Platform
- Six specialized AI coaches (Nutritionist, Fitness Trainer, Behavior Coach, etc.)
- Chat interface with persistent conversation history
- OpenAI GPT-4 integration via n8n workflow automation
- Real-time responses with coach-specific personalities
- Mobile-optimized chat experience

### 3. Professional Coach Management
- Comprehensive coach onboarding with profile creation
- Client assignment and management system
- Session scheduling with Google Meet integration
- Banking information collection for payments
- Availability management and booking system

### 4. Assessment Programs
- Multiple assessment types (wellness, nutrition, fitness, mental health)
- Freemium model: 3 free results, then payment required
- Stripe payment integration for premium assessments
- Progress tracking and results storage
- Payment validation before accessing premium content

### 5. Certification System
- Professional certification courses for coaches
- Module-based learning with progress tracking
- Quiz system with 80% pass rate requirement
- Google Drive integration for course materials
- Certificate generation upon completion

### 6. Mental Wellness Hub
- Crisis intervention resources and emergency contacts
- Mental health screening tools
- Resource library with categorized content
- Safety planning tools for domestic violence survivors

## Data Flow

### User Registration Flow
1. User visits registration page
2. Submits email, password, and basic information
3. System creates account with bcrypt-hashed password
4. Email verification sent via Gmail API
5. User confirms email and gains platform access

### AI Coaching Flow
1. User selects AI coach type
2. Chat interface loads with conversation history
3. User sends message to backend API
4. Backend forwards message to n8n webhook
5. n8n processes with OpenAI GPT-4
6. Response returned and stored in database
7. Frontend displays response in chat interface

### Payment Processing Flow
1. User initiates donation or assessment purchase
2. Frontend creates Stripe payment intent
3. User completes payment with Stripe
4. Webhook confirms payment success
5. System updates user account and access permissions

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing for donations and assessment purchases
- **Environment Variables**: STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY

### AI Services
- **OpenAI**: GPT-4 for AI coaching responses
- **n8n**: Workflow automation for AI coach routing
- **Webhook**: External n8n workflow for AI processing

### Database & Storage
- **Supabase**: PostgreSQL database hosting with real-time features
- **Environment Variables**: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

### Authentication & Social Login
- **Google OAuth**: Social login integration
- **Environment Variables**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Communication Services
- **Gmail API**: Email sending for notifications and verification
- **Google Meet**: Video conferencing for coaching sessions

## Deployment Strategy

### Build Process
- Frontend built with Vite to `dist/public` directory
- Server runs with tsx for TypeScript support
- Production build optimizes assets and bundles code

### Environment Configuration
- Development mode for local testing
- Production deployment with environment-specific variables
- Host configured for 0.0.0.0 with PORT environment variable

### Startup Scripts
- `build.js`: Builds frontend assets for production
- `start.js`: Starts server with tsx in development mode
- Graceful shutdown handling for process termination

### Domain Setup
- Custom domain: wholewellnesscoaching.org
- SSL certificate handling via hosting provider
- OAuth redirect URIs configured for custom domain

The platform is designed to be deployable on Replit with automatic dependency installation and can scale to serve multiple coaches and hundreds of clients while maintaining data security and performance.