import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut, User } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import HomePage from './pages/HomePage';
import CollegeListPage from './pages/CollegeListPage';
import ComparePage from './pages/ComparePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import CollegeDetailPage from './pages/CollegeDetailPage';
import { api } from './services/api';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Rankings', path: '/colleges' },
  { label: 'Compare', path: '/compare' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminToken = localStorage.getItem('adminToken');

  // Student auth state
  const [student, setStudent] = useState(() => {
    const token = localStorage.getItem('studentToken');
    const name = localStorage.getItem('studentName');
    return token ? { token, name } : null;
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('studentToken');
      const name = localStorage.getItem('studentName');
      setStudent(token ? { token, name } : null);
    };
    const handleOpenAuth = () => {
      setIsSignUp(false);
      setError('');
      setModalOpen(true);
    };
    window.addEventListener('student-auth-change', handleAuthChange);
    window.addEventListener('open-student-auth', handleOpenAuth);
    return () => {
      window.removeEventListener('student-auth-change', handleAuthChange);
      window.removeEventListener('open-student-auth', handleOpenAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentName');
    window.dispatchEvent(new Event('student-auth-change'));
    setMobileOpen(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const res = await api.students.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('studentToken', res.token);
        localStorage.setItem('studentName', res.student.name);
      } else {
        const res = await api.students.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('studentToken', res.token);
        localStorage.setItem('studentName', res.student.name);
      }
      window.dispatchEvent(new Event('student-auth-change'));
      setModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allLinks = adminToken
    ? [...navLinks, { label: 'Dashboard', path: '/admin' }]
    : [...navLinks, { label: 'Admin', path: '/admin' }];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-sm border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="text-[#f59e0b]" size={20} />
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

            {/* Student Auth Badge / Trigger */}
            {student ? (
              <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
                  <User size={13} className="text-[#f59e0b]" />
                  <span className="max-w-[120px] truncate">{student.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setModalOpen(true);
                }}
                className="text-xs border border-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/10 px-3 py-1.5 rounded transition-all duration-200"
              >
                Student Login
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-4 md:hidden">
            {student && (
              <span className="text-xs text-zinc-400 max-w-[80px] truncate">{student.name}</span>
            )}
            <button
              className="text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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

              {student ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[13px] text-rose-400 py-1 text-left"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setIsSignUp(false);
                    setError('');
                    setModalOpen(true);
                  }}
                  className="text-xs border border-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/10 py-2 rounded text-center transition-all duration-200 mt-2"
                >
                  Student Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Student Auth Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#09090b] border border-zinc-800 rounded-lg p-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <GraduationCap className="text-[#f59e0b] mx-auto mb-2" size={32} />
              <h3 className="text-lg font-bold text-white">
                {isSignUp ? 'Create Student Account' : 'Student Login'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {isSignUp ? 'Sign up to write reviews for your college' : 'Log in to write reviews'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-2 bg-rose-950/40 border border-rose-900/60 rounded text-rose-400 text-xs text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider py-2.5 rounded transition-colors mt-2"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Log In'}
              </button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-6 pt-4 border-t border-zinc-900">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-xs text-[#f59e0b] hover:underline"
              >
                {isSignUp ? 'Already have an account? Log In' : 'New student? Create an account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <Analytics />
      </div>
    </Router>
  );
}
