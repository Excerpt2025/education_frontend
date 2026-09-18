import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import './CollegeDetail.css';

const TABS = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'basic', label: 'Basic Info' },
  { id: 'courses', label: 'Courses' },
  { id: 'placements', label: 'Placements' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'must-know', label: 'Must Know' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'support', label: 'Support' },
  { id: 'safety', label: 'Safety' },
  { id: 'contact', label: 'Contact' },
];

const GENERIC_ACCREDITATIONS = [
  { name: 'UGC Approved', icon: 'shield' },
  { name: 'AICTE Approved', icon: 'cap' },
];

const GENERIC_AMENITIES = [
  { name: 'Hostel', icon: 'home' },
  { name: 'Library', icon: 'book' },
  { name: 'Labs & Workshops', icon: 'flask' },
  { name: 'Sports Complex', icon: 'target' },
  { name: 'Wi-Fi Campus', icon: 'signal' },
  { name: 'Cafeteria', icon: 'cup' },
];

const GENERIC_SAFETY = [
  'CCTV monitored campus and hostel blocks',
  '24x7 security personnel at all entry/exit points',
  "Dedicated women's safety and grievance cell",
  'Verified transport partners for daily commute',
];

const GENERIC_SUPPORT = [
  'Dedicated admissions counsellor assigned to you',
  'Help with scholarship and education-loan paperwork',
  'Doubt-resolution support during option entry & counselling',
  'Priority WhatsApp support line for shortlisted applicants',
];

const GENERIC_MUST_KNOW = [
  'Eligibility varies by course - check the Courses tab for each programme.',
  'Seats are allotted through KCET/COMEDK/management quota depending on the course.',
  'Document verification is usually required within 3-5 days of provisional allotment.',
  'Hostel seats are limited and allotted on a first-come basis after admission.',
];

function courseDegreeShort(course) {
  if (course.degree) return course.degree;
  const name = (course.name || '').toLowerCase();
  if (name.includes('mba')) return 'MBA';
  if (name.includes('mca')) return 'MCA';
  if (name.includes('bca')) return 'BCA';
  if (name.includes('m.tech') || name.includes('mtech')) return 'M.Tech';
  if (course.level === 'PG') return 'M.E / M.Tech';
  return 'B.E';
}

function courseDuration(course) {
  if (course.duration) return course.duration;
  return course.level === 'PG' ? '2 Years' : '4 Years';
}

function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatLPA(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `₹${num} LPA`;
}

// Admins fill in "Specializations" far more often than they link real Course
// records (see Manage Colleges / Colleges hub). So whenever a college has no
// linked coursesOffered, we fall back to showing its specializations as
// lightweight course cards instead of telling the student nothing exists.
function buildCourseList(college) {
  const linked = college.coursesOffered || [];
  if (linked.length) return linked.map((c) => ({ ...c, _isFallback: false }));
  return (college.specializations || [])
    .filter(Boolean)
    .map((name) => ({ name, _isFallback: true }));
}

