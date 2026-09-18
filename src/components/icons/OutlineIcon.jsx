import React from 'react';
import './OutlineIcon.css';

const PATHS = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-1.2 4.8-4.8 1.2 1.2-4.8z" />
    </>
  ),
  cap: (
    <>
      <path d="M3 10 12 5l9 5-9 5-9-5z" />
      <path d="M7 12.2v4.1c0 .4 2.2 2.2 5 2.2s5-1.8 5-2.2v-4.1" />
      <path d="M21 10v6" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
      <path d="M5 5.5v16" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M6 8h12" />
      <path d="M6 8 3.5 14a3 3 0 0 0 5 0z" />
      <path d="M18 8 15.5 14a3 3 0 0 0 5 0z" />
    </>
  ),
  handshake: (
    <>
      <path d="M8 13 5.5 10.5a2 2 0 0 1 0-2.8L8 5.2" />
      <path d="M16 13 18.5 10.5a2 2 0 0 0 0-2.8L16 5.2" />
      <path d="M8 13c1.2 1.4 2.4 3.2 4 5 1.6-1.8 2.8-3.6 4-5" />
      <path d="M9.5 8.5 12 11l2.5-2.5" />
    </>
  ),
  chat: (
    <>
      <path d="M6 18.5 3.5 21V7.5A2.5 2.5 0 0 1 6 5h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 18z" />
      <path d="M8 10h8M8 13.5h5" />
    </>
  ),
  phone: (
    <path d="M7 3.8h3.2l1.2 3-2 1.6a11.5 11.5 0 0 0 6.2 6.2l1.6-2 3 1.2V17a1.8 1.8 0 0 1-2 1.8A15.2 15.2 0 0 1 5.2 5.8 1.8 1.8 0 0 1 7 3.8z" />
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V7" />
      <path d="M17 16v-8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="1.8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  facebook: (
    <path d="M14 8h2.5V4.8H14c-2.4 0-4 1.7-4 4.2V11H7.5v3.2H10V20h3.3v-5.8h2.4l.5-3.2h-2.9V9c0-.6.2-1 1.2-1z" />
  ),
  youtube: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="3" />
      <path d="m10.5 9.5 5 2.5-5 2.5z" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="16.6" cy="7.4" r="0.8" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M6.2 18.6 5 21.4l2.9-1.1A8.7 8.7 0 1 0 6.2 18.6z" />
      <path d="M9.2 9.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.4.5c-.2.2-.1.4.1.7a7 7 0 0 0 2.4 2.3c.3.2.5.2.7 0l.5-.4c.2-.2.4-.1.6 0l1.5.8c.3.2.4.4.3.7-.2.7-1.1 1.2-1.8 1.1-2.4-.2-5.5-2.5-6.8-5.6-.3-.7 0-1.5.6-1.8z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  close: (
    <>
      <path d="M7 7l10 10M17 7 7 17" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  filter: <path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6z" />,
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.5 7 3.5-7 3.5z" />
    </>
  ),
  shield: <path d="M12 3.2 5 6v5.5c0 4.6 3 7.8 7 9.3 4-1.5 7-4.7 7-9.3V6z" />,
  signal: (
    <>
      <path d="M4 19v-4M9.5 19v-8M15 19V7M20.5 19V4" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-3.6L5.5 21V4.5a1 1 0 0 1 1-1z" />,
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5V14h4v5.5" />
    </>
  ),
};

export default function OutlineIcon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={`mmc-outline-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
