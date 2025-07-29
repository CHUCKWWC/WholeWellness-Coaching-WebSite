import { Request, Response, NextFunction } from "express";
import { storage } from "./supabase-client-storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { onboardingService } from "./onboarding-service";

// User interface for authenticated requests
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  membershipLevel?: string;
  isActive: boolean;
}

// Authenticated request interface
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

// User registration schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

// User login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export class AuthService {
  // Generate JWT token
  static generateToken(user: AuthenticatedUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'user',
        membershipLevel: user.membershipLevel || 'free',
        isActive: user.isActive !== false
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Register new user
  static async registerUser(email: string, password: string, firstName: string, lastName: string): Promise<AuthenticatedUser> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const userData = {
      id: userId,
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'user',
      membershipLevel: 'free',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user = await storage.createUser(userData);

    // Initialize onboarding for new user
    await onboardingService.initializeUserOnboarding(user.id, user.email, user.firstName || firstName);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      membershipLevel: user.membershipLevel,
      isActive: user.isActive
    };
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.isActive) {
        return null;
      }

      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        membershipLevel: user.membershipLevel,
        isActive: user.isActive
      };
    } catch (error) {
      console.error('User authentication error:', error);
      return null;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    try {
      const user = await storage.getUserById(userId);
      
      if (!user) {
        console.error('User not found with ID:', userId);
        return null;
      }
      
      // Default isActive to true if undefined
      const isActive = user.isActive !== false;
      
      if (!isActive) {
        console.error('User is inactive:', userId);
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'user',
        membershipLevel: user.membershipLevel || 'free',
        isActive: isActive
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }
}

// Middleware to require authentication
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check session cookie as fallback
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
      console.log('Using session token from cookie');
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = AuthService.verifyToken(token);
    console.log('Decoded token:', decoded);
    
    const user = await AuthService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware for optional authentication (user might or might not be logged in)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check session cookie as fallback
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
    }
    
    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Optional auth - don't fail if token is invalid, just continue without user
    next();
  }
};

// Middleware to require coach role
export const requireCoachRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check session cookie as fallback
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user has coach role
    if (user.role !== 'coach') {
      return res.status(403).json({ error: 'Coach access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Coach auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// User registration route handler
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);

    const user = await AuthService.registerUser(email, password, firstName, lastName);
    const token = AuthService.generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        membershipLevel: user.membershipLevel
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid registration data', details: error.errors });
    }
    
    if (error.message === 'User already exists with this email') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
};

// User login route handler
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await AuthService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = AuthService.generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        membershipLevel: user.membershipLevel
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid login data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user route handler
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
    membershipLevel: req.user.membershipLevel
  });
};

// Logout route handler (client-side token removal)
export const logout = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};