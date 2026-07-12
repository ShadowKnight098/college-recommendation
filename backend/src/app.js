const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const studentRoutes = require('./routes/studentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Visitor Tracking Middleware - tracks unique daily visitors
app.use(async (req, res, next) => {
  // Exclude static assets/uploads/admin stats
  if (!req.path.startsWith('/api/auth/stats') && !req.path.startsWith('/uploads') && req.method === 'GET') {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
      
      // Try to record the unique visit for today
      const uniqueRes = await db.query(`
        INSERT INTO daily_unique_ips (visit_date, ip_hash)
        VALUES (CURRENT_DATE, $1)
        ON CONFLICT (visit_date, ip_hash) DO NOTHING
        RETURNING visit_date
      `, [ipHash]);

      // If it was a new unique visit today, increment the counter
      if (uniqueRes.rows.length > 0) {
        await db.query(`
          INSERT INTO page_visits (visit_date, count) 
          VALUES (CURRENT_DATE, 1) 
          ON CONFLICT (visit_date) 
          DO UPDATE SET count = page_visits.count + 1
        `);
      }
    } catch (err) {
      console.error('Error updating unique page visits tracker:', err.message);
    }
  }
  next();
});

// Register REST API routers
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reviews', reviewRoutes);

// Base route info
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the College Predictor & Ranking API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Internal server error occurred' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
