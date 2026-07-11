const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide both username and password' });
  }

  try {
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL SECURITY ALERT: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ error: 'Internal server configuration error.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      secret,
      { expiresIn: '24h' }
    );

    res.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    // 1. Total Colleges
    const collegesRes = await db.query('SELECT COUNT(*) FROM colleges');
    // 2. Total Feedbacks
    const feedbacksRes = await db.query('SELECT COUNT(*) FROM feedbacks');
    // 3. Total Visits (sum of all visits count)
    const visitsRes = await db.query('SELECT SUM(count) as total FROM page_visits');
    // 4. Daily visits analytics for chart (last 7 entries)
    const visitsHistory = await db.query('SELECT visit_date, count FROM page_visits ORDER BY visit_date DESC LIMIT 7');
    
    // 5. Recent Activities
    const recentColleges = await db.query('SELECT name, code, created_at FROM colleges ORDER BY created_at DESC LIMIT 3');
    const recentFeedbacks = await db.query('SELECT name, subject, created_at FROM feedbacks ORDER BY created_at DESC LIMIT 3');

    const recentActivities = [
      ...recentColleges.rows.map(c => ({
        type: 'college',
        message: `Added new college: ${c.name} (${c.code})`,
        time: c.created_at
      })),
      ...recentFeedbacks.rows.map(f => ({
        type: 'feedback',
        message: `Received feedback from ${f.name}: "${f.subject}"`,
        time: f.created_at
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      totalColleges: parseInt(collegesRes.rows[0].count || 0),
      totalFeedbacks: parseInt(feedbacksRes.rows[0].count || 0),
      totalVisits: parseInt(visitsRes.rows[0].total || 0),
      visitsHistory: visitsHistory.rows.reverse(),
      recentActivities: recentActivities.slice(0, 5)
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
