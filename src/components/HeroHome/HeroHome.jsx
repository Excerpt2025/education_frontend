import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import AnimatedText from '../../motion/AnimatedText.jsx';
import CursorPills from '../../motion/CursorPills.jsx';
import CenterFlow from '../../motion/CenterFlow.jsx';
import './HeroHome.css';


const HERO_PILLS = [
  { to: '/career-assessment', label: 'Assessment', icon: 'compass' },
  { to: '/kcet-predictor', label: 'KCET', icon: 'cap' },
  { to: '/pgcet-predictor', label: 'PGCET', icon: 'book' },
];

// const HERO_LISTINGS = [
//   { to: '/college-compare', title: 'Compare colleges', meta: 'Fees · courses · ranks', accent: '₹1' },
//   { to: '/college-admission-enquiry', title: 'Admission support', meta: 'Counsellor-led enquiries', accent: 'Guided' },
// ];

export default function HeroHome() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { student } = useAuth();

  const submitEmail = (e) => {
    e.preventDefault();
    if (student) {
      navigate('/dashboard');
      return;
    }
    const next = email.trim()
      ? `/register?email=${encodeURIComponent(email.trim())}`
      : '/register';
    navigate(next);
  };

  return (
    <section className="mmc-hero" aria-label="Map your career path">
      <div className="container mmc-hero-stage">
        <div className="mmc-hero-copy">
          <p className="mmc-hero-crumb">Guidance / MapMyCareer360</p>
          <h1><AnimatedText mark="Empower">Educate Empower Excel</AnimatedText></h1>
          <div className="mmc-hero-meta">
            <strong>1,000+ students</strong>
            <span>150+ colleges</span>
            <span>24/7 support</span>
          </div>
          <p className="mmc-hero-sub">
          Your trusted partner for career counselling, college admissions, and placement success.
          </p>
          <p className="mmc-hero-sub mmc-hero-sub--2">
            Start with a free assessment, then shortlist campuses that actually match your rank.
          </p>

          <div className="mmc-hero-swatches">
            {HERO_PILLS.map((pill) => (
              <Link key={pill.to} to={pill.to} className="mmc-hero-swatch">
                <OutlineIcon name={pill.icon} size={14} />
                {pill.label}
              </Link>
            ))}
          </div>

          {student ? (
            <div className="mmc-hero-actions">
              <Link to="/dashboard" className="mmc-hero-cta">
                Open dashboard
              </Link>
              <Link to="/career-assessment" className="mmc-hero-ghost">
                Take assessment
              </Link>
            </div>
          ) : (
            <form className="mmc-hero-signup" onSubmit={submitEmail}>
              <label className="sr-only" htmlFor="mmc-hero-email">Email</label>
              <input
                id="mmc-hero-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button type="submit" className="mmc-hero-cta">Book a Free Counselling</button>
            </form>
          )}

          <div className="mmc-hero-utils">
            <span>Launch plans from ₹1</span>
            <Link to="/kcet-predictor">View KCET matches</Link>
          </div>
        </div>

        <div className="mmc-hero-aside">
          <CursorPills />
          <CenterFlow className="mmc-hero-flow" />
          <div className="mmc-hero-figure">
            <img src="/images/hero-journey-7.png" alt="Hero Home" className='mmc-hero-journey'/>
          </div>
        </div>
      </div>
    </section>
  );
}
