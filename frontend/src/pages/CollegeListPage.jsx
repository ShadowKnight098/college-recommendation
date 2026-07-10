import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, MapPin, Building2, School, ArrowUpDown, ChevronLeft, ChevronRight, Globe } from 'lucide-react';

export default function CollegeListPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [autonomous, setAutonomous] = useState('');
  
  // Sorting States
  const [sortBy, setSortBy] = useState('priority');
  const [order, setOrder] = useState('ASC');

  // Dynamic filter options from DB
  const [filterOptions, setFilterOptions] = useState({ regions: [], districts: [], types: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load Filters from Database
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await api.colleges.getFilters();
        setFilterOptions(data);
      } catch (err) {
        console.error('Error fetching filters options:', err);
      }
    };
    loadFilters();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const data = await api.colleges.getAll({
        search,
        district,
        region,
        type,
        autonomous,
        sortBy,
        order,
        page,
        limit: 8
      });
      setColleges(data.colleges);
      setTotalCount(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [page, district, region, type, autonomous, sortBy, order]);

  // Live suggestions query
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.colleges.getAll({ search, limit: 5 });
        setSuggestions(data.colleges);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setShowSuggestions(false);
    fetchColleges();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDistrict('');
    setRegion('');
    setType('');
    setAutonomous('');
    setSortBy('priority');
    setOrder('ASC');
    setPage(1);
  };

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white heading">College Rankings</h1>
        <p className="text-sm text-gray-450">Browse and filter top rated educational institutions by rankings, regions, and districts.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-card rounded-2xl p-6 grid grid-cols-1 gap-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by college name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-11 pr-4 py-3 bg-[#0d1222] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
            {/* Live Suggestion dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#0f1528] border border-gray-850 rounded-xl overflow-hidden shadow-2xl z-50">
                {suggestions.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => {
                      setSearch(col.name);
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setPage(1);
                      // Apply search immediately
                      setTimeout(() => {
                        fetchColleges();
                      }, 50);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-600/10 cursor-pointer border-b border-gray-900 last:border-0 group transition"
                  >
                    {/* logo photo */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-gray-850 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={col.logo_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128'; }}
                      />
                    </div>
                    {/* Name */}
                    <span className="text-xs text-gray-250 font-medium group-hover:text-white flex-grow truncate">{col.name}</span>
                    {/* Code at the end */}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 font-bold font-mono">
                      {col.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* Backdrop click closer */}
            {showSuggestions && (
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setTimeout(() => setShowSuggestions(false), 200)} 
              />
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Region */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Region</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Regions</option>
              {filterOptions.regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* District */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">District / Town</label>
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Districts</option>
              {filterOptions.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Autonomous */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400">Governance</label>
            <select
              value={autonomous}
              onChange={(e) => { setAutonomous(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-[#0d1222] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Governance</option>
              <option value="true">Autonomous</option>
              <option value="false">University Affiliated</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={handleClearFilters}
            className="mt-auto px-4 py-2.5 border border-gray-800 hover:bg-slate-900 text-gray-300 rounded-xl text-xs font-medium transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* College Table / Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : colleges.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center text-gray-500 space-y-2">
          <School size={44} className="mx-auto text-gray-600 mb-2 animate-bounce" />
          <h3 className="font-bold text-gray-300">No Colleges Found</h3>
          <p className="text-xs max-w-sm mx-auto">Try refining your search text or removing active filter dropdown selection.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-gray-450">
            <span>Showing {colleges.length} of {totalCount} matching colleges</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleSort('priority')} 
                className={`flex items-center gap-1 hover:text-white transition ${sortBy === 'priority' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Priority Rank
                <ArrowUpDown size={12} />
              </button>
              <button 
                onClick={() => toggleSort('name')} 
                className={`flex items-center gap-1 hover:text-white transition ${sortBy === 'name' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Alphabetical
                <ArrowUpDown size={12} />
              </button>
            </div>
          </div>

          {/* College grid list */}
          <div className="grid grid-cols-1 gap-6">
            {colleges.map((college) => (
              <div 
                key={college.id} 
                className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-indigo-500/35 transition duration-300"
              >
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-gray-800 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={college.logo_url}
                    alt={college.code}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128'; }}
                  />
                </div>

                {/* Core detail */}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                      Rank #{college.priority}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-300">
                      Code: {college.code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      Region: {college.region}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{college.name}</h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={13} /> {college.district}</span>
                    <span className="flex items-center gap-1"><Building2 size={13} /> {college.type}</span>
                    <span>{college.autonomous ? 'Autonomous' : 'University Affiliated'}</span>
                  </div>
                </div>

                {/* Accreditation specs & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto border-t border-gray-900 md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">NAAC: {college.naac_grade || 'N/A'}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">NBA: {college.nba_status === 'Accredited' ? 'Accredited' : 'Not Accredited'}</span>
                  </div>
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto md:ml-0 flex items-center gap-1 text-xs text-indigo-400 hover:text-white transition"
                    >
                      <Globe size={13} />
                      Visit Site
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
