import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import { COURSE_CATEGORIES, categoryCounts, courseLabels } from '../../data/courseCategories.js';
import './CollegeSpotlight.css';

/* Home-page college section:
 *   1. "Choose your area of interest" cards -> /colleges?category=<id>
 *   2. A horizontal slider of TOP colleges only (featured first, then by ranking)
 */

const PLACEHOLDER = '/images/college-placeholder.jpg';
const TOP_LIMIT = 10;

function pickTopColleges(list) {
  return [...list]
    .sort((a, b) => {
      if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1; // featured first
      return (a.ranking || 9999) - (b.ranking || 9999);              // then best rank
    })
    .slice(0, TOP_LIMIT);
}

export default function CollegeSpotlight() {
  // All colleges are kept so category counts are real; only the top ones are shown in the slider.
  const [all, setAll] = useState(MOCK_COLLEGES);
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    let alive = true;
    api.get('/colleges', { params: { page: 1, limit: 100, sort: 'ranking' } })
      .then((res) => { if (alive && res.data.colleges?.length) setAll(res.data.colleges); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const top = useMemo(() => pickTopColleges(all), [all]);
  const counts = useMemo(() => categoryCounts(all), [all]);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [top]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.mmc-spot-card');
    const step = (card ? card.offsetWidth + 18 : 300) * 2;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className="mmc-spot-section">
      <div className="container">
        

        {/* ---------- Choose your area of interest ---------- */}
        <h3 className="mmc-spot-subhead">Choose your <span>area of interest</span></h3>
        <div className="mmc-spot-cats">
          {COURSE_CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/colleges?category=${cat.id}`} className="mmc-spot-cat">
              <div className="mmc-spot-cat-text">
                <strong>{cat.label}</strong>
                <small>
                  {counts[cat.id]
                    ? `${counts[cat.id]} college${counts[cat.id] === 1 ? '' : 's'}`
                    : 'Coming soon'}
                </small>
                <em>{cat.programs.slice(0, 4).map((p) => p.label).join(' · ')}</em>
              </div>
              <span className="mmc-spot-cat-icon" aria-hidden="true">{cat.emoji}</span>
            </Link>
          ))}
        </div>

        {/* ---------- Top colleges slider ---------- */}
        <div className="mmc-spot-slider-head">
          <h3 className="mmc-spot-subhead">Top <span>colleges</span></h3>
          <div className="mmc-spot-arrows">
            <button type="button" onClick={() => scrollByCards(-1)} disabled={edge.start} aria-label="Previous colleges">
              <OutlineIcon name="arrow-left" size={16} />
            </button>
            <button type="button" onClick={() => scrollByCards(1)} disabled={edge.end} aria-label="Next colleges">
              <OutlineIcon name="arrow" size={16} />
            </button>
          </div>
        </div>

        <div className="mmc-spot-track" ref={trackRef} onScroll={updateEdges}>
          {top.map((c) => {
            const courses = courseLabels(c);
            return (
              <Link to={`/colleges/${c._id}`} key={c._id} className="mmc-spot-card">
                <div className="mmc-spot-photo">
                  <img
                    src={getImageUrl(c.image) || getImageUrl(c.logo) || PLACEHOLDER}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      // Broken/missing image -> placeholder (and stop looping if that fails too)
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                  {c.ranking ? <span className="mmc-spot-rank">#{c.ranking}</span> : null}
                  {c.featured ? <span className="mmc-spot-top">Top pick</span> : null}
                </div>
                <div className="mmc-spot-body">
                  <strong title={c.name}>{c.name}</strong>
                  <small><OutlineIcon name="pin" size={12} /> {c.location || 'Karnataka'}</small>

                  {courses.length > 0 && (
                    <span className="mmc-spot-courses">
                      {courses.slice(0, 3).map((name) => (
                        <em key={name} className="mmc-spot-course-chip">{name}</em>
                      ))}
                      {courses.length > 3 && (
                        <em className="mmc-spot-course-chip mmc-spot-course-more">+{courses.length - 3}</em>
                      )}
                    </span>
                  )}

                  <span className="mmc-spot-meta">
                    {courses.length
                      ? `${courses.length} course${courses.length === 1 ? '' : 's'}`
                      : 'Courses on request'}
                    {c.rating ? ` · ★ ${c.rating}` : ''}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mmc-spot-footer">
          <Link to="/colleges" className="mmc-spot-link">
            See full list, filter by course &amp; compare up to 4 colleges <OutlineIcon name="arrow" size={14} />
          </Link>
        </div>

        <div className="mmc-spot-head">
          <div>
            <span className="mmc-spot-eyebrow">Colleges for you</span>
            <h2>Explore, filter &amp; <span className="mmc-spot-grad">compare</span> colleges</h2>
            <p>Fees, placements, hostel options and accreditation - laid out side by side so you can decide with confidence.</p>
          </div>
          <Link to="/colleges" className="btn btn-primary mmc-spot-cta">
            Explore All Colleges <OutlineIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}