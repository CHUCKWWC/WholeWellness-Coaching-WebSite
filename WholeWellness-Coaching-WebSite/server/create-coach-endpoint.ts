import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { storage } from "./supabase-client-storage";

export async function createTestCoach(req: Request, res: Response) {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail('chuck');
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Coach account already exists for username: chuck' 
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('chucknice1', 12);

    // Create the test coach account
    const newCoach = await storage.createUser({
      id: 'coach_chuck_' + Date.now(),
      email: 'chuck',  // Using email field for username
      passwordHash: passwordHash,
      firstName: 'Chuck',
      lastName: 'TestCoach',
      role: 'coach',
      permissions: JSON.stringify([
        'VIEW_COACH_DASHBOARD',
        'MANAGE_CLIENTS',
        'VIEW_SESSIONS',
        'EDIT_PROFILE',
        'VIEW_EARNINGS'
      ]),
      isActive: true,
      membershipLevel: 'coach',
      donationTotal: '0',
      rewardPoints: 0,
    });

    res.json({
      success: true,
      message: 'Test coach account created successfully!',
      coach: {
        id: newCoach.id,
        username: 'chuck',
        role: 'coach',
        name: `${newCoach.firstName} ${newCoach.lastName}`
      }
    });

  } catch (error) {
    console.error('Error creating test coach:', error);
    res.status(500).json({ 
      message: 'Failed to create test coach account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}