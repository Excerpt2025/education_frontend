import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api.js';
import { Field, Spinner, EMAIL_RE, useTip } from '../Login/AuthFields.jsx';
import '../Login/Login.css';

const CODE_LEN = 6;
const RESEND_SECONDS = 30;
const REQUIRED = 'Please fill in this field.';
const BLANK = Array(CODE_LEN).fill('');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function maskEmail(email) {
  const [name = '', domain = ''] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 1)}${'•'.repeat(Math.max(2, name.length - 1))}@${domain}`;
}

const STEP_COPY = {
  email: ['Reset Password', "Enter your registered email and we'll send you a 6-digit verification code."],
  code: ['Verify Your Email', null], // sub text is built from the email
  newpass: ['Create New Password', 'Use at least 6 characters.'],
  done: ['Password Updated', 'You can now log in with your new password.'],
};
const STEP_INDEX = { email: 0, code: 1, newpass: 2, done: 2 };

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // email | code | newpass | done
  const [email, setEmail] = useState('');
  const [devCode, setDevCode] = useState('');
  const [digits, setDigits] = useState(BLANK);
  const [phase, setPhase] = useState('idle'); // idle | orbit | spin | converge | burst
  const [shake, setShake] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const inputs = useRef([]);
  const alive = useRef(true);
  const busy = useRef(false);
  const emailTip = useTip();
  const pwTip = useTip();

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') inputs.current[0]?.focus();
  }, [step]);

  /* ---------------- step 1: request code ---------------- */
  const sendCode = async ({ isResend = false } = {}) => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
     
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
if (res.data.devNote) {            // dev only: server tells us why no email was sent
  setError(res.data.devNote);
  return;
}
      setDevCode(res.data.devCode || ''); // only present when the server is not in production
      setDigits(BLANK);
      setResendIn(RESEND_SECONDS);
      if (isResend) {
        setNotice('A new code has been sent.');
        inputs.current[0]?.focus();
      } else {
        setStep('code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) return emailTip.show('f-email', REQUIRED);
    if (!EMAIL_RE.test(email.trim())) return emailTip.show('f-email', 'Enter a valid email address.');
    return sendCode();
  };

  /* ---------------- step 2: verify code ---------------- */
  const verify = async (code) => {
    if (busy.current) return;
    busy.current = true;
    setError('');
    setNotice('');
    setPhase('orbit');
    const fast = prefersReducedMotion();

    let token = '';
    let failure = '';
    await Promise.all([
      api.post('/auth/verify-reset-code', { email: email.trim(), code })
        .then((r) => { token = r.data.resetToken; })
        .catch((e) => { failure = e.response?.data?.message || 'Could not verify the code. Please try again.'; }),
      sleep(fast ? 0 : 700),
    ]);
    if (!alive.current) return;

    if (failure) {
      setPhase('idle');
      setShake(true);
      setError(failure);
      await sleep(500);
      if (!alive.current) return;
      setShake(false);
      setDigits(BLANK);
      busy.current = false;
      inputs.current[0]?.focus();
      return;
    }

    setResetToken(token);
    if (!fast) {
      setPhase('spin');
      await sleep(1300);
      if (!alive.current) return;
      setPhase('converge');
      await sleep(650);
      if (!alive.current) return;
    }
    setPhase('burst');
    await sleep(fast ? 200 : 1000);
    if (!alive.current) return;
    busy.current = false;
    setPhase('idle');
    setStep('newpass');
  };

  const fillFrom = (startIndex, text) => {
    const clean = text.replace(/\D/g, '').slice(0, CODE_LEN - startIndex);
    if (!clean) return;
    const next = [...digits];
    clean.split('').forEach((d, k) => { next[startIndex + k] = d; });
    setDigits(next);
    setError('');
    const last = Math.min(startIndex + clean.length, CODE_LEN - 1);
    inputs.current[last]?.focus();
    if (next.every(Boolean)) verify(next.join(''));
  };

  const onDigitChange = (i, e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      const next = [...digits];
      next[i] = '';
      setDigits(next);
      return;
    }
    fillFrom(i, value.length > 1 ? value : value.slice(-1));
  };

  const onDigitKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < CODE_LEN - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const onDigitPaste = (i, e) => {
    e.preventDefault();
    fillFrom(0, e.clipboardData.getData('text'));
  };

  /* ---------------- step 3: new password ---------------- */
  const submitNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!pw.next) return pwTip.show('f-new', REQUIRED);
    if (pw.next.length < 6) return pwTip.show('f-new', 'Use at least 6 characters.');
    if (!pw.confirm) return pwTip.show('f-confirm', REQUIRED);
    if (pw.confirm !== pw.next) return pwTip.show('f-confirm', "Passwords don't match.");

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword: pw.next });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Your reset session expired. Please request a new code.');
    } finally {
      setLoading(false);
    }
    return undefined;
  };

  const restart = () => {
    setStep('email');
    setDigits(BLANK);
    setPhase('idle');
    setError('');
    setNotice('');
    setResetToken('');
    busy.current = false;
  };

  const [title, sub] = STEP_COPY[step];
  const subText = step === 'code' ? `We sent a 6-digit code to ${maskEmail(email.trim())}.` : sub;

  return (
    <div className="mmc-auth-page">
      <div className="nm-scene">
        <div className="nm-solo">
          <div className="nm-badge">
            <img src="/images/logo.png" alt="MapMyCareer360" />
          </div>

          <div className="nm-dots" aria-hidden="true">
            {[0, 1, 2].map((n) => (
              <span key={n} className={n <= STEP_INDEX[step] ? 'on' : ''} />
            ))}
          </div>

          <h2>{title}</h2>
          <p className="nm-sub">{subText}</p>

          <div className="nm-step" key={step}>
            {/* ------------ email ------------ */}
            {step === 'email' && (
              <form onSubmit={submitEmail} noValidate>
                <Field
                  id="f-email" type="email" label="Registered email" autoComplete="email"
                  value={email} onChange={(e) => { setEmail(e.target.value); emailTip.clear(); }}
                  tip={emailTip.textFor('f-email')}
                />
                {error && <p className="nm-error" role="alert">{error}</p>}
                <button className={`nm-btn${loading ? ' is-loading' : ''}`} disabled={loading}>
                  <span>{loading ? <><Spinner /> Sending</> : 'Send Verification Code'}</span>
                </button>
              </form>
            )}

            {/* ------------ code ------------ */}
            {step === 'code' && (
              <div>
                <div className="otp-stage" data-phase={phase} data-shake={shake}>
                  <div className="otp-ring">
                    {digits.map((d, i) => (
                      <div key={i} className={`otp-box${d ? ' filled' : ''}`} style={{ '--i': i }}>
                        <input
                          ref={(el) => { inputs.current[i] = el; }}
                          value={d}
                          inputMode="numeric"
                          autoComplete={i === 0 ? 'one-time-code' : 'off'}
                          maxLength={CODE_LEN}
                          aria-label={`Digit ${i + 1} of ${CODE_LEN}`}
                          disabled={phase !== 'idle'}
                          onChange={(e) => onDigitChange(i, e)}
                          onKeyDown={(e) => onDigitKeyDown(i, e)}
                          onPaste={(e) => onDigitPaste(i, e)}
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="otp-pulse" aria-hidden="true" />
                  <div className="otp-burst" aria-hidden="true">
                    {Array.from({ length: 14 }, (_, k) => (
                      <span key={k} style={{ '--d': `${k * (360 / 14)}deg` }} />
                    ))}
                  </div>
                  <div className="otp-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>
                </div>

                {devCode && (
                  <p className="nm-dev">Dev mode: your code is <strong>{devCode}</strong></p>
                )}
                {error && <p className="nm-error" role="alert">{error}</p>}
                {notice && !error && <p className="nm-notice" role="status">{notice}</p>}

                <p className="nm-resend">
                  Didn't receive the code?{' '}
                  {resendIn > 0 ? (
                    <span>Resend in {resendIn}s</span>
                  ) : (
                    <button type="button" className="nm-link" onClick={() => sendCode({ isResend: true })} disabled={loading || phase !== 'idle'}>
                      Resend code
                    </button>
                  )}
                </p>
                <p className="nm-resend">
                  <button type="button" className="nm-link" onClick={restart} disabled={phase !== 'idle'}>
                    Use a different email
                  </button>
                </p>
              </div>
            )}

            {/* ------------ new password ------------ */}
            {step === 'newpass' && (
              <form onSubmit={submitNewPassword} noValidate>
                <Field
                  id="f-new" type="password" label="New password" autoComplete="new-password"
                  value={pw.next} onChange={(e) => { setPw({ ...pw, next: e.target.value }); pwTip.clear(); }}
                  tip={pwTip.textFor('f-new')}
                />
                <Field
                  id="f-confirm" type="password" label="Confirm new password" autoComplete="new-password"
                  value={pw.confirm} onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); pwTip.clear(); }}
                  tip={pwTip.textFor('f-confirm')}
                />
                {error && (
                  <p className="nm-error" role="alert">
                    {error}{' '}
                    <button type="button" className="nm-link" onClick={restart}>Start over</button>
                  </p>
                )}
                <button className={`nm-btn${loading ? ' is-loading' : ''}`} disabled={loading}>
                  <span>{loading ? <><Spinner /> Updating</> : 'Update Password'}</span>
                </button>
              </form>
            )}

            {/* ------------ done ------------ */}
            {step === 'done' && (
              <div className="nm-done">
                <svg className="nm-tick" viewBox="0 0 52 52" width="76" height="76" aria-hidden="true">
                  <circle className="nm-tick-c" cx="26" cy="26" r="23" fill="none" />
                  <path className="nm-tick-p" d="M15 27l8 8 14-16" fill="none" />
                </svg>
                <Link to="/login" className="nm-btn nm-btn-link"><span>Back to Login</span></Link>
              </div>
            )}
          </div>

          {step !== 'done' && (
            <div className="nm-foot">
              <Link to="/login" className="nm-link">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}