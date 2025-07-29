# WholeWellness Platform - Discovery Quiz Testing Plan
*Third-Party Testing Guide - Version 2.0*

## Overview
This comprehensive testing plan covers the WholeWellness Discovery Roadmap & Quiz implementation, including the complete digital onboarding experience, personalized coaching recommendations, and pricing integration.

## Test Environment Access
- **Platform URL**: https://whole-wellness-coaching.replit.app
- **Admin Dashboard**: https://whole-wellness-coaching.replit.app/admin-dashboard
- **Coach Portal**: https://whole-wellness-coaching.replit.app/coach-profile

## Testing Credentials

### User Accounts
- **Test User**: charles.watson@wholewellnesscoaching.org / Password: chucknice1
- **Anonymous Testing**: No credentials required for Discovery Quiz

### Coach Account
- **Test Coach**: chuck / Password: chucknice1
- **Coach Profile**: Relationship & Wellness Specialist

### Admin Access
- **Admin User**: charles.watson@wholewellnesscoaching.org
- **Role**: Super Admin with full platform access

## Core Feature Testing

### 1. Discovery Quiz Flow Testing

#### Test Case 1.1: Discovery Quiz Access
- **Route**: `/digital-onboarding`
- **Expected**: Landing page with "Start Your Discovery Quiz" button
- **Verify**: Professional design, clear value proposition, pricing preview
- **Test Data**: Anonymous user access

#### Test Case 1.2: Step 1 - Needs Assessment
- **Action**: Click "Start Your Discovery Quiz"
- **Expected**: Multi-select interface with 11 need categories:
  - Managing emotions (stress, anxiety, overwhelm)
  - Relationship issues (dating, marriage, family, divorce)
  - Career stagnation, burnout, or transitions
  - Financial stress or goals
  - Health and wellness
  - Navigating a life crisis (grief, identity, trauma)
  - Feeling unfulfilled / purpose-seeking
  - Productivity or time management
  - Trauma or domestic violence recovery
  - Parenting or co-parenting
  - Low self-worth or confidence
- **Verify**: Max 3 selections allowed, icons display correctly, progress bar shows 25%

#### Test Case 1.3: Step 2 - Situation Details
- **Action**: Complete needs selection, click "Next Step"
- **Expected**: Optional text area for situation description
- **Verify**: Can skip or provide details, progress bar shows 50%

#### Test Case 1.4: Step 3 - Support Preference
- **Action**: Proceed to support preference selection
- **Expected**: Radio button options:
  - I want to talk to a real coach (Live Coaching - $599)
  - I prefer tools to explore on my own (AI Coaching - $299)
  - A mix of both (Combined Package - $799)
  - I'm not sure—help me explore options
- **Verify**: Clear pricing display, progress bar shows 75%

#### Test Case 1.5: Step 4 - Readiness Level
- **Action**: Select support preference, click "Next Step"
- **Expected**: Four readiness level options with descriptions:
  - I'm overwhelmed and unsure where to begin
  - I'm managing, just need direction
  - I'm motivated and ready to change
  - I'm curious and open to explore
- **Verify**: Color-coded badges, progress bar shows 100%

#### Test Case 1.6: Results Generation
- **Action**: Complete all steps, click "Get My Results"
- **Expected**: Personalized coaching recommendations page with:
  - Recommended coaching team based on selections
  - Primary and supporting coach specialties
  - Pricing options with highlighted preference
  - Bonus resources (AI tools, group support)
  - Call-to-action buttons for each package
- **Verify**: Recommendations match user inputs, pricing displays correctly

### 2. Smart Matching Algorithm Testing

#### Test Case 2.1: Relationship Focus Match
- **Input**: Select "Relationship issues" + "Low self-worth"
- **Expected**: Primary - Relationship Coach, Supporting - Mindset Coach
- **Verify**: Appropriate coach combinations, AI tools recommended

#### Test Case 2.2: Trauma Recovery Match
- **Input**: Select "Trauma or domestic violence recovery"
- **Expected**: Primary - Trauma-Informed Coach, Group support enabled
- **Verify**: Specialized trauma support, additional resources provided

#### Test Case 2.3: Career Transition Match
- **Input**: Select "Career stagnation" + "Financial stress"
- **Expected**: Primary - Career Coach, Supporting - Financial Coach
- **Verify**: Multi-coach approach for complex needs

#### Test Case 2.4: Overwhelmed User Path
- **Input**: Readiness level "I'm overwhelmed and unsure where to begin"
- **Expected**: Gentle entry recommendations, AI tools emphasis, group support
- **Verify**: Appropriate pacing and support level

### 3. Navigation Integration Testing

#### Test Case 3.1: Assessments Link
- **Route**: Main navigation "Assessments"
- **Expected**: Direct link to `/digital-onboarding`
- **Verify**: Strategic placement for conversion funnel

#### Test Case 3.2: Get Started Links
- **Routes**: Various pages with "Get Started" buttons
- **Expected**: All link to discovery quiz flow
- **Verify**: Consistent user journey across platform

### 4. API Endpoints Testing

#### Test Case 4.1: Quiz Submission
- **Endpoint**: `POST /api/discovery-quiz`
- **Test Data**:
```json
{
  "sessionId": "test_session_123",
  "currentNeeds": ["relationships", "confidence"],
  "situationDetails": {"situation": "Testing API functionality"},
  "supportPreference": "live",
  "readinessLevel": "motivated",
  "recommendedPath": {
    "coaches": [{"specialty": "Relationship Coach", "priority": "primary"}],
    "pricing": {"live": 599, "ai": 299, "combined": 799}
  },
  "completed": true
}
```
- **Expected**: `{"success": true, "quizId": "demo_quiz_...", "message": "Quiz results processed successfully"}`

