# WholeWellness Coaching Platform

## Overview

WholeWellness is a comprehensive nonprofit wellness coaching platform that combines AI-powered coaching with human expertise. The platform provides personalized wellness guidance, assessment tools, certification programs, and a complete administrative system for managing coaches, users, and operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Shadcn/ui component library with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and JWT tokens
- **API Design**: RESTful API with role-based access control
- **File Processing**: TSX for TypeScript execution in production

### Data Storage Solutions
- **Primary Database**: Supabase (PostgreSQL)
- **Database ORM**: Direct SQL queries with Supabase client
- **File Storage**: Google Drive integration for document uploads
- **Session Storage**: JWT-based stateless authentication
- **Analytics**: Built-in admin dashboard with metrics tracking

### Authentication and Authorization
- **User Authentication**: JWT tokens with secure HTTP-only cookies
- **Admin Authentication**: Separate admin auth system with role-based permissions
- **Role System**: Multi-tier roles (user, coach, admin, super_admin)
- **Permission Management**: Granular permissions for different admin functions
- **Coach Certification**: Automatic role upgrades based on earnings ($99 threshold)

## Key Components

### AI Coaching System
- **AI Provider**: OpenAI GPT-4 with specialized coaching prompts
- **Assistant Integration**: Pre-configured weight loss coaching assistant
- **Template System**: Evidence-based coaching templates as fallback
- **Chat Management**: Real-time chat sessions with thread continuity
- **Personalization**: Assessment-driven coaching recommendations

### Assessment Platform
- **Multi-Assessment System**: Weight loss, relationship, mental health forms
- **Dynamic Forms**: JSON-based form configurations with validation
- **Progress Tracking**: User assessment history and analytics
- **Coach Integration**: Assessment results accessible to assigned coaches

### Coach Certification System
- **Module-Based Learning**: Structured certification courses
- **Progress Tracking**: Completion status and scoring system
- **Certificate Generation**: Automated certificate issuance
- **Admin Management**: Full admin oversight of certification programs

### Payment Processing
- **Provider**: Stripe integration for secure payments
- **Donation System**: Nonprofit donation processing with tracking
- **Earnings Tracking**: Coach earnings system with automatic role upgrades
- **Subscription Management**: Membership level handling

### Admin Dashboard
- **Comprehensive Analytics**: User metrics, donation tracking, booking management
- **Role Management**: Admin user creation and permission assignment
- **Content Management**: System-wide content and settings control
- **Database Management**: Direct database operations and maintenance tools

## Data Flow

### User Onboarding
1. User registration with email/password authentication
2. Comprehensive intake assessment completion
3. AI-powered coach matching based on assessment results
4. Personalized coaching plan generation
5. Session scheduling and payment processing

### Coaching Sessions
1. Real-time chat interface with AI or human coaches
2. Session data storage in Supabase with thread management
3. Progress tracking and goal adjustment
4. Follow-up recommendations and resource sharing

### Admin Operations
1. Centralized dashboard for all platform metrics
2. User and coach management with role assignments
3. Financial tracking and donation processing
4. Content moderation and system maintenance

## External Dependencies

### Third-Party Services
- **Supabase**: Database, authentication, and real-time features
- **OpenAI**: AI coaching capabilities
- **Stripe**: Payment processing and subscription management
- **SendGrid**: Email delivery and notifications
- **Google APIs**: Drive storage and calendar integration
- **Wix**: External booking system integration

### Development Tools
- **TypeScript**: Type safety and development experience
- **Vite**: Fast development server and optimized builds
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Accessible component primitives
- **ESBuild**: Production bundling and optimization

### Automation and Integration
- **N8N**: Workflow automation and external integrations
- **Google Sheets**: Data export and reporting
- **OAuth**: Secure third-party authentication flows

## Deployment Strategy

### Replit-Optimized Deployment
- **Build Process**: Frontend-only build with Vite, server runs with TSX
- **Environment Configuration**: Development mode to avoid vite.ts path resolution issues
- **Port Configuration**: Dynamic port assignment (PORT environment variable)
- **Host Binding**: 0.0.0.0 for Replit compatibility
- **Startup Script**: Node.js execution with proper error handling
- **Deployment Commands**:
  - Build: `node build.js` (builds frontend to dist/public)
  - Start: `node start.js` (runs server with tsx in development mode)
- **Status**: ✅ Successfully configured and tested

### Database Management
- **Migration Strategy**: SQL schema files for database initialization
- **Connection Pooling**: Optimized Supabase connection management
- **Backup Strategy**: Supabase automated backups
- **Schema Evolution**: Version-controlled database updates

### Security Considerations
- **Environment Variables**: Secure storage of API keys and secrets
- **CORS Configuration**: Restricted origin policies
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries throughout

### Monitoring and Maintenance
- **Health Checks**: Automated system health monitoring
- **Error Logging**: Comprehensive error tracking and reporting
- **Performance Monitoring**: Database query optimization
- **Admin Tools**: Built-in database management and maintenance utilities

The platform is designed for scalability and maintainability, with clear separation of concerns and comprehensive admin tools for ongoing management. The Replit deployment strategy ensures smooth operation in the cloud environment while maintaining development flexibility.