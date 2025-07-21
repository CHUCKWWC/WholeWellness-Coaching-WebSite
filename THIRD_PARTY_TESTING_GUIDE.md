# WholeWellness Platform - Complete Features Testing Guide

## Platform Overview
Comprehensive nonprofit life coaching and wellness platform serving underserved women with AI-powered coaching, professional services, and mental health resources.

## Core System Features

### 1. User Authentication & Account Management
- **User Registration**: Email-based account creation with password validation
- **Login System**: Secure authentication with session management
- **Password Reset**: Email-based password recovery with secure tokens
- **Email Verification**: Account verification system with automated emails
- **Profile Management**: User profile updates and preferences
- **Test Credentials**: 
  - Regular User: charles.watson@WholeWellness-Coaching.org
  - Test Coach: username: chuck, password: chucknice1

### 2. Assessment Programs System
- **5 Assessment Types**: Wellness, Nutrition, Fitness, Mental Health, Life Balance
- **Freemium Model**: 3 free assessment results, then payment required
- **Payment Integration**: Stripe payment processing for additional assessments
- **Results Storage**: Persistent storage of assessment results in Supabase
- **Progress Tracking**: User assessment history and progress analytics
- **Access Control**: Payment validation before displaying premium results

### 3. AI Coaching System
- **6 Specialized AI Coaches**: 
  - Nutritionist
  - Fitness Trainer
  - Behavior Coach
  - Wellness Coordinator
  - Accountability Partner
  - Meal Prep Assistant
- **Chat Interface**: Real-time AI coaching conversations
- **Memory System**: Chat session persistence and history
- **External Integration**: OpenAI GPT-4 via n8n workflow automation
- **Beta Testing Portal**: Dedicated testing environment at `/beta-test/`

### 4. Professional Coach Management
- **Coach Signup**: Comprehensive application process with banking integration
- **Coach Profile Management**: Dynamic profile editing with photo upload
- **Client Assignment**: Automated matching system
- **Session Scheduling**: Weekly availability and booking system
- **Video Integration**: Google Meet integration for remote sessions
- **Payment Processing**: Coach fee collection and banking setup

### 5. Digital Onboarding System
- **Multi-Step Flow**: 8-step comprehensive onboarding process
- **Assessment Integration**: Health assessment and support preferences
- **Safety Screening**: Crisis intervention and emergency resources
- **Payment Collection**: Upfront payment processing during onboarding
- **Coach Matching**: 24-48 hour professional coach assignment
- **Progress Persistence**: Data saved throughout onboarding process

### 6. Mental Wellness Hub
- **Personalized Recommendations**: AI-powered wellness resource suggestions
- **Crisis Detection**: Emergency resource recommendations and intervention
- **Resource Library**: Comprehensive mental health resources database
- **Usage Analytics**: Resource engagement and effectiveness tracking
- **User Profiling**: Behavioral analysis and context-aware recommendations

### 7. Wix Booking Integration
- **Service Categories**: 5 booking services with 3 products
- **Pricing Tiers**: 4 pricing plans with flexible options
- **Time Slots**: 8 available appointment time slots
- **Calendar Integration**: Real-time availability checking
- **Booking Confirmation**: Automated confirmation and reminder system

### 8. Donation & Membership System
- **Stripe Integration**: Secure donation processing
- **Membership Tiers**: Bronze, Silver, Gold, Platinum with progressive benefits
- **Reward Points**: Points-based engagement system
- **Campaign Management**: Fundraising campaigns with impact tracking
- **Recurring Donations**: Subscription-based giving options

### 9. Admin Dashboard System
- **Role-Based Access**: Admin, super admin, and coach role management
- **User Management**: Complete user lifecycle administration
- **Analytics Dashboard**: User metrics, donation tracking, session analytics
- **Content Management**: Dynamic content updates and testimonials
- **Financial Reporting**: Revenue tracking and financial analytics
- **Activity Logging**: Comprehensive admin action tracking

### 10. Content Management System (CMS)
- **Dynamic Pages**: Content page creation and management
- **Media Library**: Asset management and organization
- **Navigation Menus**: Dynamic menu structure management
- **Site Settings**: Global configuration and customization
- **SEO Optimization**: Meta tags and search engine optimization

