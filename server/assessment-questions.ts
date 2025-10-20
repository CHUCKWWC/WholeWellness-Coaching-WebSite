/**
 * Assessment questions configuration
 * These match the assessments shown in the UI
 */

export const assessmentQuestions: Record<string, any> = {
  wellness_personality: {
    id: "wellness_personality",
    name: "wellness_personality",
    displayName: "Wellness Personality Assessment",
    category: "Wellness",
    description: "Discover your unique wellness style and personalized recommendations for optimal health and happiness.",
    fields: {
      fields: [
        { name: "exercise_preference", label: "What type of exercise do you enjoy most?", type: "select", required: true, options: ["Cardio (running, cycling)", "Strength training", "Yoga/Pilates", "Sports", "Walking/Hiking", "I don't exercise regularly"] },
        { name: "diet_approach", label: "Which diet approach resonates with you?", type: "select", required: true, options: ["Balanced/Moderate", "Plant-based", "High-protein", "Intermittent fasting", "Intuitive eating", "No specific approach"] },
        { name: "stress_relief", label: "How do you prefer to manage stress?", type: "select", required: true, options: ["Meditation/Mindfulness", "Exercise", "Creative activities", "Social connection", "Nature/Outdoors", "Rest/Sleep"] },
        { name: "sleep_quality", label: "How would you rate your sleep quality?", type: "range", min: 1, max: 10, required: true },
        { name: "wellness_goals", label: "What are your top wellness goals?", type: "checkbox", options: ["Better sleep", "More energy", "Stress management", "Healthy eating", "Regular exercise", "Mental clarity"] }
      ]
    }
  },
  career_alignment: {
    id: "career_alignment",
    name: "career_alignment",
    displayName: "Career Alignment Analysis",
    category: "Career",
    description: "Uncover your career strengths, values, and ideal work environment for professional fulfillment.",
    fields: {
      fields: [
        { name: "current_satisfaction", label: "How satisfied are you with your current career?", type: "range", min: 1, max: 10, required: true },
        { name: "work_values", label: "What matters most to you in your work?", type: "checkbox", options: ["Financial stability", "Work-life balance", "Making a difference", "Creativity", "Leadership opportunities", "Continuous learning"] },
        { name: "ideal_environment", label: "What is your ideal work environment?", type: "select", required: true, options: ["Office setting", "Remote work", "Hybrid", "Collaborative team", "Independent work", "Flexible/varied"] },
        { name: "strengths", label: "What are your top professional strengths?", type: "textarea", required: true },
        { name: "growth_areas", label: "What skills would you like to develop?", type: "textarea", required: true },
        { name: "career_goals", label: "Where do you see yourself in 3-5 years?", type: "textarea", required: true }
      ]
    }
  },
  relationship_patterns: {
    id: "relationship_patterns",
    name: "relationship_patterns",
    displayName: "Relationship Patterns Assessment",
    category: "Relationships",
    description: "Understand your attachment style and communication patterns in personal relationships.",
    fields: {
      fields: [
        { name: "attachment_security", label: "I feel comfortable being close to others", type: "range", min: 1, max: 10, required: true },
        { name: "fear_abandonment", label: "I worry about being abandoned or rejected", type: "range", min: 1, max: 10, required: true },
        { name: "communication_style", label: "How do you typically communicate in relationships?", type: "select", required: true, options: ["Direct and open", "Indirect, avoid conflict", "Vary by situation", "Struggle to express feelings", "Overly accommodating"] },
        { name: "conflict_handling", label: "How do you handle disagreements?", type: "select", required: true, options: ["Address immediately", "Need time to process", "Avoid confrontation", "Get emotional quickly", "Seek compromise"] },
        { name: "relationship_goals", label: "What are your relationship goals?", type: "checkbox", options: ["Better communication", "Deeper intimacy", "Conflict resolution", "Trust building", "Independence balance", "Understanding patterns"] },
        { name: "current_challenges", label: "What relationship challenges are you facing?", type: "textarea", required: false }
      ]
    }
  },
  stress_resilience: {
    id: "stress_resilience",
    name: "stress_resilience",
    displayName: "Stress & Resilience Profile",
    category: "Mental Health",
    description: "Assess your stress management skills and discover personalized coping strategies.",
    fields: {
      fields: [
        { name: "current_stress", label: "How stressed do you feel currently?", type: "range", min: 1, max: 10, required: true },
        { name: "stress_sources", label: "What are your main sources of stress?", type: "checkbox", options: ["Work/Career", "Finances", "Relationships", "Health", "Family responsibilities", "Uncertainty about future"] },
        { name: "coping_mechanisms", label: "What do you currently do to manage stress?", type: "checkbox", options: ["Exercise", "Talk to friends/family", "Meditation/mindfulness", "Hobbies", "Professional help", "Avoid thinking about it"] },
        { name: "resilience_level", label: "I bounce back quickly from challenges", type: "range", min: 1, max: 10, required: true },
        { name: "support_system", label: "How would you rate your support system?", type: "range", min: 1, max: 10, required: true },
        { name: "desired_strategies", label: "What stress management strategies interest you?", type: "textarea", required: true }
      ]
    }
  },
  nutrition_lifestyle: {
    id: "nutrition_lifestyle",
    name: "nutrition_lifestyle",
    displayName: "Nutrition & Lifestyle Analysis",
    category: "Nutrition",
    description: "Get a comprehensive evaluation of your eating habits and lifestyle factors affecting your health.",
    fields: {
      fields: [
        { name: "eating_habits", label: "How would you describe your eating habits?", type: "select", required: true, options: ["Very healthy", "Mostly healthy", "Mixed/inconsistent", "Need improvement", "Poor"] },
        { name: "meal_frequency", label: "How many meals do you typically eat per day?", type: "select", required: true, options: ["1-2 meals", "3 meals", "4+ meals/snacks", "Irregular schedule"] },
        { name: "dietary_restrictions", label: "Do you have any dietary restrictions or preferences?", type: "textarea", required: false },
        { name: "water_intake", label: "How many glasses of water do you drink daily?", type: "select", required: true, options: ["Less than 4", "4-6 glasses", "7-8 glasses", "More than 8"] },
        { name: "activity_level", label: "How active are you during a typical week?", type: "select", required: true, options: ["Sedentary (little to no exercise)", "Lightly active (1-3 days/week)", "Moderately active (3-5 days/week)", "Very active (6-7 days/week)"] },
        { name: "sleep_hours", label: "How many hours of sleep do you get nightly?", type: "select", required: true, options: ["Less than 5", "5-6 hours", "7-8 hours", "9+ hours"] },
        { name: "nutrition_goals", label: "What are your nutrition and lifestyle goals?", type: "textarea", required: true }
      ]
    }
  }
};

export function getAssessmentQuestions(id: string) {
  return assessmentQuestions[id] || null;
}
