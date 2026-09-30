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
    image: '/images/journey-confusion.png',
    to: '/career-assessment',
    alt: 'Student feeling overwhelmed before choosing a path',
    text: 'Not sure which course, college or career path?',
  },
  {
    n: '02',
    title: 'Career Counseling',
    tone: 'blue',
    image: '/images/journey-learning.png',
    to: '/career-assessment',
    alt: 'Counsellor guiding a student with personalized advice',
    text: 'Personalized guidance based on your interests, aptitude and goals.',
  },
  {
    n: '03',
    title: 'Your Roadmap',
    tone: 'orange',
    image: '/images/journey-roadmap.png',
    to: '/kcet-predictor',
    alt: 'A mapped path with checkpoints toward a goal',
    text: 'A clear and customized plan with the right courses, colleges and skill development.',
  },
  {
    n: '04',
    title: 'Professional Success',
    tone: 'blue',
    image: '/images/journey-professional.png',
    to: '/college-admission-enquiry',
    alt: 'A confident graduate walking toward a dream career',
    text: 'Get into the right college, build the right skills and step into a successful career.',
  },
];

export default function CareerJourney() {
  return (
    <section className="mmc-journey" aria-labelledby="mmc-journey-heading">
      <div className="container">
        <MotionReveal className="mmc-journey-head">
          <p className="mmc-journey-eyebrow">
            <span className="mmc-journey-eyebrow-mark">Your</span> journey
          </p>
          <h2 id="mmc-journey-heading">
            <AnimatedText mark="professional">From confusion to professional</AnimatedText>
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
            <ScrollCard
              key={step.n}
              index={index}
              delay={staggerDelay(index, 90)}
              className="mmc-journey-scene"
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
                <span className={`mmc-journey-badge mmc-journey-badge--${step.tone}`}>
                  {step.title}
                </span>
                <span className="mmc-journey-text">{step.text}</span>
              </Link>
            </ScrollCard>
          ))}
        </div>
      </div>
    </section>
  );
}
