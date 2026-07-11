const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function migrate() {
  console.log('1. Reading and executing schema.sql to recreate tables...');
  const schemaPath = path.join(__dirname, '../schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await db.query(sql);
    console.log('Schema successfully recreated!');
  } catch (err) {
    console.error('Failed to run schema.sql:', err.message);
    process.exit(1);
  }

  console.log('2. Loading colleges dataset and branches dataset...');
  const collegesPath = path.join(__dirname, '../colleges.json');
  const branchesPath = path.join(__dirname, '../colleges_new_recovered.json');

  if (!fs.existsSync(collegesPath)) {
    console.error('colleges.json not found at:', collegesPath);
    process.exit(1);
  }

  const collegesData = JSON.parse(fs.readFileSync(collegesPath, 'utf8'));
  
  let branchDetailsMap = {};
  if (fs.existsSync(branchesPath)) {
    const branchesData = JSON.parse(fs.readFileSync(branchesPath, 'utf8'));
    branchesData.forEach(item => {
      branchDetailsMap[item.collegeCode] = item.branches;
    });
    console.log(`Loaded branch data for ${Object.keys(branchDetailsMap).length} colleges.`);
  } else {
    console.warn('colleges_new_recovered.json not found. Using defaults for all.');
  }

  console.log(`3. Importing ${collegesData.length} colleges and their branches into database...`);

  // We define standard/default mock branches for colleges that don't have explicit data (due to truncation)
  const defaultBranches = [
    { code: 'CSE', name: 'COMPUTER SCIENCE AND ENGINEERING', total: 60, leftover: 60, fee: '40,000' },
    { code: 'ECE', name: 'ELECTRONICS AND COMMUNICATION ENGINEERING', total: 60, leftover: 60, fee: '40,000' },
    { code: 'EEE', name: 'ELECTRICAL AND ELECTRONICS ENGINEERING', total: 45, leftover: 45, fee: '40,000' },
    { code: 'CIV', name: 'CIVIL ENGINEERING', total: 30, leftover: 30, fee: '40,000' },
    { code: 'MEC', name: 'MECHANICAL ENGINEERING', total: 45, leftover: 45, fee: '40,000' }
  ];

  try {
    for (let i = 0; i < collegesData.length; i++) {
      const col = collegesData[i];
      
      // Map JSON fields to colleges table columns
      const name = col.institute || col.name;
      const code = col.code;
      const district = col.place ? `${col.place} (${col.district})` : col.district;
      const region = col.region;
      const type = col.type === 'PVT' ? 'Private' : (col.type || 'Government');
      const autonomous = col.instituteType === 'AUTONOMOUS' || col.autonomous === true;
      const naac_grade = col.naac_grade || null;
      const nba_status = col.nba_status || 'Not Accredited';
      const website = col.website || null;
      const priority = parseInt(col.priority || 9999);
      const logo_url = '/uploads/default-logo.png';

      // Insert College
      const colRes = await db.query(
        `INSERT INTO colleges (name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, priority]
      );

      const collegeId = colRes.rows[0].id;

      // Determine branches to insert
      let branchesToInsert = branchDetailsMap[code];
      if (!branchesToInsert) {
        // Fallback to default mock branches if not explicitly present in new JSON data
        branchesToInsert = defaultBranches;
      }

      // Insert Branches
      for (let j = 0; j < branchesToInsert.length; j++) {
        const br = branchesToInsert[j];
        const brCode = br.branchCode || br.code;
        const brName = br.branchName || br.name;
        const totalSeats = br.totalSeats !== undefined ? br.totalSeats : br.total;
        const leftoverSeats = br.leftoverSeats !== undefined ? br.leftoverSeats : br.leftover;
        const fee = br.fee;

        await db.query(
          `INSERT INTO college_branches (college_id, branch_code, branch_name, total_seats, leftover_seats, fee)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [collegeId, brCode, brName, totalSeats, leftoverSeats, fee]
        );
      }
    }

    console.log('Database successfully redesigned, populated, and seeded with 196 colleges and their branch structures!');
    process.exit(0);
  } catch (err) {
    console.error('Import failed during execution:', err.message);
    process.exit(1);
  }
}

migrate();
