import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import { db } from './db';
import { coaches } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { log as logger } from './logger';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
}

interface MeetEventOptions {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails?: string[];
  timeZone?: string;
}

interface MeetEventResult {
  eventId: string;
  meetUrl: string;
  htmlLink: string;
  calendarId: string;
}

export function createOAuth2Client(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Build the correct redirect URI - the route is at /api/video/google/calendar/callback
  const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
    : 'http://localhost:5000';
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 
    `${baseUrl}/api/video/google/calendar/callback`;

  if (!clientId || !clientSecret) {
    logger.warn('[GOOGLE-CALENDAR] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  logger.info(`[GOOGLE-CALENDAR] OAuth redirect URI: ${redirectUri}`);
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(coachId: string): string {
  const oauth2Client = createOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: coachId,
  });

  logger.info(`[GOOGLE-CALENDAR] Generated auth URL for coach ${coachId}`);
  return authUrl;
}

export async function handleOAuthCallback(code: string, coachId: string): Promise<TokenInfo> {
  const oauth2Client = createOAuth2Client();
  
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain tokens from Google');
  }

  const tokenInfo: TokenInfo = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
  };

  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  await db.update(coaches)
    .set({
      googleId: userInfo.data.id,
      googleEmail: userInfo.data.email,
      googleAccessToken: tokenInfo.accessToken,
      googleRefreshToken: tokenInfo.refreshToken,
      googleTokenExpiry: tokenInfo.expiryDate,
      googleCalendarId: 'primary',
      updatedAt: new Date(),
    })
    .where(eq(coaches.userId, coachId));

  logger.info(`[GOOGLE-CALENDAR] OAuth complete for coach ${coachId}, email: ${userInfo.data.email}`);
  
  return tokenInfo;
}

export async function getAuthenticatedClient(coachId: string): Promise<OAuth2Client | null> {
  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  if (!coach?.googleAccessToken || !coach?.googleRefreshToken) {
    logger.warn(`[GOOGLE-CALENDAR] Coach ${coachId} has not connected Google Calendar`);
    return null;
  }

  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: coach.googleAccessToken,
    refresh_token: coach.googleRefreshToken,
    expiry_date: coach.googleTokenExpiry?.getTime(),
  });

  if (coach.googleTokenExpiry && new Date() >= coach.googleTokenExpiry) {
    logger.info(`[GOOGLE-CALENDAR] Token expired for coach ${coachId}, refreshing...`);
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      await db.update(coaches)
        .set({
          googleAccessToken: credentials.access_token,
          googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(eq(coaches.userId, coachId));

      oauth2Client.setCredentials(credentials);
      logger.info(`[GOOGLE-CALENDAR] Token refreshed for coach ${coachId}`);
    } catch (error) {
      logger.error(`[GOOGLE-CALENDAR] Failed to refresh token for coach ${coachId}:`, error);
      return null;
    }
  }

  return oauth2Client;
}

export async function createMeetEvent(
  coachId: string,
  options: MeetEventOptions
): Promise<MeetEventResult> {
  const oauth2Client = await getAuthenticatedClient(coachId);
  
  if (!oauth2Client) {
    throw new Error('Coach has not connected Google Calendar. Please connect your Google Calendar first.');
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  const calendarId = coach?.googleCalendarId || 'primary';

  const event: calendar_v3.Schema$Event = {
    summary: options.title,
    description: options.description || `WholeWellness Coaching Session\n\nJoin the video call using the Google Meet link below.`,
    start: {
      dateTime: options.startTime.toISOString(),
      timeZone: options.timeZone || 'America/New_York',
    },
    end: {
      dateTime: options.endTime.toISOString(),
      timeZone: options.timeZone || 'America/New_York',
    },
    conferenceData: {
      createRequest: {
        requestId: uuid(),
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    attendees: options.attendeeEmails?.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  logger.info(`[GOOGLE-CALENDAR] Creating event for coach ${coachId}: ${options.title}`);

  const result = await calendar.events.insert({
    calendarId,
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });

  if (!result.data.hangoutLink) {
    throw new Error('Failed to generate Google Meet link');
  }

  logger.info(`[GOOGLE-CALENDAR] Event created: ${result.data.id}, Meet URL: ${result.data.hangoutLink}`);

  return {
    eventId: result.data.id!,
    meetUrl: result.data.hangoutLink,
    htmlLink: result.data.htmlLink!,
    calendarId,
  };
}

export async function updateMeetEvent(
  coachId: string,
  eventId: string,
  options: Partial<MeetEventOptions>
): Promise<void> {
  const oauth2Client = await getAuthenticatedClient(coachId);
  
  if (!oauth2Client) {
    throw new Error('Coach has not connected Google Calendar');
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  const calendarId = coach?.googleCalendarId || 'primary';

  const updateData: calendar_v3.Schema$Event = {};
  
  if (options.title) updateData.summary = options.title;
  if (options.description) updateData.description = options.description;
  if (options.startTime) {
    updateData.start = {
      dateTime: options.startTime.toISOString(),
      timeZone: options.timeZone || 'America/New_York',
    };
  }
  if (options.endTime) {
    updateData.end = {
      dateTime: options.endTime.toISOString(),
      timeZone: options.timeZone || 'America/New_York',
    };
  }
  if (options.attendeeEmails) {
    updateData.attendees = options.attendeeEmails.map(email => ({ email }));
  }

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: updateData,
    sendUpdates: 'all',
  });

  logger.info(`[GOOGLE-CALENDAR] Event updated: ${eventId}`);
}

export async function cancelMeetEvent(
  coachId: string,
  eventId: string
): Promise<void> {
  const oauth2Client = await getAuthenticatedClient(coachId);
  
  if (!oauth2Client) {
    throw new Error('Coach has not connected Google Calendar');
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  const calendarId = coach?.googleCalendarId || 'primary';

  await calendar.events.delete({
    calendarId,
    eventId,
    sendUpdates: 'all',
  });

  logger.info(`[GOOGLE-CALENDAR] Event cancelled: ${eventId}`);
}

export async function isCalendarConnected(coachId: string): Promise<boolean> {
  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  return !!(coach?.googleAccessToken && coach?.googleRefreshToken);
}

export async function getCalendarConnectionStatus(coachId: string): Promise<{
  connected: boolean;
  email?: string;
  calendarId?: string;
}> {
  const [coach] = await db.select()
    .from(coaches)
    .where(eq(coaches.userId, coachId));

  if (!coach?.googleAccessToken) {
    return { connected: false };
  }

  return {
    connected: true,
    email: coach.googleEmail || undefined,
    calendarId: coach.googleCalendarId || 'primary',
  };
}

export async function disconnectCalendar(coachId: string): Promise<void> {
  await db.update(coaches)
    .set({
      googleId: null,
      googleEmail: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      googleCalendarId: null,
      updatedAt: new Date(),
    })
    .where(eq(coaches.userId, coachId));

  logger.info(`[GOOGLE-CALENDAR] Calendar disconnected for coach ${coachId}`);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
