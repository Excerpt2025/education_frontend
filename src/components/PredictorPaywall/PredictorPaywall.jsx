import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { loadRazorpayScript } from '../../utils/razorpay.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './PredictorPaywall.css';

// Dev/demo only - see the matching server-side ALLOW_DEV_SKIP_PAYMENT flag.
// The env flag alone does nothing without that server-side flag also being
// set, so this can never grant real access in production even if left on.
const ALLOW_DEV_SKIP_PAYMENT = import.meta.env.VITE_ALLOW_DEV_SKIP_PAYMENT === 'true';

const FALLBACK_PLANS = [
  { _id: 'monthly', name: 'Monthly', price: 1, durationInDays: 30 },
  { _id: 'quarterly', name: 'Quarterly', price: 1, durationInDays: 90 },
  { _id: 'yearly', name: 'Yearly', price: 1, durationInDays: 365 },
];

export default function PredictorPaywall({ predictorName, oneTimeFee, formData, predictorEndpoint, onUnlocked }) {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [oneTimeProcessing, setOneTimeProcessing] = useState(false);
  const [devSkipping, setDevSkipping] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { student } = useAuth();

  useEffect(() => {
    api.get('/subscription-plans').then((res) => {
      if (res.data.plans?.length) { setPlans(res.data.plans); setSelectedPlan(res.data.plans[0]._id); }
      else setSelectedPlan(FALLBACK_PLANS[0]._id);
    }).catch(() => setSelectedPlan(FALLBACK_PLANS[0]._id));
  }, []);

  // Re-run the predictor call now that access has been granted (either via
  // subscription or one-time payment), so results appear without a page reload
  // and without losing anything the student typed into the form.
  const unlockAndFetch = async (extra = {}) => {
    const res = await api.post(predictorEndpoint, { ...formData, ...extra });
    if (onUnlocked) onUnlocked(res.data);
  };

  const subscribe = async (e) => {
    e.preventDefault();
    setError(''); setProcessing(true);
    try {
      const order = await api.post('/subscriptions/purchase', { planId: selectedPlan });
      const { payment, razorpayOrderId, razorpayKeyId, amount, currency } = order.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load payment gateway. Check your connection and try again.');
        setProcessing(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'MapMyCareer360',
        description: `${plan?.name || 'Subscription'} Plan`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verify = await api.post('/payments/verify', {
              paymentId: payment._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan,
            });
            if (verify.data.success) {
              setDone(true);
              await unlockAndFetch();
            } else {
              setError('Payment verification failed. Please contact support if money was deducted.');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support if money was deducted.');
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        prefill: { name: student?.fullName || formData?.name, email: student?.email || formData?.email, contact: student?.phone || formData?.phone },
        theme: { color: '#0174cc' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed. Please try again.');
      setProcessing(false);
    }
  };

  const payOneTime = async () => {
    setError(''); setOneTimeProcessing(true);
    try {
      const payRes = await api.post('/predictors/pay');
      const { payment, razorpayOrderId, razorpayKeyId, amount, currency } = payRes.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load payment gateway. Check your connection and try again.');
        setOneTimeProcessing(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'MapMyCareer360',
        description: `${predictorName} Predictor - One-time access`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verify = await api.post('/payments/verify', {
              paymentId: payment._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.data.success) {
              setDone(true);
              await unlockAndFetch({ paymentId: payment._id });
            } else {
              setError('Payment verification failed. Please contact support if money was deducted.');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support if money was deducted.');
          } finally {
            setOneTimeProcessing(false);
          }
        },
        modal: { ondismiss: () => setOneTimeProcessing(false) },
        prefill: { name: student?.fullName || formData?.name, email: student?.email || formData?.email, contact: student?.phone || formData?.phone },
        theme: { color: '#0174cc' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setOneTimeProcessing(false);
    }
  };

  const plan = plans.find((p) => p._id === selectedPlan) || plans[0];

  const skipPaymentDev = async () => {
    setError(''); setDevSkipping(true);
    try {
      setDone(true);
      await unlockAndFetch({ devSkipPayment: true });
    } catch (err) {
      setDone(false);
      setError(err.response?.data?.message || 'Dev skip failed - is ALLOW_DEV_SKIP_PAYMENT set on the server?');
    } finally {
      setDevSkipping(false);
    }
  };

  return (
    <div className="card mmc-paywall">
      <span className="mmc-paywall-icon">🔒</span>
      <h3>Unlock Your {predictorName} Results</h3>
      <p>Your rank and category are saved - subscribe for full access to KCET, PGCET, Career
        Assessment and your dashboard, or pay once just to see this result.</p>

      {done ? (
        <p className="mmc-success-msg">Unlocked! Loading your results...</p>
      ) : (
        <>
          {error && <p className="error-state">{error}</p>}

          <form onSubmit={subscribe} className="mmc-paywall-form">
            <div className="mmc-paywall-plans">
              {plans.map((p) => (
                <label key={p._id} className={`mmc-paywall-plan ${selectedPlan === p._id ? 'selected' : ''}`}>
                  <input type="radio" name="plan" checked={selectedPlan === p._id} onChange={() => setSelectedPlan(p._id)} />
                  <span className="mmc-paywall-plan-name">{p.name}</span>
                  <span className="mmc-paywall-plan-price">₹{p.price}</span>
                  <span className="mmc-paywall-plan-duration">{p.durationInDays} days</span>
                </label>
              ))}
            </div>
            <button className="btn btn-primary" disabled={processing || oneTimeProcessing || !selectedPlan}>
              {processing ? 'Processing...' : `Subscribe for ₹${plan?.price || 1} & Unlock`}
            </button>
            <button type="button" className="mmc-paywall-later" onClick={() => navigate('/subscription')}>
              See full plan details first →
            </button>
          </form>

          <div className="mmc-paywall-divider">OR</div>

          <div className="mmc-paywall-onetime">
            <h4>Just want this one result?</h4>
            <p>Skip the subscription and pay a one-time fee to view this prediction only.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={payOneTime}
              disabled={processing || oneTimeProcessing}
            >
              {oneTimeProcessing ? 'Processing...' : `Pay ₹${oneTimeFee ?? 99} & View Results`}
            </button>
          </div>

          {ALLOW_DEV_SKIP_PAYMENT && (
            <button
              type="button"
              className="btn btn-outline mmc-paywall-dev-skip"
              onClick={skipPaymentDev}
              disabled={processing || oneTimeProcessing || devSkipping}
            >
              {devSkipping ? 'Skipping...' : '⚡ Skip Payment (Dev/Demo)'}
            </button>
          )}
        </>
      )}
    </div>
  );
}