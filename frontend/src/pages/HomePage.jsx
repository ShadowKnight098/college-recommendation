import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap } from 'lucide-react';

function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-16 md:space-y-24 animate-in">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 md:pt-16 pb-12">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
            Find the right
            <br />
            engineering college.
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg">
            Browse 196+ engineering colleges across Andhra Pradesh, ranked by priority. Filter by region, district, and type.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/colleges"
              className="btn-primary inline-flex items-center gap-2"
            >
              View Rankings
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              className="btn-secondary"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right side: Rankings Preview Widget */}
        <div className="hidden lg:block space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Rankings Preview</div>
          <div className="space-y-2 max-w-md">
            {[
              { id: 1, name: 'ABR College of Engg and Technology', priority: 1, region: 'AU', code: 'ABRK', district: 'KANIGIRI (PKS)' },
              { id: 2, name: 'Adarsh College of Engineering', priority: 2, region: 'AU', code: 'ACEE', district: 'GOLLAPROLU (EG)' },
              { id: 3, name: 'Aditya College of Engineering', priority: 3, region: 'SVU', code: 'ACEM', district: 'MADANAPALLE (CTR)' },
            ].map((col) => (
              <div key={col.id} className="card p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
                <span className="text-sm font-mono text-emerald-500 font-bold w-6">#{col.priority}</span>
                <div className="flex-grow min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{col.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{col.district} • Region: {col.region}</div>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">{col.code}</span>
              </div>
            ))}
          </div>
        </div>
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
