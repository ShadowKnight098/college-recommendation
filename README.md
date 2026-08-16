# 🎓 RankEdge — Andhra Pradesh Engineering Colleges Ranking & Comparison Portal

[![Live App](https://img.shields.io/badge/Live_Site-collegerecommedation.vercel.app-f59e0b?style=for-the-badge&logo=vercel&logoColor=white)](https://collegerecommedation.vercel.app/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Neon DB](https://img.shields.io/badge/Neon_Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/OWASP_Top_10-Hardened-red?style=for-the-badge&logo=shield&logoColor=white)](https://owasp.org/)

---

Welcome to **RankEdge**, a full-stack, priority-driven engineering college discovery and comparison portal built for students across Andhra Pradesh (AP EAPCET / EAMCET). 

RankEdge indexes **196+ engineering institutions** across AP, organizing them by official counselling priority ranks, university regions (AU, SVU), district boundaries, NAAC/NBA accreditation tiers, and autonomous governance status.

🌐 **Live Web Application:** [https://collegerecommedation.vercel.app/](https://collegerecommedation.vercel.app/)

---

## 🌟 Why RankEdge?

During AP EAPCET counselling, students face overwhelming choices across hundreds of engineering colleges. Official lists are often static, hard to search, and lack side-by-side comparative views.

**RankEdge resolves this by offering:**
- **Instant Search:** Sub-millisecond fuzzy search by college name or code powered by PostgreSQL GIN Trigram indexes (`pg_trgm`).
- **Dynamic Comparison Matrix:** Compare up to 4 colleges side-by-side across academic standing, NAAC grades, autonomous status, branch seat counts, and multi-dimensional student ratings.
- **Student Reviews System:** Authenticated student feedback broken down by Placements, Faculty Quality, Infrastructure, Hostels, and Campus Life.
- **Mobile-First Experience:** Tailored responsive layouts, mobile drawer navigation, native Web Share API (WhatsApp/Social sharing), and local favorites saving.
- **Community Transparency:** Dedicated `/progress` page for tracking feature roadmap, voting on upcoming features, and submitting feedback.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Vercel Edge Platform)"]
        Browser["React 18 SPA (Vite)"]
        Router["React Router v6"]
        Analytics["Vercel Analytics (@vercel/analytics)"]
        Browser --> Router
        Browser --> Analytics
    end

    subgraph Hosting ["Hosting Environment"]
        VercelFrontend["Vercel (Frontend SSL Hosting)"]
        RenderBackend["Render / Node.js (Backend API Proxy)"]
    end

    subgraph Server ["Backend Layer (Express REST API)"]
        App["Express.js App (Port 5000)"]
        AuthMiddleware["JWT Authentication Middleware"]
        HelmetSec["Helmet Security Headers & CORP"]
        RateLimiter["Express Rate Limiter (150 req/15min)"]
        CORS["CORS Dynamic Whitelist"]
        
        App --> HelmetSec
        App --> RateLimiter
        App --> CORS
        App --> AuthMiddleware
    end

    subgraph Data ["Data Layer (Cloud Infrastructure)"]
        NeonDB[("Neon PostgreSQL Database")]
        TrigramIndex[("GIN Trigram Indexes (pg_trgm)")]
        NeonDB --- TrigramIndex
    end

    Browser -->|HTTPS API Requests| RenderBackend
    RenderBackend --> App
    App -->|SQL Queries (pg Pool)| NeonDB
```

---

## ✨ Key Features & Capabilities

### 🏆 1. Priority-Based College Directory (`/colleges`)
- Displays all **196+ engineering colleges** in AP sorted by administrator priority order.
- **Instant Debounced Search:** Filters colleges as you type with a 250ms debounce and GIN trigram backend queries.
- **Multi-Filter System:** Filter instantly by:
  - **Region:** AU (Andhra University), SVU (Sri Venkateswara University), SVE, OU.
  - **District:** All 26 AP districts (Visakhapatnam, NTR, Guntur, Chittoor, etc.).
  - **Type:** Engineering, Medical, Technical.
  - **Governance:** Autonomous vs. University Affiliated.
  - **Favorites:** Toggle "Favorites Only" view stored locally.
- **View Toggle:** Switch between Grid Card View and Compact List View.

### 📊 2. Side-by-Side Comparison Matrix (`/compare`)
- Select up to **4 colleges** simultaneously.
- Compare side-by-side metrics:
  - Priority Rank & College Code
  - Region & District
  - Autonomous status & Accreditation (NAAC Grade, NBA Status)
  - Visual rating progress meters (Placements, Faculty, Infra, Hostels, Campus Life)
  - Available branch offerings & estimated fee ranges
- Sticky mobile comparison bar to quickly jump into matrix mode from any page.

### 💬 3. Student Reviews & Ratings (`/colleges/:id`)
- Authenticated student review system.
- Multi-metric breakdown (1 to 5 stars) across:
  - Overall Quality
  - Placements Rating
  - Faculty Quality
  - Infrastructure
  - Hostel & Food
  - Campus Life
- Admin approval workflow before reviews go live to ensure content quality.

### 🗺️ 4. Interactive Progress & Roadmap (`/progress`)
- Transparent roadmap tracking future platform milestones:
  - 🎯 *Previous Year Cut-off Rank Matcher (EAPCET rank predictor)*
  - 🖼️ *Full Campus & Media Gallery*
  - 📈 *Comprehensive Placements Dashboard*
- Community upvoting system with local storage persistence.
- Student feature request submission form.

### 🛡️ 5. OWASP Top 10 Security Hardening
- **Helmet Security Headers:** Protection against XSS, clickjacking, MIME sniffing, and CORP asset protection for `/uploads`.
- **Express Rate Limiting:** Limits requests to `150 req / 15 minutes` per IP address to prevent brute-force attacks and DoS.
- **Trust Proxy Configuration:** Configured `app.set('trust proxy', 1)` to handle cloud load balancers (Render/Vercel) safely.
- **Strict Role-Based Authorization:** Prevents privilege escalation by checking JWT decoded roles (`role === 'admin'`).
- **Dynamic CORS Whitelisting:** Safely whitelists local origins (`localhost:3000`, `localhost:5173`) and wildcard `.vercel.app` subdomains.
- **Upload Restrictions:** Multer configuration enforces a `5MB` limit and strict CSV-only MIME type checks.

---

## 🗄️ Database Schema & Data Model

The database is built on **Neon PostgreSQL** and utilizes the `pg_trgm` extension for fast text matching.

```sql
-- Core Colleges Entity
CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  district VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  autonomous BOOLEAN DEFAULT false,
  naac_grade VARCHAR(10),
  nba_status VARCHAR(50) DEFAULT 'Not Accredited',
  website VARCHAR(255),
  logo_url TEXT DEFAULT '/uploads/default-logo.png',
  image_url VARCHAR(500),
  priority INTEGER NOT NULL DEFAULT 9999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branch & Intake Allocations
CREATE TABLE college_branches (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  branch_code VARCHAR(50) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 0,
  leftover_seats INTEGER NOT NULL DEFAULT 0,
  fee VARCHAR(100) NOT NULL
);

-- Student Users
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- College Reviews & Ratings
CREATE TABLE college_reviews (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  placements_rating INTEGER CHECK (placements_rating >= 1 AND placements_rating <= 5) NOT NULL DEFAULT 5,
  faculty_rating INTEGER CHECK (faculty_rating >= 1 AND faculty_rating <= 5) NOT NULL DEFAULT 5,
  infrastructure_rating INTEGER CHECK (infrastructure_rating >= 1 AND infrastructure_rating <= 5) NOT NULL DEFAULT 5,
  hostels_rating INTEGER CHECK (hostels_rating >= 1 AND hostels_rating <= 5) NOT NULL DEFAULT 5,
  campus_life_rating INTEGER CHECK (campus_life_rating >= 1 AND campus_life_rating <= 5) NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  post_anonymously BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_college_review UNIQUE (college_id, student_id)
);

-- Admin Users
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/colleges` | Public | Fetch colleges with search, filters (`district`, `region`, `type`, `autonomous`), sorting & pagination |
| `GET` | `/api/colleges/filters` | Public | Get distinct filter options for regions, districts, and college types |
| `GET` | `/api/colleges/:id` | Public | Get college details along with branch seat allocations |
| `POST` | `/api/colleges` | Admin | Create a new college listing |
| `PUT` | `/api/colleges/:id` | Admin | Update college listing details or cover banner image URL |
| `DELETE` | `/api/colleges/:id` | Admin | Delete a college listing |
| `POST` | `/api/colleges/import` | Admin | Bulk import colleges via CSV upload (Max 5MB) |
| `POST` | `/api/students/signup` | Public | Register student account |
| `POST` | `/api/students/login` | Public | Authenticate student and issue JWT token |
| `GET` | `/api/reviews/college/:id` | Public | Fetch approved student reviews for a college |
| `POST` | `/api/reviews` | Student | Submit a college review |
| `PUT` | `/api/reviews/:id/approve` | Admin | Approve pending review |
| `POST` | `/api/auth/login` | Public | Admin login |

---

## 💻 Tech Stack Summary

- **Frontend:** React 18, Vite 5, React Router v6, Tailwind CSS v4, Lucide Icons, `@vercel/analytics`.
- **Backend:** Node.js, Express.js 4, PostgreSQL `pg` pool, `bcryptjs`, `jsonwebtoken`, `cors`, `helmet`, `express-rate-limit`, `multer`, `csv-parser`.
- **Database Cloud:** Neon PostgreSQL with `pg_trgm` GIN Trigram Search Indexes.
- **Hosting & Deployment:**
  - **Frontend:** Vercel Edge Platform
  - **Backend:** Render Web Services (Node Server)

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/)
- PostgreSQL database (Local or Neon Cloud instance)

### 1. Clone Repository
```bash
git clone https://github.com/ShadowKnight098/college-recommendation.git
cd college-recommendation
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173
```

Initialize the database schema:
```bash
# Execute schema.sql in PostgreSQL
psql -d college_db -f schema.sql
```

Run database performance indexing script:
```bash
node src/scripts/create_indexes.js
```

Start backend development server:
```bash
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Start frontend Vite server:
```bash
npm run dev
```
*(Frontend runs on `http://localhost:3000` or `http://localhost:5173`)*

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
4. Deploy!

### Backend (Render)
1. Create a Web Service on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: `your_neon_db_connection_url?sslmode=require`
   - `JWT_SECRET`: `your_secret`
   - `ALLOWED_ORIGINS`: `https://collegerecommedation.vercel.app`

---

## 👨‍💻 Author & Maintainer

Built with ❤️ for engineering aspirants in Andhra Pradesh.

- **Developer:** [ShadowKnight098](https://github.com/ShadowKnight098)
- **Live Portal:** [RankEdge on Vercel](https://collegerecommedation.vercel.app/)

---

*© 2026 RankEdge — AP Engineering Rankings Portal. All rights reserved.*
