import { supabase } from './supabase.js';

async function checkAndFixAssessments() {
  console.log('Checking assessment_types table structure...\n');
  
  // Get one record to see the structure
  const { data: existing, error: selectError } = await supabase
    .from('assessment_types')
    .select('*')
    .limit(1);
  
  if (existing && existing[0]) {
    console.log('Existing record structure:', Object.keys(existing[0]));
  }
  
  // Define assessments WITHOUT coach_types since it may not exist
  const assessments = [
    {
      id: 'attachment-style',
      name: 'attachment-style',
      display_name: 'Attachment Style Assessment',
      category: 'relationships',
      description: 'Discover your attachment style and how it impacts your relationships.',
      fields: {
        sections: [
          {
            title: 'Relationship Patterns',
            fields: [
              { name: 'closeness', label: 'I am comfortable being close to others', type: 'scale', min: 1, max: 5, required: true },
              { name: 'dependency', label: 'I worry about being abandoned', type: 'scale', min: 1, max: 5, required: true },
              { name: 'anxiety', label: 'I often worry my partner doesn\'t really love me', type: 'scale', min: 1, max: 5, required: true }
            ]
          }
        ]
      },
      is_active: true
    },
    {
      id: 'mental-health-screening',
      name: 'mental-health-screening',
      display_name: 'Mental Health Screening',
      category: 'mental_health',
      description: 'A brief screening to assess your current mental health and emotional wellbeing.',
      fields: {
        sections: [
          {
            title: 'Current Feelings',
            fields: [
              { name: 'mood', label: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?', type: 'select', required: true, options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
              { name: 'interest', label: 'Little interest or pleasure in doing things?', type: 'select', required: true, options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
            ]
          }
        ]
      },
      is_active: true
    },
    {
      id: 'career-goals',
      name: 'career-goals',
      display_name: 'Career Goals & Aspirations',
      category: 'career',
      description: 'Identify your career goals, strengths, and areas for development.',
      fields: {
        sections: [
          {
            title: 'Current Situation',
            fields: [
              { name: 'currentRole', label: 'Current Job/Role', type: 'text', required: true },
              { name: 'experience', label: 'Years of Experience', type: 'number', required: true },
              { name: 'satisfaction', label: 'Job Satisfaction (1-10)', type: 'scale', min: 1, max: 10, required: true }
            ]
          }
        ]
      },
      is_active: true
    },
    {
      id: 'trauma-recovery-intake',
      name: 'trauma-recovery-intake',
      display_name: 'Trauma Recovery Intake',
      category: 'mental_health',
      description: 'Sensitive intake assessment for survivors seeking trauma-informed support.',
      fields: {
        sections: [
          {
            title: 'Your Safety',
            fields: [
              { name: 'currentSafety', label: 'Do you currently feel safe?', type: 'select', required: true, options: ['Yes, I am safe', 'Somewhat safe', 'I have concerns', 'I am in immediate danger'] },
              { name: 'emergencyContact', label: 'Emergency Contact Name', type: 'text', required: false }
            ]
          }
        ]
      },
      is_active: true
    },
    {
      id: 'life-balance',
      name: 'life-balance',
      display_name: 'Life Balance Assessment',
      category: 'health',
      description: 'Evaluate different areas of your life to identify imbalances.',
      fields: {
        sections: [
          {
            title: 'Life Areas',
            fields: [
              { name: 'health', label: 'Physical Health (1-10)', type: 'scale', min: 1, max: 10, required: true },
              { name: 'relationships', label: 'Relationships (1-10)', type: 'scale', min: 1, max: 10, required: true },
              { name: 'career', label: 'Career/Work (1-10)', type: 'scale', min: 1, max: 10, required: true }
            ]
          }
        ]
      },
      is_active: true
    }
  ];

  console.log('\nInserting assessment types...\n');
  
  for (const assessment of assessments) {
    const { data: exists } = await supabase
      .from('assessment_types')
      .select('id')
      .eq('id', assessment.id)
      .single();
    
    if (exists) {
      console.log(`✓ "${assessment.display_name}" already exists`);
    } else {
      const { data, error } = await supabase
        .from('assessment_types')
        .insert(assessment)
        .select();
      
      if (error) {
        console.error(`✗ Error inserting "${assessment.display_name}":`, error.message);
      } else {
        console.log(`✓ Successfully inserted "${assessment.display_name}"`);
      }
    }
  }
  
  console.log('\n✓ Assessment seeding completed');
}

checkAndFixAssessments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
