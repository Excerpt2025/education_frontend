import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAdminAuth } from '../../context/useAdminAuth';
import './AdminLogin.css';

/* ---------- small inline icons (no extra packages) ---------- */
const Svg = ({ children, size, className }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}
  >
    {children}
  </svg>
);

const CapIcon = () => (<Svg><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v6" /></Svg>);
const BookIcon = () => (<Svg><path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2V5z" /><path d="M20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5z" /></Svg>);
const CompassIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><polygon points="16 8 14 14 8 16 10 10" /></Svg>);
const BulbIcon = () => (<Svg><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" /></Svg>);
const PencilIcon = () => (<Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Svg>);
const GlobeIcon = () => (<Svg><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z" /></Svg>);
const EyeIcon = ({ off }) => (
  <Svg size={18}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="3" y1="3" x2="21" y2="21" />}
  </Svg>
);

const TILES = [
  { cls: 't-cap', Icon: CapIcon },
  { cls: 't-book', Icon: BookIcon },
  { cls: 't-compass', Icon: CompassIcon },
  { cls: 't-bulb', Icon: BulbIcon },
  { cls: 't-pencil', Icon: PencilIcon },
  { cls: 't-globe', Icon: GlobeIcon },
];

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [shakeKey, setShakeKey] = useState(0);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Card + 3D tiles lean toward the cursor (or finger).
  const onPointerMove = (e) => {
    const el = pageRef.current;
    if (!el) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    el.style.setProperty('--mx', x.toFixed(3));
    el.style.setProperty('--my', y.toFixed(3));
  };
  const onPointerLeave = () => {
    pageRef.current?.style.setProperty('--mx', '0');
    pageRef.current?.style.setProperty('--my', '0');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;
    setError('');
    setStatus('loading');
    try {
      const res = await api.post('/admin/login', form);
      setStatus('success');
      // Let the "Welcome back!" animation play before leaving the page.
      timerRef.current = setTimeout(() => {
        login(res.data.token, res.data.admin);
        navigate('/admin/dashboard');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
      setShakeKey((k) => k + 1);
      setStatus('idle');
    }
  };

  const busy = status !== 'idle';

  return (
    <div className="adm-page" ref={pageRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="adm-stars" aria-hidden="true" />
      <div className="adm-floor-wrap" aria-hidden="true"><div className="adm-floor" /></div>

      <div className="adm-stage">
        {TILES.map(({ cls, Icon }) => (
          <div className={`adm-tile ${cls}`} key={cls} aria-hidden="true">
            <div className="adm-tile-in"><Icon /></div>
          </div>
        ))}

        <div className={`adm-card${shakeKey ? ' is-shake' : ''}`} key={shakeKey}>
          <div className="adm-logo">
            <img src="/images/logo.png" alt="MapMyCareer360" />
          </div>
          <span className="adm-eyebrow">Admin Console</span>
          <h2>Welcome back</h2>
          <p className="adm-sub">Restricted access - MapMyCareer360 staff only.</p>

          <form onSubmit={handleSubmit}>
            <div className="adm-field">
              <div className="adm-input">
                <input
                  id="adm-email" type="email" placeholder=" " autoComplete="username"
                  value={form.email} disabled={busy}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                />
                <label htmlFor="adm-email">Email</label>
              </div>
            </div>

            <div className="adm-field">
              <div className="adm-input">
                <input
                  id="adm-password" type={showPw ? 'text' : 'password'} placeholder=" " autoComplete="current-password"
                  value={form.password} disabled={busy}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                />
                <label htmlFor="adm-password">Password</label>
                <button
                  type="button" className="adm-eye" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            {error && <p className="adm-error" role="alert">{error}</p>}

            <button className={`adm-btn${status === 'success' ? ' is-success' : ''}`} disabled={busy}>
              {status === 'idle' && <>Sign In</>}
              {status === 'loading' && <><i className="adm-spinner" /> Signing in...</>}
              {status === 'success' && (
                <svg className="adm-tick" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </button>
            <p className="adm-status" aria-live="polite">
              {status === 'loading' && 'Verifying your credentials...'}
              {status === 'success' && 'Welcome back!'}
            </p>
          </form>

          <p className="adm-foot">Your activity on this console is logged for security.</p>
        </div>
      </div>
    </div>
  );
}