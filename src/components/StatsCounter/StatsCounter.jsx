import React from 'react';
import './StatsCounter.css';

const LOGOS = [
  { name: 'KCET', mark: 'hex' },
  { name: 'PGCET', mark: 'book' },
  { name: 'VTU', mark: 'shield' },
  { name: 'KEA', mark: 'circle' },
  { name: 'COMEDK', mark: 'wave' },
  { name: 'AICTE', mark: 'a' },
  { name: 'UGC', mark: 'grid' },
  { name: 'NBA', mark: 'bars' },
];

function Mark({ type }) {
  return (
    <svg className="mmc-logo-mark" viewBox="0 0 24 24" aria-hidden="true">
      {type === 'hex' && <path d="M12 3 20 8v8l-8 5-8-5V8z" />}
      {type === 'book' && <path d="M5 5h12v14H8a3 3 0 0 1-3-3zM8 5v11" />}
      {type === 'shield' && <path d="M12 3 20 7v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />}
      {type === 'circle' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {type === 'wave' && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M7 14c1.5-1.4 3-2.1 5-2.1s3.5.7 5 2.1M8 11c1.2-1.1 2.4-1.6 4-1.6s2.8.5 4 1.6" />
        </>
      )}
      {type === 'a' && <path d="M6 19 12 5l6 14M8.5 13h7" />}
      {type === 'grid' && (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      )}
      {type === 'bars' && (
        <>
          <path d="M5 18V9M12 18V6M19 18v-7" />
        </>
      )}
    </svg>
  );
}

function LogoItem({ name, mark }) {
  return (
    <span className="mmc-logo-item">
      <Mark type={mark} />
      {name}
    </span>
  );
}

export default function StatsCounter() {
  const loop = [...LOGOS, ...LOGOS];

  return (
    <section className="mmc-stats" aria-label="Exam boards and partner bodies">
      <div className="mmc-logo-marquee">
        <div className="mmc-logo-track">
          {loop.map((logo, i) => (
            <LogoItem key={`${logo.name}-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
