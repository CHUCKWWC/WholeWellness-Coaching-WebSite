import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { eq, and, desc } from "drizzle-orm";
import { 
  wellnessJourneys, 
  wellnessGoals, 
  lifestyleAssessments, 
  userPreferences,
  journeyPhases,
  wellnessRecommendations,
  journeyAdaptations,
  journeyMilestones,
  progressTracking,
  aiInsights
} from "@shared/schema";

// Validation schemas
const wellnessGoalSchema = z.object({
  category: z.enum(['physical', 'mental', 'emotional', 'spiritual', 'social', 'career', 'financial']),
  specific_goal: z.string().min(5, 'Please describe your goal in detail'),
  priority: z.enum(['high', 'medium', 'low']),
  timeline: z.enum(['1_week', '1_month', '3_months', '6_months', '1_year', 'ongoing']),
  current_level: z.number().min(1).max(10),
  target_level: z.number().min(1).max(10),
  obstacles: z.array(z.string()).optional(),
  motivation: z.string().optional(),
});

const lifestyleAssessmentSchema = z.object({
  sleep_hours: z.number().min(0).max(24),
  exercise_frequency: z.enum(['none', 'rarely', 'weekly', 'several_times', 'daily']),
  stress_level: z.number().min(1).max(10),
  energy_level: z.number().min(1).max(10),
  social_connection: z.number().min(1).max(10),
  work_life_balance: z.number().min(1).max(10),
  diet_quality: z.enum(['poor', 'fair', 'good', 'excellent']),
  major_life_changes: z.array(z.string()).optional(),
  support_system: z.enum(['none', 'limited', 'moderate', 'strong']),
  previous_wellness_experience: z.string().optional(),
});

const preferencesSchema = z.object({
  learning_style: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
  session_duration: z.enum(['5_min', '15_min', '30_min', '60_min', '90_min']),
  frequency: z.enum(['daily', 'every_other_day', 'weekly', 'bi_weekly', 'monthly']),
  reminder_preferences: z.array(z.enum(['email', 'push', 'sms', 'none'])),
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening', 'late_night'])),
  intensity_preference: z.enum(['gentle', 'moderate', 'intense']),
  group_vs_individual: z.enum(['individual', 'small_group', 'large_group', 'both']),
  technology_comfort: z.number().min(1).max(10),
});

const generateJourneySchema = z.object({
  goals: z.array(wellnessGoalSchema),
  lifestyle: lifestyleAssessmentSchema,
  preferences: preferencesSchema,
});

// AI-powered recommendation engine
class WellnessRecommendationEngine {
  static async generateJourney(
    userId: string,
    goals: any[],
    lifestyle: any,
    preferences: any
  ) {
    // Determine journey type based on goals and lifestyle
    const journeyType = this.determineJourneyType(goals, lifestyle);
    
    // Calculate estimated completion time
    const estimatedCompletion = this.calculateEstimatedCompletion(goals, preferences);
    
    // Create journey phases
    const phases = this.generatePhases(goals, lifestyle, preferences);
    
    // Generate initial recommendations
    const recommendations = this.generateRecommendations(goals, lifestyle, preferences, phases);
    
    return {
      journeyType,
      estimatedCompletion,
      phases,
      recommendations,
      aiInsights: this.generateInitialInsights(goals, lifestyle, preferences),
    };
  }

  private static determineJourneyType(goals: any[], lifestyle: any): string {
    const highPriorityGoals = goals.filter(g => g.priority === 'high').length;
    const stressLevel = lifestyle.stress_level;
    const supportSystem = lifestyle.support_system;

    if (stressLevel >= 8 || supportSystem === 'none') {
      return 'crisis_recovery';
    } else if (highPriorityGoals >= 3) {
      return 'comprehensive';
    } else if (highPriorityGoals === 1) {
      return 'targeted';
    } else {
      return 'maintenance';
    }
  }

