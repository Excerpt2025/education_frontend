import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import CareerReportCard from '../../components/CareerReportCard/CareerReportCard.jsx';
import './CareerAssessment.css';
import { loadRazorpayScript } from '../../utils/razorpay.js';

const SECTION_META = {
  interest: { label: 'Interests', color: 'blue' },
  aptitude: { label: 'Aptitude', color: 'orange' },
  personality: { label: 'Personality', color: 'purple' },
  adaptive: { label: 'Career Orientation', color: 'teal' },
};
const SECTION_ORDER = ['interest', 'aptitude', 'personality', 'adaptive'];

// Dev/demo only - lets you (or a client walkthrough) skip Razorpay entirely.
// Controlled by an env flag so it can never accidentally ship live in production.
const ALLOW_DEV_SKIP_PAYMENT = import.meta.env.VITE_ALLOW_DEV_SKIP_PAYMENT === 'true';

// Small just-in-case fallback if the admin question bank is ever completely empty.
const FALLBACK_SECTIONS = {
  interest: [{ id: 'f1', question: 'Which activity excites you the most?', options: [
    { label: 'Solving math puzzles', weights: { 'Engineering & Technology': 3 } },
    { label: 'Debating current affairs', weights: { 'Arts & Humanities': 3 } },
    { label: 'Sketching and designing', weights: { 'Design & Creative Media': 3 } },
    { label: 'Running a small business idea', weights: { 'Commerce & Business': 3 } },
  ] }],
  aptitude: [{ id: 'f2', question: 'Which comes naturally to you?', options: [
    { label: 'Spotting patterns in numbers', weights: { 'Engineering & Technology': 2, 'Science & Research': 2 } },
    { label: 'Explaining ideas clearly', weights: { 'Arts & Humanities': 3 } },
    { label: 'Visualising how something should look', weights: { 'Design & Creative Media': 3 } },
    { label: 'Estimating costs and value', weights: { 'Commerce & Business': 3 } },
  ] }],
  personality: [{ id: 'f3', question: 'In a group, you usually:', options: [
    { label: 'Analyze the data', weights: { 'Science & Research': 3 } },
    { label: 'Lead the discussion', weights: { 'Commerce & Business': 2 } },
    { label: 'Design the presentation', weights: { 'Design & Creative Media': 3 } },
    { label: 'Care for how everyone feels', weights: { 'Medicine & Healthcare': 3 } },
  ] }],
  adaptive: [{ id: 'f4', question: 'Which career sounds most appealing right now?', options: [
    { label: 'Engineer / Scientist', weights: { 'Engineering & Technology': 3 } },
    { label: 'Doctor / Healthcare professional', weights: { 'Medicine & Healthcare': 3 } },
    { label: 'Entrepreneur / Manager', weights: { 'Commerce & Business': 3 } },
    { label: 'Designer / Creator', weights: { 'Design & Creative Media': 3 } },
  ] }],
};

