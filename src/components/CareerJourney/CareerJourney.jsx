import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import ScrollCard from '../../motion/ScrollCard.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import './CareerJourney.css';

const STEPS = [
  {
    n: '01',
    title: 'Confusion',
    tone: 'orange',
    titleKind: 'plain',
    side: 'visual',
    image: '/images/journey-confusion.png',
    to: '/career-assessment',
    alt: 'Student feeling overwhelmed before choosing a path',
    text: 'Not sure which course, college or career path?',
  },
  {
    n: '02',
    title: 'Career Counseling',
    tone: 'blue',
    titleKind: 'pill',
    side: 'copy',
    image: '/images/journey-learning.png',
    to: '/career-assessment',
    alt: 'Counsellor guiding a student with personalized advice',
    text: 'Personalized guidance based on your interests, aptitude and goals.',
  },
  {
    n: '03',
    title: 'Your Roadmap',
    tone: 'orange',
    titleKind: 'plain',
    side: 'visual',
    image: '/images/journey-roadmap.png',
    to: '/kcet-predictor',
    alt: 'A mapped path with checkpoints toward a goal',
    text: 'A clear and customized plan with the right courses, colleges and skill development.',
  },
  {
    n: '04',
    title: 'Professional Success',
    tone: 'blue',
    titleKind: 'pill',
    side: 'visual',
    image: '/images/journey-professional.png',
    to: '/college-admission-enquiry',
    alt: 'A confident graduate walking toward a dream career',
    text: 'Get into the right college, build the right skills and step into a successful career.',
  },
];

function JourneyBridge({ direction }) {
  const toRight = direction === 'to-right';
  return (
    <div className={`mmc-journey-bridge mmc-journey-bridge--${direction}`} aria-hidden="true">
      <svg viewBox="0 0 160 56" preserveAspectRatio="none">
        <path
          d={toRight ? 'M28 4 C 36 36, 118 12, 132 50' : 'M132 4 C 124 36, 42 12, 28 50'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        <circle cx={toRight ? 28 : 132} cy="6" r="4.5" fill="currentColor" />
        <circle cx={toRight ? 132 : 28} cy="50" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function CareerJourney() {
  return (
    <section className="mmc-journey" aria-labelledby="mmc-journey-heading">
      <div className="container">
        <MotionReveal className="mmc-journey-head">
          <p className="mmc-journey-eyebrow">
            <span className="mmc-journey-eyebrow-mark">Your</span> journey
          </p>
          <h2 id="mmc-journey-heading">
            <AnimatedText>From confusion</AnimatedText>
            <AnimatedText className="mmc-journey-title-tail" mark="professional">to professional</AnimatedText>
          </h2>
          <p>
            MapMyCareer360 charts a <strong>clear path</strong> — assessment, predictors, and admission support.
          </p>
        </MotionReveal>

        <div className="mmc-journey-grid mmc-scroll-stage" role="list">
          <div className="mmc-journey-path" aria-hidden="true">
            <span className="mmc-journey-path-line" />
            {STEPS.map((step) => (
              <span key={step.n} className={`mmc-journey-path-dot mmc-journey-path-dot--${step.tone}`} />
            ))}
          </div>

          {STEPS.map((step, index) => (
            <React.Fragment key={step.n}>
              <ScrollCard
                index={index}
                delay={staggerDelay(index, 90)}
                className={`mmc-journey-scene${step.side === 'copy' ? ' mmc-journey-scene--copy-first' : ''}`}
              >
                <Link
                  to={step.to}
                  className={`mmc-journey-card mmc-journey-card--${step.tone}`}
                  aria-label={`${step.title}. ${step.text}`}
                  role="listitem"
                >
                  <span className="mmc-journey-visual">
                    <img src={step.image} alt={step.alt} loading="lazy" width={280} height={220} />
                  </span>
                  <span className="mmc-journey-copy">
                    <span className={`mmc-journey-badge mmc-journey-badge--${step.tone} mmc-journey-badge--${step.titleKind}`}>
                      {step.title}
                    </span>
                    <span className="mmc-journey-text">{step.text}</span>
                  </span>
                </Link>
              </ScrollCard>
              {index < STEPS.length - 1 && (
                <JourneyBridge direction={index % 2 === 0 ? 'to-right' : 'to-left'} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
