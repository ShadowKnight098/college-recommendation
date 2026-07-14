const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in env');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Neon PostgreSQL database.');

  console.log('Enabling pg_trgm extension if not already present...');
  await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

  console.log('Creating GIN trigram index on college name for fast ILIKE searches...');
  await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm ON colleges USING gin (name gin_trgm_ops);');

  console.log('Creating GIN trigram index on college code for fast ILIKE searches...');
  await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_code_trgm ON colleges USING gin (code gin_trgm_ops);');

  console.log('Indexes created successfully!');
  await client.end();
}

main().catch(err => {
  console.error('Failed to create indexes:', err);
  process.exit(1);
});
