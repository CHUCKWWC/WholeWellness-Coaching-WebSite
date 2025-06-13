# Google Meet Integration Guide

## Overview
The Google Meet integration provides professional video conferencing capabilities for coaches to conduct secure, high-quality sessions with clients. This integration complements the existing WebRTC video system and offers enterprise-grade features.

## Features

### 1. Connection Management
- **OAuth Integration**: Secure Google account authentication
- **Connection Status**: Real-time status monitoring and sync tracking
- **Auto-Reconnection**: Automatic token refresh and connection maintenance

### 2. Session Scheduling
- **Calendar Integration**: Automatic sync with Google Calendar
- **Client Selection**: Choose from assigned client list
- **Session Types**: Individual, group, and consultation sessions
- **Duration Control**: Flexible session length settings
- **Description/Agenda**: Optional session details and objectives

### 3. Meeting Management
- **Unique Meeting URLs**: Automatically generated Google Meet links
- **One-Click Join**: Direct access to scheduled meetings
- **Status Tracking**: Real-time session status updates (scheduled/active/completed)
- **Link Sharing**: Copy meeting links for client distribution
- **External Access**: Open meetings in new tabs for optimal experience

### 4. Professional Features
- **Enterprise Security**: Google's enterprise-grade security and encryption
- **Recording Capabilities**: Built-in session recording for review and documentation
- **Screen Sharing**: Full screen sharing and collaboration tools
- **Mobile Support**: Cross-platform compatibility (desktop, mobile, tablet)
- **Reliability**: Google's infrastructure ensures 99.9% uptime

## Implementation Details

### Frontend Components
- **GoogleMeetIntegration.tsx**: Main integration component
- **Connection Flow**: OAuth setup and account linking
- **Session Scheduler**: Meeting creation and management interface
- **Dashboard Integration**: Embedded in coach dashboard tabs

### Backend API Endpoints
- `GET /api/coaches/google-meet-status/:coachId` - Check connection status
- `POST /api/coaches/:coachId/connect-google-meet` - Connect Google account
- `GET /api/coaches/google-meet-sessions/:coachId` - Get scheduled sessions
- `POST /api/coaches/:coachId/google-meet-sessions` - Create new session
- `PATCH /api/coaches/google-meet-sessions/:sessionId` - Update session status
- `GET /api/coaches/clients/:coachId` - Get client list for scheduling

### Data Structure
```typescript
interface GoogleMeetSession {
  id: string;
  meetingId: string;
  meetingUrl: string;
  clientId: string;
  clientName: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  sessionType: 'individual' | 'group' | 'consultation';
  attendees?: string[];
  description?: string;
  createdAt: string;
}
```

## Coach Dashboard Integration

### New Google Meet Tab
The coach dashboard now includes a dedicated Google Meet tab with:
- Connection status and setup
- Upcoming sessions overview
- Quick scheduling interface
- Session management tools
- Meeting link sharing
- Integration settings

### Quick Actions
- Start instant meetings
- View Google Calendar
- Access meeting settings
- Generate meeting reports

## Benefits for Coaches

### Professional Platform
- **Brand Recognition**: Google Meet's trusted professional image
- **Client Familiarity**: Most clients already familiar with Google Meet
- **No Downloads**: Browser-based access, no software installation required
- **Technical Support**: Google's extensive support documentation

### Enhanced Functionality
- **Automatic Recording**: Session recordings stored in Google Drive
- **Transcription**: AI-powered meeting transcripts (Google Workspace plans)
- **Live Captions**: Real-time captions for accessibility
- **Breakout Rooms**: Support for group session management
- **Polls and Q&A**: Interactive session tools

### Integration Benefits
- **Calendar Sync**: Seamless integration with existing Google Calendar
- **Email Notifications**: Automatic meeting reminders and invitations
- **Contact Management**: Integration with Google Contacts
- **File Sharing**: Direct Google Drive file sharing during sessions

## Security and Compliance

### Data Protection
- **End-to-End Encryption**: All meetings encrypted in transit and at rest
- **HIPAA Compliance**: Meets healthcare privacy requirements with Google Workspace
- **SOC 2 Certified**: Enterprise security standards compliance
- **Access Controls**: Granular permissions and meeting access controls

### Privacy Features
- **Waiting Rooms**: Client approval before joining sessions
- **Meeting Locks**: Secure sessions against unauthorized access
- **Participant Management**: Remove disruptive participants
- **Recording Permissions**: Control who can record sessions

## Setup Requirements

### For Production Deployment
1. **Google Cloud Console Setup**:
   - Create Google Cloud project
   - Enable Google Calendar API
   - Enable Google Meet API
   - Set up OAuth 2.0 credentials

2. **Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=https://yourapp.com/auth/google/callback
   ```

3. **OAuth Scopes Required**:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/meet`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## Usage Workflow

### Initial Setup
1. Coach navigates to Google Meet tab in dashboard
2. Clicks "Connect Google Meet" button
3. Completes OAuth flow with Google account
4. Dashboard shows connected status

### Scheduling Sessions
1. Click "Schedule Session" button
2. Select client from dropdown
3. Set date/time and duration
4. Choose session type and add description
5. System creates Google Meet link automatically
6. Session appears in upcoming sessions list

### Conducting Sessions
1. Join meeting 5-10 minutes early
2. Admit clients from waiting room
3. Use Google Meet's built-in tools for session
4. End meeting and update session status

## Integration with Existing Features

### WebRTC Fallback
- Google Meet serves as primary video solution
- WebRTC remains available as backup option
- Coaches can choose preferred platform per session

### AI Insights Integration
- Google Meet recordings can be analyzed by AI systems
- Session transcripts feed into coaching insights
- Progress tracking enhanced with meeting data

### Mobile App Compatibility
- Google Meet links work seamlessly in mobile coach app
- Push notifications for upcoming Google Meet sessions
- Offline session scheduling syncs when connected

## Troubleshooting

### Common Issues
- **Connection Failed**: Check Google account permissions
- **Meeting Not Created**: Verify calendar access permissions
- **Can't Join Meeting**: Ensure browser allows pop-ups
- **No Audio/Video**: Check Google Meet microphone/camera permissions

### Support Resources
- Google Meet Help Center
- Google Workspace Admin Console
- Coach dashboard help section
- Platform support tickets

This integration provides coaches with enterprise-grade video conferencing while maintaining the comprehensive feature set of the existing platform.