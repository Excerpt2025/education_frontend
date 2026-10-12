import React, { useEffect, useRef, useState } from 'react';

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* Small hook: one validation tooltip at a time, auto-hides after a few seconds. */
export function useTip() {
  const [tip, setTip] = useState(null); // { field, text }
  const timer = useRef(null);

  const clear = () => {
    clearTimeout(timer.current);
    setTip(null);
  };

  const show = (field, text) => {
    clearTimeout(timer.current);
    setTip({ field, text });
    document.getElementById(field)?.focus();
    timer.current = setTimeout(() => setTip(null), 3200);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return { tip, show, clear, textFor: (field) => (tip && tip.field === field ? tip.text : '') };
}

export function EyeIcon({ off }) {
  return off ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* Embossed input with floating label, animated focus line and validation tooltip. */
export function Field({
  id, label, type = 'text', value, onChange, tip, autoComplete, inputMode, name, maxLength,
}) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`nm-field${tip ? ' has-tip' : ''}`}>
      <div className="nm-input-wrap">
        <input
          id={id}
          name={name || id}
          type={isPassword && reveal ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder=" "
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={tip ? 'true' : 'false'}
        />
        <label htmlFor={id}>{label}</label>
        {isPassword && (
          <button
            type="button"
            className="nm-eye"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            <EyeIcon off={reveal} />
          </button>
        )}
        <span className="nm-line" aria-hidden="true" />
      </div>
      {tip && (
        <div className="nm-tip" role="alert">
          <span className="nm-tip-ic" aria-hidden="true">!</span>
          {tip}
        </div>
      )}
    </div>
  );
}

export function Spinner() {
  return <span className="nm-spinner" aria-hidden="true" />;
}