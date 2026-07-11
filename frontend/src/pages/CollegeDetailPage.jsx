import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, MapPin, Building2, Globe, Award, Shield, Hash, Users, BookOpen, Calendar, ExternalLink } from 'lucide-react';

const CAMPUS_IMAGES = [
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=400&fit=crop',
];

const getCollegeImage = (id) => CAMPUS_IMAGES[id % CAMPUS_IMAGES.length];

const generateSeats = (code) => {
  const hash = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    { branch: 'Computer Science & Engineering', intake: 60 + (hash % 120), status: 'Available' },
    { branch: 'Electronics & Communication', intake: 60 + ((hash * 3) % 60), status: 'Available' },
    { branch: 'Electrical & Electronics', intake: 30 + ((hash * 2) % 60), status: 'Available' },
    { branch: 'Mechanical Engineering', intake: 60 + ((hash * 5) % 60), status: 'Available' },
    { branch: 'Civil Engineering', intake: 30 + ((hash * 7) % 60), status: 'Limited' },
  ];
};

export default function CollegeDetailPage() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.colleges.getById(id);
        setCollege(data.college);
      } catch (err) {
        setError(err.message || 'Failed to load college details');
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [id]);

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-4 w-20 skeleton rounded" />
        <div className="h-48 md:h-64 w-full skeleton rounded-xl mt-6" />
        <div className="h-6 w-2/3 skeleton rounded mt-6" />
        <div className="h-4 w-1/2 skeleton rounded mt-3" />
        <div className="h-4 w-1/2 skeleton rounded mt-3" />
        <div className="h-4 w-1/2 skeleton rounded mt-3" />
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error || !college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-sm text-red-400">{error || 'College not found'}</p>
        <Link to="/colleges" className="text-sm text-emerald-500 hover:underline">
          ← Back to Rankings
        </Link>
      </div>
    );
  }

  const seats = generateSeats(college.code || 'DEFAULT');

  /* ---------- Loaded state ---------- */
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 page-enter">
      {/* Back link */}
      <Link
        to="/colleges"
        className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Rankings
      </Link>

      {/* College image */}
      <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden bg-zinc-900 animate-in">
        <img
          src={getCollegeImage(college.id)}
          alt={college.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header info */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-xs font-mono">
            <Hash size={12} />
            {college.priority}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-xs">
            {college.code}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mt-3 animate-in delay-1">
          {college.name}
        </h1>

        <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500 animate-in delay-2">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {college.district}
          </span>
          <span className="flex items-center gap-1">
            <Building2 size={14} />
            {college.type}
          </span>
          <span>{college.region}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 animate-in delay-3">
        {[
          { label: 'Priority Rank', value: `#${college.priority}` },
          { label: 'Region', value: college.region },
          { label: 'NAAC Grade', value: college.naac_grade || 'N/A' },
          {
            label: 'NBA Status',
            value: college.nba_status === 'Accredited' ? 'Accredited' : 'Not Accredited',
          },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <p className="text-[11px] text-zinc-600 uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-semibold text-white mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* About / Details section */}
      <div className="mt-8 animate-in delay-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Details
        </h2>
        <div className="card p-5 space-y-0">
          {[
            { label: 'College Code', value: college.code },
            { label: 'District', value: college.district },
            { label: 'Region', value: college.region },
            { label: 'Type', value: college.type },
            {
              label: 'Governance',
              value: college.autonomous ? 'Autonomous' : 'University Affiliated',
            },
            { label: 'NAAC Grade', value: college.naac_grade || 'N/A' },
            {
              label: 'NBA Status',
              value: college.nba_status === 'Accredited' ? 'Accredited' : 'Not Accredited',
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
            >
              <span className="text-sm text-zinc-500">{row.label}</span>
              <span className="text-sm text-white">{row.value}</span>
            </div>
          ))}

          {college.website && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-500">Website</span>
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-500 hover:underline flex items-center gap-1"
              >
                {college.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Seats table */}
      <div className="mt-8 animate-in delay-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Seat Intake (Estimated)
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] sm:min-w-0">
              <thead className="bg-zinc-800/30">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Intake
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {seats.map((seat) => (
                  <tr
                    key={seat.branch}
                    className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-300">{seat.branch}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{seat.intake}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          seat.status === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {seat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 pb-8 flex flex-wrap gap-3 animate-in delay-6">
        {college.website && (
          <a
            href={college.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Visit Official Website
          </a>
        )}
        <Link to="/colleges" className="btn-secondary">
          Back to Rankings
        </Link>
      </div>
    </div>
  );
}
