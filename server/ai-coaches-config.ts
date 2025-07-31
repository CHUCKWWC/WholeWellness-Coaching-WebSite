export interface AICoachConfig {
  id: string;
  name: string;
  assistantId: string;
  description: string;
  specialties: string[];
  avatar: string;
  color: string;
  suggestedPrompts: string[];
}

export const AI_COACHES: Record<string, AICoachConfig> = {
  mindfulness: {
    id: "mindfulness",
    name: "Charlene",
    assistantId: "asst_hlVX0YPZB64kpfj7QTRxV5HW",
    description: "Mindfulness Coach - Helping you find peace and clarity through meditation and mindful living",
    specialties: ["Meditation", "Stress Reduction", "Mindful Living", "Breathing Techniques"],
    avatar: "🧘‍♀️",
    color: "bg-purple-100 text-purple-800",
    suggestedPrompts: [
      "Guide me through a 5-minute meditation",
      "How can I manage stress at work?",
      "Teach me mindful breathing techniques",
      "Help me develop a daily mindfulness practice",
      "Ways to stay present throughout the day"
    ]
  },
  behavior: {
    id: "behavior",
    name: "Lisa",
    assistantId: "asst_FxvjSpXXdSDIMFbjHtOh2dCe",
    description: "Behavior Coach - Supporting positive behavior change and habit formation",
    specialties: ["Habit Formation", "Goal Setting", "Behavior Modification", "Accountability"],
    avatar: "🎯",
    color: "bg-blue-100 text-blue-800",
    suggestedPrompts: [
      "Help me break a bad habit",
      "Create a morning routine for productivity",
      "How to stay consistent with my goals",
      "Strategies for overcoming procrastination",
      "Building healthy lifestyle habits"
    ]
  },
  wellness: {
    id: "wellness",
    name: "Dasha",
    assistantId: "asst_um6HkqXCT9VdkDRHr1zXUib4",
    description: "Wellness Coach - Your guide to holistic health and well-being",
    specialties: ["Holistic Health", "Lifestyle Balance", "Self-Care", "Energy Management"],
    avatar: "✨",
    color: "bg-green-100 text-green-800",
    suggestedPrompts: [
      "Create a balanced wellness plan for me",
      "How to improve my sleep quality",
      "Natural ways to boost energy",
      "Developing a self-care routine",
      "Balancing work and personal life"
    ]
  },
  relationship: {
    id: "relationship",
    name: "Charles",
    assistantId: "asst_gXDWUtr5ax4oUM9ab1ofs5oG",
    description: "Relationship Coach - Building stronger, healthier connections",
    specialties: ["Communication Skills", "Conflict Resolution", "Trust Building", "Intimacy"],
    avatar: "💕",
    color: "bg-pink-100 text-pink-800",
    suggestedPrompts: [
      "How to improve communication with my partner",
      "Dealing with trust issues in relationships",
      "Setting healthy boundaries",
      "Resolving conflicts constructively",
      "Building emotional intimacy"
    ]
  },
  mentalhealth: {
    id: "mentalhealth",
    name: "Bobby",
    assistantId: "asst_9a6WjS8dNl3HD8rRZVMSHm6h",
    description: "Mental Health Support - Compassionate support for your emotional well-being",
    specialties: ["Emotional Support", "Coping Strategies", "Mental Wellness", "Crisis Support"],
    avatar: "🤗",
    color: "bg-indigo-100 text-indigo-800",
    suggestedPrompts: [
      "I'm feeling overwhelmed today",
      "Coping strategies for anxiety",
      "How to deal with negative thoughts",
      "Building emotional resilience",
      "Finding motivation when feeling down"
    ]
  },
  weightloss: {
    id: "weightloss",
    name: "Aria",
    assistantId: "asst_tgbv3k3i8RHdB3jzFGab9AFR",
    description: "Weight Loss Coach - Personalized guidance for sustainable weight management",
    specialties: ["Meal Planning", "Fitness Guidance", "Nutrition Education", "Motivation"],
    avatar: "🏃‍♀️",
    color: "bg-emerald-100 text-emerald-800",
    suggestedPrompts: [
      "Create a personalized meal plan for my goals",
      "Design a workout routine for beginners",
      "Help me overcome emotional eating",
      "Track my progress and provide motivation",
      "Suggest healthy snacks for busy days"
    ]
  }
};

export function getCoachByAssistantId(assistantId: string): AICoachConfig | undefined {
  return Object.values(AI_COACHES).find(coach => coach.assistantId === assistantId);
}

export function getCoachById(coachId: string): AICoachConfig | undefined {
  return AI_COACHES[coachId];
}