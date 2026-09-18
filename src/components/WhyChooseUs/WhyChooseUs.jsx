import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import './WhyChooseUs.css';

const PEOPLE = [
  { initials: 'RM', name: 'Rajeev M P', role: 'Career Counsellor', variant: 'light', rot: 'ccw' },
  { initials: 'RK', name: 'Rakshith Kumar', role: 'Admissions Head', variant: 'dark', rot: 'cw' },
  { initials: 'RG', name: 'Raghavendra M', role: 'Operations Head', variant: 'light', rot: 'ccw' },
];

export default function WhyChooseUs() {
  return (
    <section className="section mmc-why-section">
      <div className="container">
        <MotionReveal className="mmc-why-banner">
          <div className="mmc-why-copy">
            <h2>
              <AnimatedText>Simplify your admissions and</AnimatedText>{' '}
              <span><AnimatedText delay={180}>maximise results</AnimatedText></span>
            </h2>
            <p>
              Assessment, KCET & PGCET predictors, and counsellor support — so students make clearer college decisions.
            </p>
            <Link to="/register" className="mmc-why-cta">Get Started</Link>
          </div>

          <div className="mmc-why-stack" aria-hidden="false">
            {PEOPLE.map((person, index) => (
              <article
                key={person.name}
                className="mmc-why-person"
              >
                <span className="mmc-why-avatar">{person.initials}</span>
                <div>
                  <strong>
                    <AnimatedText delay={staggerDelay(index, 80)}>{person.name}</AnimatedText>
                  </strong>
                  <small>
                    <AnimatedText delay={staggerDelay(index, 80, 80)}>{person.role}</AnimatedText>
                  </small>
                </div>
                <span className="mmc-why-more" aria-hidden="true">···</span>
              </article>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
