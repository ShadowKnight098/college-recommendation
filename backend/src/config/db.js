const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') || isProduction ? { rejectUnauthorized: false } : false
  });
} else {
  pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'college_predictor',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT || 5432,
  });
}

pool.on('connect', () => {
  console.log('Connected to PostgreSQL successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on database client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
