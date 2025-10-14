import { supabase } from "./supabase-client-storage.js";

async function seedAssessmentsDirect() {
  const assessmentTypes = [
    {
      id: "attachment-style",
      name: "attachment-style",
      display_name: "Attachment Style Assessment",
      category: "relationships",
      description: "Discover your attachment style and how it impacts your relationships. This assessment helps identify patterns in how you connect with others.",
      fields: {
        sections: [
          {
            title: "Relationship Patterns",
            fields: [
              { name: "closeness", label: "I am comfortable being close to others", type: "scale", min: 1, max: 5, required: true },
              { name: "dependency", label: "I worry about being abandoned", type: "scale", min: 1, max: 5, required: true },
              { name: "anxiety", label: "I often worry my partner doesn't really love me", type: "scale", min: 1, max: 5, required: true },
              { name: "avoidance", label: "I prefer not to get too close to others", type: "scale", min: 1, max: 5, required: true },
              { name: "comfort", label: "I find it easy to depend on others", type: "scale", min: 1, max: 5, required: true }
            ]
          }
        ]
      },
      coach_types: ["Relationship Coach", "Life Coach"],
      is_active: true
    },
    {
      id: "mental-health-screening",
      name: "mental-health-screening",
      display_name: "Mental Health Screening",
      category: "mental_health",
      description: "A brief screening to assess your current mental health and emotional wellbeing. Helps us provide appropriate support and resources.",
      fields: {
        sections: [
          {
            title: "Current Feelings",
            fields: [
              { name: "mood", label: "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?", type: "select", required: true, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
              { name: "interest", label: "Little interest or pleasure in doing things?", type: "select", required: true, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
              { name: "anxiety", label: "Feeling nervous, anxious, or on edge?", type: "select", required: true, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
              { name: "sleep", label: "Trouble falling or staying asleep, or sleeping too much?", type: "select", required: true, options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
            ]
          },
          {
            title: "Support & Resources",
            fields: [
              { name: "support", label: "Do you have a support system?", type: "select", required: true, options: ["Yes, strong support", "Some support", "Limited support", "No support"] },
              { name: "previousTherapy", label: "Have you received mental health treatment before?", type: "select", required: true, options: ["Yes, currently", "Yes, previously", "No, never"] },
              { name: "concerns", label: "What are your main concerns right now?", type: "textarea", required: true }
            ]
          }
        ]
      },
      coach_types: ["Life Coach", "Wellness Coach", "Trauma Recovery Coach"],
      is_active: true
    },
    {
      id: "career-goals",
      name: "career-goals",
      display_name: "Career Goals & Aspirations",
      category: "career",
      description: "Identify your career goals, strengths, and areas for development. Helps create a roadmap for professional growth.",
      fields: {
        sections: [
          {
            title: "Current Situation",
            fields: [
              { name: "currentRole", label: "Current Job/Role", type: "text", required: true },
              { name: "experience", label: "Years of Experience", type: "number", required: true },
              { name: "satisfaction", label: "Job Satisfaction (1-10)", type: "scale", min: 1, max: 10, required: true }
            ]
          },
          {
            title: "Goals & Aspirations",
            fields: [
              { name: "careerGoals", label: "What are your career goals?", type: "textarea", required: true },
              { name: "timeline", label: "Desired Timeline", type: "select", required: true, options: ["Within 6 months", "6-12 months", "1-2 years", "2-5 years", "Long-term (5+ years)"] },
              { name: "skills", label: "Skills you want to develop", type: "textarea", required: true },
              { name: "barriers", label: "What's holding you back?", type: "textarea", required: true }
            ]
          }
        ]
      },
      coach_types: ["Career Coach", "Life Coach"],
      is_active: true
    },
    {
      id: "trauma-recovery-intake",
      name: "trauma-recovery-intake",
      display_name: "Trauma Recovery Intake",
      category: "mental_health",
      description: "Sensitive intake assessment for survivors seeking trauma-informed support. All information is confidential and used to provide appropriate care.",
      fields: {
        sections: [
          {
            title: "Your Safety",
            fields: [
              { name: "currentSafety", label: "Do you currently feel safe?", type: "select", required: true, options: ["Yes, I am safe", "Somewhat safe", "I have concerns", "I am in immediate danger"] },
              { name: "emergencyContact", label: "Emergency Contact Name", type: "text", required: false },
              { name: "emergencyPhone", label: "Emergency Contact Phone", type: "text", required: false }
            ]
          },
          {
            title: "Support Needs",
            fields: [
              { name: "traumaType", label: "Type of trauma (if comfortable sharing)", type: "select", required: false, options: ["Domestic violence", "Sexual assault", "Childhood trauma", "Other trauma", "Prefer not to say"] },
              { name: "timeframe", label: "When did the trauma occur?", type: "select", required: false, options: ["Recently (past month)", "Within the past year", "1-5 years ago", "More than 5 years ago", "Ongoing"] },
              { name: "copingMechanisms", label: "Current coping strategies", type: "textarea", required: false },
              { name: "triggers", label: "Known triggers (optional)", type: "textarea", required: false },
              { name: "goals", label: "What would you like help with?", type: "textarea", required: true }
            ]
          }
        ]
      },
      coach_types: ["Trauma Recovery Coach", "Life Coach"],
      is_active: true
    },
    {
      id: "life-balance",
      name: "life-balance",
      display_name: "Life Balance Assessment",
      category: "health",
      description: "Evaluate different areas of your life to identify imbalances and areas that need attention for overall wellbeing.",
      fields: {
        sections: [
          {
            title: "Life Areas",
            fields: [
              { name: "health", label: "Physical Health (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "relationships", label: "Relationships (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "career", label: "Career/Work (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "finances", label: "Finances (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "personal", label: "Personal Growth (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "fun", label: "Fun & Recreation (1-10)", type: "scale", min: 1, max: 10, required: true },
              { name: "environment", label: "Physical Environment (1-10)", type: "scale", min: 1, max: 10, required: true }
            ]
          },
          {
            title: "Priorities",
            fields: [
              { name: "focus", label: "Which area needs the most attention?", type: "select", required: true, options: ["Health", "Relationships", "Career", "Finances", "Personal Growth", "Fun & Recreation", "Environment"] },
              { name: "why", label: "Why is this area important to you?", type: "textarea", required: true }
            ]
          }
        ]
      },
      coach_types: ["Life Coach", "Wellness Coach"],
      is_active: true
    }
  ];

  console.log("Starting direct Supabase insert...");
  
  for (const assessmentType of assessmentTypes) {
    try {
      // Check if it exists
      const { data: existing } = await supabase
        .from('assessment_types')
        .select('id')
        .eq('id', assessmentType.id)
        .single();

      if (existing) {
        console.log(`✓ Assessment "${assessmentType.display_name}" already exists`);
      } else {
        // Insert new assessment
        const { data, error } = await supabase
          .from('assessment_types')
          .insert(assessmentType);

        if (error) {
          console.error(`✗ Error inserting "${assessmentType.display_name}":`, error);
        } else {
          console.log(`✓ Successfully inserted "${assessmentType.display_name}"`);
        }
      }
    } catch (error) {
      console.error(`Error processing "${assessmentType.display_name}":`, error);
    }
  }

  console.log("\n✓ Direct seeding completed");
}

seedAssessmentsDirect()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
