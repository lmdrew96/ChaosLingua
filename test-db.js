const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  // Test connection
  const result = await sql`SELECT NOW() as time`;
  console.log('Connection OK:', result[0].time);
  
  // Check if tables exist
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tables:', tables.map(t => t.table_name).join(', '));
}

test().catch(e => console.error('Error:', e.message));
