import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  LayoutDashboard, School, MessageSquare, LineChart, 
  Trash2, Plus, Edit2, UploadCloud, LogOut, KeyRound, 
  CheckCircle, ShieldAlert, Globe, ArrowRight
} from 'lucide-react';

const REGIONS = ['SVE', 'AUC', 'OU', 'AU', 'SVU'];
const DISTRICTS = ['Chittoor', 'Visakhapatnam', 'Hyderabad', 'Tirupati', 'East Godavari', 'Srikakulam', 'Anantapur'];
const TYPES = ['Engineering', 'Medical', 'Arts & Science'];

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [activeTab, setActiveTab] = useState('overview');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Stats States
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Colleges CRUD States
  const [colleges, setColleges] = useState([]);
  const [collegesTotal, setCollegesTotal] = useState(0);
  const [collegesPage, setCollegesPage] = useState(1);
  const [adminSearch, setAdminSearch] = useState('');
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [collegeForm, setCollegeForm] = useState({
    name: '', code: '', district: 'Chittoor', region: 'SVE', type: 'Engineering',
    autonomous: false, naac_grade: 'A', nba_status: 'Not Accredited', website: '',
    logo_url: '', priority: 100
  });

  // Feedbacks States
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  // CSV Import States
  const [csvFile, setCsvFile] = useState(null);
  const [csvLog, setCsvLog] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.auth.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Colleges List
  const fetchColleges = async () => {
    setCollegesLoading(true);
    try {
      const data = await api.colleges.getAll({ page: collegesPage, limit: 6, search: adminSearch });
      setColleges(data.colleges);
      setCollegesTotal(data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
    } finally {
      setCollegesLoading(false);
    }
  };

  // Fetch Feedbacks
  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const data = await api.feedback.getAll();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchColleges();
      fetchFeedbacks();
    }
  }, [token, collegesPage, adminSearch]);

  // Auth Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await api.auth.login(username, password);
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      // Force page refresh to update Navbar state
      window.location.reload();
    } catch (err) {
      setLoginError(err.message || 'Login failed. Invalid admin credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    window.location.reload();
  };

  // CRUD Actions
  const handleAddOrEditCollege = async (e) => {
    e.preventDefault();
    try {
      if (editingCollege) {
        await api.colleges.update(editingCollege.id, collegeForm);
        alert('College details updated successfully!');
      } else {
        await api.colleges.create(collegeForm);
        alert('New college added successfully!');
      }
      setShowCollegeModal(false);
      setEditingCollege(null);
      setCollegeForm({
        name: '', code: '', district: 'Chittoor', region: 'SVE', type: 'Engineering',
        autonomous: false, naac_grade: 'A', nba_status: 'Not Accredited', website: '',
        logo_url: '', priority: 100
      });
      fetchColleges();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  const startEdit = (college) => {
    setEditingCollege(college);
    setCollegeForm({
      name: college.name,
      code: college.code,
      district: college.district,
      region: college.region,
      type: college.type,
      autonomous: college.autonomous,
      naac_grade: college.naac_grade || 'A',
      nba_status: college.nba_status || 'Not Accredited',
      website: college.website || '',
      logo_url: college.logo_url || '',
      priority: college.priority
    });
    setShowCollegeModal(true);
  };

  const handleDeleteCollege = async (id) => {
    if (window.confirm('Are you sure you want to delete this college? All associated cutoff entries will be removed.')) {
      try {
        await api.colleges.delete(id);
        alert('College deleted successfully.');
        fetchColleges();
        fetchStats();
      } catch (err) {
        alert(err.message || 'Deletion failed.');
      }
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      try {
        await api.feedback.delete(id);
        fetchFeedbacks();
        fetchStats();
      } catch (err) {
        alert(err.message || 'Deletion failed.');
      }
    }
  };

  // CSV import handler
  const handleCSVImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvLoading(true);
    setCsvLog(null);
    try {
      const data = await api.colleges.importCSV(csvFile);
      setCsvLog(data);
      alert('CSV processing finished!');
      setCsvFile(null);
      fetchColleges();
      fetchStats();
    } catch (err) {
      alert(err.message || 'CSV Import failed.');
    } finally {
      setCsvLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="py-20 px-6 max-w-sm mx-auto animate-in">
        <div className="card p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-350 flex items-center justify-center mx-auto mb-2">
              <KeyRound size={18} />
            </div>
            <h1 className="text-lg font-semibold text-white">Admin Login</h1>
            <p className="text-xs text-zinc-500">Access college management controls and statistics.</p>
          </div>

          {loginError && (
            <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-zinc-500">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-zinc-500">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full mt-2"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // ADMIN PANEL LAYOUT
  // ────────────────────────────────────────────────────────
  return (
    <div className="py-12 px-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-900">
        <div>
          <h1 className="text-3xl font-extrabold text-white heading">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Configure colleges registry, upload statistics, and inspect feedback responses.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 rounded-xl text-xs font-semibold transition"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-850 gap-4">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'colleges', label: 'Manage Colleges', icon: School },
          { id: 'import', label: 'CSV Importer', icon: UploadCloud },
          { id: 'feedbacks', label: 'Feedbacks Log', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 px-1 transition ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-zinc-500 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────
         TAB: OVERVIEW
         ──────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : stats && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalColleges}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Colleges Registered</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <School size={18} />
                  </div>
                </div>

                <div className="card p-5 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalFeedbacks}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Feedbacks Logged</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                </div>

                <div className="card p-5 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalVisits}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total Viewers</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <LineChart size={18} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Visits history */}
                <div className="md:col-span-3 card p-5 space-y-4">
                  <h3 className="font-semibold text-white text-sm">Visits Tracker (Last 7 Days)</h3>
                  <div className="flex items-end justify-between gap-2 h-44 pt-6 pl-2 pr-2 border-b border-zinc-800">
                    {stats.visitsHistory.map((day, i) => {
                      const maxCount = Math.max(...stats.visitsHistory.map(d => d.count), 1);
                      const barHeight = `${(day.count / maxCount) * 100}%`;
                      return (
                        <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                          <div className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition duration-150 font-bold">{day.count}</div>
                          <div className="w-full bg-emerald-500/10 hover:bg-emerald-500 rounded-t-sm transition duration-300 relative" style={{ height: barHeight }}>
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 hover:opacity-100 transition rounded-t-sm" />
                          </div>
                          <span className="text-[9px] text-zinc-500">{new Date(day.visit_date).toLocaleDateString(undefined, {weekday: 'short'})}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity log */}
                <div className="md:col-span-2 card p-5 space-y-4">
                  <h3 className="font-semibold text-white text-sm">Recent Activities</h3>
                  {stats.recentActivities.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-6 text-center">No recent entries recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentActivities.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs border-b border-zinc-800 pb-2.5 last:border-0 last:pb-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-zinc-300 leading-snug">{act.message}</p>
                            <span className="text-[9px] text-zinc-600">{new Date(act.time).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
         TAB: COLLEGES MANAGEMENT (CRUD)
         ──────────────────────────────────────────────────────── */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white text-sm">Colleges Registered ({collegesTotal})</h3>
            <button
              onClick={() => { setEditingCollege(null); setShowCollegeModal(true); }}
              className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4"
            >
              <Plus size={13} />
              Add College
            </button>
          </div>

          {/* Search bar inside admin colleges CRUD */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search colleges by name or code..."
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setCollegesPage(1);
              }}
              className="input-field py-2.5 text-xs"
            />
          </div>

          {collegesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-gray-900 text-gray-400 uppercase font-bold tracking-wide">
                      <th className="px-4 py-3">College Code & Name</th>
                      <th className="px-4 py-3">District / Region</th>
                      <th className="px-4 py-3">Accreditations</th>
                      <th className="px-4 py-3 text-center">Priority Rank</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colleges.map((college) => (
                      <tr key={college.id} className="border-b border-gray-900 hover:bg-slate-950/20 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{college.code}</div>
                          <div className="text-[10px] text-gray-500">{college.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-300">{college.district}</div>
                          <div className="text-[10px] text-gray-500">Region: {college.region}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold text-[9px] uppercase">NAAC: {college.naac_grade || 'N/A'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold text-[9px] uppercase">NBA: {college.nba_status === 'Accredited' ? 'Accredited' : 'Not'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-indigo-400">
                          #{college.priority}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => startEdit(college)}
                              className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition border border-gray-800"
                              title="Edit college"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCollege(college.id)}
                              className="w-7 h-7 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition border border-rose-500/20"
                              title="Delete college"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => setCollegesPage(p => Math.max(1, p - 1))}
                  disabled={collegesPage === 1}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-gray-800 text-xs text-gray-400 disabled:opacity-40 hover:text-white transition"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-500">Page {collegesPage}</span>
                <button
                  onClick={() => setCollegesPage(p => p + 1)}
                  disabled={colleges.length < 6}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-gray-800 text-xs text-gray-400 disabled:opacity-40 hover:text-white transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Modal Overlay: Add/Edit College */}
          {showCollegeModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card rounded-3xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
                <h3 className="font-extrabold text-white text-base">
                  {editingCollege ? 'Modify College Registry' : 'Add New College Entry'}
                </h3>

                <form onSubmit={handleAddOrEditCollege} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">College Name</label>
                    <input
                      type="text"
                      value={collegeForm.name}
                      onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Code */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">College Code</label>
                    <input
                      type="text"
                      value={collegeForm.code}
                      onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Priority Ranking Rank</label>
                    <input
                      type="number"
                      value={collegeForm.priority}
                      onChange={(e) => setCollegeForm({ ...collegeForm, priority: parseInt(e.target.value) || 9999 })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Region */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Region</label>
                    <select
                      value={collegeForm.region}
                      onChange={(e) => setCollegeForm({ ...collegeForm, region: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* District */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">District</label>
                    <select
                      value={collegeForm.district}
                      onChange={(e) => setCollegeForm({ ...collegeForm, district: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Institution Type</label>
                    <select
                      value={collegeForm.type}
                      onChange={(e) => setCollegeForm({ ...collegeForm, type: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* NAAC Grade */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">NAAC Grade</label>
                    <select
                      value={collegeForm.naac_grade}
                      onChange={(e) => setCollegeForm({ ...collegeForm, naac_grade: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      {['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'N/A'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* Autonomous toggle */}
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="modal-autonomous"
                      checked={collegeForm.autonomous}
                      onChange={(e) => setCollegeForm({ ...collegeForm, autonomous: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="modal-autonomous" className="text-xs font-semibold text-gray-300 cursor-pointer">Autonomous Standing</label>
                  </div>

                  {/* NBA Accreditation Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">NBA Status</label>
                    <select
                      value={collegeForm.nba_status}
                      onChange={(e) => setCollegeForm({ ...collegeForm, nba_status: e.target.value })}
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="Accredited">Accredited</option>
                      <option value="Not Accredited">Not Accredited</option>
                    </select>
                  </div>

                  {/* Website */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Website Link</label>
                    <input
                      type="url"
                      value={collegeForm.website}
                      onChange={(e) => setCollegeForm({ ...collegeForm, website: e.target.value })}
                      placeholder="https://example.edu"
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Logo Image URL</label>
                    <input
                      type="text"
                      value={collegeForm.logo_url}
                      onChange={(e) => setCollegeForm({ ...collegeForm, logo_url: e.target.value })}
                      placeholder="e.g. Unsplash URL or static path"
                      className="px-3 py-2 bg-[#0c0f1d] border border-gray-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="sm:col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-900">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCollegeModal(false);
                        setEditingCollege(null);
                        setCollegeForm({
                          name: '', code: '', district: 'Chittoor', region: 'SVE', type: 'Engineering',
                          autonomous: false, naac_grade: 'A', nba_status: 'Not Accredited', website: '',
                          logo_url: '', priority: 100
                        });
                      }}
                      className="px-5 py-2 border border-gray-850 text-gray-300 rounded-lg hover:bg-slate-900 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      {editingCollege ? 'Save Modifications' : 'Add College'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
         TAB: CSV IMPORT
         ──────────────────────────────────────────────────────── */}
      {activeTab === 'import' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-8 space-y-6 text-center border border-dashed border-gray-850">
            <UploadCloud size={44} className="mx-auto text-indigo-400 animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-base">Bulk Import Colleges (CSV)</h3>
              <p className="text-xs text-gray-500">Upload a `.csv` data sheet containing college parameters.</p>
            </div>

            <form onSubmit={handleCSVImport} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-xl cursor-pointer hover:bg-slate-950/20 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="text-xs text-gray-300 font-semibold mb-1">
                      {csvFile ? csvFile.name : 'Click to select CSV File'}
                    </p>
                    <p className="text-[10px] text-gray-500">CSV file format only (code, name, district...)</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={csvLoading || !csvFile}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                {csvLoading ? 'Uploading & Parsing entries...' : 'Import Data'}
              </button>
            </form>
          </div>

          {/* Import log outcome */}
          {csvLog && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle size={18} />
                <h4 className="font-bold text-white text-sm">Import Summary</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                  <div className="text-xl font-bold text-white">{csvLog.successCount}</div>
                  <span className="text-gray-400 text-[10px]">Successfully Imported</span>
                </div>
                <div className="p-3 bg-rose-600/10 border border-rose-500/20 rounded-xl">
                  <div className="text-xl font-bold text-white">{csvLog.errors?.length || 0}</div>
                  <span className="text-gray-400 text-[10px]">Failed Rows</span>
                </div>
              </div>

              {csvLog.errors && csvLog.errors.length > 0 && (
                <div className="space-y-2 border-t border-gray-900 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Failure Logs:</span>
                  <div className="bg-black/45 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-350">
                    {csvLog.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
         TAB: FEEDBACKS LIST
         ──────────────────────────────────────────────────────── */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-6">
          <h3 className="font-bold text-white text-sm">User Feedbacks Log</h3>

          {feedbacksLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="glass-card rounded-2xl py-20 text-center text-gray-500 space-y-1">
              <MessageSquare className="mx-auto text-gray-700 mb-2" size={32} />
              <h4 className="font-semibold text-gray-300">No Feedbacks Logged</h4>
              <p className="text-[10px]">Feedbacks submitted from the contact page will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-gray-900 hover:border-gray-800 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{fb.subject}</h4>
                      <p className="text-[10px] text-gray-400">
                        From: <span className="font-semibold text-indigo-400">{fb.name}</span> | {fb.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition"
                      title="Delete Feedback"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-450 leading-relaxed bg-black/20 p-3 rounded-xl border border-gray-900/50">
                    {fb.message}
                  </p>
                  <span className="text-[9px] text-gray-500 mt-auto pl-1">
                    Submitted: {new Date(fb.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
