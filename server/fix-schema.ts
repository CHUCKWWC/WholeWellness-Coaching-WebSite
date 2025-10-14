import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('Checking current schema...');
  
  // Try to add the missing column using raw SQL
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE assessment_types 
        ADD COLUMN IF NOT EXISTS coach_types text[];
      `
    });
    
    if (error) {
      console.error('RPC method not available, trying direct insert to check schema...');
      
      // Try to insert a test record to see what columns exist
      const { data: testData, error: testError } = await supabase
        .from('assessment_types')
        .select('*')
        .limit(1)
        .single();
      
      console.log('Existing record structure:', testData);
      console.log('Error (if any):', testError);
    } else {
      console.log('✓ Column added successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixSchema().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
