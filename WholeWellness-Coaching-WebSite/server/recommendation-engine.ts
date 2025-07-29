import { supabase } from './supabase';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

// Mock data for mental wellness resources
const mockMentalWellnessResources = [
  {
    id: 1,
    title: 'National Suicide Prevention Lifeline',
    description: 'Free 24/7 crisis support for people in suicidal crisis or emotional distress',
    category: 'crisis',
    resource_type: 'hotline',
    contact_info: 'Call 988 for immediate crisis support',
    phone: '988',
    website: 'https://suicidepreventionlifeline.org',
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ['suicide prevention', 'crisis intervention'],
    languages: ['English', 'Spanish']
  },
  {
    id: 2,
    title: 'Crisis Text Line',
    description: 'Free 24/7 text-based crisis support',
    category: 'crisis',
    resource_type: 'hotline',
    contact_info: 'Text HOME to 741741',
    phone: '741741',
    website: 'https://crisistextline.org',
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ['crisis intervention', 'text support'],
    languages: ['English', 'Spanish']
  },
  {
    id: 3,
    title: 'National Domestic Violence Hotline',
    description: '24/7 support for domestic violence survivors',
    category: 'safety',
    resource_type: 'hotline',
    contact_info: 'Call 1-800-799-7233 for confidential support',
    phone: '1-800-799-7233',
    website: 'https://thehotline.org',
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ['domestic violence', 'safety planning'],
    languages: ['English', 'Spanish']
  },
  {
    id: 4,
    title: 'Headspace',
    description: 'Meditation and mindfulness app',
    category: 'mindfulness',
    resource_type: 'app',
    contact_info: 'Download the Headspace app',
    website: 'https://headspace.com',
    emergency: false,
    crisis_support: false,
    featured: true,
    specialties: ['meditation', 'mindfulness', 'sleep'],
    languages: ['English']
  },
  {
    id: 5,
    title: 'BetterHelp',
    description: 'Online therapy platform',
    category: 'therapy',
    resource_type: 'website',
    contact_info: 'Visit BetterHelp.com to connect with licensed therapists',
    website: 'https://betterhelp.com',
    emergency: false,
    crisis_support: false,
    featured: true,
    specialties: ['therapy', 'counseling'],
    languages: ['English']
  }
];

// Mock emergency contacts
const mockEmergencyContacts = [
  {
    id: 1,
    name: 'National Suicide Prevention Lifeline',
    phone_number: '988',
    description: 'Free 24/7 crisis support for people in suicidal crisis',
    specialty: 'Crisis Intervention',
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: 'Crisis Text Line',
    phone_number: '741741',
    description: 'Free 24/7 text-based crisis support',
    specialty: 'Crisis Intervention',
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: 'National Domestic Violence Hotline',
    phone_number: '1-800-799-7233',
    description: '24/7 support for domestic violence survivors',
    specialty: 'Domestic Violence',
    is_active: true,
    sort_order: 3
  }
];

export interface UserProfile {
  userId: string;
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  preferences?: {
    communicationStyle?: string;
    sessionTiming?: string;
    specialtyAreas?: string[];
  };
  mentalHealthProfile?: {
    primaryConcerns?: string[];
    currentChallenges?: string[];
    previousExperiences?: string[];
    riskFactors?: string[];
  };
  behaviorPatterns?: {
    resourceUsage?: any[];
    engagementLevel?: string;
    preferredResourceTypes?: string[];
  };
}

export interface RecommendationContext {
  currentMood?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'crisis';
  sessionGoals?: string[];
  timeAvailable?: number;
  environment?: 'private' | 'public';
}

export interface WellnessRecommendation {
  id: string;
  type: 'resource' | 'activity' | 'coaching' | 'crisis_support';
  title: string;
  description: string;
  reasoning: string;
  priority: number;
  estimatedTime: number;
  resourceId?: number;
  actionSteps: string[];
  followUpSuggestions?: string[];
  crisisLevel?: boolean;
}

export class PersonalizedRecommendationEngine {
  
