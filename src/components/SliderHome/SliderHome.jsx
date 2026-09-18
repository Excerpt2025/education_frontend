import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import './SliderHome.css';

const FALLBACK_SLIDES = [
  {
    _id: 'fallback-1',
    title: 'Map Your Career With Confidence',
    subtitle: 'Take our scientific Career Assessment and discover the path that truly fits you.',
    image: '/images/student-to-professional.png',
    ctaText: 'Take Free Career Assessment',
    ctaLink: '/career-assessment',
  },
  {
    _id: 'fallback-2',
    title: 'KCET & PGCET College Predictors',
    subtitle: 'Know your Safe, Moderate and Dream colleges instantly based on your rank.',
    image: '/images/student-to-professional.png',
    ctaText: 'Explore Subscription Plans',
    ctaLink: '/subscription',
  },
];

export default function SliderHome() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/sliders').then((res) => {
      if (res.data.sliders && res.data.sliders.length) setSlides(res.data.sliders);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active] || slides[0];
  if (!slide) return null;

  return (
    <section className="mmc-slider">
      <div className="mmc-slider-bg" style={{ backgroundImage: `url(${slide.image})` }} />
      <div className="mmc-slider-overlay" />
      <div className="container mmc-slider-content">
        <span className="mmc-slider-tag">MapMyCareer360</span>
        <h1>{slide.title}</h1>
        <p>{slide.subtitle}</p>
        {/* Clicking the slider button routes the user to the Career Assessment page (or admin-configured link) */}
        <button className="btn btn-primary" onClick={() => navigate(slide.ctaLink || '/career-assessment')}>
          {slide.ctaText || 'Take Free Career Assessment'}
        </button>
      </div>

      <div className="mmc-slider-dots">
        {slides.map((s, i) => (
          <button
            key={s._id || i}
            className={i === active ? 'active' : ''}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
