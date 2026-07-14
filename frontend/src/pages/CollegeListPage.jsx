import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, MapPin, Building2, School, ArrowUpDown, ChevronLeft, ChevronRight, Globe, Filter, X, LayoutList, LayoutGrid, Heart, Share2, ArrowRight, Shield } from 'lucide-react';

const CAMPUS_IMAGES = [
  'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=300&fit=crop',
];
const getCollegeImage = (id) => CAMPUS_IMAGES[id % CAMPUS_IMAGES.length];

export default function CollegeListPage() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [autonomous, setAutonomous] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [order, setOrder] = useState('ASC');
  const [filterOptions, setFilterOptions] = useState({ regions: [], districts: [], types: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('card');

  // Favorites, Compare & Share States
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [compareIds, setCompareIds] = useState(() => {
    try {
      const saved = localStorage.getItem('compareIds');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleCompare = (collegeId, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (compareIds.includes(collegeId)) {
      updated = compareIds.filter(id => id !== collegeId);
    } else {
      if (compareIds.length >= 4) {
        alert('You can select a maximum of 4 colleges to compare.');
        return;
      }
      updated = [...compareIds, collegeId];
    }
    setCompareIds(updated);
    localStorage.setItem('compareIds', JSON.stringify(updated));
  };

  const clearCompare = () => {
    setCompareIds([]);
    localStorage.removeItem('compareIds');
  };

  const toggleFavorite = (collegeId, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(collegeId)) {
      updated = favorites.filter(id => id !== collegeId);
    } else {
      updated = [...favorites, collegeId];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleShareCollege = async (college, e) => {
    e.stopPropagation();
    const imageUrl = college.image_url || getCollegeImage(college.id);
    const shareText = `Check out ${college.name} (${college.code}) on RankEdge!\nPriority Rank: #${college.priority}\nRegion: ${college.region}\nDistrict: ${college.district}`;
    const shareUrl = `${window.location.origin}/colleges/${college.id}`;

    if (navigator.share) {
      try {
        // Fetch image as blob and build File object
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `college-${college.code}.jpg`, { type: 'image/jpeg' });

        const shareData = {
          title: college.name,
          text: shareText,
          url: shareUrl,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }

        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log('File sharing failed, falling back to text-only share:', err);
        try {
          await navigator.share({
            title: college.name,
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch (e2) {
          console.log('Text-only share failed:', e2);
        }
      }
    }

    // Desktop fallback: include image link inside WhatsApp message
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\nCollege Image: ' + imageUrl + '\nLink: ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await api.colleges.getFilters();
        setFilterOptions(data);
      } catch (err) { console.error('Error fetching filters:', err); }
    };
    loadFilters();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = {
        search, district, region, type, autonomous, sortBy, order, page, limit: 12
      };
      if (showFavoritesOnly) {
        params.ids = favorites.length > 0 ? favorites.join(',') : '-1';
      }
      const data = await api.colleges.getAll(params);
      setColleges(data.colleges);
      setTotalCount(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) { console.error('Error fetching colleges:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchColleges(); }, [page, district, region, type, autonomous, sortBy, order, showFavoritesOnly]);

  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); return; }
    const delay = setTimeout(async () => {
      try {
        const data = await api.colleges.getAll({ search, limit: 5 });
        setSuggestions(data.colleges);
      } catch (err) { console.error('Suggestions error:', err); }
    }, 250);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setShowSuggestions(false);
    fetchColleges();
  };

  const toggleSort = (field) => {
    if (sortBy === field) { setOrder(order === 'ASC' ? 'DESC' : 'ASC'); }
    else { setSortBy(field); setOrder('ASC'); }
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch(''); setDistrict(''); setRegion(''); setType(''); setAutonomous('');
    setSortBy('priority'); setOrder('ASC'); setPage(1);
  };

  const hasActiveFilters = district || region || type || autonomous;

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Rankings</h1>
        <span className="text-sm text-zinc-600">{totalCount} colleges</span>
      </div>

      {/* Disclaimer Message */}
      <div className="bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-xl p-3.5 text-xs flex items-start gap-2.5 mb-6 shadow-sm shadow-amber-500/[0.02]">
        <Shield size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> This data is compiled from various official institutional websites. Please consider and verify everything independently before making decisions.
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input
            type="text"
            className="input-field pl-9 pr-4 h-11 text-sm w-full"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSuggestions(false)}
            />
            <div className="absolute w-full mt-1 bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s) => (
                <div
                  key={s.id || s.code}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 cursor-pointer border-b border-zinc-800/50 last:border-0"
                  onClick={() => {
                    setSearch(s.name);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setTimeout(() => fetchColleges(), 50);
                  }}
                >
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-semibold uppercase flex-shrink-0">
                    {s.code}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-300 flex-grow truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 flex-grow animate-in">
          <button
            type="button"
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setPage(1); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] font-semibold transition cursor-pointer w-full sm:w-auto ${
              showFavoritesOnly
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-455 hover:bg-rose-500/20'
                : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Heart size={14} className={showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''} />
            <span>Favorites Only</span>
          </button>

          <select
            value={region}
            onChange={(e) => { setRegion(e.target.value); setPage(1); }}
            className="bg-[#18181b] border border-zinc-800 rounded-lg text-[13px] text-zinc-400 px-3 py-2 outline-none focus:border-emerald-500/50 w-full sm:w-auto"
          >
            <option value="">All Regions</option>
            {filterOptions.regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
            className="bg-[#18181b] border border-zinc-800 rounded-lg text-[13px] text-zinc-400 px-3 py-2 outline-none focus:border-emerald-500/50 w-full sm:w-auto"
          >
            <option value="">All Districts</option>
            {filterOptions.districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="bg-[#18181b] border border-zinc-800 rounded-lg text-[13px] text-zinc-400 px-3 py-2 outline-none focus:border-emerald-500/50 w-full sm:w-auto"
          >
            <option value="">All Types</option>
            {filterOptions.types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={autonomous}
            onChange={(e) => { setAutonomous(e.target.value); setPage(1); }}
            className="bg-[#18181b] border border-zinc-800 rounded-lg text-[13px] text-zinc-400 px-3 py-2 outline-none focus:border-emerald-500/50 w-full sm:w-auto"
          >
            <option value="">Governance</option>
            <option value="yes">Autonomous</option>
            <option value="no">University Affiliated</option>
          </select>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-[13px] text-zinc-650 hover:text-white cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* View Toggle */}
          <div className="bg-zinc-900 rounded-lg p-0.5 inline-flex gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Sort Row */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <span className="text-[13px] text-zinc-600">
          Showing {colleges.length} of {totalCount}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => toggleSort('priority')}
            className={`text-[13px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
              sortBy === 'priority' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Priority <ArrowUpDown size={12} />
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`text-[13px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
              sortBy === 'name' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Name <ArrowUpDown size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewMode === 'list' ? (
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-8 h-4 skeleton" />
                <div className="w-10 h-10 rounded-lg skeleton" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 skeleton" style={{ width: `${60 + Math.random() * 30}%` }} />
                  <div className="h-3 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-32 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-3 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : colleges.length === 0 ? (
        <div className="py-20 text-center">
          <School size={32} className="text-zinc-800 mx-auto" />
          <p className="text-sm font-medium text-zinc-500 mt-3">No colleges found</p>
          <p className="text-[13px] text-zinc-700 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-1">
          {colleges.map((college, index) => (
            <div
              key={college.id}
              onClick={() => navigate(`/colleges/${college.id}`)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group cursor-pointer animate-in border ${
                compareIds.includes(college.id)
                  ? 'border-amber-500/40 bg-amber-500/[0.02] shadow-sm shadow-amber-500/5 hover:bg-amber-500/[0.04]'
                  : 'border-transparent hover:bg-zinc-900/50'
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Rank */}
              <span className="text-sm font-mono text-zinc-600 w-8 text-right flex-shrink-0">{college.priority}</span>
              
              {/* Image thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                <img src={college.image_url || getCollegeImage(college.id)} alt="" className="w-full h-full object-cover" />
              </div>
              
              {/* Info */}
              <div className="flex-grow min-w-0">
                <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">{college.name}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[12px] text-zinc-650">
                  <span className="flex items-center gap-1"><MapPin size={12} className="flex-shrink-0" /> {college.district}</span>
                  <span className="flex items-center gap-1"><Building2 size={12} className="flex-shrink-0" /> {college.type}</span>
                  <span className="sm:hidden text-zinc-500 font-mono">{college.code} • {college.region}</span>
                </div>
              </div>
              
              {/* Right side */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">{college.region}</span>
                <span className="text-[11px] text-zinc-605 font-mono">{college.code}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 pl-2">
                <button
                  type="button"
                  onClick={(e) => toggleCompare(college.id, e)}
                  className={`p-2 rounded-lg transition hover:bg-zinc-800 ${
                    compareIds.includes(college.id) ? 'text-[#f59e0b]' : 'text-zinc-500 hover:text-white'
                  }`}
                  title={compareIds.includes(college.id) ? 'Remove from Comparison' : 'Select to Compare'}
                >
                  <Building2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(college.id, e)}
                  className={`p-2 rounded-lg transition hover:bg-zinc-800 ${
                    favorites.includes(college.id) ? 'text-rose-500' : 'text-zinc-500 hover:text-rose-455'
                  }`}
                  title={favorites.includes(college.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart size={15} className={favorites.includes(college.id) ? 'fill-rose-500' : ''} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleShareCollege(college, e)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-white transition hover:bg-zinc-800"
                  title="Share College"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {colleges.map((college, index) => (
            <div
              key={college.id}
              onClick={() => navigate(`/colleges/${college.id}`)}
              className={`card p-0 overflow-hidden transition-all card-lift cursor-pointer animate-in ${
                compareIds.includes(college.id)
                  ? 'border-amber-500/50 shadow-md shadow-amber-500/5 bg-amber-500/[0.01]'
                  : 'hover:border-zinc-700'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="h-32 overflow-hidden bg-zinc-900 relative">
                <img src={college.image_url || getCollegeImage(college.id)} alt="" className="w-full h-full object-cover" />
                {/* Overlay buttons */}
                <div className="absolute top-2 right-2 flex z-10">
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(college.id, e)}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white transition-colors"
                    title={favorites.includes(college.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <Heart size={13} className={favorites.includes(college.id) ? 'fill-rose-500 text-rose-550' : 'text-white'} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">#{college.priority}</span>
                  <span className="text-[11px] font-mono text-zinc-600">{college.code}</span>
                </div>
                
                {/* Name */}
                <h3 className="text-sm font-semibold text-white mt-2 line-clamp-2">{college.name}</h3>
                
                {/* Meta */}
                <div className="mt-2 space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                      <MapPin size={12} className="flex-shrink-0" /> {college.district}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                      <Building2 size={12} className="flex-shrink-0" /> {college.type}
                    </div>
                  </div>
                  {/* Additional details */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                      NAAC: {college.naac_grade || 'N/A'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                      {college.nba_status === 'Accredited' ? 'NBA' : 'No NBA'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
                      {college.autonomous ? 'Auto' : 'Affil'}
                    </span>
                  </div>
                  {/* Courses Offered list */}
                  {college.branches && college.branches.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-800/30">
                      {college.branches.slice(0, 5).map((brCode) => (
                        <span key={brCode} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-450 font-mono">
                          {brCode}
                        </span>
                      ))}
                      {college.branches.length > 5 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
                          +{college.branches.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Bottom */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                  <span className="badge bg-zinc-900 text-zinc-500 font-mono">{college.region}</span>
                  
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(college.id, e)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        compareIds.includes(college.id)
                          ? 'bg-amber-500/10 border-amber-500/20 text-[#f59e0b]'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
                      }`}
                      title={compareIds.includes(college.id) ? 'Remove from Compare' : 'Add to Compare'}
                    >
                      <Building2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleShareCollege(college, e)}
                      className="p-1.5 rounded-lg border bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white transition cursor-pointer"
                      title="Share"
                    >
                      <Share2 size={13} />
                    </button>
                    <span className="text-[12px] text-emerald-500 font-medium ml-1">View details →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && colleges.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 disabled:opacity-30 transition-colors hover:border-zinc-700"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-[13px] font-medium flex items-center justify-center transition-colors ${
                p === page
                  ? 'bg-emerald-500 text-black'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 disabled:opacity-30 transition-colors hover:border-zinc-700"
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-[12px] text-zinc-700 ml-3">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {/* Sticky Bottom Compare Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-3 rounded-full flex items-center justify-between gap-6 border border-amber-500/30 bg-black/80 backdrop-blur-md shadow-lg shadow-amber-500/10 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide whitespace-nowrap">
              Compare Colleges: {compareIds.length} / 4
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-[10px] text-zinc-500 hover:text-white font-semibold transition cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
              className="px-4 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-extrabold rounded-full transition shadow-md shadow-amber-500/10 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              Compare Now
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
