import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Star, GitPullRequest, ArrowRight, MessageSquare, Heart, Clock } from 'lucide-react';

export default function ProgressPage() {
  // Local storage for feature upvotes to make page interactive
  const [votes, setVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('feature_votes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [feedback, setFeedback] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  useEffect(() => {
    localStorage.setItem('feature_votes', JSON.stringify(votes));
  }, [votes]);

  const handleUpvote = (featureId) => {
    setVotes(prev => ({
      ...prev,
      [featureId]: (prev[featureId] || 0) + 1
    }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmittedFeedback(true);
    setFeedback('');
    setTimeout(() => {
      setSubmittedFeedback(false);
    }, 4000);
  };

  const roadmapItems = [
    {
      id: 'cutoff_predictor',
      title: 'Previous Year Cut-Off Rank Matcher',
      status: 'Planned',
      statusColor: 'bg-zinc-900 text-zinc-500 border-zinc-800',
      percentage: 0,
      desc: 'Create an intelligent filter system to input your EAPCET rank, reservation category, gender, and region to match previous year allotment cutoffs.',
      category: 'Core Predictor Engine',
      timeline: 'Planned',
      upvotes: 0
    },
    {
      id: 'college_images',
      title: 'College Images in Listing Cards',
      status: 'Planned',
      statusColor: 'bg-zinc-900 text-zinc-500 border-zinc-800',
      percentage: 0,
      desc: 'Seamlessly render high-quality campus cover images directly on the college comparison and listing cards for better visual clarity.',
      category: 'UI/UX Improvement',
      timeline: 'Planned',
      upvotes: 0
    },
    {
      id: 'college_gallery',
      title: 'Full Media & Campus Gallery',
      status: 'Planned',
      statusColor: 'bg-zinc-900 text-zinc-500 border-zinc-800',
      percentage: 0,
      desc: 'Adding an interactive media section inside the college profile view displaying classrooms, labs, playgrounds, and campus infrastructure.',
      category: 'Visual Content',
      timeline: 'Planned',
      upvotes: 0
    },
    {
      id: 'placements_stats',
      title: 'Comprehensive Placements Dashboard',
      status: 'Planned',
      statusColor: 'bg-zinc-900 text-zinc-500 border-zinc-800',
      percentage: 0,
      desc: 'Integrate verified placement details including average packages, top recruiters, historic placement percentages, and campus placement audit charts.',
      category: 'Institutional Metrics',
      timeline: 'Planned',
      upvotes: 0
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 page-enter space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/15 text-amber-500 text-[10px] uppercase font-bold tracking-widest">
          <Sparkles size={12} /> Development Roadmap
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight heading">
          Platform Progress &amp; Future Goals
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">
          We are committed to constantly upgrading RankEdge. Below is our roadmap of upcoming features, currently planned tasks, and completed platform achievements.
        </p>
      </div>

      {/* Progress Stats Summary widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Overall Completion</span>
            <GitPullRequest size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">0%</span>
            <span className="text-[10px] text-zinc-500 font-semibold">Planning phase</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="card p-5 space-y-3 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Core Milestones</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">0 / 4</span>
            <span className="text-[10px] text-zinc-500">Not started yet</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="card p-5 space-y-3 hover:border-zinc-800 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Community Requests</span>
            <MessageSquare size={16} className="text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{Object.values(votes).reduce((a, b) => a + b, 0)}</span>
            <span className="text-[10px] text-blue-500 font-semibold">Student votes registered</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
            <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* Main Roadmap Timeline */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Project Timeline</h3>
        
        <div className="space-y-4">
          {roadmapItems.map((item) => {
            const addedVotes = votes[item.id] || 0;
            const hasVoted = addedVotes > 0;
            return (
              <div 
                key={item.id} 
                className="card p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-800 transition-all group"
              >
                <div className="space-y-4 flex-grow">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-medium">{item.category}</span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white group-hover:text-amber-500 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {item.desc}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>Development Progress</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-900">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Metadata / Voting column */}
                <div className="flex md:flex-col justify-between md:justify-center items-end md:items-center gap-4 flex-shrink-0 md:w-32 md:border-l md:border-zinc-900/60 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-900/60">
                  <div className="flex flex-col md:items-center">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Est. Release</span>
                    <span className="text-xs font-semibold text-zinc-300 font-mono mt-0.5 flex items-center gap-1">
                      <Clock size={11} className="text-zinc-650" /> {item.timeline}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpvote(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      hasVoted
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Heart size={12} className={hasVoted ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{item.upvotes + addedVotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestion Form */}
      <div className="card p-6 md:p-8 bg-[#f59e0b]/[0.01] border border-amber-500/10 rounded-2xl space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-500" /> Have other features in mind?
          </h4>
          <p className="text-xs text-zinc-500">
            Tell us what data or tools you want us to add to RankEdge. We read every student suggestion!
          </p>
        </div>

        {submittedFeedback ? (
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-450 text-xs text-center animate-scale-in">
            🎉 Thank you for your feedback! Your feature request has been registered.
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="flex gap-2">
            <input
              type="text"
              required
              className="input-field text-xs h-10 flex-grow"
              placeholder="e.g. Add college hostel review system, EAPCET Mock counselling..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              Submit <ArrowRight size={12} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
