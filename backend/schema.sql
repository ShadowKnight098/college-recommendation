-- Create pg_trgm extension for fuzzy search (if supported, optional)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop tables if they exist
DROP TABLE IF EXISTS page_visits CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
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

-- 4. Page Visits Analytics Table
CREATE TABLE page_visits (
  id SERIAL PRIMARY KEY,
  visit_date DATE UNIQUE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1
);

-- Indexes for Optimization
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_region ON colleges(region);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_priority ON colleges(priority ASC);

-- ────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────

-- Seed Admin User (username: admin, password: admin123)
-- Hash generated using bcrypt ($2a$10$wU/2Wf6.xVepO15t35JqZeqZ.17zG5W.lZ69uO29pD0pG63k4n3Iq)
INSERT INTO admins (username, password_hash, role) VALUES 
('admin', '$2a$10$wU/2Wf6.xVepO15t35JqZeqZ.17zG5W.lZ69uO29pD0pG63k4n3Iq', 'admin');

-- Seed Colleges (10 Samples)
INSERT INTO colleges (name, code, district, region, type, autonomous, naac_grade, nba_status, website, logo_url, priority) VALUES
('Sri Venkateswara College of Engineering', 'SVCE', 'Chittoor', 'SVE', 'Engineering', true, 'A+', 'Accredited', 'https://www.svce.edu.in', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128', 1),
('Andhra University College of Engineering', 'AUCE', 'Visakhapatnam', 'AUC', 'Engineering', false, 'A++', 'Accredited', 'https://www.andhrauniversity.edu.in', 'https://images.unsplash.com/photo-1562774053-701939374585?w=128', 2),
('Osmania University College of Engineering', 'OUCE', 'Hyderabad', 'OU', 'Engineering', false, 'A', 'Accredited', 'https://www.uceou.edu', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128', 3),
('Sri Vidyanikethan Engineering College', 'SVEC', 'Tirupati', 'SVE', 'Engineering', true, 'A', 'Accredited', 'https://svec.education', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128', 4),
('Aditya Engineering College', 'ADIT', 'East Godavari', 'AUC', 'Engineering', true, 'B++', 'Not Accredited', 'https://aec.edu.in', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128', 5),
('GMR Institute of Technology', 'GMRIT', 'Srikakulam', 'AUC', 'Engineering', true, 'A', 'Accredited', 'http://www.gmrit.org', 'https://images.unsplash.com/photo-1562774053-701939374585?w=128', 6),
('Siddharth Institute of Engineering and Technology', 'SIET', 'Chittoor', 'SVE', 'Engineering', true, 'A', 'Not Accredited', 'http://siddharthgroup.ac.in', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128', 7),
('JNTU College of Engineering', 'JNTUA', 'Anantapur', 'SVE', 'Engineering', false, 'A', 'Accredited', 'https://www.jntua.ac.in', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128', 8),
('Gayatri Vidya Parishad College of Engineering', 'GVPCOE', 'Visakhapatnam', 'AUC', 'Engineering', true, 'A', 'Accredited', 'http://gvpce.ac.in', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128', 9),
('Vasavi College of Engineering', 'VCE', 'Hyderabad', 'OU', 'Engineering', true, 'A++', 'Accredited', 'http://vce.ac.in', 'https://images.unsplash.com/photo-1562774053-701939374585?w=128', 10);

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
