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
  wellnessRecommendations,
  assessmentTypes,
  userAssessments,
  coachInteractions,
  bookingCategories,
  bookingServices,
  coachSchedule,
  coachBlockedTimes,
  appointments
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import type { User, InsertUser, Booking, InsertBooking, AssessmentType, InsertAssessmentType, UserAssessment, InsertUserAssessment, CoachInteraction, InsertCoachInteraction } from "@shared/schema";
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

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    console.log('[DrizzleStorage] updateUserProfile called with:', userId, updates);
    return this.updateUser(userId, updates);
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

  // Assessment Methods Implementation
  async getActiveAssessmentTypes(): Promise<AssessmentType[]> {
    try {
      console.log('[DrizzleStorage] getActiveAssessmentTypes called');
      const result = await db
        .select()
        .from(assessmentTypes)
        .where(eq(assessmentTypes.isActive, true))
        .orderBy(assessmentTypes.category, assessmentTypes.displayName);
      
      console.log('[DrizzleStorage] getActiveAssessmentTypes result:', result.length, 'types found');
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting active assessment types:', error);
      return [];
    }
  }

  async getAssessmentTypeById(id: string): Promise<AssessmentType | undefined> {
    try {
      console.log('[DrizzleStorage] getAssessmentTypeById called with:', id);
      const result = await db
        .select()
        .from(assessmentTypes)
        .where(eq(assessmentTypes.id, id))
        .limit(1);
      
      console.log('[DrizzleStorage] getAssessmentTypeById result:', result[0] ? `Found type ${result[0].displayName}` : 'Type not found');
      return result[0];
    } catch (error) {
      console.error('[DrizzleStorage] Error getting assessment type by id:', error);
      return undefined;
    }
  }

  async createAssessmentType(assessmentType: InsertAssessmentType): Promise<AssessmentType> {
    try {
      console.log('[DrizzleStorage] createAssessmentType called with:', assessmentType);
      const [result] = await db
        .insert(assessmentTypes)
        .values(assessmentType)
        .returning();
      
      console.log('[DrizzleStorage] createAssessmentType result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating assessment type:', error);
      throw error;
    }
  }

  async createUserAssessment(assessment: InsertUserAssessment): Promise<UserAssessment> {
    try {
      console.log('[DrizzleStorage] createUserAssessment called with:', assessment);
      const [result] = await db
        .insert(userAssessments)
        .values(assessment)
        .returning();
      
      console.log('[DrizzleStorage] createUserAssessment result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating user assessment:', error);
      throw error;
    }
  }

  async getUserAssessments(userId: string): Promise<UserAssessment[]> {
    try {
      console.log('[DrizzleStorage] getUserAssessments called for user:', userId);
      const result = await db
        .select()
        .from(userAssessments)
        .where(and(
          eq(userAssessments.userId, userId),
          eq(userAssessments.isActive, true)
        ))
        .orderBy(desc(userAssessments.completedAt));
      
      console.log('[DrizzleStorage] getUserAssessments result:', result.length, 'assessments found');
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user assessments:', error);
      return [];
    }
  }

  async getAssessmentsForCoach(userId: string, coachType: string): Promise<UserAssessment[]> {
    try {
      console.log('[DrizzleStorage] getAssessmentsForCoach called with:', { userId, coachType });
      
      // First, get assessment types relevant for this coach type
      const relevantTypes = await db
        .select()
        .from(assessmentTypes)
        .where(and(
          eq(assessmentTypes.isActive, true),
          sql`${coachType} = ANY(${assessmentTypes.coachTypes})`
        ));
      
      if (relevantTypes.length === 0) {
        console.log('[DrizzleStorage] No relevant assessment types for coach type:', coachType);
        return [];
      }
      
      const relevantTypeIds = relevantTypes.map(type => type.id);
      
      // Get user assessments for these types
      const result = await db
        .select()
        .from(userAssessments)
        .where(and(
          eq(userAssessments.userId, userId),
          eq(userAssessments.isActive, true),
          sql`${userAssessments.assessmentTypeId} = ANY(${relevantTypeIds})`
        ))
        .orderBy(desc(userAssessments.completedAt));
      
      console.log('[DrizzleStorage] getAssessmentsForCoach result:', result.length, 'relevant assessments found');
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting assessments for coach:', error);
      return [];
    }
  }

  async createCoachInteraction(interaction: InsertCoachInteraction): Promise<CoachInteraction> {
    try {
      console.log('[DrizzleStorage] createCoachInteraction called with:', interaction);
      const [result] = await db
        .insert(coachInteractions)
        .values(interaction)
        .returning();
      
      console.log('[DrizzleStorage] createCoachInteraction result:', result);
      return result;
    } catch (error) {
      console.error('[DrizzleStorage] Error creating coach interaction:', error);
      throw error;
    }
  }

  async getUserAssessmentSummary(userId: string): Promise<any> {
    try {
      console.log('[DrizzleStorage] getUserAssessmentSummary called for user:', userId);
      
      // Get all user assessments
      const assessments = await this.getUserAssessments(userId);
      
      // Get assessment types for additional context
      const types = await db
        .select()
        .from(assessmentTypes)
        .where(eq(assessmentTypes.isActive, true));
      
      // Group assessments by category
      const assessmentsByCategory: Record<string, UserAssessment[]> = {};
      const categorizedTypes = types.reduce((acc: Record<string, AssessmentType[]>, type) => {
        if (!acc[type.category]) {
          acc[type.category] = [];
        }
        acc[type.category].push(type);
        return acc;
      }, {});
      
      assessments.forEach(assessment => {
        const type = types.find(t => t.id === assessment.assessmentTypeId);
        if (type) {
          if (!assessmentsByCategory[type.category]) {
            assessmentsByCategory[type.category] = [];
          }
          assessmentsByCategory[type.category].push(assessment);
        }
      });
      
      // Calculate summary statistics
      const summary = {
        totalAssessments: assessments.length,
        assessmentsByCategory,
        categoriesCompleted: Object.keys(assessmentsByCategory),
        lastAssessmentDate: assessments.length > 0 ? assessments[0].completedAt : null,
        availableCategories: Object.keys(categorizedTypes),
        completionRate: types.length > 0 ? (assessments.length / types.length) * 100 : 0,
        recentAssessments: assessments.slice(0, 5),
        allTags: assessments.flatMap(a => a.tags || []).filter((tag, index, self) => self.indexOf(tag) === index)
      };
      
      console.log('[DrizzleStorage] getUserAssessmentSummary result:', summary);
      return summary;
    } catch (error) {
      console.error('[DrizzleStorage] Error getting user assessment summary:', error);
      return {
        totalAssessments: 0,
        assessmentsByCategory: {},
        categoriesCompleted: [],
        lastAssessmentDate: null,
        availableCategories: [],
        completionRate: 0,
        recentAssessments: [],
        allTags: []
      };
    }
  }

  async getBookingCategories(): Promise<any[]> {
    return await db.select().from(bookingCategories);
  }

  async createBookingCategory(category: any): Promise<any> {
    const [result] = await db.insert(bookingCategories).values(category).returning();
    return result;
  }

  async getBookingServices(coachId?: string): Promise<any[]> {
    if (coachId) {
      return await db.select().from(bookingServices).where(eq(bookingServices.coachId, coachId));
    }
    return await db.select().from(bookingServices);
  }

  async getBookingService(id: string): Promise<any | null> {
    const [service] = await db.select().from(bookingServices).where(eq(bookingServices.id, id));
    return service || null;
  }

  async createBookingService(service: any): Promise<any> {
    const [result] = await db.insert(bookingServices).values(service).returning();
    return result;
  }

  async updateBookingService(id: string, updates: any): Promise<any | null> {
    const [result] = await db.update(bookingServices).set({ ...updates, updatedAt: new Date() }).where(eq(bookingServices.id, id)).returning();
    return result || null;
  }

  async deleteBookingService(id: string): Promise<boolean> {
    const result = await db.delete(bookingServices).where(eq(bookingServices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getCoachSchedule(coachId: string): Promise<any[]> {
    return await db.select().from(coachSchedule).where(eq(coachSchedule.coachId, coachId));
  }

  async createCoachSchedule(schedule: any): Promise<any> {
    const [result] = await db.insert(coachSchedule).values(schedule).returning();
    return result;
  }

  async deleteCoachSchedule(id: string): Promise<boolean> {
    const result = await db.delete(coachSchedule).where(eq(coachSchedule.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getCoachBlockedTimes(coachId: string): Promise<any[]> {
    return await db.select().from(coachBlockedTimes).where(eq(coachBlockedTimes.coachId, coachId));
  }

  async createCoachBlockedTime(blockedTime: any): Promise<any> {
    const [result] = await db.insert(coachBlockedTimes).values(blockedTime).returning();
    return result;
  }

  async deleteCoachBlockedTime(id: string): Promise<boolean> {
    const result = await db.delete(coachBlockedTimes).where(eq(coachBlockedTimes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAppointments(filter?: { coachId?: string; clientId?: string }): Promise<any[]> {
    if (filter?.coachId) {
      return await db.select().from(appointments).where(eq(appointments.coachId, filter.coachId));
    }
    if (filter?.clientId) {
      return await db.select().from(appointments).where(eq(appointments.clientId, filter.clientId));
    }
    return await db.select().from(appointments);
  }

  async getAppointment(id: string): Promise<any | null> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || null;
  }

  async createAppointment(appointment: any): Promise<any> {
    const [result] = await db.insert(appointments).values(appointment).returning();
    return result;
  }

  async updateAppointment(id: string, updates: any): Promise<any | null> {
    const [result] = await db.update(appointments).set({ ...updates, updatedAt: new Date() }).where(eq(appointments.id, id)).returning();
    return result || null;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const drizzleStorage = new DrizzleStorage();
