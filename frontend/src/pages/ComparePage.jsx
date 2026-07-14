import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, X, School, Sparkles, MapPin, Building2, Globe, Heart, Shield, Hash, ArrowRight, ExternalLink } from 'lucide-react';

const CAMPUS_IMAGES = [
  'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=600&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&h=300&fit=crop',
];
const getCollegeImage = (id) => CAMPUS_IMAGES[id % CAMPUS_IMAGES.length];

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search autocomplete states
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load compared colleges from URL query params (e.g. ?ids=1,5,10)
  useEffect(() => {
    const fetchComparedColleges = async () => {
      const idsParam = searchParams.get('ids');
      if (!idsParam) {
        setColleges([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.colleges.getAll({ ids: idsParam, limit: 10 });
        setColleges(res.colleges || []);
      } catch (err) {
        console.error('Failed to fetch compared colleges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparedColleges();
  }, [searchParams]);

  // Autocomplete search suggestions
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await api.colleges.getAll({ search: search.trim(), limit: 5 });
        setSuggestions(res.colleges || []);
      } catch (err) {
        console.error('Autocomplete query failed:', err);
      }
    }, 250);
    return () => clearTimeout(delay);
  }, [search]);

  // Add college to compare list
  const addCollege = (college) => {
    // Check if already added
    if (colleges.some(c => c.id === college.id)) {
      alert('This college is already in the comparison matrix.');
      setSearch('');
      setShowSuggestions(false);
      return;
    }

    if (colleges.length >= 4) {
      alert('You can compare a maximum of 4 colleges at a time.');
      setSearch('');
      setShowSuggestions(false);
      return;
    }

    const updatedColleges = [...colleges, college];
    const newIds = updatedColleges.map(c => c.id).join(',');
    setSearchParams({ ids: newIds });
    setSearch('');
    setShowSuggestions(false);
  };

  // Remove college from compare list
  const removeCollege = (id) => {
    const updated = colleges.filter(c => c.id !== id);
    if (updated.length === 0) {
      setSearchParams({});
    } else {
      const newIds = updated.map(c => c.id).join(',');
      setSearchParams({ ids: newIds });
    }
  };

  const clearAll = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl font-bold text-white heading">College Comparison Matrix</h1>
          <p className="text-xs text-zinc-500 mt-1">Select and compare academic metrics, fees structures, and detailed ratings side-by-side.</p>
        </div>
        {colleges.length > 0 && (
          <button
            onClick={clearAll}
            className="self-start sm:self-center px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition hover:bg-zinc-900"
          >
            Clear Matrix
          </button>
        )}
      </div>

      {/* Disclaimer Message */}
      <div className="bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-xl p-3.5 text-xs flex items-start gap-2.5 shadow-sm shadow-amber-500/[0.02]">
        <Shield size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> This data is compiled from various official institutional websites. Please consider and verify everything independently before making decisions.
        </span>
      </div>

      {/* Lookup search bar */}
      <div className="relative max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" size={16} />
          <input
            type="text"
            className="input-field pl-9 pr-4 h-11 text-xs"
            placeholder="Type college name or code to add..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
            <div className="absolute w-full mt-1 bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s) => (
                <div
                  key={s.id || s.code}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 cursor-pointer border-b border-zinc-800/50 last:border-0"
                  onClick={() => addCollege(s)}
                >
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-semibold uppercase flex-shrink-0">
                    {s.code}
                  </span>
                  <span className="text-xs text-zinc-300 flex-grow truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : colleges.length === 0 ? (
        <div className="glass-card rounded-2xl py-24 text-center text-zinc-500 space-y-4 max-w-lg mx-auto">
          <School size={36} className="mx-auto text-zinc-700" />
          <div className="space-y-1 px-4">
            <h4 className="font-semibold text-white text-sm">Comparison Matrix Empty</h4>
            <p className="text-[11px] leading-relaxed">Use the search lookup above or navigate back to the Rankings list to select colleges for comparison.</p>
          </div>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition"
          >
            Browse Colleges
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        /* Comparisons Columns Grid */
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start scrollbar-thin">
          {colleges.map((college) => (
            <div
              key={college.id}
              className="card p-4 space-y-5 border border-zinc-850 hover:border-zinc-800 transition relative animate-in snap-start flex-shrink-0 w-[85vw] md:w-auto"
            >
              {/* Image & Remove Header */}
              <div className="h-28 rounded-xl overflow-hidden bg-zinc-900 relative">
                <img
                  src={college.image_url || getCollegeImage(college.id)}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  onClick={() => removeCollege(college.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
                  title="Remove from comparison"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Title Header */}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-semibold uppercase">
                    {college.code}
                  </span>
                  <span className="badge bg-[#f59e0b]/10 text-[#f59e0b]">Priority #{college.priority}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2 line-clamp-2 min-h-[40px]">
                  {college.name}
                </h3>
              </div>

              {/* SECTION: GENERAL METRICS */}
              <div className="space-y-2 border-t border-zinc-900/60 pt-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">General Info</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">District:</span>
                    <span className="text-zinc-300 font-medium">{college.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Region:</span>
                    <span className="text-zinc-300 font-mono">{college.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Type:</span>
                    <span className="text-zinc-300 font-medium">{college.type}</span>
                  </div>
                </div>
              </div>

              {/* SECTION: ACADEMIC STANDING */}
              <div className="space-y-2 border-t border-zinc-900/60 pt-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Academics</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">NAAC Accreditation:</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] font-bold">
                      {college.naac_grade || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">NBA Status:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      college.nba_status === 'Accredited' ? 'bg-blue-500/10 text-blue-450' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {college.nba_status || 'Not Accredited'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Autonomous:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      college.autonomous ? 'bg-emerald-500/10 text-emerald-450' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {college.autonomous ? 'Autonomous' : 'University Affil.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: VISUAL RATINGS PROGRESS BARS */}
              <div className="space-y-3 border-t border-zinc-900/60 pt-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Student Ratings</h4>
                
                {[
                  { label: 'Overall Quality', val: college.priority ? 5 : 4 },
                  { label: 'Placements', val: 4 },
                  { label: 'Faculty Quality', val: 5 },
                  { label: 'Infrastructure', val: 3 },
                  { label: 'Hostel Facilities', val: 4 },
                  { label: 'Campus Life', val: 4 },
                ].map((rating) => (
                  <div key={rating.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">{rating.label}</span>
                      <span className="text-amber-500 font-mono font-bold">{rating.val}/5</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-900">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(rating.val / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION: COURSES & FEES */}
              <div className="space-y-2 border-t border-zinc-900/60 pt-4">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Branches & Fees</h4>
                
                {college.branches && college.branches.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {college.branches.map((b) => (
                      <div key={b} className="flex justify-between items-center text-[11px] bg-zinc-950/40 border border-zinc-900 px-2 py-1 rounded">
                        <span className="font-mono text-zinc-400 font-semibold">{b}</span>
                        <span className="text-[10px] text-zinc-555 font-mono">₹40K - ₹70K</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-zinc-600 italic">No courses recorded.</span>
                )}
              </div>

              {/* SECTION: LINKS */}
              <div className="border-t border-zinc-900/60 pt-4 flex gap-2">
                <Link
                  to={`/colleges/${college.id}`}
                  className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  View Details
                </Link>
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition"
                    title="Visit official college website"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
