import { db } from "./server/db";
import { sql } from 'drizzle-orm';

async function checkAndCreateAssessmentTables() {
  try {
    console.log('Checking assessment tables...');
    
    // Check if tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('assessment_types', 'user_assessments', 'coach_interactions')
    `);
    
    console.log('Assessment tables found:', tables);
    
    const tableRows = tables.rows || tables;
    if (!tableRows || tableRows.length < 3) {
      console.log('Creating missing assessment tables...');
      
      // Create assessment_types table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS assessment_types (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR NOT NULL,
          display_name VARCHAR NOT NULL,
          category VARCHAR NOT NULL,
          description TEXT,
          version INTEGER DEFAULT 1,
          fields JSONB NOT NULL,
          coach_types TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✓ Created assessment_types table');
      
      // Create user_assessments table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_assessments (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          assessment_type_id VARCHAR NOT NULL REFERENCES assessment_types(id),
          responses JSONB NOT NULL,
          summary TEXT,
          tags TEXT[],
          completed_at TIMESTAMP DEFAULT NOW(),
          last_accessed_at TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✓ Created user_assessments table');
      
      // Create coach_interactions table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS coach_interactions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          coach_type VARCHAR NOT NULL,
          accessed_assessments TEXT[],
          interaction_summary TEXT,
          session_id VARCHAR,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✓ Created coach_interactions table');
      
      console.log('All assessment tables created successfully!');
    } else {
      console.log('All assessment tables already exist.');
      
      // Check columns in user_assessments
      const columns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_assessments'
        ORDER BY column_name
      `);
      
      console.log('user_assessments columns:', columns.rows.map(r => r.column_name).join(', '));
      
      // Check if we have the correct column name
      const hasAssessmentTypeId = columns.rows.some(r => r.column_name === 'assessment_type_id');
      const hasAssessmentType = columns.rows.some(r => r.column_name === 'assessmenttype');
      
      if (!hasAssessmentTypeId && hasAssessmentType) {
        console.log('Found incorrect column name "assessmenttype", renaming to "assessment_type_id"...');
        await db.execute(sql`
          ALTER TABLE user_assessments 
          RENAME COLUMN assessmenttype TO assessment_type_id
        `);
        console.log('✓ Column renamed successfully');
      } else if (hasAssessmentTypeId) {
        console.log('✓ Column "assessment_type_id" exists correctly');
      }
    }
    
    // Insert a sample assessment type if none exist
    const assessmentTypesCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM assessment_types
    `);
    
    if (assessmentTypesCount.rows[0].count === '0') {
      console.log('Inserting sample assessment type...');
      await db.execute(sql`
        INSERT INTO assessment_types (name, display_name, category, description, fields, coach_types)
        VALUES (
          'weight-loss-intake',
          'Weight Loss Intake',
          'health',
          'Initial weight loss assessment',
          '{"fields": []}'::jsonb,
          ARRAY['weight_loss']
        )
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('✓ Sample assessment type created');
    }
    
    console.log('\n✅ Assessment tables check complete!');
  } catch (error) {
    console.error('Error checking/creating assessment tables:', error);
  } finally {
    process.exit(0);
  }
}

checkAndCreateAssessmentTables();