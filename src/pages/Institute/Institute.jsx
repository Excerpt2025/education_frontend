import React from 'react';
import MotionReveal, { staggerDelay } from '../../motion/MotionReveal.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import InstituteForm from './InstituteForm.jsx';
import { BENEFITS, INSTITUTION_TYPES } from './instituteContent.js';
import './Institute.css';

function FormLink({ className, children }) {
  return (
    <a href="#institute-registration" className={className}>
      {children}
    </a>
  );
}

export default function Institute() {
  return (
    <div className="mmc-institute-page">
      <header className="mmc-inst-hero">
        <div className="container mmc-inst-hero-inner">
          <MotionReveal>
            <p className="mmc-section-eyebrow mmc-section-eyebrow--light">For institutions</p>
            <h1>Get Your Institution Listed for Free</h1>
            <p className="mmc-inst-lead">
              Connect with students, showcase your courses, and explore admission and collaboration opportunities with MapMyCareer360.
            </p>
            <p>
              Are you a college, university or educational institution looking to reach more students and expand your admissions network?
            </p>
            <p>
              List your institution on MapMyCareer360 and explore opportunities to connect with prospective students through our education counselling and admission support network.
            </p>
            <FormLink className="btn btn-primary mmc-inst-cta">
              List Your Institution for Free <OutlineIcon name="arrow" size={16} />
            </FormLink>
          </MotionReveal>
        </div>
      </header>

      <section className="mmc-inst-section" aria-labelledby="institute-benefits-title">
        <div className="container">
          <MotionReveal className="mmc-inst-head">
            <p className="mmc-section-eyebrow">Partnership</p>
            <h2 id="institute-benefits-title">Why Partner with MapMyCareer360?</h2>
          </MotionReveal>
          <div className="mmc-inst-benefit-grid">
            {BENEFITS.map((item, index) => (
              <MotionReveal
                as="article"
                key={item.title}
                className="card mmc-inst-benefit"
                delay={staggerDelay(index, 40, 50)}
              >
                <span className="mmc-inst-benefit-icon" aria-hidden="true">
                  <OutlineIcon name={item.icon} size={20} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mmc-inst-section mmc-inst-who" aria-labelledby="institute-who-title">
        <div className="container">
          <MotionReveal className="mmc-inst-head">
            <p className="mmc-section-eyebrow">Eligibility</p>
            <h2 id="institute-who-title">Who Can Register?</h2>
          </MotionReveal>
          <ul className="mmc-inst-type-grid">
            {INSTITUTION_TYPES.map((type) => (
              <li key={type}>
                <OutlineIcon name="cap" size={16} />
                <span>{type}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mmc-inst-collab" aria-labelledby="institute-collab-title">
        <div className="container mmc-inst-collab-inner">
          <MotionReveal>
            <h2 id="institute-collab-title">Ready to Collaborate?</h2>
            <p>Fill out the form below. Our team will review your submission and contact you to discuss the next steps.</p>
          </MotionReveal>
          <FormLink className="btn btn-primary mmc-inst-cta">
            List Your Institution for Free <OutlineIcon name="arrow" size={16} />
          </FormLink>
        </div>
      </section>

      <section
        id="institute-registration"
        className="mmc-inst-section mmc-inst-form-section"
        aria-labelledby="institute-form-title"
      >
        <div className="container mmc-inst-form-wrap">
          <MotionReveal className="mmc-inst-head">
            <p className="mmc-section-eyebrow">Short questionnaire</p>
            <h2 id="institute-form-title">MapMyCareer360 – Institution Registration Form</h2>
            <p className="mmc-inst-form-sub">List Your Institution for Free</p>
            <p>
              Connect with students and explore admission and collaboration opportunities through MapMyCareer360.
            </p>
            <p className="mmc-inst-required-note">Fields marked with * are required.</p>
          </MotionReveal>
          <InstituteForm />
        </div>
      </section>
    </div>
  );
}