// Where "Apply" should actually send the student - the real college link an
// admin enters in Manage Colleges, not the generic internal enquiry form.
function resolveApplyUrl(college) {
  const raw = college.contact?.website || college.brochureUrl || college.website || '';
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [status, setStatus] = useState('loading');
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [shortlisted, setShortlisted] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    api.get(`/colleges/${id}`)
      .then((res) => {
        if (!alive) return;
        setCollege(res.data.college || res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        const fallback = MOCK_COLLEGES.find((c) => c._id === id) || MOCK_COLLEGES[0];
        setCollege(fallback);
        setStatus('ready');
      });
    return () => { alive = false; };
  }, [id]);

  // Whenever the college we're viewing changes, jump back to the Gallery tab
  // and reset the photo index - otherwise navigating from one college's
  // detail page to another (e.g. via a "similar colleges" link) can leave
  // you on a stale tab or a gallery index that doesn't exist for the new one.
  useEffect(() => {
    setActiveTab('gallery');
    setGalleryIndex(0);
    setShortlisted(new Set());
  }, [id]);

  // Nudge the global floating WhatsApp button up so it doesn't sit on top of
  // this page's own sticky "View courses" bar.
  useEffect(() => {
    document.body.classList.add('mmc-has-sticky-college-bar');
    return () => document.body.classList.remove('mmc-has-sticky-college-bar');
  }, []);

  const gallery = useMemo(() => {
    if (!college) return [];
    if (Array.isArray(college.gallery) && college.gallery.length) {
      return college.gallery.map((g) => getImageUrl(g) || g);
    }
    const single = getImageUrl(college.image) || '/images/college-placeholder.jpg';
    return [single];
  }, [college]);

  // Real linked Course docs (used for fee/level/duration detail when present).
  const linkedCourses = college?.coursesOffered || [];
  // What we actually render in the Courses tab: linked courses, or a
  // specializations-based fallback so the tab is never empty for no reason.
  const courseList = useMemo(() => (college ? buildCourseList(college) : []), [college]);
  const applyUrl = useMemo(() => (college ? resolveApplyUrl(college) : ''), [college]);

  const feeValues = linkedCourses
    .map((c) => Number(c.fees?.annual ?? college?.fees?.annual))
    .filter((n) => Number.isFinite(n) && n > 0);
  const feeMin = feeValues.length ? Math.min(...feeValues) : Number(college?.fees?.annual) || null;
  const feeMax = feeValues.length ? Math.max(...feeValues) : Number(college?.fees?.annual) || null;

  const toggleShortlist = (courseName) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      if (next.has(courseName)) next.delete(courseName);
      else next.add(courseName);
      return next;
    });
  };

  const share = async () => {
    const shareData = { title: college?.name, text: `Check out ${college?.name} on MapMyCareer360`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (status === 'loading') {
    return <div className="mmc-cd-loading">Loading college details…</div>;
  }
  if (!college) {
    return <div className="mmc-cd-loading">College not found. <Link to="/college-compare">Browse all colleges</Link></div>;
  }

  return (
    <div className="mmc-cd-page">
      {/* GALLERY HERO */}
      <div className="mmc-cd-hero">
        <img src={gallery[galleryIndex]} alt={college.name} className="mmc-cd-hero-img" />
        <div className="mmc-cd-hero-scrim" />

        <button type="button" className="mmc-cd-hero-btn mmc-cd-hero-back" onClick={() => navigate(-1)} aria-label="Go back">
          <OutlineIcon name="arrow-left" size={18} />
        </button>
        <div className="mmc-cd-hero-actions">
          <button type="button" className="mmc-cd-hero-btn" onClick={share} aria-label="Share this college">
            <OutlineIcon name="share" size={18} />
          </button>
          <button
            type="button"
            className={`mmc-cd-hero-btn ${favorited ? 'is-active' : ''}`}
            onClick={() => setFavorited((f) => !f)}
            aria-label="Save to favourites"
          >
            <OutlineIcon name="heart" size={18} filled={favorited} />
          </button>
        </div>

        {gallery.length > 1 && (
          <>
            <span className="mmc-cd-hero-count">{galleryIndex + 1}/{gallery.length}</span>
            <button
              type="button"
              className="mmc-cd-hero-nav mmc-cd-hero-prev"
              onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="mmc-cd-hero-nav mmc-cd-hero-next"
              onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* IDENTITY CARD */}
      <div className="mmc-cd-identity">
        <div className="mmc-cd-logo">
          <img src={getImageUrl(college.logo) || '/images/logo.png'} alt="" />
        </div>
        <h1>{college.name}</h1>
        {college.establishedYear && (
          <p className="mmc-cd-estd">
            <span />ESTD {college.establishedYear}<span />
          </p>
        )}

        <div className="mmc-cd-facts">
          <div className="mmc-cd-fact">
            <OutlineIcon name="cap" size={22} />
            <span className="mmc-cd-fact-label">Affiliated</span>
            <strong>{college.affiliatedUniversity || 'Autonomous Institution'}</strong>
          </div>
          <div className="mmc-cd-fact">
            <OutlineIcon name="pin" size={22} />
            <span className="mmc-cd-fact-label">Located</span>
            <strong>{college.location || 'Karnataka'}</strong>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mmc-cd-tabs-wrap">
        <div className="mmc-cd-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={`mmc-cd-tab ${activeTab === t.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* PANELS */}
      <div className="mmc-cd-panel">
        {activeTab === 'gallery' && (
          <div className="mmc-cd-gallery-grid">
            {gallery.map((src, i) => (
              <button key={i} type="button" className="mmc-cd-gallery-thumb" onClick={() => setGalleryIndex(i)}>
                <img src={src} alt={`${college.name} photo ${i + 1}`} />
              </button>
            ))}
          </div>
        )}

        {activeTab === 'basic' && (
          <div className="mmc-cd-basic">
            <h2 className="mmc-cd-panel-title">Accreditations</h2>
            <div className="mmc-cd-accred-row">
              {(college.accreditations?.length ? college.accreditations : GENERIC_ACCREDITATIONS).map((a) => (
                <div className="mmc-cd-accred" key={a.name || a}>
                  <div className="mmc-cd-accred-badge"><OutlineIcon name={a.icon || 'shield'} size={26} /></div>
                  <span>{a.name || a}</span>
                </div>
              ))}
            </div>

            <h2 className="mmc-cd-panel-title">About</h2>
            <p className="mmc-cd-about-text">
              {college.about ||
                `${college.name} is a ${(college.type || 'private').toLowerCase()} institution located in ${college.location || 'Karnataka'}, offering ${courseList.length || 'multiple'} programmes across engineering and allied disciplines.`}
            </p>

            {(college.specializations || []).length > 0 && (
              <>
                <h2 className="mmc-cd-panel-title">Specializations</h2>
                <div className="mmc-cd-accred-row">
                  {college.specializations.map((s) => (
                    <div className="mmc-cd-accred" key={s}>
                      <div className="mmc-cd-accred-badge"><OutlineIcon name="target" size={22} /></div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="mmc-cd-basic">
            <h2 className="mmc-cd-panel-title">Placement Highlights</h2>
            <div className="mmc-cd-course-fees" style={{ marginBottom: 18 }}>
              <div>
                <span>Highest Package</span>
                <strong>{formatLPA(college.placements?.highestPackage) || 'On request'}</strong>
              </div>
              <div>
                <span>Average Package</span>
                <strong>{formatLPA(college.placements?.averagePackage) || 'On request'}</strong>
              </div>
            </div>
            {college.placements?.placementPercentage ? (
              <p className="mmc-cd-about-text">
                <strong>{college.placements.placementPercentage}%</strong> of eligible students were placed in the most recent placement cycle.
              </p>
            ) : null}
            {(college.placements?.topRecruiters || []).length > 0 && (
              <>
                <h2 className="mmc-cd-panel-title">Top Recruiters</h2>
                <div className="mmc-cd-accred-row">
                  {college.placements.topRecruiters.map((r) => (
                    <div className="mmc-cd-accred" key={r}>
                      <div className="mmc-cd-accred-badge"><OutlineIcon name="handshake" size={22} /></div>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!college.placements?.highestPackage && !college.placements?.averagePackage && (
              <p className="mmc-cd-empty">Placement details for this college will be added shortly.</p>
            )}
          </div>
        )}

        {activeTab === 'hostel' && (
          <div className="mmc-cd-basic">
            <h2 className="mmc-cd-panel-title">Hostel Options</h2>
            {college.hostel?.available ? (
              <div className="mmc-cd-courses">
                {['twoShare', 'threeShare', 'fourShare'].map((key, i) => {
                  const share = college.hostel?.[key];
                  const label = ['2-Share Room', '3-Share Room', '4-Share Room'][i];
                  if (!share?.available) return null;
                  return (
                    <div className="mmc-cd-course-card" key={key}>
                      <h3>{label}</h3>
                      <div className="mmc-cd-course-fees">
                        <div>
                          <span>Fees per Year</span>
                          <strong>{formatINR(share.feesPerYear) || 'On request'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mmc-cd-empty">Hostel details for this college will be added shortly.</p>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="mmc-cd-courses">
            {courseList.length === 0 && (
              <p className="mmc-cd-empty">Course details for this college will be added shortly.</p>
            )}

            {courseList.map((course) => {
              // ---- Fallback card: specialization only, no fee/level/duration data ----
              if (course._isFallback) {
                return (
                  <div className="mmc-cd-course-card" key={course.name}>
                    <div className="mmc-cd-course-top">
                      <span className="mmc-cd-status is-open"><i />Applications Open</span>
                    </div>
                    <h3>{course.name}</h3>
                    <p className="mmc-cd-course-degree">Offered at this college</p>
                    <div className="mmc-cd-course-tags">
                      <span>Specialization</span>
                    </div>
                    {applyUrl ? (
                      <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mmc-cd-course-info-btn"
                      >
                        Apply Now →
                      </a>
                    ) : (
                      <Link to="/college-admission-enquiry" className="mmc-cd-course-info-btn">Enquire Now</Link>
                    )}
                  </div>
                );
              }

              // ---- Full detail card: real linked Course document ----
              const isShortlisted = shortlisted.has(course.name);
              const applicationFee = formatINR(course.applicationFee) || '₹1,000';
              const annualFee = formatINR(course.fees?.annual ?? college.fees?.annual);
              const status2 = course.applicationStatus || 'Applications Open';
              const isOpen = /open/i.test(status2);
              return (
                <div className="mmc-cd-course-card" key={course.name}>
                  <div className="mmc-cd-course-top">
                    <span className={`mmc-cd-status ${isOpen ? 'is-open' : 'is-closed'}`}>
                      <i />{status2}
                    </span>
                    <button
                      type="button"
                      className={`mmc-cd-shortlist ${isShortlisted ? 'is-active' : ''}`}
                      onClick={() => toggleShortlist(course.name)}
                    >
                      <OutlineIcon name="bookmark" size={16} filled={isShortlisted} />
                      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </div>

                  <h3>{course.name}</h3>
                  <p className="mmc-cd-course-degree">{courseDegreeShort(course)}</p>

                  <div className="mmc-cd-course-tags">
                    <span>{course.level || 'UG'}</span>
                    <span>{courseDuration(course)}</span>
                    <span>{course.mode || 'Full Time'}</span>
                  </div>

                  <div className="mmc-cd-course-fees">
                    <div>
                      <span>Application Fee</span>
                      <strong>{applicationFee}</strong>
                    </div>
                    <div>
                      <span>Annualized Fee</span>
                      <strong>{annualFee || 'On request'}</strong>
                    </div>
                  </div>

                  {applyUrl ? (
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mmc-cd-course-info-btn"
                    >
                      Apply Now →
                    </a>
                  ) : (
                    <Link to="/college-admission-enquiry" className="mmc-cd-course-info-btn">Course info</Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'must-know' && (
          <ul className="mmc-cd-bullet-list">
            {GENERIC_MUST_KNOW.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        {activeTab === 'amenities' && (
          <div className="mmc-cd-amenities-grid">
            {(college.facilities?.length ? college.facilities.map((f) => ({ name: f, icon: 'target' })) : GENERIC_AMENITIES).map((a) => (
              <div className="mmc-cd-amenity" key={a.name}>
                <OutlineIcon name={a.icon} size={24} />
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'support' && (
          <ul className="mmc-cd-bullet-list">
            {GENERIC_SUPPORT.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        {activeTab === 'safety' && (
          <ul className="mmc-cd-bullet-list">
            {GENERIC_SAFETY.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        {activeTab === 'contact' && (
          <div className="mmc-cd-contact">
            <div className="mmc-cd-contact-row"><OutlineIcon name="pin" size={18} /> {college.location || 'Karnataka'}</div>
            <div className="mmc-cd-contact-row"><OutlineIcon name="phone" size={18} /> {college.contact?.phone || college.phone || '+91 90088 04368'}</div>
            <div className="mmc-cd-contact-row"><OutlineIcon name="mail" size={18} /> {college.contact?.email || college.email || 'admissions@mapmycareer360.com'}</div>
            {applyUrl ? (
              <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mmc-cd-contact-cta">
                Visit College Website →
              </a>
            ) : (
              <Link to="/college-admission-enquiry" className="btn btn-primary mmc-cd-contact-cta">Enquire Now →</Link>
            )}
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="mmc-cd-sticky-bar">
        <div>
          <strong>{courseList.length || 0} Courses</strong>
          <span>
            Annual Fee Range {feeMin ? `${formatINR(feeMin)}${feeMax && feeMax !== feeMin ? ` - ${formatINR(feeMax)}` : ''}` : 'On request'}
          </span>
        </div>
        <button type="button" className="mmc-cd-view-courses" onClick={() => setActiveTab('courses')}>
          View courses
        </button>
      </div>
    </div>
  );
}