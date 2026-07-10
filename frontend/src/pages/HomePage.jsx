import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Compass, ShieldCheck, HelpCircle, ChevronRight, Zap, Target } from 'lucide-react';

export default function HomePage() {
  const stats = [
    { value: '150+', label: 'Top Colleges Indexed' },
    { value: '10+', label: 'Regions & Districts' },
    { value: '100%', label: 'Verified Priority Ranks' },
    { value: '24/7', label: 'Student Support System' }
  ];

  const features = [
    {
      icon: Compass,
      title: 'Priority Matching',
      desc: 'Colleges are sorted precisely according to administrator priority rules, ensuring that top colleges always appear first.'
    },
    {
      icon: Trophy,
      title: 'Regional Codes',
      desc: 'Filter institutions by local university regions (SVE, AUC, OU) to easily check region-specific choices.'
    },
    {
      icon: Target,
      title: 'District Segments',
      desc: 'Narrow down college lists based on districts, NAAC grades, and autonomous status criteria.'
    }
  ];

  const steps = [
    { num: '01', title: 'Select Preferences', desc: 'Choose your region (like SVE, AUC), district, or governance type filters.' },
    { num: '02', title: 'Check Priority Order', desc: 'View matching colleges instantly, sorted by priority ranks (Priority 1 first).' },
    { num: '03', title: 'Visit College Site', desc: 'Read accreditations and click directly through to official college websites.' }
  ];

  const faqs = [
    {
      q: 'How accurate are the predictions?',
      a: 'Our predictions are computed using official historical cutoff datasets. While highly reliable for sorting and shortlisting, actual cutoffs fluctuate annually depending on student preferences and seat distribution.'
    },
    {
      q: 'What does SVE and AUC filters mean?',
      a: 'These represent regional admissions codes (e.g. SVE for Sri Venkateswara University region, AUC for Andhra University region). Filtering by regions helps you check seats allocated to local vs non-local candidates.'
    },
    {
      q: 'How can I list my college or modify cutoffs?',
      a: 'College administrators can request listing or cutoff updates by submitting details via our Contact form. Once verified, our system team will publish them.'
    }
  ];

  return (
    <div className="py-12 space-y-24 px-6 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 pt-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
          <Sparkles size={13} />
          Official regional codes SVE, AUC supported
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Browse College Rankings &<br />
          <span className="gradient-text">Regional Preferences</span>
        </h1>
        <p className="text-lg text-gray-450 max-w-2xl mx-auto leading-relaxed">
          Centralized rankings portal. View priority lists of colleges sorted by districts, accreditations (NAAC/NBA), autonomous governance, and regional codes instantly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/colleges"
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-755 text-white font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Explore Rankings
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 text-center border-l-4 border-l-indigo-600">
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-2">{stat.value}</div>
            <div className="text-xs text-gray-450 font-medium tracking-wide uppercase">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 3. Features Section */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">Powerful Features</h2>
          <p className="text-sm text-gray-450">Everything you need to navigate college admissions decisions confidently.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-8 hover:-translate-y-1 transition duration-300 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-gray-455 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="space-y-12 bg-indigo-950/10 border border-indigo-950/20 rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="text-sm text-gray-450">Shortlist your choices in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col gap-3">
              <span className="text-5xl font-extrabold text-indigo-900/30">{step.num}</span>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-sm text-gray-450 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Built for Student Choice</h2>
          <p className="text-sm text-gray-450 leading-relaxed">
            Finding a college shouldn't require navigating complex, outdated PDFs and brochures. We aggregate verified institutions and organize them by regions and priorities, letting you filter matching colleges easily.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-indigo-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-white">Verified Institutional Profiles</h4>
                <p className="text-xs text-gray-450">Displays district alignments, website links, autonomous governance, and NAAC ratings.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="text-indigo-400 mt-1 flex-shrink-0" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-white">Priority Order Sorting</h4>
                <p className="text-xs text-gray-450">Colleges are listed precisely according to admin rankings (Priority 1 first) to present top options instantly.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600"
            alt="Students collaborating"
            className="w-full h-80 object-cover"
          />
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-450">Clear answers to your general admission ranking queries.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <h4 className="font-semibold text-white text-sm">{faq.q}</h4>
              </div>
              <p className="text-xs text-gray-450 leading-relaxed pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
