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
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [student, setStudent] = useState(() => {
    const token = localStorage.getItem('studentToken');
    const name = localStorage.getItem('studentName');
    return token ? { token, name } : null;
  });

  // Review submission form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Observe student auth status changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('studentToken');
      const name = localStorage.getItem('studentName');
      setStudent(token ? { token, name } : null);
    };
    window.addEventListener('student-auth-change', handleAuthChange);
    return () => window.removeEventListener('student-auth-change', handleAuthChange);
  }, []);

  // Fetch college details and its approved reviews
  useEffect(() => {
    const fetchCollegeAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.colleges.getById(id);
        setCollege(data.college);
        setBranches(data.branches || []);

        // Fetch approved reviews
        const revRes = await api.reviews.getByCollege(id);
        setReviews(revRes.reviews || []);
      } catch (err) {
        setError(err.message || 'Failed to load college details');
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchCollegeAndReviews();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write your review comment.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await api.reviews.submit({
        collegeId: college.id,
        rating,
        comment: comment.trim(),
        postAnonymously,
      });

      setSubmitSuccess(res.message);
      setComment('');
      setRating(5);
      setPostAnonymously(false);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitLoading(false);
    }
  };

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
                className="text-sm text-[#f59e0b] hover:underline flex items-center gap-1"
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
          Seat Intake & Course Fees
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-zinc-800/30">
                <tr>
                  <th className="px-4 py-3 text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Branch Name
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Total Seats
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Leftover Seats
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Annual Fee
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => {
                  const hasSeats = b.leftover_seats > 0;
                  return (
                    <tr
                      key={b.id || b.branch_code}
                      className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="text-zinc-200 font-medium">{b.branch_name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{b.branch_code}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 text-center font-mono">{b.total_seats}</td>
                      <td className="px-4 py-3 text-sm text-white text-center font-mono font-medium">{b.leftover_seats}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right font-mono">
                        ₹{b.fee}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono ${
                            hasSeats
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {hasSeats ? 'Available' : 'Filled'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Reviews section */}
      <div className="mt-12 animate-in delay-6 border-t border-zinc-900 pt-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Student Reviews & Ratings
        </h2>
        
        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            <div className="h-20 w-full skeleton rounded-lg" />
            <div className="h-20 w-full skeleton rounded-lg" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No approved reviews yet for this college. Be the first to share your experience!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{r.studentName}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {/* Rating display */}
                  <div className="flex text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-300 mt-2 whitespace-pre-line leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submission Form / Call To Action */}
        <div className="mt-8 border-t border-zinc-900/60 pt-6">
          {student ? (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-white mb-4">Write a Review</h3>

              {submitError && (
                <div className="mb-4 p-2 bg-rose-950/40 border border-rose-900/60 rounded text-rose-400 text-xs">
                  {submitError}
                </div>
              )}

              {submitSuccess ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded text-emerald-400 text-xs text-center">
                  {submitSuccess}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star selector */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">Rating</label>
                    <div className="flex items-center gap-1.5 text-2xl">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <span className={starValue <= (hoverRating || rating) ? 'text-amber-500' : 'text-zinc-700'}>
                              ★
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience about academics, placements, infrastructure, and campus life..."
                      className="w-full bg-[#121214] border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anon"
                      checked={postAnonymously}
                      onChange={(e) => setPostAnonymously(e.target.checked)}
                      className="rounded bg-[#121214] border-zinc-800 text-[#f59e0b] focus:ring-[#f59e0b] focus:ring-offset-0 focus:outline-none w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="anon" className="text-xs text-zinc-400 cursor-pointer select-none">
                      Post Anonymously (your name will show as "Anonymous Student" publicly)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider px-6 py-2 rounded transition-colors"
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="card p-6 border border-dashed border-zinc-800 text-center">
              <p className="text-zinc-400 text-sm mb-3">
                Are you a student of this college? Share your experience to help future aspirants!
              </p>
              <button
                onClick={() => window.dispatchEvent(new Event('open-student-auth'))}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded transition-colors font-medium"
              >
                Log In as Student to Write Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 pb-8 flex flex-wrap gap-3 animate-in delay-7">
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
