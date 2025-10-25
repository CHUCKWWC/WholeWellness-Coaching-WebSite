import { SDK } from "@100mslive/server-sdk";

const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY || "";
const HMS_SECRET = process.env.HMS_SECRET || "";

let hmsClient: SDK | null = null;

// Initialize 100ms SDK
export function initialize100ms() {
  if (!HMS_ACCESS_KEY || !HMS_SECRET) {
    console.warn("100ms credentials not configured. Video sessions will not work until HMS_ACCESS_KEY and HMS_SECRET are set.");
    return null;
  }

  try {
    hmsClient = new SDK(HMS_ACCESS_KEY, HMS_SECRET);
    console.log("100ms SDK initialized successfully");
    return hmsClient;
  } catch (error) {
    console.error("Failed to initialize 100ms SDK:", error);
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
    const roomCode = await hmsClient.roomCodes.create({
      room_id: roomId,
      role: role,
    });

    return roomCode.code;
  } catch (error) {
    console.error("Error creating room code:", error);
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
    // Create the room first
    const room = await hmsClient.rooms.create({
      name: options.name,
      description: options.description,
      recording_info: {
        enabled: options.recording ?? true,
      },
    });

    // Generate room code for the specified role
    const roomCode = await hmsClient.roomCodes.create({
      room_id: room.id,
      role: options.role || "guest",
    });

    return {
      roomId: room.id,
      roomCode: roomCode.code,
      name: room.name,
    };
  } catch (error) {
    console.error("Error creating room with code:", error);
    throw error;
  }
}

// Initialize on module load
initialize100ms();
