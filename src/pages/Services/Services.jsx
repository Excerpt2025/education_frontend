import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import './Services.css';

const FEATURED = {
  icon: 'compass',
  title: 'Career Assessment',
  text: 'Aptitude, interest and personality mapped to the right stream before you apply.',
  link: '/career-assessment',
  meta: ['Free start', 'Personality fit', 'Stream map'],
};

const SERVICES = [
  { icon: 'cap', title: 'KCET Predictor', text: 'Safe, Moderate and Dream colleges from live cutoffs.', link: '/kcet-predictor', tone: 'blue' },
  { icon: 'book', title: 'PGCET Predictor', text: 'Postgraduate matches by rank, category and course.', link: '/pgcet-predictor', tone: 'orange' },
  { icon: 'scale', title: 'College Compare', text: 'Fees, courses and rankings side by side.', link: '/college-compare', tone: 'blue' },
  { icon: 'target', title: 'Subscription Plans', text: 'Unlock assessment and both predictors from ₹1.', link: '/subscription', tone: 'orange' },
  { icon: 'handshake', title: 'Referral Program', text: 'Share your link and track conversions in dashboard.', link: '/dashboard', tone: 'blue' },
  { icon: 'chart', title: 'Admission Support', text: 'Guided enquiries handled by our counselling team.', link: '/college-admission-enquiry', tone: 'orange' },
  { icon: 'chat', title: 'Personal Counselling', text: 'One-on-one mentorship to turn results into a decision.', link: '/contact', tone: 'blue' },
];

const STEPS = [
  { n: '01', title: 'Assess', text: 'Start with aptitude and interest.' },
  { n: '02', title: 'Predict', text: 'Match rank to colleges live.' },
  { n: '03', title: 'Compare', text: 'Shortlist fees and courses.' },
  { n: '04', title: 'Apply', text: 'Get counsellor support.' },
];

export default function Services() {
  return (
    <div className="mmc-services-page">
      <header className="mmc-svc-hero">
        <div className="container mmc-svc-hero-grid">
          <MotionReveal className="mmc-svc-hero-copy">
            <p className="mmc-svc-kicker">Services</p>
            <h1>
              <AnimatedText mark="tools">Tools students already use daily</AnimatedText>
            </h1>
            <p>
              Assessment, KCET &amp; PGCET predictors, compare, and counselling — one platform for the full admission path.
            </p>
            <div className="mmc-svc-hero-actions">
              <Link to="/register" className="mmc-svc-btn mmc-svc-btn--orange">
                Get Started <OutlineIcon name="arrow" size={16} />
              </Link>
              <Link to="/contact" className="mmc-svc-btn mmc-svc-btn--ghost">
                Talk to us
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal variant="right" delay={90} className="mmc-svc-hero-aside">
            <div className="mmc-svc-hero-media">
              <img src="/images/explore_college.jpg" alt="" loading="eager" />
              <span className="mmc-svc-hero-badge">
                <OutlineIcon name="target" size={14} />
                Full admission path
              </span>
            </div>
            <ul className="mmc-svc-hero-stats">
              <li><strong>8+</strong><span>Tools</span></li>
              <li><strong>₹1</strong><span>Launch plans</span></li>
              <li><strong>1:1</strong><span>Counselling</span></li>
            </ul>
          </MotionReveal>
        </div>
      </header>

      <section className="mmc-svc-steps" aria-label="How it works">
        <div className="container mmc-svc-steps-row">
          {STEPS.map((step, i) => (
            <MotionReveal as="div" key={step.n} delay={staggerDelay(i, 90)} className="mmc-svc-step">
              <em>{step.n}</em>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="mmc-svc-section">
        <div className="container">
          <MotionReveal className="mmc-svc-section-head">
            <p className="mmc-section-eyebrow">What you get</p>
            <h2>
              <AnimatedText>Everything from assessment to admission</AnimatedText>
            </h2>
          </MotionReveal>

          <div className="mmc-svc-bento mmc-scroll-stage">
            <ScrollCard
              as={Link}
              to={FEATURED.link}
              className="mmc-svc-featured"
              index={0}
              delay={staggerDelay(0, 90)}
              aria-label={`${FEATURED.title}. ${FEATURED.text}`}
            >
              <span className="mmc-svc-featured-glow" aria-hidden="true" />
              <span className="mmc-svc-featured-icon">
                <OutlineIcon name={FEATURED.icon} size={28} />
              </span>
              <div className="mmc-svc-featured-copy">
                <em>Start here</em>
                <strong>{FEATURED.title}</strong>
                <span>{FEATURED.text}</span>
                <ul>
                  {FEATURED.meta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <span className="mmc-svc-go">
                  Explore <OutlineIcon name="arrow" size={14} />
                </span>
              </div>
            </ScrollCard>

            {SERVICES.map((s, i) => (
              <ScrollCard
                as={Link}
                to={s.link}
                className={`mmc-svc-card mmc-svc-card--${s.tone}`}
                key={s.title}
                index={i + 1}
                delay={staggerDelay(i + 1, 80)}
                aria-label={`${s.title}. ${s.text}`}
              >
                <span className="mmc-svc-index">{String(i + 2).padStart(2, '0')}</span>
                <span className="mmc-svc-icon">
                  <OutlineIcon name={s.icon} size={20} />
                </span>
                <strong>{s.title}</strong>
                <span className="mmc-svc-text">{s.text}</span>
                <span className="mmc-svc-go">
                  Explore <OutlineIcon name="arrow" size={14} />
                </span>
              </ScrollCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mmc-svc-cta">
        <div className="container mmc-svc-cta-inner">
          <MotionReveal>
            <h2>Not sure where to start?</h2>
            <p>Book a free consultation and we’ll help you pick the first step.</p>
          </MotionReveal>
          <MotionReveal delay={90}>
            <Link to="/contact" className="mmc-svc-btn mmc-svc-btn--orange">
              Get Started <OutlineIcon name="arrow" size={16} />
            </Link>
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}
