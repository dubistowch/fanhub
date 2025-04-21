import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL must be set. Please provide a valid Supabase database URL');
}

console.log("Checking Supabase connection...");

// Create PostgreSQL connection pool to Supabase
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 5, // Connection pool max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log when connection is created
pool.on('connect', () => {
  console.log('PostgreSQL connection created');
});

// Log errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

const checkConnection = async () => {
  try {
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW() as now');
    console.log('Successfully connected to Supabase PostgreSQL');
    console.log('Current server time:', timeResult.rows[0].now);
    
    // Create drizzle instance
    const db = drizzle(pool, { schema });
    
    // Check if tables exist
    const tableNames = ['users', 'providers', 'creators', 'follows', 'checkins', 'checkin_stats'];
    
    console.log('\nChecking tables:');
    for (const table of tableNames) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`, [table]);
        
        const exists = result.rows[0].exists;
        console.log(`- ${table}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
        
        if (exists) {
          const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`  Records: ${countResult.rows[0].count}`);
        }
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
      }
    }
    
    // Check users if they exist
    try {
      const usersResult = await pool.query('SELECT COUNT(*) FROM users');
      const userCount = usersResult.rows[0].count;
      
      if (parseInt(userCount) > 0) {
        const sampleUsers = await pool.query('SELECT id, username, email FROM users LIMIT 3');
        console.log('\nSample users:');
        sampleUsers.rows.forEach(user => {
          console.log(`- User ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
        });
      }
    } catch (error) {
      console.error('Error checking users:', error);
    }
    
    console.log('\nConnection test completed successfully');
  } catch (error) {
    console.error('Failed to connect to Supabase PostgreSQL:', error);
  } finally {
    await pool.end();
  }
};

checkConnection();