#### Test Case 4.2: Quiz History (Authenticated)
- **Endpoint**: `GET /api/discovery-quiz/history`
- **Headers**: Valid auth token
- **Expected**: Array of user's previous quiz results

#### Test Case 4.3: Session Retrieval
- **Endpoint**: `GET /api/discovery-quiz/{sessionId}`
- **Expected**: Specific quiz result data

### 5. Pricing Integration Testing

#### Test Case 5.1: Package Selection Flow
- **Action**: Complete quiz, select "Start Live Coaching"
- **Expected**: Redirect to `/subscribe?plan=live_coaching`
- **Verify**: Stripe integration maintains pricing consistency

#### Test Case 5.2: Combined Package Promotion
- **Input**: Support preference "A mix of both"
- **Expected**: Combined package highlighted with "$99 savings" messaging
- **Verify**: Value proposition clear and accurate

### 6. Mobile Responsiveness Testing

#### Test Case 6.1: Mobile Discovery Quiz
- **Device**: Mobile viewport (375px width)
- **Verify**: 
  - Progress bar readable
  - Selection options accessible
  - Text input areas functional
  - Results page layout appropriate

#### Test Case 6.2: Tablet Experience
- **Device**: Tablet viewport (768px width)
- **Verify**: Grid layouts adapt properly, touch interactions work

### 7. Error Handling & Edge Cases

#### Test Case 7.1: Incomplete Selections
- **Action**: Try to proceed without required selections
- **Expected**: Validation prevents progression, clear error messaging

#### Test Case 7.2: Maximum Selections
- **Action**: Try to select more than 3 needs
- **Expected**: Additional options disabled, counter shows "3/3"

#### Test Case 7.3: API Failure Handling
- **Scenario**: Simulated API failure
- **Expected**: User sees friendly error message, can retry

### 8. Database Integration Testing

#### Test Case 8.1: Database Schema Setup
- **File**: `supabase-discovery-quiz-schema.sql`
- **Action**: Run SQL in Supabase dashboard
- **Verify**: Tables created successfully:
  - discovery_quiz_results
  - coach_match_tags
  - Indexes and sample data populated

#### Test Case 8.2: Data Persistence
- **Action**: Complete quiz as authenticated user
- **Verify**: Results stored in database, retrievable via API

### 9. Performance Testing

#### Test Case 9.1: Quiz Load Time
- **Metric**: Initial page load under 3 seconds
- **Verify**: Progress between steps is immediate

#### Test Case 9.2: Results Generation Speed
- **Metric**: Recommendation algorithm completes under 1 second
- **Verify**: No noticeable delay in results display

### 10. Accessibility Testing

#### Test Case 10.1: Keyboard Navigation
- **Action**: Navigate entire quiz using only keyboard
- **Expected**: All elements accessible via Tab/Enter

#### Test Case 10.2: Screen Reader Compatibility
- **Tool**: Screen reader software
- **Verify**: Labels, descriptions, and progress indicators read correctly

## Expected User Journey Flow

1. **Discovery Entry**: User clicks "Assessments" or "Get Started"
2. **Introduction**: Professional landing page explains value proposition
3. **Need Assessment**: User selects 1-3 primary challenge areas
4. **Context Gathering**: Optional situation details provided
5. **Preference Setting**: User indicates coaching style preference
6. **Readiness Assessment**: User selects current readiness level
7. **Results Display**: Personalized coaching team recommendations shown
8. **Package Selection**: User chooses pricing package and proceeds to payment

## Success Criteria

### Functional Requirements
- ✅ All 4 quiz steps complete without errors
- ✅ Smart matching algorithm generates appropriate recommendations
- ✅ Pricing display matches approved policy ($299/$599/$799)
- ✅ API endpoints return expected responses
- ✅ Mobile experience fully functional

### User Experience Requirements
- ✅ Professional, empathetic design throughout
- ✅ Clear progress indication and navigation
- ✅ Personalized results feel relevant and actionable
- ✅ Conversion funnel guides to appropriate packages
- ✅ Trust indicators and compliance messaging present

### Technical Requirements
- ✅ Works for both authenticated and anonymous users
- ✅ Database integration functional (when schema deployed)
- ✅ API error handling graceful
- ✅ Performance meets established benchmarks
- ✅ Cross-browser compatibility confirmed

## Known Limitations

1. **Database Setup Required**: The `supabase-discovery-quiz-schema.sql` file must be run manually in Supabase dashboard for full data persistence
2. **Demo Mode**: Quiz currently runs in demo mode with mock data responses when database tables aren't available
3. **Payment Integration**: Package selection links prepared but full Stripe integration requires additional configuration

## Reporting Issues

When reporting issues, please include:
- Test case number and description
- Browser/device information
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Console error messages (if any)

## Contact Information

For testing questions or technical issues:
- Platform: WholeWellness Coaching
- Technical Lead: Development Team
- Last Updated: July 21, 2025

---

*This testing plan ensures the Discovery Quiz provides a professional, conversion-optimized experience that matches the quality standards of platforms like BetterHelp and Talkspace while serving WholeWellness's unique mission of supporting underserved women.*