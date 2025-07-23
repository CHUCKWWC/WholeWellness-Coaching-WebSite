# Test Accounts Guide

## Account Credentials

### Coach Experience Account
- **Email**: `coachchuck@wwctest.com`
- **Password**: `chucknice1`
- **Role**: Coach
- **Membership Level**: Platinum
- **Reward Points**: 1000
- **Donation Total**: $250.00

### Member Experience Account
- **Email**: `memberchuck@wwctest.com`
- **Password**: `chucknice1`
- **Role**: User/Member
- **Membership Level**: Gold
- **Reward Points**: 500
- **Donation Total**: $100.00

## Coach Experience Features

When logged in as `coachchuck@wwctest.com`, you can access:

### Navigation Menu
- **Coach Dashboard**: Overview of clients, sessions, and earnings
- **Certification Courses**: Professional development and training modules
- **My Profile**: Coach profile management with photo, specialties, and availability
- **Client Management**: View assigned clients and session notes
- **Resource Library**: Coaching tools and materials

### Specific Features
1. **Certification Dashboard** (`/certification-dashboard`)
   - 3 modules: Introduction to Wellness Coaching, Advanced Nutrition, Relationship Counseling
   - Quiz interface with scoring system
   - Progress tracking and completion status

2. **Coach Profile Management** (`/coach-profile`)
   - Inline editing of profile information
   - Photo upload on hover
   - Specialty and video link management
   - Banking information (demo mode)

3. **Client Assignment System**
   - View client matches based on coaching specialties
   - Session scheduling and note-taking
   - Communication templates

## Member Experience Features

When logged in as `memberchuck@wwctest.com`, you can access:

### Navigation Menu
- **Home**: Personalized dashboard with progress tracking
- **AI Coaching**: Access to 6 specialized AI coaches
- **Assessments**: Wellness assessments and recommendations
- **Personal Recommendations**: AI-powered wellness suggestions
- **Donations**: Support the platform and unlock membership benefits
- **My Profile**: Member profile with wellness journey tracking

### Specific Features
1. **AI Coaching System** (`/ai-coaching`)
   - Weight Loss Specialist (Dasha)
   - Relationship Coach (Charles)
   - Wellness Coordinator
   - Behavior Coach
   - Accountability Partner
   - Meal Prep Assistant

2. **Multi-Assessment System** (`/assessments`)
   - Weight Loss Intake Questionnaire
   - Attachment Style Assessment
   - Mental Health Screening
   - Progress tracking and coach data access

3. **Personal Recommendations** (`/recommendations`)
   - AI-powered wellness recommendations
   - Crisis detection and emergency resources
   - Personalized scoring and feedback collection

4. **Donation Portal** (`/donations`)
   - Membership tier progression (Bronze → Gold → Platinum)
   - Reward points system
   - Impact tracking and testimonials

## Testing Workflows

### Coach Workflow Test
1. Login with `coachchuck@wwctest.com`
2. Navigate to "Certification Courses" 
3. Complete a module and quiz
4. Check "My Profile" and update information
5. View client management features

### Member Workflow Test
1. Login with `memberchuck@wwctest.com`
2. Complete an assessment from "Assessments"
3. Try AI coaching with different coaches
4. Visit "Personal Recommendations" for wellness suggestions
5. Make a donation to test membership progression

## Account Management

### Password Reset
Both accounts support password reset functionality:
- Use "Forgot Password" on login page
- Password reset emails will be logged in console during development

### Profile Updates
Both accounts have full profile management capabilities:
- Update personal information
- Change preferences and settings
- Track progress and activity

### Session Management
Both accounts maintain secure sessions:
- 7-day session lifetime
- Automatic logout on browser close
- Session token stored in HTTP-only cookies

## Development Notes

### Account Creation
- Accounts created with bcrypt password hashing (12 rounds)
- Email verification status set to `true` for immediate access
- Profile completion status set to `true` to bypass onboarding

### Data Seeding
- Coach account includes sample specialties and availability
- Member account includes assessment history and recommendation data
- Both accounts have realistic donation and points history

### Role-Based Access
- Coach account can access coach-only features and endpoints
- Member account restricted to user-level features
- Proper authentication middleware enforces access control

Use these accounts to test the complete platform experience from both coach and member perspectives.