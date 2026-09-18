import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import './Subscription.css';
import { loadRazorpayScript } from '../../utils/razorpay.js';

const FALLBACK_PLANS = [
  { _id: 'monthly', name: 'Monthly', price: 1, durationInDays: 30, features: ['Career Assessment access', 'KCET Predictor', 'PGCET Predictor'] },
  { _id: 'quarterly', name: 'Quarterly', price: 1, durationInDays: 90, features: ['Career Assessment access', 'KCET Predictor', 'PGCET Predictor', 'Priority support'] },
  { _id: 'yearly', name: 'Yearly', price: 1, durationInDays: 365, features: ['Career Assessment access', 'KCET Predictor', 'PGCET Predictor', 'Priority support', '1-on-1 counselling session'] },
];

function periodLabel(days) {
  if (days >= 360) return '/Year';
  if (days >= 85) return '/Quarter';
  return '/Month';
}

function planCopy(plan) {
  const name = (plan.name || '').toLowerCase();
  if (name.includes('year')) {
    return 'Full-year access with counselling support for the complete admission cycle.';
  }
  if (name.includes('quarter')) {
    return 'Growing students who want predictors, dashboard access, and priority support.';
  }
  return 'For students who want assessment plus both predictors for one admission cycle.';
}

function badgeLabel(plan, featured) {
  if (featured) return 'Most Popular';
  const name = (plan.name || '').toLowerCase();
  if (name.includes('year')) return 'Full Access Plan';
  return 'Starting Plan';
}

function CheckIcon() {
  return (
    <svg className="mmc-price-check" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.2 11.2 9.8 13.7 14.8 8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="mmc-price-badge-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 9h5.6M9.2 6.4 11.8 9 9.2 11.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isFeaturedPlan(plan, list) {
  if (list.length === 1) return true;
  if (plan.name === 'Quarterly') return true;
  if (list.some((p) => p.name === 'Quarterly')) return false;
  return list.length > 1 && plan._id === list[Math.min(1, list.length - 1)]._id;
}

export default function Subscription() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const { student } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/subscription-plans').then((res) => {
      if (res.data.plans?.length) setPlans(res.data.plans);
    }).catch(() => {});
  }, []);

  const orderedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.durationInDays || 0) - (b.durationInDays || 0)),
    [plans]
  );

  const purchase = async (plan) => {
    if (!student) { navigate('/login', { state: { from: '/subscription' } }); return; }
    setProcessingId(plan._id);
    setMessage('');
    try {
      const order = await api.post('/subscriptions/purchase', { planId: plan._id });
      const { payment, razorpayOrderId, razorpayKeyId, amount, currency } = order.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setMessage('Could not load payment gateway. Check your connection and try again.');
        setProcessingId(null);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'MapMyCareer360',
        description: `${plan.name} Subscription`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verify = await api.post('/payments/verify', {
              paymentId: payment._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
            });
            if (verify.data.success) {
              setMessage(`Subscribed to the ${plan.name} plan! You now have full access to Career Assessment, KCET/PGCET predictors and your dashboard.`);
            } else {
              setMessage('Payment verification failed. Please contact support if money was deducted.');
            }
          } catch (err) {
            setMessage('Payment verification failed. Please contact support if money was deducted.');
          } finally {
            setProcessingId(null);
          }
        },
        modal: { ondismiss: () => setProcessingId(null) },
        prefill: { name: student?.fullName, email: student?.email, contact: student?.phone },
        theme: { color: '#0174cc' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Purchase failed. Please try again.');
      setProcessingId(null);
    }
  };

  return (
    <div className="mmc-pricing-page">
      <div className="container mmc-pricing-inner">
        <header className="mmc-pricing-head">
          <h1>Flexible plans that scale with <span>your admission goals</span></h1>
        </header>

        {message && <p className="mmc-pricing-message">{message}</p>}

        <div className="mmc-pricing-grid mmc-scroll-stage">
          {orderedPlans.map((plan, index) => {
            const featured = isFeaturedPlan(plan, orderedPlans);
            const features = [...(plan.features || []), 'Full access via your Student Dashboard'];

            return (
              <ScrollCard
                as="article"
                key={plan._id}
                index={index}
                delay={index * 90}
                className={`mmc-price-card${featured ? ' mmc-price-card--featured' : ''}`}
              >
                <span className="mmc-price-badge">
                  <BadgeIcon />
                  {badgeLabel(plan, featured)}
                </span>

                <div className="mmc-price-amount">
                  ₹{plan.price} <small>INR {periodLabel(plan.durationInDays)}</small>
                </div>

                <p className="mmc-price-desc">{planCopy(plan)}</p>

                <button
                  type="button"
                  className="mmc-price-cta"
                  onClick={() => purchase(plan)}
                  disabled={processingId === plan._id}
                >
                  {processingId === plan._id ? 'Processing...' : `Subscribe for ₹${plan.price}`}
                </button>

                <ul className="mmc-price-features">
                  {features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
