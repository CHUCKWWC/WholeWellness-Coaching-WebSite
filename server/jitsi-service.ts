import jwt from "jsonwebtoken";
import { log as logger } from "./logger";

// JaaS (Jitsi as a Service) configuration
const JAAS_APP_ID = process.env.JAAS_APP_ID || "";
const JAAS_API_KEY = process.env.JAAS_API_KEY || "";
const JAAS_PRIVATE_KEY = process.env.JAAS_PRIVATE_KEY || "";

// Check if JaaS is configured
export function isJaasConfigured(): boolean {
  return !!(JAAS_APP_ID && JAAS_API_KEY && JAAS_PRIVATE_KEY);
}

// Initialize Jitsi service
export function initializeJitsi() {
  logger.info("[Jitsi] Starting service initialization...");
  
  if (!isJaasConfigured()) {
    logger.warn("[Jitsi] JaaS credentials not configured. Video sessions will use public Jitsi Meet servers.");
    logger.info("[Jitsi] To use JaaS, configure JAAS_APP_ID, JAAS_API_KEY, and JAAS_PRIVATE_KEY");
    return false;
  }

  logger.info("[Jitsi] ✓ JaaS credentials found, service initialized");
  return true;
}

// Generate a unique room name
export function generateRoomName(sessionId: string, title?: string): string {
  const sanitizedTitle = title 
    ? title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20).toLowerCase()
    : 'session';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  
  return `ww_${sanitizedTitle}_${timestamp}_${random}`;
}

// Generate a short, shareable room code
export function generateRoomCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomString = () => Array.from(
    { length: 3 }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  return `${randomString()}-${randomString()}-${randomString()}`;
}

// Generate JWT token for JaaS
export function generateJaasToken(options: {
  roomName: string;
  moderator: boolean;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  expiresIn?: number; // in seconds, default 2 hours
}): string | null {
  if (!isJaasConfigured()) {
    logger.warn("[Jitsi] JaaS not configured, cannot generate JWT token");
    return null;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (options.expiresIn || 7200); // Default 2 hours

    // JaaS JWT payload structure
    const payload = {
      aud: "jitsi",
      iss: "chat",
      iat: now,
      nbf: now,
      exp: exp,
      sub: JAAS_APP_ID,
      room: options.roomName,
      context: {
        user: {
          id: options.userId,
          name: options.userName,
          email: options.userEmail || "",
          avatar: options.userAvatar || "",
          moderator: options.moderator,
        },
        features: {
          recording: options.moderator, // Only moderators can record
          livestreaming: options.moderator,
          transcription: options.moderator,
          "outbound-call": false,
        },
      },
    };

    // Sign the JWT with the private key
    const token = jwt.sign(payload, JAAS_PRIVATE_KEY.replace(/\\n/g, '\n'), {
      algorithm: "RS256",
      header: {
        alg: "RS256",
        typ: "JWT",
        kid: JAAS_API_KEY,
      },
    });

    logger.info(`[Jitsi] Generated JWT for user ${options.userName} in room ${options.roomName}`);
    return token;
  } catch (error: any) {
    logger.error("[Jitsi] Failed to generate JWT:", error.message);
    return null;
  }
}

// Get the Jitsi Meet domain (JaaS or public)
export function getJitsiDomain(): string {
  if (isJaasConfigured()) {
    return "8x8.vc"; // JaaS domain
  }
  return "meet.jit.si"; // Public Jitsi Meet
}

// Build the full Jitsi Meet URL for a room
export function buildJitsiUrl(roomName: string, jwt?: string | null): string {
  const domain = getJitsiDomain();
  
  if (isJaasConfigured() && jwt) {
    // JaaS URL format: https://8x8.vc/{appId}/{roomName}?jwt={token}
    return `https://${domain}/${JAAS_APP_ID}/${roomName}?jwt=${jwt}`;
  }
  
  // Public Jitsi URL
  return `https://${domain}/${roomName}`;
}

// Create a session configuration for Jitsi
export interface JitsiSessionConfig {
  roomName: string;
  roomCode: string;
  domain: string;
  appId?: string;
  isJaasEnabled: boolean;
}

export function createSessionConfig(sessionId: string, title?: string): JitsiSessionConfig {
  const roomName = generateRoomName(sessionId, title);
  const roomCode = generateRoomCode();
  
  return {
    roomName,
    roomCode,
    domain: getJitsiDomain(),
    appId: isJaasConfigured() ? JAAS_APP_ID : undefined,
    isJaasEnabled: isJaasConfigured(),
  };
}

// Get room config for frontend
export interface JitsiRoomConfig {
  domain: string;
  roomName: string;
  jwt?: string;
  appId?: string;
  isJaasEnabled: boolean;
  configOverwrite: Record<string, any>;
  interfaceConfigOverwrite: Record<string, any>;
}

export function getRoomConfig(options: {
  roomName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  moderator: boolean;
}): JitsiRoomConfig {
  const jwt = generateJaasToken({
    roomName: options.roomName,
    moderator: options.moderator,
    userId: options.userId,
    userName: options.userName,
    userEmail: options.userEmail,
  });

  return {
    domain: getJitsiDomain(),
    roomName: options.roomName,
    jwt: jwt || undefined,
    appId: isJaasConfigured() ? JAAS_APP_ID : undefined,
    isJaasEnabled: isJaasConfigured(),
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      disableDeepLinking: true,
      prejoinPageEnabled: true,
      enableWelcomePage: false,
      enableClosePage: false,
      disableInviteFunctions: false,
      enableNoisyMicDetection: true,
      enableNoAudioDetection: true,
      enableLobbyChat: true,
      hiddenPremeetingButtons: [],
      toolbarButtons: [
        'camera',
        'chat',
        'closedcaptions',
        'desktop',
        'download',
        'filmstrip',
        'fullscreen',
        'hangup',
        'microphone',
        'participants-pane',
        'raisehand',
        'select-background',
        'settings',
        'tileview',
        'toggle-camera',
        'videoquality',
      ],
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: !isJaasConfigured(),
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      SHOW_POWERED_BY: false,
      SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      MOBILE_APP_PROMO: false,
      HIDE_INVITE_MORE_HEADER: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      ENABLE_FEEDBACK_ANIMATION: true,
      DISABLE_FOCUS_INDICATOR: false,
      DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
      VERTICAL_FILMSTRIP: true,
      CLOSE_PAGE_GUEST_HINT: false,
      DEFAULT_BACKGROUND: '#1a1a2e',
      DEFAULT_LOCAL_DISPLAY_NAME: 'You',
      DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
      TOOLBAR_ALWAYS_VISIBLE: false,
      TOOLBAR_TIMEOUT: 4000,
    },
  };
}

// Initialize on module load
logger.info("[Jitsi] Module loaded, initializing service...");
const initResult = initializeJitsi();
logger.info(`[Jitsi] Initialization result: ${initResult ? "JaaS enabled" : "Using public servers"}`);
