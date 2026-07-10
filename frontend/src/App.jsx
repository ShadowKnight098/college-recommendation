import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Trophy, Info, PhoneCall, LayoutDashboard, Menu, X } from 'lucide-react';

// Import Pages
import HomePage from './pages/HomePage';
import CollegeListPage from './pages/CollegeListPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminLoggedIn = !!localStorage.getItem('adminToken');

  const navLinks = [
    { path: '/', label: 'Home', icon: GraduationCap },
    { path: '/colleges', label: 'Rankings', icon: Trophy },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: PhoneCall },
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <GraduationCap className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white heading">
            College<span className="gradient-text">Predictor</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-gray-300'
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          
          {isAdminLoggedIn ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              <LayoutDashboard size={16} />
              Admin Panel
            </Link>
          ) : (
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Admin Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-800 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-gray-300 hover:text-indigo-400 py-2 text-base font-medium transition-colors"
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 text-indigo-400 hover:text-white py-2 text-base font-medium transition-colors"
          >
            <LayoutDashboard size={18} />
            {isAdminLoggedIn ? 'Admin Panel' : 'Admin Area'}
          </Link>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-850 bg-slate-950/40 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-white">College Predictor</span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Helping students find and sort top colleges based on region, district, type, and autonomous preferences.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/colleges" className="text-sm text-gray-450 hover:text-white transition">College Rankings</Link>
            <Link to="/about" className="text-sm text-gray-450 hover:text-white transition">About Portal</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">Legal</h4>
          <p className="text-sm text-gray-450 leading-relaxed">
            Disclaimer: Predictions are illustrative calculations based on previous statistics. Actual cutoffs may vary.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-900 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} College Predictor Portal. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0d18]">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/colleges" element={<CollegeListPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
