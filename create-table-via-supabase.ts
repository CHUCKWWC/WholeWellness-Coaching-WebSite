import { supabase } from './server/supabase';

async function createProgramsTableViaSupabase() {
  console.log('📝 Creating programs table using Supabase SQL API...\n');

  // SQL to create the programs table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS "programs" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" varchar NOT NULL,
      "assessment_type" varchar(50) NOT NULL,
      "status" varchar(20) DEFAULT 'in_progress',
      "completion_percentage" integer DEFAULT 0,
      "paid" boolean DEFAULT false,
      "payment_intent_id" varchar,
      "responses" jsonb,
      "result" jsonb,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now(),
      CONSTRAINT "programs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
    );
    
    CREATE INDEX IF NOT EXISTS "programs_user_id_idx" ON "programs" ("user_id");
  `;

  try {
    // Use Supabase's SQL RPC function
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });

    if (error) {
      // If the RPC function doesn't exist, we might need to use a different approach
      console.log('⚠️  RPC method failed:', error.message);
      console.log('\n💡 Alternative approach: Creating via REST API...\n');
      
      // Try using Supabase's REST API directly
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/rpc/query`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY!,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: createTableSQL })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`REST API failed: ${response.status} - ${errorText}`);
      }

      console.log('✅ Table created via REST API');
    } else {
      console.log('✅ Table created successfully!');
      console.log('Response:', data);
    }

  } catch (error: any) {
    console.error('❌ Failed to create table:', error.message);
    console.log('\n📌 Manual Solution:');
    console.log('Go to Supabase Dashboard → SQL Editor and run:');
    console.log('---');
    console.log(createTableSQL);
    console.log('---\n');
    process.exit(1);
  }
}

createProgramsTableViaSupabase()
  .then(() => {
    console.log('\n✅ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
