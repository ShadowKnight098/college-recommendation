const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/db');

exports.getAllColleges = async (req, res) => {
  const { district, type, region, autonomous, search, sortBy, order, ids, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let queryText = 'SELECT *, (SELECT json_agg(branch_code) FROM college_branches WHERE college_id = colleges.id) as branches FROM colleges WHERE 1=1';
  const queryParams = [];
  let paramIndex = 1;

  if (ids) {
    const idArray = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (idArray.length > 0) {
      queryText += ` AND id = ANY($${paramIndex})`;
      queryParams.push(idArray);
      paramIndex++;
    } else {
      queryText += ` AND 1=0`; // Force empty result if list is empty
    }
  }

  if (district) {
    queryText += ` AND district = $${paramIndex}`;
    queryParams.push(district);
    paramIndex++;
  }
  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    queryParams.push(type);
    paramIndex++;
  }
  if (region) {
    queryText += ` AND region = $${paramIndex}`;
    queryParams.push(region);
    paramIndex++;
  }
  if (autonomous !== undefined && autonomous !== '') {
    queryText += ` AND autonomous = $${paramIndex}`;
    queryParams.push(autonomous === 'true');
    paramIndex++;
  }
  if (search) {
    queryText += ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  // Count total matching colleges (for pagination metadata)
  let countQueryText = 'SELECT COUNT(*) ' + queryText.substring(queryText.indexOf('FROM colleges'));
  const countResult = await db.query(countQueryText, queryParams);
  const totalCount = parseInt(countResult.rows[0].count);

  // Sorting: Lower priority number means higher ranking, so default sort is priority ASC
  const validSortColumns = ['name', 'priority', 'district', 'region', 'type'];
  const activeSort = validSortColumns.includes(sortBy) ? sortBy : 'priority';
  const activeOrder = order === 'DESC' ? 'DESC' : 'ASC';
  queryText += ` ORDER BY ${activeSort} ${activeOrder}`;

  // Pagination limits
  queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(parseInt(limit), parseInt(offset));

  try {
    const result = await db.query(queryText, queryParams);
    res.json({
      colleges: result.rows,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Fetch colleges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCollegeById = async (req, res) => {
  const { id } = req.params;
  try {
    const collegeRes = await db.query('SELECT * FROM colleges WHERE id = $1', [id]);
    if (collegeRes.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const branchesRes = await db.query('SELECT * FROM college_branches WHERE college_id = $1 ORDER BY branch_code', [id]);
    res.json({
      college: collegeRes.rows[0],
      branches: branchesRes.rows
    });
  } catch (error) {
    console.error('Fetch college detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCollege = async (req, res) => {
  const { name, code, district, region, type, autonomous, naac_grade, nba_status, website, priority, logo_url, image_url } = req.body;

  if (!name || !code || !district || !region || !type) {
    return res.status(400).json({ error: 'Name, code, district, region, and type are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO colleges (name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, image_url, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, code, district, region, type, autonomous || false, naac_grade || null, nba_status || 'Not Accredited', website || null, logo_url || '/uploads/default-logo.png', image_url || null, priority || 9999]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A college with this code already exists' });
    }
    console.error('Create college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCollege = async (req, res) => {
  const { id } = req.params;
  const { name, code, district, region, type, autonomous, naac_grade, nba_status, website, priority, logo_url, image_url } = req.body;

  try {
    const existing = await db.query('SELECT * FROM colleges WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const result = await db.query(
      `UPDATE colleges 
       SET name = $1, code = $2, district = $3, region = $4, type = $5, autonomous = $6, naac_grade = $7, 
           nba_status = $8, website = $9, logo_url = $10, image_url = $11, priority = $12
       WHERE id = $13 RETURNING *`,
      [
        name || existing.rows[0].name,
        code || existing.rows[0].code,
        district || existing.rows[0].district,
        region || existing.rows[0].region,
        type || existing.rows[0].type,
        autonomous !== undefined ? autonomous : existing.rows[0].autonomous,
        naac_grade !== undefined ? naac_grade : existing.rows[0].naac_grade,
        nba_status || existing.rows[0].nba_status,
        website !== undefined ? website : existing.rows[0].website,
        logo_url || existing.rows[0].logo_url,
        image_url !== undefined ? image_url : existing.rows[0].image_url,
        priority !== undefined ? priority : existing.rows[0].priority,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCollege = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM colleges WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json({ message: 'College deleted successfully', college: result.rows[0] });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file' });
  }

  const results = [];
  const errors = [];
  let successCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // Clean properties
      const cleaned = {
        name: data.name?.trim(),
        code: data.code?.trim()?.toUpperCase(),
        district: data.district?.trim(),
        region: data.region?.trim()?.toUpperCase(),
        type: data.type?.trim(),
        autonomous: data.autonomous?.trim()?.toLowerCase() === 'true',
        naac_grade: data.naac_grade?.trim() || null,
        nba_status: data.nba_status?.trim() || 'Not Accredited',
        website: data.website?.trim() || null,
        logo_url: data.logo_url?.trim() || '/uploads/default-logo.png',
        priority: parseInt(data.priority) || 9999
      };
      results.push(cleaned);
    })
    .on('end', async () => {
      // Execute sequential insertion in a transaction
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        for (const college of results) {
          if (!college.name || !college.code || !college.district || !college.region || !college.type) {
            errors.push(`Row validation failed for: ${college.name || 'Unknown'}. Missing core parameters.`);
            continue;
          }
          try {
            await client.query(
              `INSERT INTO colleges (name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, priority)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
               ON CONFLICT (code) DO UPDATE 
               SET name = EXCLUDED.name, district = EXCLUDED.district, region = EXCLUDED.region, type = EXCLUDED.type, 
                   autonomous = EXCLUDED.autonomous, naac_grade = EXCLUDED.naac_grade, nba_status = EXCLUDED.nba_status, 
                   website = EXCLUDED.website, logo_url = EXCLUDED.logo_url, priority = EXCLUDED.priority`,
              [
                college.name, college.code, college.district, college.region, college.type,
                college.autonomous, college.naac_grade, college.nba_status, college.website,
                college.logo_url, college.priority
              ]
            );
            successCount++;
          } catch (insertErr) {
            errors.push(`Failed to insert ${college.name} (${college.code}): ${insertErr.message}`);
          }
        }
        await client.query('COMMIT');
        
        // Remove temporary uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({
          message: `CSV import completed. Successful entries: ${successCount}. Failures: ${errors.length}`,
          successCount,
          errors
        });
      } catch (transactionErr) {
        await client.query('ROLLBACK');
        console.error('Import transaction rollback error:', transactionErr);
        res.status(500).json({ error: 'Failed to complete database updates during transaction import.' });
      } finally {
        client.release();
      }
    });
};

exports.getFilterOptions = async (req, res) => {
  try {
    const regionsRes = await db.query('SELECT DISTINCT region FROM colleges WHERE region IS NOT NULL AND region != \'\' ORDER BY region');
    const districtsRes = await db.query('SELECT DISTINCT district FROM colleges WHERE district IS NOT NULL AND district != \'\' ORDER BY district');
    const typesRes = await db.query('SELECT DISTINCT type FROM colleges WHERE type IS NOT NULL AND type != \'\' ORDER BY type');

    res.json({
      regions: regionsRes.rows.map(r => r.region),
      districts: districtsRes.rows.map(d => d.district),
      types: typesRes.rows.map(t => t.type)
    });
  } catch (error) {
    console.error('Fetch filter options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.importBranches = async (req, res) => {
  const { collegesBranches } = req.body;
  if (!collegesBranches || !Array.isArray(collegesBranches)) {
    return res.status(400).json({ error: 'Invalid payload. Must be an array of college objects with branches.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    let successCount = 0;
    for (const item of collegesBranches) {
      const { collegeCode, branches } = item;
      if (!collegeCode || !Array.isArray(branches)) continue;

      // Find the college ID or auto-create it if missing
      const colRes = await client.query('SELECT id FROM colleges WHERE code = $1', [collegeCode]);
      let collegeId;
      if (colRes.rows.length === 0) {
        const insertCol = await client.query(
          `INSERT INTO colleges (name, code, district, region, type, autonomous, priority, logo_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [collegeCode, collegeCode, 'Chittoor', 'SVE', 'Engineering', false, 100, '/uploads/default-logo.png']
        );
        collegeId = insertCol.rows[0].id;
      } else {
        collegeId = colRes.rows[0].id;
      }

      // Clear existing branches for this college to prevent duplicates
      await client.query('DELETE FROM college_branches WHERE college_id = $1', [collegeId]);

      // Insert new branches
      for (const br of branches) {
        const brCode = br.branchCode || br.code;
        const brName = br.branchName || br.name;
        const totalSeats = br.totalSeats !== undefined ? br.totalSeats : (br.total || 0);
        const leftoverSeats = br.leftoverSeats !== undefined ? br.leftoverSeats : (br.leftover || 0);
        const fee = br.fee;

        await client.query(
          `INSERT INTO college_branches (college_id, branch_code, branch_name, total_seats, leftover_seats, fee)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [collegeId, brCode, brName, totalSeats, leftoverSeats, fee]
        );
      }
      successCount++;
    }

    await client.query('COMMIT');
    res.json({ message: `Successfully imported branches for ${successCount} colleges.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import branches transaction error:', err);
    res.status(500).json({ error: 'Failed to import branches.' });
  } finally {
    client.release();
  }
};
