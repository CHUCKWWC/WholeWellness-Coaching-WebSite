import { storage } from "./supabase-client-storage.js";
import { resources } from "../shared/schema.js";

export async function seedResources() {
  const sampleResources = [
    // Articles
    {
      title: "Building Resilience After Trauma",
      type: "article",
      category: "Mental Health",
      content: "Learn evidence-based strategies for rebuilding emotional strength and finding stability after experiencing trauma. This comprehensive guide covers grounding techniques, self-care practices, and when to seek professional help.",
      url: null,
      isFree: true
    },
    {
      title: "5 Steps to Setting Healthy Boundaries",
      type: "article",
      category: "Relationships",
      content: "Discover how to establish and maintain healthy boundaries in all your relationships. Includes scripts for difficult conversations and strategies for staying consistent with your limits.",
      url: null,
      isFree: true
    },
    {
      title: "Financial Recovery: Starting Over",
      type: "article",
      category: "Financial Wellness",
      content: "A practical guide to rebuilding your financial life after major life changes. Covers budgeting basics, credit repair, and building emergency funds on a limited income.",
      url: null,
      isFree: true
    },
    {
      title: "Mindful Eating for Emotional Wellness",
      type: "article",
      category: "Weight Loss",
      content: "Explore the connection between emotions and eating patterns. Learn mindful eating techniques that support both emotional healing and sustainable weight management.",
      url: null,
      isFree: false
    },

    // Videos
    {
      title: "Guided Meditation for Anxiety Relief",
      type: "video",
      category: "Mental Health",
      content: "A 15-minute guided meditation specifically designed to help calm anxiety and create inner peace. Perfect for daily practice or moments of stress.",
      url: "https://example.com/meditation-anxiety",
      isFree: true
    },
    {
      title: "Career Transition Confidence",
      type: "video",
      category: "Career Development",
      content: "Build confidence for making major career changes. Includes exercises for identifying transferable skills and strategies for networking in new fields.",
      url: "https://example.com/career-confidence",
      isFree: true
    },
    {
      title: "Effective Communication in Relationships",
      type: "video",
      category: "Relationships",
      content: "Learn essential communication skills for healthier relationships. Covers active listening, expressing needs clearly, and resolving conflicts constructively.",
      url: "https://example.com/communication-skills",
      isFree: false
    },

    // Worksheets
    {
      title: "Daily Self-Care Checklist",
      type: "worksheet",
      category: "Personal Development",
      content: "A printable daily checklist to help you prioritize self-care activities. Includes physical, emotional, mental, and spiritual wellness categories.",
      url: "/downloads/self-care-checklist.pdf",
      isFree: true
    },
    {
      title: "Goal Setting Workbook",
      type: "worksheet",
      category: "Personal Development",
      content: "Comprehensive workbook for setting and achieving meaningful goals. Includes templates for vision boards, action plans, and progress tracking.",
      url: "/downloads/goal-setting-workbook.pdf",
      isFree: true
    },
    {
      title: "Emotion Regulation Toolkit",
      type: "worksheet",
      category: "Mental Health",
      content: "Practical tools for managing intense emotions. Includes coping strategies, breathing exercises, and journaling prompts for emotional awareness.",
      url: "/downloads/emotion-regulation-toolkit.pdf",
      isFree: false
    },
    {
      title: "Weekly Meal Planning Template",
      type: "worksheet",
      category: "Weight Loss",
      content: "Structured template for planning nutritious meals that support your wellness goals. Includes grocery lists and prep suggestions.",
      url: "/downloads/meal-planning-template.pdf",
      isFree: true
    },

    // Podcasts
    {
      title: "Healing from Domestic Violence - Episode 1",
      type: "podcast",
      category: "Mental Health",
      content: "First episode in our healing series, featuring survivor stories and expert guidance on the recovery journey. Includes resources for immediate support.",
      url: "https://example.com/podcast/healing-dv-ep1",
      isFree: true
    },
    {
      title: "Building New Friendships After Loss",
      type: "podcast",
      category: "Relationships",
      content: "Learn how to create meaningful connections and build a supportive social network after experiencing major life changes or trauma.",
      url: "https://example.com/podcast/building-friendships",
      isFree: true
    },
    {
      title: "Finding Your Purpose After Crisis",
      type: "podcast",
      category: "Personal Development",
      content: "Explore how major challenges can lead to discovering your authentic purpose and values. Features interviews with women who transformed their lives.",
      url: "https://example.com/podcast/finding-purpose",
      isFree: true
    },
    {
      title: "Money Mindset Transformation",
      type: "podcast",
      category: "Financial Wellness",
      content: "Address limiting beliefs about money and develop a healthier relationship with finances. Includes practical exercises and success stories.",
      url: "https://example.com/podcast/money-mindset",
      isFree: false
    }
  ];

  try {
    // Insert new resources
    for (const resource of sampleResources) {
      await storage.createResource(resource);
    }
    
    console.log(`Successfully seeded ${sampleResources.length} resources`);
  } catch (error) {
    console.error("Error seeding resources:", error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedResources().then(() => process.exit(0));
}