import React, { useEffect, useRef, useState } from 'react';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import CenterFlow from '../../motion/CenterFlow.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';

import './StudentReviews.css';

const PREVIEW_CHARS = 160;

const REVIEWS = [
  {
    id: 'ananya',
    name: 'Ananya R.',
    course: 'Engineering · Bangalore',
    source: 'KCET',
    featured: true,
    review: 'The predictor showed exactly which colleges were realistic — Safe, Moderate, Dream.',
  },
  {
    id: 'rahul',
    name: 'Rahul K.',
    course: 'PGCET aspirant',
    source: 'PGCET',
    review: 'Together they saved weeks of guesswork on PGCET shortlists.',
  },
  {
    id: 'sneha',
    name: 'Sneha M.',
    course: 'Career assessment',
    source: 'Assessment',
    review: 'The career test matched what Sneha actually enjoyed in college.',
  },
];

function visibleCount() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 980) return 2;
  return 3;
}

function Stars() {
  return (
    <span className="mmc-rev-stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14">
          <path d="M12 3.6 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.8 6.7 19.5l1.2-5.8-4.4-4L9.4 9z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review, delay, index = 0 }) {
  const [open, setOpen] = useState(false);
  const long = review.review.length > PREVIEW_CHARS;
  const text = !long || open ? review.review : `${review.review.slice(0, PREVIEW_CHARS).trim()}…`;

  return (
    <ScrollCard index={index} delay={delay} className={`mmc-rev-scene${review.featured ? ' is-featured' : ''}`}>
      <article className="mmc-rev-card">
        <header className="mmc-rev-who">
          <span className="mmc-rev-avatar" aria-hidden="true">{review.name.slice(0, 1)}</span>
          <div>
            <strong><AnimatedText delay={delay}>{review.name}</AnimatedText></strong>
            <small>{review.course}</small>
          </div>
          {review.source ? <em>{review.source}</em> : null}
        </header>
        <Stars />
        <p>{text}</p>
        {long ? (
          <button type="button" className="mmc-rev-more" onClick={() => setOpen((v) => !v)}>
            {open ? 'Read less' : 'Read more'}
          </button>
        ) : null}
      </article>
    </ScrollCard>
  );
}

export default function StudentReviews() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const startX = useRef(null);
  const maxIndex = Math.max(0, REVIEWS.length - visible);
  const featured = REVIEWS.find((review) => review.featured) || REVIEWS[0];

  useEffect(() => {
    const update = () => setVisible(visibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

  const onPointerDown = (event) => {
    startX.current = event.clientX;
  };

  const onPointerUp = (event) => {
    if (startX.current == null) return;
    const delta = event.clientX - startX.current;
    startX.current = null;
    if (delta > 48) prev();
    if (delta < -48) next();
  };

  return (
    <section className="section mmc-rev-section" aria-labelledby="mmc-rev-heading">
      <CenterFlow className="mmc-rev-flow" />
      <div className="container">
        <div className="mmc-rev-top">
          <MotionReveal className="mmc-rev-head">
            <p className="mmc-section-eyebrow mmc-heading-italic">
              <AnimatedText mark="students">What students say</AnimatedText>
            </p>
            <h2 id="mmc-rev-heading" className="mmc-heading-italic">
              <AnimatedText mark="clarity">Real experiences from students mapping their next step</AnimatedText>
            </h2>
            <p>Students who used assessment, predictors and counsellor support to choose with more clarity.</p>
            <p className="mmc-rev-trust">Loved by students</p>
          </MotionReveal>

          <div className="mmc-rev-aside">
            <MotionReveal variant="right" delay={90}>
              <div className="mmc-rev-aside-frame">
                <img src="/images/review.jpg" alt="" loading="lazy" />
              </div>
            </MotionReveal>
            {maxIndex > 0 ? (
              <div className="mmc-rev-toolbar">
                <button type="button" className="mmc-rev-nav" onClick={prev} aria-label="Previous reviews">
                  <OutlineIcon name="arrow" size={16} />
                </button>
                <button type="button" className="mmc-rev-nav" onClick={next} aria-label="Next reviews">
                  <OutlineIcon name="arrow" size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <MotionReveal className="mmc-rev-featured" delay={60}>
          <blockquote className="mmc-rev-quote">
            <Stars />
            <p>“{featured.review}”</p>
            <footer>
              <span className="mmc-rev-avatar" aria-hidden="true">{featured.name.slice(0, 1)}</span>
              <div>
                <strong>{featured.name}</strong>
                <small>{featured.course}</small>
              </div>
              {featured.source ? <em>{featured.source}</em> : null}
            </footer>
          </blockquote>
        </MotionReveal>

        <div
          className="mmc-rev-viewport"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { startX.current = null; }}
        >
          <div
            className="mmc-rev-track mmc-scroll-stage"
            style={{ '--mmc-rev-index': index, '--mmc-rev-visible': visible }}
          >
            {REVIEWS.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} delay={staggerDelay(i, 90)} />
            ))}
          </div>
        </div>

        {maxIndex > 0 ? (
          <div className="mmc-rev-dots" role="tablist" aria-label="Review slides">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={index === i}
                aria-label={`Show reviews starting at ${i + 1}`}
                className={`mmc-rev-dot${index === i ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}





// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
// import ScrollCard from '../../motion/ScrollCard.jsx';
// import AnimatedText from '../../motion/AnimatedText.jsx';
// import CenterFlow from '../../motion/CenterFlow.jsx';
// import OutlineIcon from '../icons/OutlineIcon.jsx';

// import './StudentReviews.css';

// const PREVIEW_CHARS = 160;

// // Set window.__MMC_API_BASE__ = 'https://api.yourdomain.com' in index.html if the
// // API isn't served from the same origin. Otherwise relative paths just work.
// const API_BASE = (typeof window !== 'undefined' && window.__MMC_API_BASE__) || '';

// const SOURCES = ['KCET', 'PGCET', 'Assessment', 'Counselling', 'Colleges', 'Other'];

// function visibleCount() {
//   if (typeof window === 'undefined') return 3;
//   if (window.innerWidth <= 640) return 1;
//   if (window.innerWidth <= 980) return 2;
//   return 3;
// }

// function Stars({ rating = 5 }) {
//   return (
//     <span className="mmc-rev-stars" aria-label={`${rating} out of 5 stars`}>
//       {Array.from({ length: 5 }, (_, i) => (
//         <svg key={i} viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" opacity={i < rating ? 1 : 0.25}>
//           <path d="M12 3.6 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.8 6.7 19.5l1.2-5.8-4.4-4L9.4 9z" />
//         </svg>
//       ))}
//     </span>
//   );
// }

// function ReviewCard({ review, delay, index = 0 }) {
//   const [open, setOpen] = useState(false);
//   const long = review.review.length > PREVIEW_CHARS;
//   const text = !long || open ? review.review : `${review.review.slice(0, PREVIEW_CHARS).trim()}…`;

//   return (
//     <ScrollCard index={index} delay={delay} className={`mmc-rev-scene${review.featured ? ' is-featured' : ''}`}>
//       <article className="mmc-rev-card">
//         <header className="mmc-rev-who">
//           <span className="mmc-rev-avatar" aria-hidden="true">{review.name.slice(0, 1)}</span>
//           <div>
//             <strong><AnimatedText delay={delay}>{review.name}</AnimatedText></strong>
//             <small>{review.course}</small>
//           </div>
//           {review.source ? <em>{review.source}</em> : null}
//         </header>
//         <Stars rating={review.rating} />
//         <p>{text}</p>
//         {long ? (
//           <button type="button" className="mmc-rev-more" onClick={() => setOpen((v) => !v)}>
//             {open ? 'Read less' : 'Read more'}
//           </button>
//         ) : null}
//       </article>
//     </ScrollCard>
//   );
// }

// const EMPTY_FORM = {
//   fullName: '', email: '', phone: '', course: '', city: '',
//   source: 'KCET', rating: 5, review: '', consentToPublish: false,
// };

// function ReviewForm({ onDone }) {
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [state, setState] = useState({ sending: false, error: '', done: false });

//   const set = (key) => (event) => {
//     const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
//     setForm((f) => ({ ...f, [key]: value }));
//   };

//   const submit = async () => {
//     if (!form.consentToPublish) {
//       setState({ sending: false, error: 'Please tick the box so we know we can publish this.', done: false });
//       return;
//     }
//     setState({ sending: true, error: '', done: false });
//     try {
//       const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
//       const res = await fetch(`${API_BASE}/api/reviews`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ ...form, rating: Number(form.rating) }),
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || 'Something went wrong');
//       setForm(EMPTY_FORM);
//       setState({ sending: false, error: '', done: true });
//       if (onDone) onDone();
//     } catch (err) {
//       setState({ sending: false, error: err.message, done: false });
//     }
//   };

//   if (state.done) {
//     return (
//       <div className="mmc-rev-form mmc-rev-form-done">
//         <p>Thank you — we&apos;ll put your review live once we&apos;ve had a quick look at it.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="mmc-rev-form">
//       <h3>Share your experience</h3>

//       <div className="mmc-rev-form-row">
//         <label>
//           Your name
//           <input type="text" value={form.fullName} onChange={set('fullName')} placeholder="Ananya Rao" />
//           <small>We only show your first name and last initial.</small>
//         </label>
//         <label>
//           Course or class
//           <input type="text" value={form.course} onChange={set('course')} placeholder="Engineering" />
//         </label>
//       </div>

//       <div className="mmc-rev-form-row">
//         <label>
//           City
//           <input type="text" value={form.city} onChange={set('city')} placeholder="Bangalore" />
//         </label>
//         <label>
//           What did you use?
//           <select value={form.source} onChange={set('source')}>
//             {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
//           </select>
//         </label>
//       </div>

//       <div className="mmc-rev-form-row">
//         <label>
//           Email <span className="mmc-rev-optional">(optional)</span>
//           <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
//         </label>
//         <label>
//           Phone <span className="mmc-rev-optional">(optional)</span>
//           <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9XXXXXXXXX" />
//         </label>
//       </div>

//       <fieldset className="mmc-rev-rating-picker">
//         <legend>Your rating</legend>
//         {[1, 2, 3, 4, 5].map((n) => (
//           <button
//             key={n}
//             type="button"
//             className={`mmc-rev-rating-star${Number(form.rating) >= n ? ' is-on' : ''}`}
//             onClick={() => setForm((f) => ({ ...f, rating: n }))}
//             aria-label={`${n} star${n > 1 ? 's' : ''}`}
//             aria-pressed={Number(form.rating) === n}
//           >
//             <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
//               <path d="M12 3.6 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.8 6.7 19.5l1.2-5.8-4.4-4L9.4 9z" />
//             </svg>
//           </button>
//         ))}
//       </fieldset>

//       <label className="mmc-rev-form-full">
//         Your review
//         <textarea
//           rows={4}
//           value={form.review}
//           onChange={set('review')}
//           maxLength={1000}
//           placeholder="What were you unsure about before, and what changed after?"
//         />
//         <small>{form.review.length}/1000</small>
//       </label>

//       <label className="mmc-rev-consent">
//         <input type="checkbox" checked={form.consentToPublish} onChange={set('consentToPublish')} />
//         <span>I&apos;m happy for MapMyCareer360 to publish this review on their website.</span>
//       </label>

//       {state.error ? <p className="mmc-rev-form-error" role="alert">{state.error}</p> : null}

//       <button type="button" className="mmc-rev-submit" onClick={submit} disabled={state.sending}>
//         {state.sending ? 'Sending…' : 'Send review'}
//       </button>
//     </div>
//   );
// }

// export default function StudentReviews() {
//   const [reviews, setReviews] = useState([]);
//   const [meta, setMeta] = useState({ totalCount: 0, averageRating: null });
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);

//   const [index, setIndex] = useState(0);
//   const [visible, setVisible] = useState(3);
//   const startX = useRef(null);

//   const maxIndex = Math.max(0, reviews.length - visible);
//   const featured = reviews.find((r) => r.featured) || reviews[0];
//   const rest = featured ? reviews.filter((r) => r.id !== featured.id) : reviews;

//   const load = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/reviews?limit=12`);
//       const data = await res.json();
//       if (data.success) {
//         setReviews(data.reviews || []);
//         setMeta({ totalCount: data.totalCount || 0, averageRating: data.averageRating });
//       }
//     } catch {
//       setReviews([]); // never fall back to made-up reviews
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   useEffect(() => {
//     const update = () => setVisible(visibleCount());
//     update();
//     window.addEventListener('resize', update);
//     return () => window.removeEventListener('resize', update);
//   }, []);

//   useEffect(() => { setIndex((i) => Math.min(i, maxIndex)); }, [maxIndex]);

//   const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
//   const next = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

//   const onPointerDown = (event) => { startX.current = event.clientX; };
//   const onPointerUp = (event) => {
//     if (startX.current == null) return;
//     const delta = event.clientX - startX.current;
//     startX.current = null;
//     if (delta > 48) prev();
//     if (delta < -48) next();
//   };

//   const hasReviews = reviews.length > 0;

//   return (
//     <section className="section mmc-rev-section" aria-labelledby="mmc-rev-heading">
//       <CenterFlow className="mmc-rev-flow" />
//       <div className="container">
//         <div className="mmc-rev-top">
//           <MotionReveal className="mmc-rev-head">
//             <p className="mmc-section-eyebrow mmc-heading-italic">
//               <AnimatedText mark="students">What students say</AnimatedText>
//             </p>
//             <h2 id="mmc-rev-heading" className="mmc-heading-italic">
//               <AnimatedText mark="clarity">Real experiences from students mapping their next step</AnimatedText>
//             </h2>
//             <p>Students who used assessment, predictors and counsellor support to choose with more clarity.</p>
//             {hasReviews && meta.averageRating ? (
//               <p className="mmc-rev-trust">
//                 {meta.averageRating} out of 5 · {meta.totalCount} verified {meta.totalCount === 1 ? 'review' : 'reviews'}
//               </p>
//             ) : null}
//           </MotionReveal>

//           <div className="mmc-rev-aside">
//             <MotionReveal variant="right" delay={90}>
//               <div className="mmc-rev-aside-frame">
//                 <img src="/images/review.jpg" alt="" loading="lazy" />
//               </div>
//             </MotionReveal>
//             {maxIndex > 0 ? (
//               <div className="mmc-rev-toolbar">
//                 <button type="button" className="mmc-rev-nav" onClick={prev} aria-label="Previous reviews">
//                   <OutlineIcon name="arrow" size={16} />
//                 </button>
//                 <button type="button" className="mmc-rev-nav" onClick={next} aria-label="Next reviews">
//                   <OutlineIcon name="arrow" size={16} />
//                 </button>
//               </div>
//             ) : null}
//           </div>
//         </div>

//         {loading ? (
//           <div className="mmc-rev-skeleton" aria-busy="true" aria-live="polite">
//             <span className="sr-only">Loading reviews…</span>
//           </div>
//         ) : null}

//         {!loading && !hasReviews ? (
//           <MotionReveal className="mmc-rev-empty">
//             <p>We&apos;re collecting reviews from our first batch of students right now. If you&apos;ve used the assessment or a predictor, we&apos;d love to hear how it went.</p>
//           </MotionReveal>
//         ) : null}

//         {!loading && featured ? (
//           <MotionReveal className="mmc-rev-featured" delay={60}>
//             <blockquote className="mmc-rev-quote">
//               <Stars rating={featured.rating} />
//               <p>“{featured.review}”</p>
//               <footer>
//                 <span className="mmc-rev-avatar" aria-hidden="true">{featured.name.slice(0, 1)}</span>
//                 <div>
//                   <strong>{featured.name}</strong>
//                   <small>{featured.course}</small>
//                 </div>
//                 {featured.source ? <em>{featured.source}</em> : null}
//               </footer>
//             </blockquote>
//           </MotionReveal>
//         ) : null}

//         {!loading && rest.length ? (
//           <div
//             className="mmc-rev-viewport"
//             onPointerDown={onPointerDown}
//             onPointerUp={onPointerUp}
//             onPointerCancel={() => { startX.current = null; }}
//           >
//             <div
//               className="mmc-rev-track mmc-scroll-stage"
//               style={{ '--mmc-rev-index': index, '--mmc-rev-visible': visible }}
//             >
//               {rest.map((review, i) => (
//                 <ReviewCard key={review.id} review={review} index={i} delay={staggerDelay(i, 90)} />
//               ))}
//             </div>
//           </div>
//         ) : null}

//         {maxIndex > 0 ? (
//           <div className="mmc-rev-dots" role="tablist" aria-label="Review slides">
//             {Array.from({ length: maxIndex + 1 }, (_, i) => (
//               <button
//                 key={i}
//                 type="button"
//                 role="tab"
//                 aria-selected={index === i}
//                 aria-label={`Show reviews starting at ${i + 1}`}
//                 className={`mmc-rev-dot${index === i ? ' is-active' : ''}`}
//                 onClick={() => setIndex(i)}
//               />
//             ))}
//           </div>
//         ) : null}

//         <div className="mmc-rev-cta">
//           {showForm ? (
//             <ReviewForm onDone={load} />
//           ) : (
//             <button type="button" className="mmc-rev-open-form" onClick={() => setShowForm(true)}>
//               Write a review
//             </button>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }