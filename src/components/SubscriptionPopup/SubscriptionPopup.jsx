import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './SubscriptionPopup.css';

const DISMISS_KEY = 'mmc_promo_popup_dismissed';
const SHOW_DELAY_MS = 1800;

const FALLBACK_HIGHLIGHTS = [
  'Career Assessment - find streams that fit you',
  'KCET Predictor - see colleges within reach of your rank',
  'PGCET Predictor - match cutoffs across Karnataka',
];

export default function SubscriptionPopup() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function decide() {
      if (sessionStorage.getItem(DISMISS_KEY)) return;

      // Logged-in students who already have an active subscription never need the ad.
      if (student) {
        try {
          const res = await api.get('/subscriptions/status');
          if (res.data.active) return;
        } catch {
          /* if the check fails, fall through and still show the popup */
        }
      }

      try {
        const res = await api.get('/subscription-plans');
        const cheapest = (res.data.plans || []).slice().sort((a, b) => a.price - b.price)[0];
        if (!cancelled && cheapest) setPlan(cheapest);
      } catch {
        /* use fallback copy below if plans can't be fetched */
      }

      if (!cancelled) setOpen(true);
    }

    const timer = window.setTimeout(decide, SHOW_DELAY_MS);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [student]);

  useEffect(() => {
    if (!open) return undefined;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    return () => {
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const dismiss = () => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, 180);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  const viewPlans = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
    navigate('/subscription');
  };

  if (!open) return null;

  const highlights = plan?.features?.length ? plan.features.slice(0, 3) : FALLBACK_HIGHLIGHTS;

  return createPortal(
    <div className={`mmc-promo-backdrop${closing ? ' is-closing' : ''}`} onClick={dismiss}>
      <div className={`mmc-promo-card${closing ? ' is-closing' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Subscription offer">
        <span className="mmc-promo-blob mmc-promo-blob-a" aria-hidden="true" />
        <span className="mmc-promo-blob mmc-promo-blob-b" aria-hidden="true" />
        <button type="button" className="mmc-promo-close" onClick={dismiss} aria-label="Close">
          <OutlineIcon name="close" size={16} />
        </button>

        <span className="mmc-promo-badge"><OutlineIcon name="shield" size={13} /> Limited-Time Offer</span>
        <h2>Unlock every career tool<br /><span className="mmc-promo-grad">in one subscription</span></h2>
        <p className="mmc-promo-sub">
          Career Assessment + KCET Predictor + PGCET Predictor - no separate payments, no waiting.
        </p>

        <ul className="mmc-promo-list">
          {highlights.map((h) => (
            <li key={h}><OutlineIcon name="shield" size={14} /> {h}</li>
          ))}
        </ul>

        {plan && (
          <div className="mmc-promo-price">
            <span className="mmc-promo-price-amount">₹{plan.price}</span>
            <span className="mmc-promo-price-period">/ {plan.name}</span>
          </div>
        )}

        <div className="mmc-promo-actions">
          <button type="button" className="btn btn-primary mmc-promo-cta" onClick={viewPlans}>
            View Subscription Plans <OutlineIcon name="arrow" size={15} />
          </button>
          <button type="button" className="mmc-promo-later" onClick={dismiss}>Maybe later</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
