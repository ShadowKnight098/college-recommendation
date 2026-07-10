import React from 'react';
import { Info, Code2, Database, Shield, BookOpen, UserCheck } from 'lucide-react';

export default function AboutPage() {
  const specs = [
    { icon: Code2, title: 'Modular Architecture', desc: 'Constructed using an MVC architecture separating route definitions, database models, and view presentation controllers.' },
    { icon: Database, title: 'Relational Database', desc: 'Powered by PostgreSQL leveraging compound indexes on district, regions, and priority columns for sub-millisecond retrieval speeds.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Secure administrator logins protected with JSON Web Tokens (JWT) and encrypted passwords via bcrypt encryption.' },
    { icon: BookOpen, title: 'Admissions Shortlisting', desc: 'Engineered specifically for prospective students to simplify tracking historic counselling cutoffs.' }
  ];

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Info size={30} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white heading">About The Portal</h1>
        <p className="text-sm text-gray-450 leading-relaxed max-w-xl mx-auto">
          Simplifying the transition from entrance examinations to collegiate life by indexing priority lists and automating admissions forecasting.
        </p>
      </div>

      {/* Tech Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {specs.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-white text-base">{spec.title}</h3>
              <p className="text-xs text-gray-450 leading-relaxed">{spec.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Purpose Banner */}
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-indigo-500/10 bg-indigo-950/5 flex flex-col md:flex-row gap-6 items-center">
        <div className="space-y-4 flex-grow">
          <h3 className="text-xl font-bold text-indigo-400">Our Purpose</h3>
          <p className="text-xs text-gray-450 leading-relaxed">
            State engineering counselling processes are notoriously complex, with thousands of seats scattered across diverse colleges. This website acts as a centralized dashboard to list official college accreditations, governance standings, and run comparative simulations that filter out unreachable codes, saving students hours of research.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#0a0d18] border border-gray-800">
          <UserCheck className="text-indigo-400" size={24} />
          <div>
            <div className="text-xs font-bold text-white">Student First</div>
            <div className="text-[10px] text-gray-500">100% Free & Open Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