export default function CareerAssessment() {
  const { student } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [sections, setSections] = useState(null);
  const [careerValueOptions, setCareerValueOptions] = useState([]);
  const [access, setAccess] = useState({ freeAccess: false, assessmentFee: 199 });
  const [paymentId, setPaymentId] = useState(null);
  const [isFree, setIsFree] = useState(false);

  const [selectedValues, setSelectedValues] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;
    api.get('/assessment/access').then((res) => setAccess(res.data)).catch(() => {});
  }, [student]);

  useEffect(() => {
    api.get('/career-values').then((res) => setCareerValueOptions(res.data.values || [])).catch(() => {});
  }, []);

  const flatQuestions = useMemo(() => {
    if (!sections) return [];
    return SECTION_ORDER.flatMap((cat) => (sections[cat] || []).map((q) => ({ ...q, category: cat })));
  }, [sections]);

  const loadQuestionsAndGo = async () => {
    setLoading(true); setError('');
    try {
      const qRes = await api.get('/assessment/questions');
      const hasAny = SECTION_ORDER.some((cat) => qRes.data[cat]?.length);
      setSections(hasAny ? qRes.data : FALLBACK_SECTIONS);
      setCurrent(0);
      setPhase('quiz');
    } catch {
      setError('Could not load the assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    if (!student) { navigate('/login'); return; }
    setLoading(true); setError('');
    try {
      if (access.freeAccess) {
        setIsFree(true); setPaymentId(null);
        await loadQuestionsAndGo();
        return;
      }

      const pay = await api.post('/assessment/pay');
      const { payment, razorpayOrderId, razorpayKeyId, amount, currency } = pay.data;
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load payment gateway. Check your connection and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKeyId, amount, currency,
        name: 'MapMyCareer360', description: 'Career Assessment Fee', order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verify = await api.post('/payments/verify', {
              paymentId: payment._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verify.data.success) {
              setPaymentId(payment._id); setIsFree(false);
              await loadQuestionsAndGo();
            } else {
              setError('Payment verification failed. Please try again.');
              setLoading(false);
            }
          } catch {
            setError('Payment verification failed. Please try again.');
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: { name: student?.fullName, email: student?.email, contact: student?.phone },
        theme: { color: '#f57c00' },
      };
      new window.Razorpay(options).open();
    } catch {
      setError('Could not start assessment. Please try again.');
      setLoading(false);
    }
  };

  // Dev/demo shortcut - bypasses Razorpay entirely so the flow can be shown
  // to a client without a real transaction. Only rendered when the
  // VITE_ALLOW_DEV_SKIP_PAYMENT env flag is set (never in production).
  const skipPaymentDev = async () => {
    if (!student) { navigate('/login'); return; }
    setIsFree(true); setPaymentId(null);
    await loadQuestionsAndGo();
  };

  const toggleValue = (key) => {
    setSelectedValues((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const selectOption = (idx) => {
    const q = flatQuestions[current];
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    // Auto-advance for a snappier, more interactive feel.
    window.setTimeout(() => {
      if (current < flatQuestions.length - 1) setCurrent((c) => c + 1);
      else submit({ ...answers, [q.id]: idx });
    }, 260);
  };
  const prevQuestion = () => setCurrent((c) => Math.max(0, c - 1));

  const submit = async (finalAnswers) => {
    setLoading(true); setError('');
    try {
      const payload = {
        studentInfo: { fullName: student?.fullName || '' },
        academicProfile: {},
        careerValues: selectedValues,
        answers: Object.entries(finalAnswers).map(([questionId, selectedOptionIndex]) => ({ questionId, selectedOptionIndex })),
        paymentId, isFreeViaSubscription: isFree,
      };
      const res = await api.post('/assessment/submit', payload);
      setResult(res.data.result);
      setPhase('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit assessment.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = flatQuestions[current];
  const currentMeta = currentQuestion ? SECTION_META[currentQuestion.category] : null;

  return (
    <div className="mmc-assessment-page mmc-assessment-page--lean">

      <div className="mmc-ca-title-row container">
        <span className="mono mmc-ca-eyebrow">MMC Navigator · Career Assessment</span>
        <h1>Discover the route <span className="mmc-ca-grad">only you</span> can take.</h1>
        {phase === 'intro' && (
          <p className="mmc-ca-title-sub">
            Four quick interactive sections - Interests, Aptitude, Personality and Career Orientation -
            answered one tap at a time. Your personalized report is ready right after.
          </p>
        )}
      </div>

      <section className="mmc-ca-section mmc-ca-action mmc-ca-action--top">
        <div className="container mmc-ca-action-inner">

          {phase === 'intro' && (
            <div className="mmc-ca-start-card">
              <span className="mono">Take the first step</span>
              <h2>Before You Begin</h2>
              <ul className="mmc-ca-dash-list">
                <li>Takes about 5 minutes - tap an answer and it moves straight to the next question.</li>
                <li>{access.freeAccess ? 'You have free access via your active subscription.' : `One-time fee of ₹${access.assessmentFee} applies (free for subscribers).`}</li>
                <li>Your report is saved to your dashboard and downloadable as a PDF.</li>
              </ul>

              {careerValueOptions.length > 0 && (
                <div className="mmc-ca-quick-values">
                  <span className="mmc-ca-quick-values-label">Optional: what matters most to you? (pick up to 3)</span>
                  <div className="mmc-ca-values-grid">
                    {careerValueOptions.map((v) => (
                      <button
                        key={v.key} type="button"
                        className={`mmc-ca-value-chip ${selectedValues.includes(v.key) ? 'selected' : ''}`}
                        onClick={() => toggleValue(v.key)}
                        disabled={!selectedValues.includes(v.key) && selectedValues.length >= 3}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="mmc-ca-error">{error}</p>}

              <div className="mmc-ca-start-actions">
                <button className="btn-primary" onClick={startAssessment} disabled={loading}>
                  {loading ? 'Preparing...' : (access.freeAccess ? 'Start Free Assessment' : `Pay ₹${access.assessmentFee} & Start`)} →
                </button>
                {ALLOW_DEV_SKIP_PAYMENT && !access.freeAccess && (
                  <button className="btn-outline mmc-ca-dev-skip" onClick={skipPaymentDev} disabled={loading} type="button">
                    ⚡ Skip Payment (Dev/Demo)
                  </button>
                )}
              </div>
              {!student && <p className="mmc-ca-note">You'll need to <Link to="/login">login</Link> or <Link to="/register">sign up</Link> first.</p>}
            </div>
          )}

          {phase === 'quiz' && currentQuestion && (
            <div className="mmc-ca-quiz-card">
              <div className="mmc-ca-quiz-section-row">
                {SECTION_ORDER.map((cat) => (
                  <span key={cat} className={`mmc-ca-section-pill accent-${SECTION_META[cat].color}${cat === currentQuestion.category ? ' is-active' : ''}`}>
                    {SECTION_META[cat].label}
                  </span>
                ))}
              </div>
              <div className="mmc-ca-quiz-progress">
                <div className={`mmc-ca-quiz-progress-bar accent-${currentMeta.color}`} style={{ width: `${((current + 1) / flatQuestions.length) * 100}%` }} />
              </div>
              <p className="mono mmc-ca-quiz-counter">Question {current + 1} of {flatQuestions.length} · {currentMeta.label}</p>
              <h3 key={currentQuestion.id} className="mmc-ca-quiz-question-anim">{currentQuestion.question}</h3>
              <div className="mmc-ca-quiz-options">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`mmc-ca-quiz-option ${answers[currentQuestion.id] === idx ? 'selected' : ''}`}
                    onClick={() => selectOption(idx)}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {loading && <p className="mmc-ca-quiz-loading">Generating your report...</p>}
              {error && <p className="mmc-ca-error">{error}</p>}
              <div className="mmc-ca-quiz-nav">
                <button className="btn-outline" onClick={prevQuestion} disabled={current === 0} type="button">← Previous</button>
              </div>
            </div>
          )}

          {phase === 'result' && result && (
            <CareerReportCard report={result} studentName={student?.fullName} />
          )}
        </div>
      </section>
    </div>
  );
}
