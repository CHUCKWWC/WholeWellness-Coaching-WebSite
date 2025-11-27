import { SDK } from "@100mslive/server-sdk";
import { log as logger } from "./logger";

const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY || "";
const HMS_SECRET = process.env.HMS_SECRET || "";

let hmsClient: SDK | null = null;

// Initialize 100ms SDK
export function initialize100ms() {
  logger.info("[100ms] Starting SDK initialization...");
  
  if (!HMS_ACCESS_KEY || !HMS_SECRET) {
    logger.warn("[100ms] Credentials not configured. Video sessions will not work until HMS_ACCESS_KEY and HMS_SECRET are set.");
    return null;
  }

  logger.info("[100ms] Credentials found, creating SDK instance...");
  
  try {
    hmsClient = new SDK(HMS_ACCESS_KEY, HMS_SECRET);
    logger.info("[100ms] ✓ SDK initialized successfully");
    return hmsClient;
  } catch (error) {
    logger.error("[100ms] ✗ Failed to initialize SDK:", error);
    return null;
  }
}

// Create a room for a session
export async function createRoom(sessionId: string, options: {
  name: string;
  description?: string;
  recording?: boolean;
  maxParticipants?: number;
}) {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    const room = await hmsClient.rooms.create({
      name: options.name,
      description: options.description,
      recording_info: {
        enabled: options.recording ?? true,
      },
    });

    return {
      roomId: room.id,
      name: room.name,
    };
  } catch (error) {
    console.error("Error creating 100ms room:", error);
    throw error;
  }
}

// Generate auth token for a participant to join a room
export async function generateAuthToken(roomId: string, userId: string, role: string = "guest") {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    const token = await hmsClient.auth.getAuthToken({
      roomId,
      userId,
      role,
    });

    return token.token;
  } catch (error) {
    console.error("Error generating auth token:", error);
    throw error;
  }
}

// End a session and get recording
export async function endSession(roomId: string) {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized");
  }

  try {
    // Stop recording if enabled
    await hmsClient.recordings.stopAll(roomId);

    // Disable the room
    await hmsClient.rooms.enableOrDisable(roomId, false);

    return { success: true };
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
}

// Get session recording
export async function getRecording(roomId: string) {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized");
  }

  try {
    const recordings = await hmsClient.recordings.list({
      room_id: roomId,
    });

    return recordings;
  } catch (error) {
    console.error("Error fetching recording:", error);
    throw error;
  }
}

// Generate room code using 100ms API (for Prebuilt component)
export async function createRoomCode(roomId: string, role: string = "guest"): Promise<string> {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    const roomCode = await (hmsClient.roomCodes as any).create({
      room_id: roomId,
      role: role,
    });

    return (roomCode as any).code;
  } catch (error) {
    console.error("Error creating room code:", error);
    throw error;
  }
}

// Get available roles from a room (diagnostic function)
export async function getAvailableRoles(roomId: string): Promise<{ roles: string[], roomCodes: any[] }> {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    logger.info(`[getAvailableRoles] Fetching roles for room ${roomId}...`);
    
    // Generate management token
    const tokenResponse = await (hmsClient.auth as any).getManagementToken({});
    const managementToken = (tokenResponse as any).token || tokenResponse;
    
    // Call the REST API to get room codes (which contains all roles)
    const response = await fetch(`https://api.100ms.live/v2/room-codes/room/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch room codes: ${response.status} ${errorText}`);
    }
    
    const roomCodesResponse = await response.json();
    const roomCodes = roomCodesResponse.data || roomCodesResponse;
    const roles = roomCodes.map((code: any) => code.role);
    
    logger.info(`[getAvailableRoles] Found roles: ${roles.join(', ')}`);
    
    return { roles, roomCodes };
  } catch (error: any) {
    logger.error("[getAvailableRoles] Error:", error.message);
    throw error;
  }
}

// Validate a room code by checking if it's active (requires room_id)
export async function validateRoomCode(roomCode: string, roomId?: string): Promise<{
  valid: boolean;
  roomId?: string;
  role?: string;
  enabled?: boolean;
  error?: string;
  allCodes?: any[];
}> {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    logger.info(`[validateRoomCode] Validating room code: ${roomCode}${roomId ? ` for room: ${roomId}` : ''}...`);
    
    // Generate management token
    const tokenResponse = await (hmsClient.auth as any).getManagementToken({});
    const managementToken = (tokenResponse as any).token || tokenResponse;
    
    // If we have a room_id, use it to fetch room codes
    if (roomId) {
      const response = await fetch(`https://api.100ms.live/v2/room-codes/room/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`[validateRoomCode] Failed to fetch room codes: ${response.status} ${errorText}`);
        return { 
          valid: false, 
          error: `Failed to fetch room codes: ${response.status}` 
        };
      }
      
      const roomCodesResponse = await response.json();
      const allCodes = roomCodesResponse.data || roomCodesResponse;
      
      // Find the matching room code (case-insensitive)
      const matchingCode = allCodes.find((c: any) => 
        c.code?.toLowerCase() === roomCode.toLowerCase()
      );
      
      if (matchingCode) {
        logger.info(`[validateRoomCode] ✓ Room code is valid:`, matchingCode);
        return {
          valid: true,
          roomId: matchingCode.room_id,
          role: matchingCode.role,
          enabled: matchingCode.enabled !== false,
          allCodes
        };
      } else {
        logger.warn(`[validateRoomCode] Room code not found in room's codes. Available codes: ${allCodes.map((c: any) => c.code).join(', ')}`);
        return {
          valid: false,
          error: `Room code '${roomCode}' not found for room. Available: ${allCodes.map((c: any) => c.code).join(', ')}`,
          allCodes
        };
      }
    }
    
    // Without room_id, we can't easily validate (100ms API doesn't support lookup by code alone)
    logger.warn(`[validateRoomCode] No room_id provided, cannot validate room code`);
    return { 
      valid: false, 
      error: `Cannot validate room code without room_id. 100ms API requires room_id to fetch room codes.` 
    };
  } catch (error: any) {
    logger.error("[validateRoomCode] Error:", error.message);
    return { valid: false, error: error.message };
  }
}

