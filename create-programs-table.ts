import { Client } from 'pg';

async function createProgramsTable() {
  // Convert pooler URL to direct connection
  const directUrl = process.env.DATABASE_URL!
    .replace(':6543', ':5432')
    .replace('?pgbouncer=true', '')
    .replace('&connection_limit=1', '');

  console.log('Connecting to database with direct connection...');
  
  const client = new Client({ connectionString: directUrl });
  
  try {
    await client.connect();
    console.log('Connected successfully!');

    // Create programs table based on schema
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
    `;

    console.log('Creating programs table...');
    await client.query(createTableSQL);
    console.log('✓ Programs table created successfully!');

    // Create index on user_id for better query performance
    await client.query('CREATE INDEX IF NOT EXISTS "programs_user_id_idx" ON "programs" ("user_id");');
    console.log('✓ Index created successfully!');

  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createProgramsTable()
  .then(() => {
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
