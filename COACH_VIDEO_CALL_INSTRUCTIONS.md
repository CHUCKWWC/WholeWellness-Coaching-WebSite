# 🎥 Coach Guide: How to Start a Video Call with a Client

## Overview
The WholeWellness platform includes integrated video conferencing powered by 100ms. As a coach, you can initiate secure, recorded video sessions with your clients directly from your dashboard.

## Prerequisites
- You must be logged in with a coach account
- You need at least one client in your client list
- HMS_ACCESS_KEY and HMS_SECRET must be configured (handled by platform admin)

## Step-by-Step Instructions

### Step 1: Access Your Coach Dashboard
1. Log in to the WholeWellness platform
2. Navigate to your **Coach Dashboard** (usually at `/coach-dashboard`)
3. You should see your main dashboard with client information, bookings, and session controls

### Step 2: Initiate a Video Session
1. Locate the **"Start Video Session"** button on your dashboard
   - It's a prominent blue button with a video camera icon
   - You can find it in the main action area of your dashboard
2. Click the **"Start Video Session"** button

### Step 3: Choose Session Type
You have two options for creating a session:

#### Option A: Create from Existing Booking
1. In the **"Create Session From"** dropdown, select an existing booking
2. The form will automatically pre-fill with:
   - Client information
   - Session title (based on booking)
   - Description (coaching area from booking)
   - Scheduled time (if available)
3. Review and adjust as needed

#### Option B: Create New Session
1. In the **"Create Session From"** dropdown, select **"New Session"**
2. Fill out all fields manually

### Step 4: Fill Out Session Details

#### Required Fields:
- **Client**: Select the client from your client list (dropdown)
- **Session Title**: Enter a descriptive title (e.g., "Weekly Check-in", "Goal Setting Session")
  - Minimum 3 characters required
- **Start Time**: Select when the session should begin
  - Must be at least 5 minutes in the future
  - Use the date-time picker
- **Duration**: Choose session length from:
  - 30 minutes
  - 45 minutes
  - 60 minutes (default)
  - 90 minutes

#### Optional Fields:
- **Description**: Add session notes or agenda

#### Session Features (Enabled by Default):
- ✅ **Recording**: Session will be recorded
- ✅ **Transcript**: Speech-to-text transcript generated
- ✅ **AI Summary**: Automatic session summary created

### Step 5: Create the Session
1. Review all entered information
2. Click the **"Create Session"** button
3. Wait for confirmation (usually takes 2-3 seconds)

### Step 6: Share Session Link with Client
Once created, you'll see a success screen with:

1. **Session Details**:
   - Session title
   - Room code (6-digit code like "ABC123")

2. **Join Link**: 
   - Full URL to join the session
   - Format: `https://yourdomain.com/video-session/[session-id]`

3. **Actions**:
   - **Copy Link**: Click the copy icon to copy the full join URL
   - **Join Session Now**: Opens the video room in a new tab

### Step 7: Share the Link
You can share the join link with your client via:
- Email (copy and paste the link)
- SMS/Text message
- WhatsApp or other messaging apps
- Direct message in the platform (if available)

**Important**: The client will need this link to join the session at the scheduled time.

### Step 8: Join the Session
When ready to start:
1. Click **"Join Session Now"** from the success dialog, OR
2. Navigate to the session from your dashboard, OR
3. Use the same join link you shared with the client

## During the Video Session

### Controls Available:
- 🎤 **Microphone**: Toggle audio on/off
- 📹 **Camera**: Toggle video on/off
- 📞 **End Call**: End the session
- 💬 **Chat**: Send messages to participants (if enabled)
- 📝 **Transcript**: View live transcript
- 👥 **Participants**: See who's in the session

### Ending the Session:
1. Click the **"End Call"** button (red phone icon)
2. Confirm you want to end the session
3. The session will be saved with:
   - Recording (if enabled)
   - Transcript
   - AI-generated summary
4. You'll be redirected back to your coach dashboard

## After the Session

### What Happens Automatically:
1. **Recording**: Saved and accessible in session history
2. **Transcript**: Generated and emailed to participants
3. **AI Summary**: Key points and insights extracted
4. **Session Notes**: Available in your dashboard

### Finding Past Sessions:
- Navigate to your Coach Dashboard
- Look for "Session History" or "Past Sessions"
- Click on any session to view:
  - Recording
  - Transcript
  - AI summary
  - Session notes

## Troubleshooting

### Client Can't Join
**Problem**: Client says the link doesn't work
**Solution**: 
- Verify you sent the complete URL (starts with `https://`)
- Check that the session hasn't been ended
- Regenerate a new session if needed

### No Audio/Video
**Problem**: Can't see or hear participants
**Solution**:
- Check browser permissions (allow camera/microphone)
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)
- Test your devices before the session

### Session Creation Fails
**Problem**: Error when creating session
**Solution**:
- Verify client is selected
- Ensure session title has at least 3 characters
- Check that start time is in the future (minimum 5 minutes)
- Try logging out and back in

### Recording Not Available
**Problem**: Can't find session recording
**Solution**:
- Recordings may take a few minutes to process
- Check that recording was enabled when creating the session
- Contact platform admin if issue persists

## Best Practices

### Before the Session:
- ✅ Create the session at least 15 minutes before scheduled time
- ✅ Send the join link to your client immediately
- ✅ Include a reminder 5 minutes before the session
- ✅ Test your audio/video before the session starts

### During the Session:
- ✅ Start with a brief audio/video check
- ✅ Keep camera on for better connection
- ✅ Mute when not speaking in group sessions
- ✅ Take notes using the session description field

### After the Session:
- ✅ Review the AI summary for key insights
- ✅ Follow up with action items from the transcript
- ✅ Update client notes in the dashboard
- ✅ Schedule the next session if needed

## Security & Privacy

### Data Protection:
- All video sessions are encrypted end-to-end
- Recordings stored securely in the cloud
- Only authorized participants can access sessions
- Transcripts contain no personal data beyond what was discussed

### Client Privacy:
- Clients can join without creating an account
- No email required for client to join (just the link)
- Session data deleted after retention period (configurable)
- Compliant with data protection regulations

## Support

If you encounter any issues:
1. Check this guide first
2. Contact technical support: support@wholewellness.com
3. Report bugs through the platform feedback form
4. Emergency support: Available 24/7 for urgent session issues

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Platform**: WholeWellness Coaching Platform
