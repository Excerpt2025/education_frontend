import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import CollegeInterestModal from '../CollegeInterestModal/CollegeInterestModal.jsx';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import { COURSE_CATEGORIES, categoryCounts, courseLabels } from '../../data/courseCategories.js';
import './CollegeSpotlight.css';

/* Home-page college section:
 *   1. "Choose your area of interest" cards -> /colleges?category=<id>
 *   2. A horizontal slider of TOP colleges only (featured first, then by ranking)
 *   3. Clicking a college first asks for the interest form (same as the
 *      Colleges page), then opens the college details.
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

/* Inline SVG arrows - always visible (the "arrow-left" icon name was missing
 * from OutlineIcon, which is why the back button looked empty). */
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function CollegeSpotlight() {
  const navigate = useNavigate();

  // All colleges are kept so category counts are real; only the top ones are shown in the slider.
  const [all, setAll] = useState(MOCK_COLLEGES);
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [pendingCollege, setPendingCollege] = useState(null);

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

  /* ---------- interest form gate (same behaviour as Colleges page) ---------- */
  const alreadyUnlocked = () => sessionStorage.getItem('mmc_interest_submitted');

  const openCollege = (college) => {
    if (alreadyUnlocked()) navigate(`/colleges/${college._id}`);
    else setPendingCollege(college);
  };

  const onInterestSubmitted = () => {
    sessionStorage.setItem('mmc_interest_submitted', '1');
    const college = pendingCollege;
    setPendingCollege(null);
    if (college) navigate(`/colleges/${college._id}`);
  };

  return (
    <section className="mmc-spot-section">
      <div className="container">
        <div>
          <span className="mmc-spot-eyebrow">Colleges for you</span>
        </div>

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
              <ChevronLeft />
            </button>
            <button type="button" onClick={() => scrollByCards(1)} disabled={edge.end} aria-label="Next colleges">
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="mmc-spot-track" ref={trackRef} onScroll={updateEdges}>
          {top.map((c) => {
            const courses = courseLabels(c);
            return (
              <button
                type="button"
                key={c._id}
                className="mmc-spot-card"
                onClick={() => openCollege(c)}
              >
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
              </button>
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
            <h2>Explore, filter &amp; <span className="mmc-spot-grad">compare</span> colleges</h2>
            <p>Fees, placements, hostel options and accreditation - laid out side by side so you can decide with confidence.</p>
          </div>
          <Link to="/colleges" className="btn btn-primary mmc-spot-cta">
            Explore All Colleges <OutlineIcon name="arrow" size={16} />
          </Link>
        </div>
      </div>

      {pendingCollege && (
        <CollegeInterestModal
          collegeIds={[pendingCollege._id]}
          context="view"
          courseOptions={courseLabels(pendingCollege)}
          title="Tell us a bit about you 👋"
          subtitle={`Just a few details before we open the full profile for ${pendingCollege.name}.`}
          submitLabel="View College Details →"
          onSuccess={onInterestSubmitted}
          onClose={() => setPendingCollege(null)}
        />
      )}
    </section>
  );
}