  private static calculateEstimatedCompletion(goals: any[], preferences: any): Date {
    const baseWeeks = goals.length * 4; // 4 weeks per goal base
    const intensityMultiplier = {
      'gentle': 1.5,
      'moderate': 1.0,
      'intense': 0.7
    }[preferences.intensity_preference] || 1.0;
    
    const frequencyMultiplier = {
      'daily': 0.8,
      'every_other_day': 1.0,
      'weekly': 1.5,
      'bi_weekly': 2.0,
      'monthly': 3.0
    }[preferences.frequency] || 1.0;

    const adjustedWeeks = baseWeeks * intensityMultiplier * frequencyMultiplier;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (adjustedWeeks * 7));
    
    return completionDate;
  }

  private static generatePhases(goals: any[], lifestyle: any, preferences: any): any[] {
    const phases = [];
    
    // Foundation Phase (Always first)
    phases.push({
      name: 'Foundation Building',
      description: 'Establish healthy habits and assessment baselines',
      order: 1,
      estimated_duration: '2-3 weeks',
      goals: ['Establish routine', 'Complete assessments', 'Set up tracking systems'],
      milestones: ['Daily check-ins established', 'Baseline measurements recorded', 'Support system activated'],
    });

    // Development Phase(s) - based on goals
    const goalCategories = [...new Set(goals.map(g => g.category))];
    goalCategories.forEach((category, index) => {
      phases.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Development`,
        description: `Focus on ${category} wellness goals and skills`,
        order: index + 2,
        estimated_duration: '4-6 weeks',
        goals: goals.filter(g => g.category === category).map(g => g.specific_goal),
        milestones: [`${category} skills developed`, `Progress toward ${category} goals`, 'Habit integration'],
      });
    });

    // Integration Phase
    phases.push({
      name: 'Integration & Optimization',
      description: 'Combine all practices and optimize for sustainability',
      order: phases.length + 1,
      estimated_duration: '3-4 weeks',
      goals: ['Integrate all practices', 'Optimize routines', 'Plan for long-term maintenance'],
      milestones: ['Seamless routine integration', 'Sustainable practices identified', 'Long-term plan created'],
    });

    return phases;
  }

  private static generateRecommendations(goals: any[], lifestyle: any, preferences: any, phases: any[]): any[] {
    const recommendations = [];
    
    // Generate foundation recommendations
    recommendations.push({
      type: 'daily_practice',
      title: 'Morning Mindfulness Check-in',
      description: 'Start each day with a 5-minute mindfulness practice to set intentions',
      category: 'mindfulness',
      priority: 1,
      estimated_time: 5,
      difficulty_level: 'beginner',
      ai_reasoning: `Based on your ${lifestyle.stress_level}/10 stress level, mindfulness practice will help establish a calm foundation for your wellness journey.`,
      action_steps: [
        'Find a quiet space upon waking',
        'Sit comfortably and close your eyes',
        'Take 5 deep breaths focusing on the sensation',
        'Set an intention for the day',
        'Record your mood and energy level'
      ],
      success_metrics: ['Consistent daily practice', 'Improved morning mood ratings', 'Clearer daily intentions'],
      resources: [
        {
          type: 'app',
          title: 'Headspace - Mindfulness Meditation',
          url: 'https://www.headspace.com/',
          duration: 5
        }
      ],
      expected_outcomes: ['Reduced morning stress', 'Better focus throughout day', 'Increased self-awareness'],
      progress_tracking: {
        method: 'daily_rating',
        frequency: 'daily',
        checkpoints: ['mood_rating', 'energy_rating', 'intention_clarity']
      }
    });

    // Generate goal-specific recommendations
    goals.forEach(goal => {
      if (goal.category === 'physical') {
        recommendations.push({
          type: 'weekly_goal',
          title: `Physical Activity: ${goal.specific_goal}`,
          description: `Weekly progression toward your physical wellness goal`,
          category: 'physical',
          priority: goal.priority === 'high' ? 2 : 3,
          estimated_time: preferences.session_duration === '30_min' ? 30 : 45,
          difficulty_level: goal.current_level <= 3 ? 'beginner' : goal.current_level <= 6 ? 'intermediate' : 'advanced',
          ai_reasoning: `Your current level (${goal.current_level}/10) and target (${goal.target_level}/10) suggest a ${goal.target_level - goal.current_level} point improvement is needed.`,
          action_steps: [
            'Schedule weekly exercise sessions',
            'Track physical activity and progress',
            'Gradually increase intensity or duration',
            'Monitor how you feel before and after'
          ],
          success_metrics: ['Weekly activity completion', 'Progressive improvement', 'Energy level increases'],
          resources: [],
          expected_outcomes: ['Improved physical fitness', 'Higher energy levels', 'Better sleep quality']
        });
      }

      if (goal.category === 'mental') {
        recommendations.push({
          type: 'daily_practice',
          title: `Mental Wellness: ${goal.specific_goal}`,
          description: 'Daily practices to strengthen mental resilience and clarity',
          category: 'mental',
          priority: goal.priority === 'high' ? 1 : 2,
          estimated_time: 15,
          difficulty_level: 'intermediate',
          ai_reasoning: `Mental wellness goals require consistent daily practice. Your ${lifestyle.stress_level}/10 stress level indicates this is a priority area.`,
          action_steps: [
            'Practice daily meditation or breathing exercises',
            'Journal thoughts and feelings',
            'Challenge negative thought patterns',
            'Engage in mentally stimulating activities'
          ],
          success_metrics: ['Daily practice consistency', 'Improved stress management', 'Mental clarity ratings'],
          resources: [
            {
              type: 'article',
              title: 'Cognitive Behavioral Techniques for Daily Use',
              url: '/resources/cbt-techniques',
              duration: 10
            }
          ],
          expected_outcomes: ['Reduced anxiety', 'Better emotional regulation', 'Increased mental resilience']
        });
      }
    });

    return recommendations;
  }

  private static generateInitialInsights(goals: any[], lifestyle: any, preferences: any): any[] {
    const insights = [];
    
    // Stress level insight
    if (lifestyle.stress_level >= 7) {
      insights.push({
        type: 'risk_assessment',
        title: 'High Stress Level Detected',
        description: `Your stress level of ${lifestyle.stress_level}/10 indicates a need for immediate stress management strategies.`,
        confidence: 0.9,
        impact_level: 'high',
        suggested_actions: [
          'Prioritize stress-reduction techniques',
          'Consider professional support if needed',
          'Focus on sleep quality improvement',
          'Implement daily relaxation practices'
        ]
      });
    }

    // Sleep insight
    if (lifestyle.sleep_hours < 6 || lifestyle.sleep_hours > 9) {
      insights.push({
        type: 'pattern_recognition',
        title: 'Sleep Optimization Opportunity',
        description: `Your ${lifestyle.sleep_hours} hours of sleep may be impacting your wellness goals.`,
        confidence: 0.8,
        impact_level: 'medium',
        suggested_actions: [
          'Establish consistent sleep schedule',
          'Create bedtime routine',
          'Optimize sleep environment',
          'Track sleep quality metrics'
        ]
      });
    }

    // Goal alignment insight
    const highPriorityGoals = goals.filter(g => g.priority === 'high').length;
    if (highPriorityGoals > 3) {
      insights.push({
        type: 'recommendation_optimization',
        title: 'Goal Prioritization Needed',
        description: `You have ${highPriorityGoals} high-priority goals. Consider focusing on 1-2 initially for better success rates.`,
        confidence: 0.85,
        impact_level: 'medium',
        suggested_actions: [
          'Select top 2 most important goals',
          'Set others as secondary priorities',
          'Focus resources on primary goals first',
          'Reassess priorities monthly'
        ]
      });
    }

    return insights;
  }
}

export function registerWellnessJourneyRoutes(app: Express) {
  // Get current user's wellness journey
  app.get('/api/wellness-journey/current', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const journey = await storage.getCurrentWellnessJourney(req.user.id);
      
      if (!journey) {
        return res.status(404).json({ message: 'No active journey found' });
      }

      res.json(journey);
    } catch (error) {
      console.error('Error fetching wellness journey:', error);
      res.status(500).json({ message: 'Failed to fetch wellness journey' });
    }
  });

  // Generate new wellness journey
  app.post('/api/wellness-journey/generate', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const validatedData = generateJourneySchema.parse(req.body);
      
      // Generate AI-powered journey
      const journeyData = await WellnessRecommendationEngine.generateJourney(
        req.user.id,
        validatedData.goals,
        validatedData.lifestyle,
        validatedData.preferences
      );

      // Create journey in database
      const journey = await storage.createWellnessJourney({
        userId: req.user.id,
        journeyType: journeyData.journeyType,
        title: `${req.user.firstName}'s Wellness Journey`,
        description: `Personalized wellness journey focusing on ${validatedData.goals.map(g => g.category).join(', ')} goals`,
        estimatedCompletion: journeyData.estimatedCompletion,
        currentPhase: journeyData.phases[0]?.name || 'Foundation Building',
      });

      // Create goals, lifestyle assessment, preferences, phases, and recommendations
      await Promise.all([
        ...validatedData.goals.map(goal => 
          storage.createWellnessGoal({
            journeyId: journey.id,
            category: goal.category,
            specificGoal: goal.specific_goal,
            priority: goal.priority,
            timeline: goal.timeline,
            currentLevel: goal.current_level,
            targetLevel: goal.target_level,
            obstacles: goal.obstacles || [],
            motivation: goal.motivation || '',
          })
        ),
        storage.createLifestyleAssessment({
          journeyId: journey.id,
          sleepHours: validatedData.lifestyle.sleep_hours.toString(),
          exerciseFrequency: validatedData.lifestyle.exercise_frequency,
          stressLevel: validatedData.lifestyle.stress_level,
          energyLevel: validatedData.lifestyle.energy_level,
          socialConnection: validatedData.lifestyle.social_connection,
          workLifeBalance: validatedData.lifestyle.work_life_balance,
          dietQuality: validatedData.lifestyle.diet_quality,
          majorLifeChanges: validatedData.lifestyle.major_life_changes || [],
          supportSystem: validatedData.lifestyle.support_system,
          previousWellnessExperience: validatedData.lifestyle.previous_wellness_experience || '',
        }),
        storage.createUserPreferences({
          journeyId: journey.id,
          learningStyle: validatedData.preferences.learning_style,
          sessionDuration: validatedData.preferences.session_duration,
          frequency: validatedData.preferences.frequency,
          reminderPreferences: validatedData.preferences.reminder_preferences,
          preferredTimes: validatedData.preferences.preferred_times,
          intensityPreference: validatedData.preferences.intensity_preference,
          groupVsIndividual: validatedData.preferences.group_vs_individual,
          technologyComfort: validatedData.preferences.technology_comfort,
        }),
        ...journeyData.phases.map((phase, index) =>
          storage.createJourneyPhase({
            journeyId: journey.id,
            phaseName: phase.name,
            phaseDescription: phase.description,
            phaseOrder: index + 1,
            estimatedDuration: phase.estimated_duration,
            goals: phase.goals,
            milestones: phase.milestones,
            isCurrent: index === 0,
          })
        ),
      ]);

      // Get the created phases to use their IDs for recommendations
      const phases = await storage.getJourneyPhases(journey.id);
      
      // Create recommendations for each phase
      await Promise.all(
        journeyData.recommendations.map(rec =>
          storage.createWellnessRecommendation({
            journeyId: journey.id,
            phaseId: phases[0]?.id, // Assign to first phase initially
            type: rec.type,
            title: rec.title,
            description: rec.description,
            category: rec.category,
            priority: rec.priority,
            estimatedTime: rec.estimated_time,
            difficultyLevel: rec.difficulty_level,
            aiReasoning: rec.ai_reasoning,
            actionSteps: rec.action_steps || [],
            successMetrics: rec.success_metrics || [],
            resources: rec.resources || [],
            expectedOutcomes: rec.expected_outcomes || [],
            progressTracking: rec.progress_tracking,
          })
        )
      );

      // Create AI insights
      await Promise.all(
        journeyData.aiInsights.map(insight =>
          storage.createAiInsight({
            journeyId: journey.id,
            insightType: insight.type,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            impactLevel: insight.impact_level,
            suggestedActions: insight.suggested_actions,
          })
        )
      );

      res.json({ 
        message: 'Wellness journey created successfully',
        journey: await storage.getCurrentWellnessJourney(req.user.id)
      });

    } catch (error) {
      console.error('Error generating wellness journey:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid input data', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to generate wellness journey' });
    }
  });

  // Update progress on a recommendation
  app.post('/api/wellness-journey/progress', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { recommendation_id, progress, notes, mood_rating, energy_rating } = req.body;

      if (!recommendation_id || typeof progress !== 'number') {
        return res.status(400).json({ message: 'recommendation_id and progress are required' });
      }

      // Get the recommendation to verify ownership
      const recommendation = await storage.getWellnessRecommendation(recommendation_id);
      if (!recommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }

      // Verify the recommendation belongs to the user's journey
      const journey = await storage.getWellnessJourney(recommendation.journeyId);
      if (!journey || journey.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Update recommendation progress
      await storage.updateRecommendationProgress(recommendation_id, progress);

      // Create progress tracking entry
      await storage.createProgressTracking({
        journeyId: journey.id,
        recommendationId: recommendation_id,
        progressValue: progress.toString(),
        progressUnit: 'percentage',
        userNotes: notes || '',
        moodRating: mood_rating || null,
        energyRating: energy_rating || null,
      });

      // Update overall journey progress
      await storage.updateJourneyProgress(journey.id);

      res.json({ message: 'Progress updated successfully' });

    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });

  // Get journey analytics and insights
  app.get('/api/wellness-journey/analytics', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const analytics = await storage.getJourneyAnalytics(req.user.id);
      res.json(analytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Adapt journey based on user feedback or progress
  app.post('/api/wellness-journey/adapt', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { journey_id, adaptation_reason, feedback } = req.body;

      if (!journey_id || !adaptation_reason) {
        return res.status(400).json({ message: 'journey_id and adaptation_reason are required' });
      }

      // Verify journey ownership
      const journey = await storage.getWellnessJourney(journey_id);
      if (!journey || journey.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Generate adaptations using AI
      const adaptations = await storage.generateJourneyAdaptations(journey_id, adaptation_reason, feedback);

      res.json({ 
        message: 'Journey adaptations generated',
        adaptations 
      });

    } catch (error) {
      console.error('Error adapting journey:', error);
      res.status(500).json({ message: 'Failed to adapt journey' });
    }
  });

  // Complete a milestone
  app.post('/api/wellness-journey/milestone/:milestone_id/complete', async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { milestone_id } = req.params;
      const { reflection, difficulty_rating, satisfaction_rating } = req.body;

      const milestone = await storage.completeMilestone(
        milestone_id,
        req.user.id,
        reflection,
        difficulty_rating,
        satisfaction_rating
      );

      if (!milestone) {
        return res.status(404).json({ message: 'Milestone not found or access denied' });
      }

      res.json({ 
        message: 'Milestone completed successfully',
        milestone 
      });

    } catch (error) {
      console.error('Error completing milestone:', error);
      res.status(500).json({ message: 'Failed to complete milestone' });
    }
  });
}