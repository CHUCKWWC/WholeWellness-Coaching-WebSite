import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { donationStorage } from './donation-storage';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await donationStorage.createSession({
    id: uuidv4(),
    userId,
    token: sessionToken,
    expiresAt,
  });
  
  return sessionToken;
}

export async function validateSession(token: string): Promise<any | null> {
  if (!token) return null;
  
  const session = await donationStorage.getSessionByToken(token);
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await donationStorage.deleteSession(session.id);
    }
    return null;
  }
  
  const user = await donationStorage.getUserById(session.userId);
  return user;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token;
  const user = await validateSession(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  req.user = user;
  next();
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token;
  const user = await validateSession(token);
  
  if (user) {
    req.user = user;
  }
  
  next();
}

export function calculateMembershipLevel(totalDonated: number): string {
  if (totalDonated >= 1000) return 'guardian';
  if (totalDonated >= 500) return 'champion';
  if (totalDonated >= 100) return 'supporter';
  return 'free';
}

export function calculateRewardPoints(amount: number, donationType: string, isRecurring: boolean = false): number {
  const basePoints = Math.floor(amount);
  const typeMultiplier = donationType === 'monthly' ? 2 : 1;
  const recurringBonus = isRecurring ? 1.5 : 1;
  
  return Math.floor(basePoints * typeMultiplier * recurringBonus);
}