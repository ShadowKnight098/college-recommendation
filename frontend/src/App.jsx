import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import CollegeListPage from './pages/CollegeListPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import CollegeDetailPage from './pages/CollegeDetailPage';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Rankings', path: '/colleges' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem('adminToken');

  const allLinks = token
    ? [...navLinks, { label: 'Dashboard', path: '/admin' }]
    : [...navLinks, { label: 'Admin', path: '/admin' }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-sm border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="text-emerald-500" size={20} />
          <span className="text-sm font-semibold text-white tracking-tight">RankEdge</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {allLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[13px] transition-colors ${
                location.pathname === link.path
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#09090b] border-b border-zinc-900 px-6 pb-4">
          <div className="flex flex-col gap-3 pt-2">
            {allLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`text-[13px] py-1 transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs text-zinc-600">© 2025 RankEdge</span>
        <div className="flex gap-6">
          <Link to="/colleges" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Rankings</Link>
          <Link to="/about" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">About</Link>
          <Link to="/contact" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#09090b]">
        <Navbar />
        <main className="flex-grow pt-14">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/colleges" element={<CollegeListPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
