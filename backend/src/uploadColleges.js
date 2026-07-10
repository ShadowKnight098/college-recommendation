const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function upload() {
  const jsonPath = path.join(__dirname, '../colleges.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('colleges.json file not found.');
    return;
  }
  
  const colleges = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${colleges.length} colleges for upload.`);
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing colleges
    console.log('Truncating existing colleges table...');
    await client.query('TRUNCATE TABLE colleges CASCADE');
    
    console.log('Uploading colleges to Neon PostgreSQL database...');
    let count = 0;
    
    for (const col of colleges) {
      const name = col.institute;
      const code = col.code;
      const place = col.place;
      const district = col.district;
      // Map place & district code together for rich location data
      const location = `${place} (${district})`;
      const region = col.region;
      const type = col.type === 'PVT' ? 'Private' : col.type === 'UNIV' ? 'University' : col.type === 'SF' ? 'Self Finance' : col.type;
      const priority = parseInt(col.priority) || 9999;
      
      await client.query(
        `INSERT INTO colleges (name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          name, 
          code, 
          location, // Storing "KANIGIRI (PKS)" as location/district
          region, 
          type, 
          false, // autonomous
          null,  // naac
          'Not Accredited', 
          null,  // website
          '/uploads/default-logo.png', 
          priority
        ]
      );
      count++;
    }
    
    await client.query('COMMIT');
    console.log(`Success! Inserted ${count} colleges into your Neon database!`);
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Upload transaction failed and rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

upload();
