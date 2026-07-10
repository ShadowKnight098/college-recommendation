const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function reset() {
  const username = 'admin';
  const password = 'admin123';
  
  console.log(`Generating bcrypt hash for "${password}"...`);
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Clear and insert admin user
    await db.query('DELETE FROM admins WHERE username = $1', [username]);
    await db.query(
      'INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3)',
      [username, hash, 'admin']
    );
    
    console.log(`Successfully reset admin credentials on Neon:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Password reset utility failed:', err.message);
    process.exit(1);
  }
}

reset();
