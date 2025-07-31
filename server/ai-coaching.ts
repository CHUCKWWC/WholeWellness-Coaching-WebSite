import OpenAI from "openai";
import { CoachingTemplates } from "./coaching-templates";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  try {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  } catch (error) {
    console.warn('OpenAI initialization failed, using evidence-based templates');
  }
}

export interface CoachingProfile {
  name: string;
  age: number;
  height: string;
  currentWeight: number;
  goalWeight: number;
  activityLevel: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
  fitnessGoals: string[];
  preferredWorkouts: string[];
  availableTime: string;
  experience: string;
  motivation: string;
}

export interface MealPlan {
  day: string;
  meals: {
    breakfast: { name: string; calories: number; ingredients: string[]; instructions: string };
    lunch: { name: string; calories: number; ingredients: string[]; instructions: string };
    dinner: { name: string; calories: number; ingredients: string[]; instructions: string };
    snacks: { name: string; calories: number; ingredients: string[] }[];
  };
  totalCalories: number;
  macros: { protein: number; carbs: number; fat: number };
}

export interface WorkoutPlan {
  day: string;
  type: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    instructions: string;
    modifications: string;
  }[];
  warmup: string[];
  cooldown: string[];
}

export class AICoaching {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  private model = "gpt-4o";

  async generatePersonalizedMealPlan(profile: CoachingProfile): Promise<MealPlan[]> {
    if (!openai) {
      // Use evidence-based template system
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.mealPlan;
    }

    const restrictions = profile.dietaryRestrictions.length > 0 
      ? `with dietary restrictions: ${profile.dietaryRestrictions.join(', ')}` 
      : '';
    
    const healthConditions = profile.healthConditions.length > 0 
      ? `considering health conditions: ${profile.healthConditions.join(', ')}` 
      : '';

    const prompt = `Create a personalized 7-day meal plan for weight loss for ${profile.name}:
    - Age: ${profile.age}, Height: ${profile.height}, Current: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Activity level: ${profile.activityLevel}
    - ${restrictions} ${healthConditions}
    - Fitness goals: ${profile.fitnessGoals.join(', ')}
    
    Provide realistic, nutritious meals with proper portions for sustainable weight loss. Include exact ingredients, cooking instructions, calorie counts, and macronutrients. Focus on whole foods, lean proteins, and balanced nutrition.
    
    Format as JSON with this structure: {
      "weeklyPlan": [
        {
          "day": "Monday",
          "meals": {
            "breakfast": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "lunch": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "dinner": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "snacks": [{"name": "", "calories": 0, "ingredients": []}]
          },
          "totalCalories": 0,
          "macros": {"protein": 0, "carbs": 0, "fat": 0}
        }
      ]
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a certified nutritionist and weight loss coach with expertise in creating personalized meal plans. Provide practical, achievable nutrition advice focused on sustainable weight loss and overall health."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.weeklyPlan || [];
    } catch (error) {
      console.error('Error generating meal plan:', error);
      // Fallback to evidence-based templates
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.mealPlan;
    }
  }

  async generatePersonalizedWorkoutPlan(profile: CoachingProfile): Promise<WorkoutPlan[]> {
    const workoutPrefs = profile.preferredWorkouts.length > 0 
      ? `prefers: ${profile.preferredWorkouts.join(', ')}` 
      : 'open to various workout types';

    const prompt = `Create a personalized 7-day workout plan for ${profile.name}:
    - Age: ${profile.age}, Current weight: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Activity level: ${profile.activityLevel}
    - Experience level: ${profile.experience}
    - Available time: ${profile.availableTime}
    - ${workoutPrefs}
    - Fitness goals: ${profile.fitnessGoals.join(', ')}
    
    Design a progressive workout plan that's safe, effective, and sustainable. Include proper warm-up, exercises with sets/reps/rest periods, modifications for different fitness levels, and cool-down routines.
    
    Format as JSON: {
      "weeklyPlan": [
        {
          "day": "Monday",
          "type": "Strength Training",
          "duration": 45,
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": 3,
              "reps": "8-12",
              "rest": "60-90 seconds",
              "instructions": "detailed form instructions",
              "modifications": "easier/harder options"
            }
          ],
          "warmup": ["5 minutes walking", "dynamic stretching"],
          "cooldown": ["5 minutes stretching", "deep breathing"]
        }
      ]
    }`;

    if (!openai) {
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.workoutPlan;
    }

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a certified personal trainer and fitness coach with expertise in creating safe, effective workout programs for weight loss and overall fitness. Focus on proper form, progressive overload, and injury prevention."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.weeklyPlan || [];
    } catch (error) {
      console.error('Error generating workout plan:', error);
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.workoutPlan;
    }
  }

  async generateMotivationalMessage(profile: CoachingProfile, progressData?: any): Promise<string> {
    const progressContext = progressData 
      ? `Recent progress: ${JSON.stringify(progressData)}` 
      : 'Starting their journey';

    const prompt = `Write a personalized, motivational message for ${profile.name} who is working on weight loss:
    - Current situation: ${profile.currentWeight}lbs working toward ${profile.goalWeight}lbs
    - Their motivation: ${profile.motivation}
    - ${progressContext}
    
    Create an encouraging, supportive message that acknowledges their efforts and provides motivation to continue. Keep it personal, authentic, and empowering. Focus on progress, not perfection.`;

    if (!openai) {
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.motivation;
    }

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a compassionate life coach specializing in supporting women through weight loss journeys. Your messages are encouraging, realistic, and focus on building confidence and sustainable habits."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
      });

      return response.choices[0].message.content || "Keep going! Every step forward is progress worth celebrating.";
    } catch (error) {
      console.error('Error generating motivational message:', error);
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.motivation;
    }
  }

  async analyzeProgressAndAdjustPlan(profile: CoachingProfile, progressData: any): Promise<{
    analysis: string;
    recommendations: string[];
    planAdjustments: string[];
  }> {
    const prompt = `Analyze the progress and provide coaching recommendations for ${profile.name}:
    
    Profile: Age ${profile.age}, starting weight ${profile.currentWeight}lbs, goal ${profile.goalWeight}lbs
    Activity level: ${profile.activityLevel}
    
    Progress data: ${JSON.stringify(progressData)}
    
    Provide:
    1. Analysis of their progress (positive reinforcement and areas for improvement)
    2. Specific recommendations for the next week
    3. Any adjustments needed to their meal or workout plan
    
    Format as JSON: {
      "analysis": "detailed progress analysis",
      "recommendations": ["specific actionable recommendations"],
      "planAdjustments": ["specific plan modifications"]
    }`;

    if (!openai) {
      return {
        analysis: `${profile.name}, you're making excellent progress on your journey toward ${profile.goalWeight} lbs. Your commitment to healthy habits is showing results.`,
        recommendations: [
          "Continue tracking your daily food intake for accountability",
          "Increase water intake to support metabolism and reduce hunger",
          "Focus on getting 7-9 hours of quality sleep nightly",
          "Add 10 minutes of walking after meals to aid digestion"
        ],
        planAdjustments: [
          "Maintain current calorie targets - they're working well for you",
          "Consider adding one extra strength training session if energy levels permit",
          "Try meal prepping on Sundays to stay consistent during busy weekdays"
        ]
      };
    }

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an experienced weight loss coach who provides constructive, encouraging feedback. Focus on sustainable habits and positive reinforcement while making practical adjustments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        analysis: result.analysis || "Great job staying committed to your health journey!",
        recommendations: result.recommendations || ["Continue following your meal plan", "Stay consistent with workouts"],
        planAdjustments: result.planAdjustments || ["No adjustments needed - keep going!"]
      };
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return {
        analysis: `${profile.name}, you're making excellent progress on your journey toward ${profile.goalWeight} lbs. Your commitment to healthy habits is showing results.`,
        recommendations: [
          "Continue tracking your daily food intake for accountability",
          "Increase water intake to support metabolism and reduce hunger",
          "Focus on getting 7-9 hours of quality sleep nightly",
          "Add 10 minutes of walking after meals to aid digestion"
        ],
        planAdjustments: [
          "Maintain current calorie targets - they're working well for you",
          "Consider adding one extra strength training session if energy levels permit",
          "Try meal prepping on Sundays to stay consistent during busy weekdays"
        ]
      };
    }
  }

  async generateNutritionTips(profile: CoachingProfile): Promise<string[]> {
    const prompt = `Generate 5 personalized nutrition tips for ${profile.name}:
    - Age: ${profile.age}, Current: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Dietary restrictions: ${profile.dietaryRestrictions.join(', ') || 'None'}
    - Health conditions: ${profile.healthConditions.join(', ') || 'None'}
    
    Provide practical, actionable nutrition tips that are specific to their situation and easy to implement.
    
    Format as JSON: {"tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]}`;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a registered dietitian providing practical, evidence-based nutrition advice for sustainable weight loss."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.tips || [
        "Stay hydrated with 8-10 glasses of water daily",
        "Fill half your plate with vegetables at each meal",
        "Choose lean proteins to support muscle maintenance",
        "Practice portion control using your hand as a guide",
        "Eat slowly and mindfully to recognize fullness cues"
      ];
    } catch (error) {
      console.error('Error generating nutrition tips:', error);
      return [
        "Stay hydrated throughout the day",
        "Include protein in every meal",
        "Choose whole foods over processed options",
        "Practice mindful eating",
        "Plan and prep meals in advance"
      ];
    }
  }
}

export const aiCoaching = new AICoaching();