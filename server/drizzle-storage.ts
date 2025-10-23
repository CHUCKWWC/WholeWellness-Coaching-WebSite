import { db } from "./db";
import { 
  users, 
  coaches, 
  coachCredentials, 
  coachAvailability, 
  bookings,
  wellnessJourneys,
  wellnessGoals,
  journeyPhases,
  userPreferences,
  lifestyleAssessments,
  journeyMilestones,
  progressTracking,
  aiInsights,
  journeyAdaptations,
  wellnessRecommendations
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { User, InsertUser, Booking, InsertBooking } from "@shared/schema";
import type { IStorage } from "./supabase-client-storage";

class DrizzleStorage implements Partial<IStorage> {
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log('[DrizzleStorage] getUserByEmail called with:', email);
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      console.log('[DrizzleStorage] getUserByEmail result:', result[0] ? `Found user ${result[0].id}` : 'No user found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      console.log('[DrizzleStorage] getUserById called with ID:', id);
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      console.log('[DrizzleStorage] getUserById result:', result[0] ? `Found user ${result[0].email}` : 'No user found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user by ID:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      console.log('[DrizzleStorage] updateUserLastLogin called for:', userId);
      await db
        .update(users)
        .set({ lastLogin: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('[DrizzleStorage] Error updating last login:', error);
    }
  }

  async getCoachBookings(coachId: string): Promise<Booking[]> {
    try {
      console.log('[DrizzleStorage] getCoachBookings called for:', coachId);
      const result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.coachId, coachId))
        .orderBy(desc(bookings.createdAt));
      console.log('[DrizzleStorage] getCoachBookings result:', result.length, 'bookings found');
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting coach bookings:', error);
      return [];
    }
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    try {
      console.log('[DrizzleStorage] createBooking called with:', insertBooking);
      const [booking] = await db
        .insert(bookings)
        .values(insertBooking)
        .returning();
      console.log('[DrizzleStorage] createBooking result:', booking);
      return booking;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating booking:', error);
      throw error;
    }
  }

  // Wellness Journey Methods
  async createWellnessJourney(journey: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createWellnessJourney called with:', journey);
      const [result] = await db
        .insert(wellnessJourneys)
        .values(journey)
        .returning();
      console.log('[DrizzleStorage] createWellnessJourney result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating wellness journey:', error);
      throw error;
    }
  }

  async getCurrentWellnessJourney(userId: string): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] getCurrentWellnessJourney called for user:', userId);
      const result = await db
        .select()
        .from(wellnessJourneys)
        .where(and(
          eq(wellnessJourneys.userId, userId),
          eq(wellnessJourneys.isActive, true),
          eq(wellnessJourneys.isCompleted, false)
        ))
        .orderBy(desc(wellnessJourneys.createdAt))
        .limit(1);
      
      console.log('[DrizzleStorage] getCurrentWellnessJourney result:', result[0] ? `Found active journey ${result[0].id}` : 'No active journey found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting current wellness journey:', error);
      return undefined;
    }
  }

  async getWellnessJourney(id: string): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] getWellnessJourney called with id:', id);
      const result = await db
        .select()
        .from(wellnessJourneys)
        .where(eq(wellnessJourneys.id, id))
        .limit(1);
      
      console.log('[DrizzleStorage] getWellnessJourney result:', result[0] ? `Found journey ${result[0].id}` : 'Journey not found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting wellness journey:', error);
      return undefined;
    }
  }

  async updateJourneyProgress(journeyId: string): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] updateJourneyProgress called for journey:', journeyId);
      
      // Calculate progress based on completed milestones
      const milestones = await db
        .select()
        .from(journeyMilestones)
        .where(eq(journeyMilestones.journeyId, journeyId));
      
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.isAchieved).length;
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
      
      const [result] = await db
        .update(wellnessJourneys)
        .set({ 
          overallProgress: progress,
          updatedAt: new Date()
        })
        .where(eq(wellnessJourneys.id, journeyId))
        .returning();
      
      console.log('[DrizzleStorage] updateJourneyProgress result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error updating journey progress:', error);
      return undefined;
    }
  }

  async createWellnessGoal(goal: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createWellnessGoal called with:', goal);
      const [result] = await db
        .insert(wellnessGoals)
        .values(goal)
        .returning();
      console.log('[DrizzleStorage] createWellnessGoal result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating wellness goal:', error);
      throw error;
    }
  }

  async createJourneyPhase(phase: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createJourneyPhase called with:', phase);
      const [result] = await db
        .insert(journeyPhases)
        .values(phase)
        .returning();
      console.log('[DrizzleStorage] createJourneyPhase result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating journey phase:', error);
      throw error;
    }
  }

  async createUserPreferences(preferences: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createUserPreferences called with:', preferences);
      const [result] = await db
        .insert(userPreferences)
        .values(preferences)
        .returning();
      console.log('[DrizzleStorage] createUserPreferences result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating user preferences:', error);
      throw error;
    }
  }

  async createLifestyleAssessment(assessment: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createLifestyleAssessment called with:', assessment);
      const [result] = await db
        .insert(lifestyleAssessments)
        .values(assessment)
        .returning();
      console.log('[DrizzleStorage] createLifestyleAssessment result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating lifestyle assessment:', error);
      throw error;
    }
  }

  async getJourneyPhases(journeyId: string): Promise<any[]> {
    try {
      console.log('[DrizzleStorage] getJourneyPhases called for journey:', journeyId);
      const result = await db
        .select()
        .from(journeyPhases)
        .where(eq(journeyPhases.journeyId, journeyId))
        .orderBy(journeyPhases.phaseOrder);
      console.log('[DrizzleStorage] getJourneyPhases result:', result.length, 'phases found');
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting journey phases:', error);
      return [];
    }
  }

  async createJourneyMilestone(milestone: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createJourneyMilestone called with:', milestone);
      const [result] = await db
        .insert(journeyMilestones)
        .values(milestone)
        .returning();
      console.log('[DrizzleStorage] createJourneyMilestone result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating journey milestone:', error);
      throw error;
    }
  }

  async recordProgress(progress: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] recordProgress called with:', progress);
      const [result] = await db
        .insert(progressTracking)
        .values(progress)
        .returning();
      console.log('[DrizzleStorage] recordProgress result:', result);
      
      // Update journey progress after recording
      if (progress.journeyId) {
        await this.updateJourneyProgress(progress.journeyId);
      }
      
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error recording progress:', error);
      throw error;
    }
  }

  async createAIInsight(insight: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createAIInsight called with:', insight);
      const [result] = await db
        .insert(aiInsights)
        .values(insight)
        .returning();
      console.log('[DrizzleStorage] createAIInsight result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating AI insight:', error);
      throw error;
    }
  }

  async getJourneyAnalytics(userId: string): Promise<any> {
    try {
      console.log('[DrizzleStorage] getJourneyAnalytics called for user:', userId);
      
      // Get all journeys for the user
      const journeys = await db
        .select()
        .from(wellnessJourneys)
        .where(eq(wellnessJourneys.userId, userId))
        .orderBy(desc(wellnessJourneys.createdAt));
      
      // Get goals for active journey
      const activeJourney = journeys.find(j => j.isActive && !j.isCompleted);
      let goals = [];
      let milestones = [];
      let progressRecords = [];
      let insights = [];
      
      if (activeJourney) {
        goals = await db
          .select()
          .from(wellnessGoals)
          .where(eq(wellnessGoals.journeyId, activeJourney.id));
        
        milestones = await db
          .select()
          .from(journeyMilestones)
          .where(eq(journeyMilestones.journeyId, activeJourney.id));
        
        progressRecords = await db
          .select()
          .from(progressTracking)
          .where(eq(progressTracking.journeyId, activeJourney.id))
          .orderBy(desc(progressTracking.trackingDate));
        
        insights = await db
          .select()
          .from(aiInsights)
          .where(eq(aiInsights.journeyId, activeJourney.id))
          .orderBy(desc(aiInsights.createdAt));
      }
      
      const analytics = {
        totalJourneys: journeys.length,
        completedJourneys: journeys.filter(j => j.isCompleted).length,
        activeJourney,
        averageProgress: journeys.reduce((sum, j) => sum + (j.overallProgress || 0), 0) / (journeys.length || 1),
        totalGoals: goals.length,
        achievedGoals: goals.filter((g: any) => g.isAchieved).length,
        totalMilestones: milestones.length,
        completedMilestones: milestones.filter((m: any) => m.isAchieved).length,
        recentProgress: progressRecords.slice(0, 10),
        recentInsights: insights.slice(0, 5),
        journeyHistory: journeys
      };
      
      console.log('[DrizzleStorage] getJourneyAnalytics result:', analytics);
      return analytics;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting journey analytics:', error);
      return {
        totalJourneys: 0,
        completedJourneys: 0,
        activeJourney: null,
        averageProgress: 0,
        totalGoals: 0,
        achievedGoals: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        recentProgress: [],
        recentInsights: [],
        journeyHistory: []
      };
    }
  }

  async completeJourneyMilestone(milestoneId: string, userId: string): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] completeJourneyMilestone called with:', { milestoneId, userId });
      
      // First verify the milestone belongs to the user's journey
      const milestone = await db
        .select()
        .from(journeyMilestones)
        .where(eq(journeyMilestones.id, milestoneId))
        .limit(1);
      
      if (!milestone[0]) {
        console.error('[DrizzleStorage] Milestone not found:', milestoneId);
        return undefined;
      }
      
      // Verify the journey belongs to the user
      const journey = await db
        .select()
        .from(wellnessJourneys)
        .where(and(
          eq(wellnessJourneys.id, milestone[0].journeyId),
          eq(wellnessJourneys.userId, userId)
        ))
        .limit(1);
      
      if (!journey[0]) {
        console.error('[DrizzleStorage] Journey not found or does not belong to user');
        return undefined;
      }
      
      // Update the milestone
      const [result] = await db
        .update(journeyMilestones)
        .set({ 
          isAchieved: true,
          achievedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(journeyMilestones.id, milestoneId))
        .returning();
      
      // Update journey progress
      if (result) {
        await this.updateJourneyProgress(milestone[0].journeyId);
      }
      
      console.log('[DrizzleStorage] completeJourneyMilestone result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error completing journey milestone:', error);
      return undefined;
    }
  }

  async adaptWellnessJourney(journeyId: string, adaptationData: any): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] adaptWellnessJourney called with:', { journeyId, adaptationData });
      
      // First, record the adaptation
      const [adaptation] = await db
        .insert(journeyAdaptations)
        .values({
          journeyId,
          ...adaptationData
        })
        .returning();
      
      // Update the journey's adaptation count
      const [updatedJourney] = await db
        .update(wellnessJourneys)
        .set({ 
          adaptationCount: db.sql`${wellnessJourneys.adaptationCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(wellnessJourneys.id, journeyId))
        .returning();
      
      console.log('[DrizzleStorage] adaptWellnessJourney result:', { adaptation, updatedJourney });
      return { adaptation, updatedJourney };
    } catch (error) {
      console.error('[DrizzleStorage] Error adapting wellness journey:', error);
      return undefined;
    }
  }

  async createWellnessRecommendation(recommendation: any): Promise<any> {
    try {
      console.log('[DrizzleStorage] createWellnessRecommendation called with:', recommendation);
      const [result] = await db
        .insert(wellnessRecommendations)
        .values(recommendation)
        .returning();
      console.log('[DrizzleStorage] createWellnessRecommendation result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating wellness recommendation:', error);
      throw error;
    }
  }

  async getWellnessRecommendation(id: string): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] getWellnessRecommendation called with id:', id);
      const result = await db
        .select()
        .from(wellnessRecommendations)
        .where(eq(wellnessRecommendations.id, id))
        .limit(1);
      
      console.log('[DrizzleStorage] getWellnessRecommendation result:', result[0] ? `Found recommendation ${result[0].id}` : 'Recommendation not found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting wellness recommendation:', error);
      return undefined;
    }
  }

  async updateRecommendationProgress(id: string, progress: number): Promise<any | undefined> {
    try {
      console.log('[DrizzleStorage] updateRecommendationProgress called with:', { id, progress });
      const [result] = await db
        .update(wellnessRecommendations)
        .set({ 
          userProgress: progress,
          lastAccessed: new Date(),
          timesAccessed: db.sql`${wellnessRecommendations.timesAccessed} + 1`,
          updatedAt: new Date()
        })
        .where(eq(wellnessRecommendations.id, id))
        .returning();
      
      console.log('[DrizzleStorage] updateRecommendationProgress result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error updating recommendation progress:', error);
      return undefined;
    }
  }

  async createProgressTracking(progress: any): Promise<any> {
    // This is an alias for recordProgress since they both insert into progressTracking table
    return this.recordProgress(progress);
  }

  async createAiInsight(insight: any): Promise<any> {
    // This is an alias for createAIInsight (different casing in route calls)
    return this.createAIInsight(insight);
  }
}

export const drizzleStorage = new DrizzleStorage();