## Testing Routes & Pages

### Public Pages
- `/` - Homepage with hero section and features
- `/about` - Organization mission and team information
- `/services` - Service offerings and descriptions
- `/programs` - Wellness program catalog
- `/resources` - Public resource library
- `/contact` - Contact form and information
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Authentication Pages
- `/admin-login` - Admin authentication
- `/password-reset` - Password recovery
- `/email-verification` - Account verification

### User Portal Pages
- `/ai-coaching` - AI coaching interface
- `/assessments` - Assessment programs dashboard
- `/mental-wellness` - Mental wellness hub
- `/personalized-recommendations` - Personalized resource suggestions
- `/digital-onboarding` - Comprehensive onboarding flow
- `/member-portal` - User dashboard
- `/subscribe` - Premium subscription page
- `/checkout` - Payment processing
- `/wix-booking` - Appointment booking system

### Admin & Professional Pages
- `/admin-dashboard` - Complete admin control panel
- `/coach-dashboard` - Coach management interface
- `/coach-profile` - Dynamic coach profile management
- `/coach-signup` - Coach application system
- `/donation-portal` - Donation management
- `/cms` - Content management system

### Beta Testing
- `/beta-test/` - AI coaching beta testing portal
- `/help-demo` - Help system demonstration

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI with Tailwind CSS styling
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side navigation
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **Payment Processing**: Stripe integration
- **Email Service**: Gmail OAuth2 with SMTP fallback
- **AI Integration**: OpenAI GPT-4 via n8n workflows

### Database Schema
- **Users Table**: Complete user profiles with membership levels
- **Assessment Programs**: Assessment results and payment tracking
- **Chat Sessions**: AI coaching conversation persistence
- **Chat Messages**: Individual message storage with metadata
- **Bookings**: Appointment scheduling and management
- **Donations**: Financial transaction tracking
- **Admin Sessions**: Secure admin authentication

## Environment Configuration
- **Database**: Supabase PostgreSQL (persistent storage)
- **Payment**: Stripe (test/live keys)
- **Email**: Gmail OAuth2 authentication
- **AI Services**: OpenAI GPT-4 integration
- **Domain**: wholewellnesscoaching.org

## Testing Scenarios

### User Journey Testing
1. **New User Registration** → Email Verification → Profile Setup
2. **Assessment Flow** → Take 3 Free Assessments → Hit Payment Wall → Subscribe
3. **AI Coaching** → Start Chat Session → Receive Personalized Guidance
4. **Professional Booking** → Digital Onboarding → Coach Assignment → Session Scheduling
5. **Donation Flow** → Select Amount → Payment Processing → Membership Upgrade

### Admin Testing
1. **Admin Login** → Dashboard Access → User Management → Analytics Review
2. **Content Management** → Page Creation → Media Upload → Menu Updates
3. **Financial Tracking** → Donation Reports → Revenue Analytics → User Segments

### Coach Testing
1. **Coach Signup** → Application Process → Banking Setup → Profile Creation
2. **Client Management** → Assignment Notifications → Session Scheduling → Video Integration

## Integration Points
- **Stripe**: Payment processing and subscription management
- **Supabase**: Database operations and real-time updates
- **Gmail API**: Automated email communications
- **OpenAI**: AI coaching responses and recommendations
- **Wix**: Appointment booking and calendar integration
- **n8n**: Workflow automation and AI processing

## Performance & Security
- **Authentication**: JWT tokens with secure cookie storage
- **Data Validation**: Zod schema validation on all inputs
- **Error Handling**: Comprehensive error logging and user feedback
- **Loading States**: Skeleton screens and progress indicators
- **Responsive Design**: Mobile-first design approach
- **SSL**: Secure HTTPS connections throughout

## Success Metrics
- User registration and verification completion rates
- Assessment completion and payment conversion rates
- AI coaching session engagement and duration
- Professional coaching booking and completion rates
- Donation conversion and recurring contribution rates
- Admin efficiency and content management utilization

---

**Testing Environment**: Production-ready deployment with live integrations
**Data Persistence**: All user data, assessments, and sessions saved permanently
**Payment Processing**: Test mode available, live payments functional
**Support**: Admin dashboard provides comprehensive user and system monitoring