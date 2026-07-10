const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function migrate() {
  console.log('Reading schema.sql...');
  const schemaPath = path.join(__dirname, '../schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing database schema and seed data onto remote database...');
  try {
    await db.query(sql);
    console.log('Database successfully migrated and seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Migration execution failed:', err.message);
    process.exit(1);
  }
}

migrate();
