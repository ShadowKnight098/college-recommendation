-- Create pg_trgm extension for fuzzy search (if supported, optional)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop tables if they exist
DROP TABLE IF EXISTS daily_unique_ips CASCADE;
DROP TABLE IF EXISTS page_visits CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS college_branches CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;

-- 1. Colleges Table
CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  district VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL, -- Region Code: e.g., SVE, AUC, OU, AU, SVU
  type VARCHAR(100) NOT NULL, -- e.g., Engineering, Medical
  autonomous BOOLEAN DEFAULT false,
  naac_grade VARCHAR(10),
  nba_status VARCHAR(50) DEFAULT 'Not Accredited', -- Accredited / Not Accredited
  website VARCHAR(255),
  logo_url TEXT DEFAULT '/uploads/default-logo.png',
  priority INTEGER NOT NULL DEFAULT 9999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1b. College Branches & Seats Table
CREATE TABLE college_branches (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  branch_code VARCHAR(50) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 0,
  leftover_seats INTEGER NOT NULL DEFAULT 0,
  fee VARCHAR(100) NOT NULL
);

-- 2. Feedbacks Table
CREATE TABLE feedbacks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admin Users Table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4b. Students Table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4c. College Reviews Table
CREATE TABLE college_reviews (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  post_anonymously BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_college_review UNIQUE (college_id, student_id)
);

-- 5. Page Visits Analytics Table
CREATE TABLE page_visits (
  id SERIAL PRIMARY KEY,
  visit_date DATE UNIQUE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1
);

-- 5b. Daily Unique IPs Tracker (for unique visitor counting)
CREATE TABLE daily_unique_ips (
  visit_date DATE DEFAULT CURRENT_DATE,
  ip_hash VARCHAR(64) NOT NULL,
  PRIMARY KEY (visit_date, ip_hash)
);

-- Indexes for Optimization
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_region ON colleges(region);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_priority ON colleges(priority ASC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved_college ON college_reviews(college_id) WHERE approved = true;

-- ────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────

-- Seed Admin User (username: admin, password: admin123)
-- Hash generated using bcrypt ($2a$10$wU/2Wf6.xVepO15t35JqZeqZ.17zG5W.lZ69uO29pD0pG63k4n3Iq)
INSERT INTO admins (username, password_hash, role) VALUES 
('admin', '$2a$10$wU/2Wf6.xVepO15t35JqZeqZ.17zG5W.lZ69uO29pD0pG63k4n3Iq', 'admin');



-- Seed some visits
INSERT INTO page_visits (visit_date, count) VALUES
(CURRENT_DATE - INTERVAL '3 days', 124),
(CURRENT_DATE - INTERVAL '2 days', 167),
(CURRENT_DATE - INTERVAL '1 day', 215),
(CURRENT_DATE, 45);

-- Seed Feedbacks
INSERT INTO feedbacks (name, email, subject, message) VALUES
('John Doe', 'john@example.com', 'Feature Request', 'Could you add region details for more colleges? The rankings work great!'),
('Jane Smith', 'jane@example.com', 'Partnership', 'We are interested in listing our educational consultancy services on your ranking portal.');
