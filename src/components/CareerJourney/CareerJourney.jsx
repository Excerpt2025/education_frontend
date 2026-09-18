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
    mark: 'Confusion',
    image: '/images/journey-confusion.png',
    to: '/career-assessment',
    alt: 'Student feeling overwhelmed before choosing a path',
  },
  {
    n: '02',
    title: 'Choose roadmap',
    mark: 'roadmap',
    image: '/images/journey-roadmap.png',
    to: '/career-assessment',
    alt: 'A mapped path with checkpoints toward a goal',
  },
  {
    n: '03',
    title: 'Learning',
    mark: 'Learning',
    image: '/images/journey-learning.png',
    to: '/kcet-predictor',
    alt: 'Student learning and researching colleges on a laptop',
  },
  {
    n: '04',
    title: 'Professional',
    mark: 'Professional',
    image: '/images/journey-professional.png',
    to: '/college-admission-enquiry',
    alt: 'A confident student ready for college and career',
  },
];

export default function CareerJourney() {
  return (
    <section className="mmc-journey" aria-labelledby="mmc-journey-heading">
      <div className="container">
        <MotionReveal className="mmc-journey-head">
          <p className="mmc-section-eyebrow mmc-heading-italic">
            <AnimatedText mark="journey">Your journey</AnimatedText>
          </p>
          <h2 id="mmc-journey-heading" className="mmc-heading-italic">
            <AnimatedText mark="professional">From confusion to professional</AnimatedText>
          </h2>
          <p>MapMyCareer360 charts a clear path — assessment, predictors, and admission support.</p>
        </MotionReveal>

        <div className="mmc-journey-grid mmc-scroll-stage">
          {STEPS.map((step, index) => (
            <ScrollCard key={step.n} index={index} delay={staggerDelay(index, 90)}>
              <Link to={step.to} className="mmc-journey-card" aria-label={`${step.title}. ${step.text}`}>
                <span className="mmc-journey-n">{step.n}</span>
                <span className="mmc-journey-visual">
                  <img src={step.image} alt={step.alt} loading="lazy" />
                </span>
                <strong className="mmc-heading-italic">
                  <AnimatedText delay={staggerDelay(index, 40)} mark={step.mark}>
                    {step.title}
                  </AnimatedText>
                </strong>
               
              </Link>
            </ScrollCard>
          ))}
        </div>
      </div>
    </section>
  );
}
