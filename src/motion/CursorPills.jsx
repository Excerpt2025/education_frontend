import React from 'react';

const DEFAULT_PILLS = [
  { label: 'Learn', top: '8%', left: '46%', x: 14, y: 8, delay: '0s' },
  { label: 'Skills', top: '22%', left: '86%', x: -12, y: 10, delay: '0.6s' },
  { label: 'Growth', top: '68%', left: '42%', x: 10, y: -12, delay: '1.1s' },
  { label: 'Career', top: '78%', left: '78%', x: -8, y: 8, delay: '1.7s' },
  { label: 'Knowledge', top: '4%', left: '72%', x: 8, y: -6, delay: '0.3s' },
];

export default function CursorPills({ pills = DEFAULT_PILLS }) {
  return (
    <div className="mmc-cursor-pills" aria-hidden="true">
      {pills.map((pill) => (
        <span
          key={pill.label}
          className="mmc-cursor-pill"
          style={{
            top: pill.top,
            left: pill.left,
            '--mmc-pill-x': `${pill.x}px`,
            '--mmc-pill-y': `${pill.y}px`,
            '--mmc-pill-delay': pill.delay,
          }}
        >
          {pill.label}
        </span>
      ))}
    </div>
  );
}
