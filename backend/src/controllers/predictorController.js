const db = require('../config/db');

exports.predictColleges = async (req, res) => {
  const { rank, branch, category, region } = req.body;

  if (!rank || !branch || !category) {
    return res.status(400).json({ error: 'Please provide rank, branch, and category' });
  }

  const numericRank = parseInt(rank);
  if (isNaN(numericRank) || numericRank <= 0) {
    return res.status(400).json({ error: 'Rank must be a positive integer number' });
  }

  try {
    // Select matching cutoffs from database.
    // Fetch colleges where closing_rank is >= 0.85 * student_rank to show "Safe", "Target" and "Reach" options.
    let queryText = `
      SELECT 
        c.id, c.name, c.code, c.district, c.region, c.type, c.autonomous, 
        c.naac_grade, c.nba_status, c.website, c.logo_url, c.priority,
        co.branch, co.category, co.closing_rank, co.year
      FROM colleges c
      JOIN college_cutoffs co ON c.id = co.college_id
      WHERE co.branch = $1 
        AND co.category = $2 
        AND co.closing_rank >= $3
    `;
    const queryParams = [branch, category, Math.round(numericRank * 0.85)];
    let paramIndex = 4;

    if (region) {
      queryText += ` AND c.region = $${paramIndex}`;
      queryParams.push(region);
      paramIndex++;
    }

    // Sort by ranking priority (lower priority number means higher rank)
    queryText += ` ORDER BY c.priority ASC, co.closing_rank ASC`;

    const result = await db.query(queryText, queryParams);

    // Process and categorise chances for each outcome
    const predictions = result.rows.map((row) => {
      let chance = 'Reach';
      let chanceColor = 'red';
      const difference = row.closing_rank - numericRank;

      if (row.closing_rank >= numericRank * 1.25) {
        chance = 'Safe (High Chance)';
        chanceColor = 'green';
      } else if (row.closing_rank >= numericRank) {
        chance = 'Target (Medium Chance)';
        chanceColor = 'yellow';
      } else {
        chance = 'Reach (Low Chance)';
        chanceColor = 'red';
      }

      return {
        collegeId: row.id,
        name: row.name,
        code: row.code,
        district: row.district,
        region: row.region,
        type: row.type,
        autonomous: row.autonomous,
        naacGrade: row.naac_grade,
        nbaStatus: row.nba_status,
        website: row.website,
        logoUrl: row.logo_url,
        priority: row.priority,
        branch: row.branch,
        category: row.category,
        cutoffRank: row.closing_rank,
        cutoffYear: row.year,
        chance,
        chanceColor
      };
    });

    res.json({
      rank: numericRank,
      branch,
      category,
      region: region || 'ALL',
      predictionsCount: predictions.length,
      predictions
    });
  } catch (error) {
    console.error('Predictor engine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
