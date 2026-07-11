import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap } from 'lucide-react';

function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-16 md:space-y-24 animate-in">
      {/* Hero */}
      <section className="text-left space-y-4 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Find the right
          <br />
          engineering college.
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg">
          Browse 196+ colleges across Andhra Pradesh, ranked by priority. Filter
          by region, district, and type.
        </p>
        <Link
          to="/colleges"
          className="btn-primary inline-flex items-center gap-2 mt-4"
        >
          View Rankings
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-8 border-t border-b border-zinc-900">
        {[
          { value: '196+', label: 'Colleges' },
          { value: '3', label: 'Regions' },
          { value: '100%', label: 'Verified' },
          { value: '24/7', label: 'Access' },
        ].map((stat) => (
          <div key={stat.label} className="space-y-1">
            <div className="text-xl md:text-2xl font-bold text-white">
              {stat.value}
            </div>
            <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Set your filters',
              desc: 'Choose region, district, or college type to narrow your search.',
            },
            {
              step: '02',
              title: 'Browse by priority',
              desc: 'Colleges appear in ranked order. Priority 1 comes first.',
            },
            {
              step: '03',
              title: 'Get details',
              desc: 'View accreditation, governance status, and visit college websites.',
            },
          ].map((item) => (
            <div key={item.step} className="card p-6 flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="text-xs text-zinc-655 font-mono">
                  {item.step}
                </div>
                <div className="text-sm font-semibold text-white mt-2">
                  {item.title}
                </div>
              </div>
              <div className="text-xs text-zinc-450 mt-1 leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature detail */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 md:p-8 space-y-3">
          <Shield size={20} className="text-emerald-500" />
          <div className="text-sm font-semibold text-white">
            Verified Data
          </div>
          <div className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Every college listing is verified with official institutional
            profiles, district info, and accreditation status.
          </div>
        </div>

        <div className="card p-6 md:p-8 space-y-3">
          <Zap size={20} className="text-emerald-500" />
          <div className="text-sm font-semibold text-white">
            Instant Filtering
          </div>
          <div className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Search by name or code, filter by region, district, and type.
            Results update instantly.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 md:py-16 space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-white">
          Ready to explore?
        </h2>
        <p className="text-xs md:text-sm text-zinc-500">
          Start browsing ranked colleges now.
        </p>
        <Link
          to="/colleges"
          className="btn-primary inline-flex items-center gap-2 mt-4"
        >
          View Rankings
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
