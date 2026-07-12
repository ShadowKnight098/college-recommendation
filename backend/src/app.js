const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Visitor Tracking Middleware - tracks daily visits automatically
app.use(async (req, res, next) => {
  // Exclude admin stats endpoints to avoid inflating visitor stats during admin operations
  if (!req.path.startsWith('/api/auth/stats') && req.method === 'GET') {
    try {
      await db.query(`
        INSERT INTO page_visits (visit_date, count) 
        VALUES (CURRENT_DATE, 1) 
        ON CONFLICT (visit_date) 
        DO UPDATE SET count = page_visits.count + 1
      `);
    } catch (err) {
      console.error('Error updating page visits tracker:', err.message);
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
