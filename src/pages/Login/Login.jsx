import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/useAuth.js';
import { Field, Spinner, EMAIL_RE, useTip } from './AuthFields.jsx';
import './Login.css';

const REMEMBER_KEY = 'mmc_remember_email';
const REQUIRED = 'Please fill in this field.';

function readRememberedEmail() {
  try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; }
}

function Brand() {
  return (
    <div className="nm-badge">
      <img src="/images/logo.png" alt="MapMyCareer360" />
    </div>
  );
}

/**
 * One card, two faces. Login and Register both render this component, so
 * switching between them flips the card in 3D instead of changing pages.
 * The URL is updated quietly so refresh / shared links still land correctly.
 */
export function AuthCard({ initial = 'login' }) {
  const [params] = useSearchParams();
  const referredBy = params.get('ref') || '';
  const navigate = useNavigate();
  const { login: setSession } = useAuth();

  const [mode, setMode] = useState(initial);
  const [flipDir, setFlipDir] = useState(''); // '', 'fwd', 'back'
  const [height, setHeight] = useState();

  const rememberedEmail = readRememberedEmail();
  const [loginForm, setLoginForm] = useState({ email: rememberedEmail, password: '' });
  const [remember, setRemember] = useState(!!rememberedEmail);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const loginTip = useTip();

  const [regForm, setRegForm] = useState({
    fullName: '',
    email: params.get('email') || '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const regTip = useTip();

  const loginFace = useRef(null);
  const regFace = useRef(null);

  // Keep the card exactly as tall as whichever face is showing.
  useLayoutEffect(() => {
    const el = mode === 'login' ? loginFace.current : regFace.current;
    if (!el) return undefined;
    const update = () => setHeight(el.offsetHeight);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const flipTo = (next) => {
    if (next === mode) return;
    loginTip.clear();
    regTip.clear();
    setFlipDir(next === 'register' ? 'fwd' : 'back');
    setMode(next);
    try {
      const qs = params.toString();
      const url = next === 'register' ? `/register${qs ? `?${qs}` : ''}` : '/login';
      window.history.replaceState(window.history.state, '', url);
    } catch { /* URL sync is cosmetic */ }
  };

  /* ---------------- login ---------------- */
  const onLoginChange = (e) => {
    setLoginForm((f) => ({ ...f, [e.target.name === 'l-email' ? 'email' : 'password']: e.target.value }));
    loginTip.clear();
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const email = loginForm.email.trim();
    if (!email) return loginTip.show('l-email', REQUIRED);
    if (!EMAIL_RE.test(email)) return loginTip.show('l-email', 'Enter a valid email address.');
    if (!loginForm.password) return loginTip.show('l-password', REQUIRED);

    setLoginLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password: loginForm.password });
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch { /* storage unavailable */ }
      setSession(res.data.token, res.data.student);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
    return undefined;
  };

  /* ---------------- register ---------------- */
  const REG_KEYS = { 'r-name': 'fullName', 'r-email': 'email', 'r-phone': 'phone', 'r-password': 'password', 'r-confirm': 'confirm' };
  const onRegChange = (e) => {
    setRegForm((f) => ({ ...f, [REG_KEYS[e.target.name]]: e.target.value }));
    regTip.clear();
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    const f = regForm;
    if (!f.fullName.trim()) return regTip.show('r-name', REQUIRED);
    if (!f.email.trim()) return regTip.show('r-email', REQUIRED);
    if (!EMAIL_RE.test(f.email.trim())) return regTip.show('r-email', 'Enter a valid email address.');
    if (!f.phone.trim()) return regTip.show('r-phone', REQUIRED);
    if (f.phone.replace(/\D/g, '').length < 10) return regTip.show('r-phone', 'Enter a 10-digit phone number.');
    if (!f.password) return regTip.show('r-password', REQUIRED);
    if (f.password.length < 6) return regTip.show('r-password', 'Use at least 6 characters.');
    if (!f.confirm) return regTip.show('r-confirm', REQUIRED);
    if (f.confirm !== f.password) return regTip.show('r-confirm', "Passwords don't match.");

    setRegLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName: f.fullName.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        password: f.password,
        referredBy,
      });
      setSession(res.data.token, res.data.student);
      navigate('/dashboard');
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
    return undefined;
  };

  return (
    <div className="mmc-auth-page">
      <div className="nm-scene">
        <div
          className={`nm-card${mode === 'register' ? ' is-register' : ''}`}
          data-dir={flipDir}
          style={{ height }}
        >
          {/* ---------- FRONT: LOGIN ---------- */}
          <section
            ref={loginFace}
            className={`nm-face nm-front${mode === 'login' ? '' : ' is-off'}`}
            aria-hidden={mode !== 'login'}
          >
            <Brand />
            <h2>Welcome Back</h2>
            <p className="nm-sub">Login to access your Career Assessment, predictors and dashboard.</p>

            <form onSubmit={submitLogin} noValidate>
              <Field
                id="l-email" name="l-email" type="email" label="Email address" autoComplete="email"
                value={loginForm.email} onChange={onLoginChange} tip={loginTip.textFor('l-email')}
              />
              <Field
                id="l-password" name="l-password" type="password" label="Password" autoComplete="current-password"
                value={loginForm.password} onChange={onLoginChange} tip={loginTip.textFor('l-password')}
              />

              <div className="nm-row">
                <label className="nm-check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span className="nm-box" aria-hidden="true" />
                  Remember me
                </label>
                <button type="button" className="nm-link" onClick={() => navigate('/forgot-password')}>
                  Forgot Password?
                </button>
              </div>

              {loginError && <p className="nm-error" role="alert">{loginError}</p>}

              <button className={`nm-btn${loginLoading ? ' is-loading' : ''}`} disabled={loginLoading}>
                <span>{loginLoading ? <><Spinner /> Logging in</> : 'Login'}</span>
              </button>
            </form>

            <div className="nm-switch">
              <span>New here?</span>
              <button type="button" className="nm-round" onClick={() => flipTo('register')} aria-label="Create an account">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </section>

          {/* ---------- BACK: REGISTER ---------- */}
          <section
            ref={regFace}
            className={`nm-face nm-back${mode === 'register' ? '' : ' is-off'}`}
            aria-hidden={mode !== 'register'}
          >
            <Brand />
            <h2>Create Your Account</h2>
            <p className="nm-sub">
              {referredBy ? `Signing up with referral code ${referredBy}` : 'Join to start your Career Assessment.'}
            </p>

            <form onSubmit={submitRegister} noValidate>
              <Field id="r-name" name="r-name" label="Full name" autoComplete="name"
                value={regForm.fullName} onChange={onRegChange} tip={regTip.textFor('r-name')} />
              <Field id="r-email" name="r-email" type="email" label="Email address" autoComplete="email"
                value={regForm.email} onChange={onRegChange} tip={regTip.textFor('r-email')} />
              <Field id="r-phone" name="r-phone" type="tel" inputMode="tel" label="Phone number" autoComplete="tel"
                value={regForm.phone} onChange={onRegChange} tip={regTip.textFor('r-phone')} />
              <Field id="r-password" name="r-password" type="password" label="Password" autoComplete="new-password"
                value={regForm.password} onChange={onRegChange} tip={regTip.textFor('r-password')} />
              <Field id="r-confirm" name="r-confirm" type="password" label="Confirm password" autoComplete="new-password"
                value={regForm.confirm} onChange={onRegChange} tip={regTip.textFor('r-confirm')} />

              {regError && <p className="nm-error" role="alert">{regError}</p>}

              <button className={`nm-btn${regLoading ? ' is-loading' : ''}`} disabled={regLoading}>
                <span>{regLoading ? <><Spinner /> Creating account</> : 'Create Account'}</span>
              </button>
            </form>

            <div className="nm-switch">
              <span>Already have an account?</span>
              <button type="button" className="nm-round" onClick={() => flipTo('login')} aria-label="Back to login">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return <AuthCard initial="login" />;
}