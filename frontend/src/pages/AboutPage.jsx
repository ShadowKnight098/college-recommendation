import React from 'react';
import { Code2, Database, Shield, Globe } from 'lucide-react';

const techStack = [
  { icon: Code2, title: 'React + Express', desc: 'Modern full-stack architecture' },
  { icon: Database, title: 'PostgreSQL', desc: 'Cloud-hosted on Neon' },
  { icon: Shield, title: 'JWT Auth', desc: 'Secure admin access' },
  { icon: Globe, title: 'Open Access', desc: 'Free, no registration' },
];

const AboutPage = () => {
  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff' }}>About</h1>
      <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: '0.5rem' }}>
        RankEdge is a college ranking portal for engineering students in Andhra Pradesh.
      </p>

      <div style={{ borderTop: '1px solid #18181b', margin: '2rem 0' }} />

      <p style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.7 }}>
        State engineering counselling processes are complex, with thousands of seats across hundreds of colleges.
        RankEdge simplifies this by providing a centralized dashboard where colleges are ranked by priority,
        filterable by region, district, and type — saving students hours of research.
      </p>

      <div style={{ borderTop: '1px solid #18181b', margin: '2rem 0' }} />

      <p style={{
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1rem',
      }}>
        Built with
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: '0.75rem',
      }} className="about-grid">
        {techStack.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Icon size={16} style={{ color: '#71717a', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#d4d4d8' }}>{title}</p>
              <p style={{ fontSize: '13px', color: '#52525b', marginTop: '2px' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.75rem', color: '#3f3f46', textAlign: 'center', marginTop: '3rem' }}>
        Built for students in Andhra Pradesh.
      </p>

      <style>{`
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