  async generateRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext
  ): Promise<WellnessRecommendation[]> {
    
    // Handle crisis situations immediately
    if (context.urgencyLevel === 'crisis') {
      return await this.generateCrisisRecommendations(userProfile, context);
    }

    // Get available resources
    const resources = await this.getAvailableResources();
    const userHistory = await this.getUserHistory(userProfile.userId);
    
    // Generate AI-powered recommendations
    const aiRecommendations = await this.generateAIRecommendations(
      userProfile,
      context,
      resources,
      userHistory
    );

    // Rank and personalize recommendations
    const rankedRecommendations = await this.rankRecommendations(
      aiRecommendations,
      userProfile,
      context
    );

    // Store recommendations for analytics
    await this.storeRecommendations(userProfile.userId, rankedRecommendations);

    return rankedRecommendations;
  }

  private async generateCrisisRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext
  ): Promise<WellnessRecommendation[]> {
    
    // Get emergency contacts (with fallback to mock data)
    let emergencyContacts;
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) {
        emergencyContacts = mockEmergencyContacts;
      } else {
        emergencyContacts = data || mockEmergencyContacts;
      }
    } catch (err) {
      emergencyContacts = mockEmergencyContacts;
    }

    const recommendations: WellnessRecommendation[] = [];

    // Add immediate crisis support
    if (emergencyContacts) {
      emergencyContacts.forEach((contact, index) => {
        recommendations.push({
          id: `crisis_${contact.id}`,
          type: 'crisis_support',
          title: `Call ${contact.name}`,
          description: contact.description,
          reasoning: 'Immediate professional crisis support is available 24/7',
          priority: index + 1,
          estimatedTime: 0,
          resourceId: contact.id,
          actionSteps: [
            `Call ${contact.phone_number}`,
            'Speak with a trained crisis counselor',
            'Follow their guidance for immediate support'
          ],
          crisisLevel: true
        });
      });
    }

    // Add immediate safety resources
    const safetyResources = await this.getSafetyResources();
    safetyResources.forEach((resource, index) => {
      recommendations.push({
        id: `safety_${resource.id}`,
        type: 'resource',
        title: resource.title,
        description: resource.description,
        reasoning: 'Immediate safety and crisis resources',
        priority: index + 10,
        estimatedTime: 5,
        resourceId: resource.id,
        actionSteps: [
          'Access this resource immediately',
          'Follow safety protocols',
          'Reach out for professional help'
        ],
        crisisLevel: true
      });
    });

    return recommendations;
  }

  private async generateAIRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    resources: any[],
    userHistory: any[]
  ): Promise<WellnessRecommendation[]> {
    
    const prompt = this.buildRecommendationPrompt(userProfile, context, resources, userHistory);
    
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        system: `You are a compassionate wellness AI coach specializing in personalized mental health recommendations. 
                 Your role is to provide thoughtful, evidence-based suggestions that are:
                 - Personalized to the user's specific needs and context
                 - Practical and actionable
                 - Sensitive to crisis situations
                 - Based on available resources
                 - Focused on gradual improvement and self-care`,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const aiResponse = response.content[0].text;
      return this.parseAIRecommendations(aiResponse, resources);
      
    } catch (error) {
      console.error('AI recommendation generation failed:', error);
      return await this.generateFallbackRecommendations(userProfile, context, resources);
    }
  }

  private buildRecommendationPrompt(
    userProfile: UserProfile,
    context: RecommendationContext,
    resources: any[],
    userHistory: any[]
  ): string {
    return `
Generate personalized wellness recommendations for a user with the following profile:

USER PROFILE:
- Primary concerns: ${userProfile.mentalHealthProfile?.primaryConcerns?.join(', ') || 'General wellness'}
- Current challenges: ${userProfile.mentalHealthProfile?.currentChallenges?.join(', ') || 'Not specified'}
- Preferred resource types: ${userProfile.behaviorPatterns?.preferredResourceTypes?.join(', ') || 'Mixed'}
- Engagement level: ${userProfile.behaviorPatterns?.engagementLevel || 'Medium'}

CURRENT CONTEXT:
- Current mood: ${context.currentMood || 'Not specified'}
- Urgency level: ${context.urgencyLevel || 'medium'}
- Available time: ${context.timeAvailable || 30} minutes
- Environment: ${context.environment || 'private'}
- Session goals: ${context.sessionGoals?.join(', ') || 'General wellness'}

AVAILABLE RESOURCES:
${resources.map(r => `- ${r.title} (${r.category}): ${r.description}`).join('\n')}

RECENT ACTIVITY:
${userHistory.length > 0 ? userHistory.map(h => `- Used: ${h.resource_title}`).join('\n') : 'No recent activity'}

Please provide 5-7 personalized recommendations in the following JSON format:
{
  "recommendations": [
    {
      "id": "unique_id",
      "type": "resource|activity|coaching",
      "title": "Recommendation title",
      "description": "Brief description",
      "reasoning": "Why this is recommended for this user",
      "priority": 1-10,
      "estimatedTime": minutes,
      "resourceId": resource_id_if_applicable,
      "actionSteps": ["step1", "step2", "step3"],
      "followUpSuggestions": ["suggestion1", "suggestion2"]
    }
  ]
}

Focus on:
1. Immediate needs based on current context
2. Progressive skill building
3. Variety in recommendation types
4. Practical, actionable steps
5. Appropriate urgency level
`;
  }

  private async parseAIRecommendations(
    aiResponse: string,
    resources: any[]
  ): Promise<WellnessRecommendation[]> {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.recommendations || [];
    } catch (error) {
      console.error('Failed to parse AI recommendations:', error);
      return await this.generateFallbackRecommendations({} as UserProfile, {} as RecommendationContext, resources);
    }
  }

  private async generateFallbackRecommendations(
    userProfile: UserProfile,
    context: RecommendationContext,
    resources: any[]
  ): Promise<WellnessRecommendation[]> {
    
    const fallbackRecommendations: WellnessRecommendation[] = [];

    // Basic resource recommendations
    const featuredResources = resources.filter(r => r.is_featured).slice(0, 3);
    featuredResources.forEach((resource, index) => {
      fallbackRecommendations.push({
        id: `fallback_${resource.id}`,
        type: 'resource',
        title: resource.title,
        description: resource.description,
        reasoning: 'Highly rated resource for general wellness support',
        priority: index + 1,
        estimatedTime: 15,
        resourceId: resource.id,
        actionSteps: [
          'Access this resource',
          'Explore the available support',
          'Apply the guidance to your situation'
        ],
        followUpSuggestions: [
          'Consider bookmarking for future reference',
          'Share with trusted friends or family if helpful'
        ]
      });
    });

    // Add basic wellness activities
    fallbackRecommendations.push({
      id: 'mindfulness_basic',
      type: 'activity',
      title: 'Brief Mindfulness Practice',
      description: 'A simple 5-minute breathing exercise to center yourself',
      reasoning: 'Mindfulness practices are universally beneficial for mental wellness',
      priority: 4,
      estimatedTime: 5,
      actionSteps: [
        'Find a comfortable, quiet space',
        'Focus on your breath for 5 minutes',
        'Notice thoughts without judgment'
      ],
      followUpSuggestions: [
        'Try extending the practice to 10 minutes',
        'Explore guided meditation resources'
      ]
    });

    return fallbackRecommendations;
  }

  private async rankRecommendations(
    recommendations: WellnessRecommendation[],
    userProfile: UserProfile,
    context: RecommendationContext
  ): Promise<WellnessRecommendation[]> {
    
    // Sort by priority and apply personalization scoring
    return recommendations
      .map(rec => ({
        ...rec,
        personalizedScore: this.calculatePersonalizationScore(rec, userProfile, context)
      }))
      .sort((a, b) => {
        // Crisis recommendations always come first
        if (a.crisisLevel && !b.crisisLevel) return -1;
        if (!a.crisisLevel && b.crisisLevel) return 1;
        
        // Then by personalized score
        if (a.personalizedScore !== b.personalizedScore) {
          return b.personalizedScore - a.personalizedScore;
        }
        
        // Finally by priority
        return a.priority - b.priority;
      })
      .slice(0, 7); // Return top 7 recommendations
  }

  private calculatePersonalizationScore(
    recommendation: WellnessRecommendation,
    userProfile: UserProfile,
    context: RecommendationContext
  ): number {
    let score = 0;

    // Match with user's primary concerns
    if (userProfile.mentalHealthProfile?.primaryConcerns) {
      // This would be more sophisticated in a real implementation
      score += recommendation.description.toLowerCase().includes('anxiety') ? 10 : 0;
      score += recommendation.description.toLowerCase().includes('depression') ? 10 : 0;
    }

    // Match with preferred resource types
    if (userProfile.behaviorPatterns?.preferredResourceTypes?.includes(recommendation.type)) {
      score += 15;
    }

    // Consider time availability
    if (context.timeAvailable && recommendation.estimatedTime <= context.timeAvailable) {
      score += 10;
    }

    // Urgency matching
    if (context.urgencyLevel === 'high' && recommendation.priority <= 3) {
      score += 20;
    }

    return score;
  }

  private async storeRecommendations(
    userId: string,
    recommendations: WellnessRecommendation[]
  ): Promise<void> {
    try {
      const recommendationRecords = recommendations.map(rec => ({
        user_id: userId,
        resource_id: rec.resourceId,
        recommendation_score: rec.personalizedScore || rec.priority,
        reasons: rec.reasoning ? [rec.reasoning] : [],
        algorithm_version: 'v1.0',
        generated_at: new Date().toISOString()
      }));

      await supabase
        .from('personalized_recommendations')
        .insert(recommendationRecords);
        
    } catch (error) {
      console.error('Failed to store recommendations:', error);
    }
  }

  private async getAvailableResources(): Promise<any[]> {
    // Get resources from database (with fallback to mock data)
    try {
      const { data: resources, error } = await supabase
        .from('mental_wellness_resources')
        .select('*')
        .eq('featured', true)
        .order('id');

      if (error) {
        console.log('Using mock data for mental wellness resources');
        return mockMentalWellnessResources;
      }

      return resources || mockMentalWellnessResources;
    } catch (err) {
      console.log('Database not available, using mock data');
      return mockMentalWellnessResources;
    }
  }

  private async getSafetyResources(): Promise<any[]> {
    // Get safety resources from database (with fallback to mock data)
    try {
      const { data: resources, error } = await supabase
        .from('mental_wellness_resources')
        .select('*')
        .eq('emergency', true)
        .order('id');

      if (error) {
        return mockMentalWellnessResources.filter(r => r.emergency);
      }

      return resources || mockMentalWellnessResources.filter(r => r.emergency);
    } catch (err) {
      return mockMentalWellnessResources.filter(r => r.emergency);
    }
  }

  private async getUserHistory(userId: string): Promise<any[]> {
    // Get user history from database (with fallback to empty array)
    try {
      const { data: history, error } = await supabase
        .from('resource_usage_analytics')
        .select(`
          *,
          mental_wellness_resources (title, category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return [];
      }

      return history || [];
    } catch (err) {
      return [];
    }
  }

  async trackRecommendationUsage(
    userId: string,
    recommendationId: string,
    action: 'viewed' | 'accessed' | 'completed' | 'helpful' | 'not_helpful'
  ): Promise<void> {
    try {
      await supabase
        .from('personalized_recommendations')
        .update({
          was_accessed: action === 'accessed' || action === 'completed',
          was_helpful: action === 'helpful' ? true : action === 'not_helpful' ? false : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('id', recommendationId);
        
    } catch (error) {
      console.error('Failed to track recommendation usage:', error);
    }
  }
}

export const recommendationEngine = new PersonalizedRecommendationEngine();