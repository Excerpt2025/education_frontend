import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import OutlineIcon from '../icons/OutlineIcon.jsx';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import './CollegeSpotlight.css';

/* Compact Home-page section. Gives a taste of the college hub - each card now
 * links straight to that specific college's own detail page (/colleges/:id)
 * instead of always dropping the visitor back on the browse/compare list. */

/* Admins currently fill "Specializations" in Manage Colleges far more often
 * than they link real Course records, so the card falls back to
 * specializations whenever coursesOffered is empty. That way the strip never
 * shows "0 courses" for a college that clearly offers something. */
function courseLabels(college) {
  const fromCourses = (college.coursesOffered || [])
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean);
  if (fromCourses.length) return fromCourses;
  return (college.specializations || []).filter(Boolean);
}

export default function CollegeSpotlight() {
  const [colleges, setColleges] = useState(MOCK_COLLEGES.slice(0, 6));

  useEffect(() => {
    let alive = true;
    api.get('/colleges', { params: { page: 1, limit: 6, sort: 'ranking' } })
      .then((res) => { if (alive && res.data.colleges?.length) setColleges(res.data.colleges); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="mmc-spot-section">
      <div className="container">
        <div className="mmc-spot-head">
          <div>
            <span className="mmc-spot-eyebrow">Colleges for you</span>
            <h2>Explore, filter &amp; <span className="mmc-spot-grad">compare</span> colleges</h2>
            <p>Fees, placements, hostel options and accreditation - laid out side by side so you can decide with confidence.</p>
          </div>
          <Link to="/college-compare" className="btn btn-primary mmc-spot-cta">
            Explore All Colleges <OutlineIcon name="arrow" size={16} />
          </Link>
        </div>

        <div className="mmc-spot-row">
          {colleges.slice(0, 6).map((c) => {
            const courses = courseLabels(c);
            return (
              <Link to={`/colleges/${c._id}`} key={c._id} className="mmc-spot-card">
                <div className="mmc-spot-photo">
                  <img src={getImageUrl(c.image) || '/images/college-placeholder.jpg'} alt={c.name} />
                  {c.ranking ? <span className="mmc-spot-rank">#{c.ranking}</span> : null}
                </div>
                <div className="mmc-spot-body">
                  <strong>{c.name}</strong>
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
          <Link to="/college-compare" className="mmc-spot-link">
            See full list, filter by course &amp; compare up to 4 colleges <OutlineIcon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}