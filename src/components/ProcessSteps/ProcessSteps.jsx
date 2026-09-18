import React from 'react';
import { Link } from 'react-router-dom';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import './ProcessSteps.css';

const FEATURES = [
  {
    icon: 'compass',
    tone: 'lime',
    title: 'Create your path',
    text: 'Scientific career assessment maps interests and aptitude to the right streams.',
    to: '/career-assessment',
  },
  {
    icon: 'chart',
    tone: 'mint',
    title: 'Predict your colleges',
    text: 'KCET & PGCET cutoffs ranked Safe, Moderate, and Dream — in seconds.',
    to: '/kcet-predictor',
  },
  {
    icon: 'cap',
    tone: 'forest',
    title: 'Get admitted',
    text: 'Shortlists, documents, and counsellor follow-through until you join.',
    to: '/college-admission-enquiry',
  },
];

const PRODUCTS = [
  { n: '12', label: 'Assessment', tone: 'lime' },
  { n: '08', label: 'KCET matches', tone: 'mint' },
  { n: '05', label: 'PGCET list', tone: 'forest' },
];

export default function ProcessSteps() {
  return (
    <section className="section mmc-process-section">
      <div className="container mmc-process-split">
        <div className="mmc-process-left">
          <MotionReveal>
            <p className="mmc-process-label">MapMyCareer feature</p>
            <div className="mmc-process-intro">
              <h2>
                <AnimatedText>One platform,</AnimatedText>{' '}
                <span><AnimatedText delay={160}>endless possibilities</AnimatedText></span>
              </h2>
              <p>We handle the heavy lifting so students can focus on choosing the right college — with data, not guesswork.</p>
            </div>
          </MotionReveal>

          <div className="mmc-process-list">
            {FEATURES.map((s, i) => (
              <MotionReveal as={Link} to={s.to} className="mmc-process-step" key={s.title} delay={staggerDelay(i)}>
                <span className={`mmc-process-icon mmc-process-icon--${s.tone}`} aria-hidden="true">
                  <OutlineIcon name={s.icon} size={20} />
                </span>
                <div>
                  <h4><AnimatedText delay={staggerDelay(i, 40)}>{s.title}</AnimatedText></h4>
                  <p>{s.text}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>

        <MotionReveal variant="right" delay={120} className="mmc-process-visual">
          <div className="mmc-mock-window">
            <h3>My college <span>matches</span></h3>
            <ul className="mmc-mock-products">
              {PRODUCTS.map((item) => (
                <li key={item.label}>
                  <span className={`mmc-mock-count mmc-mock-count--${item.tone}`}>{item.n}</span>
                  <b>{item.label}</b>
                  <span className="mmc-mock-user" aria-hidden="true">A</span>
                  <span className="mmc-mock-bars" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
