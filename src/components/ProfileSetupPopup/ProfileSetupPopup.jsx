import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../api/api.js';
import './ProfileSetupPopup.css';

/* ============================================================================
 *  PROFILE SETUP POPUP
 *  Shows on the Home page a few seconds AFTER the subscription popup, as a
 *  bottom sheet. One question per step; answers are stored locally (so the
 *  rest of the site can personalise) and pushed to the student record when
 *  the visitor happens to be logged in.
 *
 *  Adding a second question = add one more object to STEPS. The "1/2"
 *  counter, Back/Skip behaviour and saving all follow automatically.
 * ==========================================================================*/

const STORAGE_DONE_KEY = 'mmc_profile_setup_done';
const STORAGE_ANSWERS_KEY = 'mmc_profile_answers';

const STEPS = [
  {
    key: 'studentClass',
    emoji: '🎒',
    question: 'Which class are you in?',
    help: 'This helps us customise everything you see to match your journey.',
    options: [
      'Yet to reach 10th',
      'Class 10th',
      'Class 11th',
      'Class 12th',
      'In college/Already graduated',
    ],
  },
  // Example of a second step - uncomment to use:
  // {
  //   key: 'goal',
  //   emoji: '🎯',
  //   question: 'What are you looking for right now?',
  //   help: 'We will put the most useful tools at the top for you.',
  //   options: ['Career guidance', 'College admissions', 'KCET/PGCET predictor', 'Just exploring'],
  // },
];

function readAnswers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_ANSWERS_KEY) || '{}'); } catch { return {}; }
}

export default function ProfileSetupPopup({ delay = 6000 }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [closing, setClosing] = useState(false);
  const answersRef = useRef(readAnswers());
  const sheetRef = useRef(null);

  /* Wait for the subscription popup to be dismissed before appearing - two
   * sheets on screen at once is nobody's idea of a welcome. */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (localStorage.getItem(STORAGE_DONE_KEY)) return undefined;

    let cancelled = false;
    let timer;

    const anotherPopupOpen = () =>
      !!document.querySelector('.mmc-subpop, .mmc-subscription-popup, [class*="subscription-popup"], [class*="SubscriptionPopup"]');

    const tryOpen = () => {
      if (cancelled) return;
      if (anotherPopupOpen()) { timer = window.setTimeout(tryOpen, 1500); return; }
      setOpen(true);
    };

    timer = window.setTimeout(tryOpen, delay);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [delay]);

  /* Greet by first name when we know it. Fails quietly for logged-out visitors. */
  useEffect(() => {
    if (!open) return;
    let alive = true;
    api.get('/students/me')
      .then((res) => {
        const full = res.data?.student?.fullName || '';
        if (alive && full) setName(full.trim().split(' ')[0]);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [open]);

  const finish = useCallback((saveToServer) => {
    localStorage.setItem(STORAGE_DONE_KEY, '1');
    localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(answersRef.current));
    if (saveToServer && Object.keys(answersRef.current).length) {
      api.put('/students/me', answersRef.current).catch(() => {});
    }
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, 220);
  }, []);

  const choose = (value) => {
    const current = STEPS[step];
    answersRef.current = { ...answersRef.current, [current.key]: value };
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finish(true);
  };

  // Lock background scroll + close on Escape while the sheet is open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') finish(false); };
    document.addEventListener('keydown', onKey);
    sheetRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, finish]);

  if (!open) return null;

  const current = STEPS[step];

  return (
    <div
      className={`mmc-ps-overlay${closing ? ' is-closing' : ''}`}
      onClick={() => finish(false)}
      role="presentation"
    >
      <div
        className="mmc-ps-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mmc-ps-title"
        tabIndex={-1}
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mmc-ps-grip" aria-hidden="true" />

        <h2 className="mmc-ps-title" id="mmc-ps-title">
          {name ? `${name}, let's finish setting up your profile` : "Let's finish setting up your profile"}
        </h2>
        <p className="mmc-ps-sub">Not sure? You can always edit this later.</p>

        <div className="mmc-ps-card">
          <span className="mmc-ps-emoji" aria-hidden="true">{current.emoji}</span>
          <button type="button" className="mmc-ps-skip" onClick={() => finish(false)}>Skip</button>

          <h3 className="mmc-ps-question">{current.question}</h3>
          <p className="mmc-ps-help">{current.help}</p>

          <div className="mmc-ps-options">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`mmc-ps-option${answersRef.current[current.key] === opt ? ' is-selected' : ''}`}
                onClick={() => choose(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mmc-ps-foot">
            {step > 0 ? (
              <button type="button" className="mmc-ps-back" onClick={() => setStep((s) => s - 1)}>Back</button>
            ) : <span />}
            <span className="mmc-ps-count">{step + 1}/{STEPS.length}</span>
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}