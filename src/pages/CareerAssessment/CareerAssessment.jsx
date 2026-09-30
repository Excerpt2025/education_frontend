import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/useAuth.js';
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

// Dev/demo only - controlled by an env flag so it can never ship live in production.
const ALLOW_DEV_SKIP_PAYMENT = import.meta.env.VITE_ALLOW_DEV_SKIP_PAYMENT === 'true';

// How long the "selected" tick is shown before auto-advancing (ms)
const ADVANCE_DELAY = 350;

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
  const [direction, setDirection] = useState('forward'); // drives slide animation
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs so the delayed auto-advance never reads stale state, and so a
  // double-tap can't skip two questions.
  const answersRef = useRef({});
  const lockRef = useRef(false);
  const timerRef = useRef(null);
  const finalAnswersRef = useRef(null); // kept so a failed submit can be retried

  useEffect(() => {
    if (!student) return;
    api.get('/assessment/access').then((res) => setAccess(res.data)).catch(() => {});
  }, [student]);

  useEffect(() => {
    api.get('/career-values').then((res) => setCareerValueOptions(res.data.values || [])).catch(() => {});
  }, []);

  // Clear any pending auto-advance if the page is left
  useEffect(() => () => clearTimeout(timerRef.current), []);

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
      answersRef.current = {};
      setAnswers({});
      setCurrent(0);
      setDirection('forward');
      lockRef.current = false;
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

  // Dev/demo shortcut - only rendered when VITE_ALLOW_DEV_SKIP_PAYMENT is set.
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

  const submit = useCallback(async (finalAnswers) => {
    finalAnswersRef.current = finalAnswers;
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
      lockRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [student, selectedValues, paymentId, isFree]);

  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setCurrent(index);
    lockRef.current = false;
  }, []);

  const selectOption = useCallback((idx) => {
    if (lockRef.current) return;                 // ignore double taps during the advance delay
    const q = flatQuestions[current];
    if (!q) return;
    lockRef.current = true;

    const next = { ...answersRef.current, [q.id]: idx };
    answersRef.current = next;
    setAnswers(next);
    setError('');

    // Drop focus so no browser focus/active/hover style is carried to the next question
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (current < flatQuestions.length - 1) {
        goTo(current + 1, 'forward');
      } else {
        submit(next);
      }
    }, ADVANCE_DELAY);
  }, [current, flatQuestions, goTo, submit]);

  const prevQuestion = useCallback(() => {
    if (current === 0 || loading) return;
    clearTimeout(timerRef.current);
    goTo(current - 1, 'back');
  }, [current, loading, goTo]);

  // "Next" is only offered for questions already answered (after going back)
  const nextQuestion = useCallback(() => {
    if (loading) return;
    const q = flatQuestions[current];
    if (!q || answersRef.current[q.id] === undefined) return;
    clearTimeout(timerRef.current);
    if (current < flatQuestions.length - 1) goTo(current + 1, 'forward');
    else submit(answersRef.current);
  }, [current, flatQuestions, goTo, loading, submit]);

  // Keyboard: 1-9 picks an option, ← goes back, → goes forward (if answered)
  useEffect(() => {
    if (phase !== 'quiz') return undefined;
    const onKey = (e) => {
      const q = flatQuestions[current];
      if (!q) return;
      if (e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1;
        if (idx < q.options.length) selectOption(idx);
      } else if (e.key === 'ArrowLeft') prevQuestion();
      else if (e.key === 'ArrowRight') nextQuestion();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, flatQuestions, current, selectOption, prevQuestion, nextQuestion]);

  const currentQuestion = flatQuestions[current];
  const currentMeta = currentQuestion ? SECTION_META[currentQuestion.category] : null;
  const answeredCount = Object.keys(answers).length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Per-section progress (e.g. "Aptitude 2/5") for the pills
  const sectionProgress = useMemo(() => {
    const out = {};
    SECTION_ORDER.forEach((cat) => {
      const qs = flatQuestions.filter((q) => q.category === cat);
      out[cat] = { total: qs.length, done: qs.filter((q) => answers[q.id] !== undefined).length };
    });
    return out;
  }, [flatQuestions, answers]);

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
                {SECTION_ORDER.filter((cat) => sectionProgress[cat]?.total > 0).map((cat) => (
                  <span
                    key={cat}
                    className={`mmc-ca-section-pill accent-${SECTION_META[cat].color}${cat === currentQuestion.category ? ' is-active' : ''}${sectionProgress[cat].done === sectionProgress[cat].total ? ' is-done' : ''}`}
                  >
                    {sectionProgress[cat].done === sectionProgress[cat].total ? '✓ ' : ''}{SECTION_META[cat].label}
                    <small> {sectionProgress[cat].done}/{sectionProgress[cat].total}</small>
                  </span>
                ))}
              </div>
              <div className="mmc-ca-quiz-progress">
                <div className={`mmc-ca-quiz-progress-bar accent-${currentMeta.color}`} style={{ width: `${(answeredCount / flatQuestions.length) * 100}%` }} />
              </div>
              <p className="mono mmc-ca-quiz-counter">
                Question {current + 1} of {flatQuestions.length} · {currentMeta.label}
              </p>

              {/*
                KEY FIX: everything that depends on the question is keyed by the
                question id. React now tears down and rebuilds the option buttons
                for every new question, so no button can carry over the
                hover/focus/selected look of the previous question.
              */}
              <div key={currentQuestion.id} className={`mmc-ca-quiz-slide slide-${direction}`}>
                <h3 className="mmc-ca-quiz-question-anim">{currentQuestion.question}</h3>
                <div className="mmc-ca-quiz-options" role="radiogroup" aria-label={currentQuestion.question}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = currentAnswer === idx;
                    return (
                      <button
                        key={`${currentQuestion.id}-${idx}`}
                        className={`mmc-ca-quiz-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectOption(idx)}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={loading}
                      >
                        <span className="mmc-ca-quiz-option-key">{idx + 1}</span>
                        <span className="mmc-ca-quiz-option-label">{opt.label}</span>
                        {isSelected && <span className="mmc-ca-quiz-option-tick" aria-hidden="true">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading && <p className="mmc-ca-quiz-loading">Generating your report...</p>}
              {error && (
                <div className="mmc-ca-error">
                  <p>{error}</p>
                  {current === flatQuestions.length - 1 && finalAnswersRef.current && (
                    <button className="btn-outline" type="button" onClick={() => submit(finalAnswersRef.current)}>Try again</button>
                  )}
                </div>
              )}

              <div className="mmc-ca-quiz-nav">
                <button className="btn-outline" onClick={prevQuestion} disabled={current === 0 || loading} type="button">← Previous</button>
                {currentAnswer !== undefined && !loading && (
                  <button className="btn-outline" onClick={nextQuestion} type="button">
                    {current === flatQuestions.length - 1 ? 'Finish →' : 'Next →'}
                  </button>
                )}
              </div>
              <p className="mmc-ca-quiz-hint">Tip: press 1–{currentQuestion.options.length} to answer, ← → to move.</p>
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