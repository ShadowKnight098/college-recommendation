const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Apply Helmet security headers with cross-origin resource sharing enabled for static uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply rate limiting on API endpoints to prevent brute-force and DoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Enable CORS for trusted origins only
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:5173', 'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, false); // Reject gracefully in CORS rather than throwing a 500 error
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit body sizes to prevent large payload DoS
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