// Get template roles from 100ms dashboard
export async function getTemplateRoles(): Promise<{ templateId: string, roles: string[] } | null> {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    logger.info(`[getTemplateRoles] Fetching template roles...`);
    
    // Generate management token
    const tokenResponse = await (hmsClient.auth as any).getManagementToken({});
    const managementToken = (tokenResponse as any).token || tokenResponse;
    
    // Get templates list
    const response = await fetch(`https://api.100ms.live/v2/templates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch templates: ${response.status} ${errorText}`);
    }
    
    const templatesResponse = await response.json();
    const templates = templatesResponse.data || templatesResponse;
    
    if (templates && templates.length > 0) {
      const template = templates[0];
      const roles = template.roles ? Object.keys(template.roles) : [];
      logger.info(`[getTemplateRoles] Template: ${template.name}, Roles: ${roles.join(', ')}`);
      
      return {
        templateId: template.id,
        roles: roles
      };
    }
    
    return null;
  } catch (error: any) {
    logger.error("[getTemplateRoles] Error:", error.message);
    throw error;
  }
}

// Create room with room code in one step (optimized for Prebuilt)
export async function createRoomWithCode(options: {
  name: string;
  description?: string;
  recording?: boolean;
  role?: string;
}) {
  if (!hmsClient) {
    throw new Error("100ms SDK not initialized. Please configure HMS_ACCESS_KEY and HMS_SECRET.");
  }

  try {
    logger.info("[createRoomWithCode] Step 1: Creating room...");
    // Create the room first
    const room = await hmsClient.rooms.create({
      name: options.name,
      description: options.description,
      recording_info: {
        enabled: options.recording ?? true,
      },
    });
    
    // Log the full room object to understand its structure
    logger.info("[createRoomWithCode] Room object:", JSON.stringify(room, null, 2));
    logger.info(`[createRoomWithCode] Step 1 ✓ Room created`);

    // The 100ms SDK returns the room ID in a property, not directly as 'id'
    // It could be room.id, room.data.id, or just room itself as a string
    const roomId = typeof room === 'string' ? room : ((room as any).id || (room as any).data?.id || room);
    logger.info(`[createRoomWithCode] Extracted room ID: ${roomId}`);

    logger.info(`[createRoomWithCode] Step 2: Creating room codes for room ${roomId}...`);
    
    // WORKAROUND: The SDK's roomCodes.create() has a bug, so we'll use the REST API directly
    // Generate management token
    const tokenResponse = await (hmsClient.auth as any).getManagementToken({});
    // The SDK returns an object with a 'token' property, not the token string directly
    const managementToken = (tokenResponse as any).token || tokenResponse;
    logger.info(`[createRoomWithCode] Generated management token: ${typeof managementToken}`);
    
    // Call the REST API directly to create room codes
    const response = await fetch(`https://api.100ms.live/v2/room-codes/room/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create room codes: ${response.status} ${errorText}`);
    }
    
    const roomCodesResponse = await response.json();
    logger.info(`[createRoomWithCode] Step 2 ✓ Room codes created:`, roomCodesResponse);
    
    // The API returns { data: [...] }, so extract the array
    const roomCodes = roomCodesResponse.data || roomCodesResponse;
    
    // Find the room code for the requested role (default to "guest")
    const requestedRole = options.role || "guest";
    const roleCode = roomCodes.find((code: any) => code.role === requestedRole);
    
    if (!roleCode) {
      throw new Error(`No room code found for role "${requestedRole}"`);
    }
    
    logger.info(`[createRoomWithCode] Selected room code for role "${requestedRole}": ${roleCode.code}`);

    return {
      roomId: roomId,
      roomCode: roleCode.code,
      name: options.name,
    };
  } catch (error: any) {
    logger.error("[createRoomWithCode] Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    throw error;
  }
}

// Initialize on module load
logger.info("[100ms] Module loaded, initializing SDK...");
const initResult = initialize100ms();
logger.info(`[100ms] Initialization result: ${initResult ? "Success" : "Failed or skipped"}`);
