import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import CollegeInterestModal from '../../components/CollegeInterestModal/CollegeInterestModal.jsx';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import './Colleges.css';

/* ============================================================================
 *  ONE college hub page - replaces the old "College10Plus" home widget,
 *  the standalone "CollegeCompare" page and the generic "CollegeCard".
 *  Everything a student needs lives here: search, filter chips (course /
 *  location / budget / rating), a rich result grid, and an inline
 *  side-by-side compare table for up to 4 colleges - all in one file.
 * ==========================================================================*/

const BUDGET_OPTIONS = [
  { id: '', label: 'Any budget' },
  { id: 'lt1', label: 'Under ₹1L', max: 100000 },
  { id: 'lt3', label: 'Under ₹3L', max: 300000 },
  { id: 'lt5', label: 'Under ₹5L', max: 500000 },
  { id: 'lt7', label: 'Under ₹7L', max: 700000 },
];

const RATING_OPTIONS = [
  { id: '', label: 'Any rating' },
  { id: '4', label: '4.0+ ★' },
  { id: '4.5', label: '4.5+ ★' },
];

const SORT_OPTIONS = [
  { id: 'ranking', label: 'Top Ranked' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'placement', label: 'Best Placements' },
  { id: 'fees-asc', label: 'Fees: Low to High' },
  { id: 'fees-desc', label: 'Fees: High to Low' },
];

/* ---------------------------------------------------------------------------
 *  COURSE FILTER
 *  Admins type courses in different ways ("B.E", "BE Computer Science",
 *  "Bachelor of Engineering", "Engineering"), and many colleges only have
 *  Specializations filled in rather than linked Course records. So each chip
 *  below is a *group* of keywords, matched against course names AND
 *  specializations. Add a new group here and it shows up in the tab strip
 *  automatically - no other change needed.
 * ------------------------------------------------------------------------*/
const COURSE_GROUPS = [
  { id: 'engineering', label: 'Engineering', keywords: ['engineering', 'b.e', 'be', 'b.tech', 'btech', 'b tech', 'bachelor of engineering', 'bachelor of technology'] },
  { id: 'mtech', label: 'M.Tech / M.E', keywords: ['m.tech', 'mtech', 'm tech', 'm.e', 'master of technology', 'master of engineering'] },
  { id: 'mba', label: 'MBA', keywords: ['mba', 'pgdm', 'master of business administration'] },
  { id: 'bba', label: 'BBA', keywords: ['bba', 'bbm', 'bachelor of business administration'] },
  { id: 'mca', label: 'MCA', keywords: ['mca', 'master of computer applications'] },
  { id: 'bca', label: 'BCA', keywords: ['bca', 'bachelor of computer applications'] },
  { id: 'bsc', label: 'B.Sc', keywords: ['b.sc', 'bsc', 'b sc', 'bachelor of science'] },
  { id: 'msc', label: 'M.Sc', keywords: ['m.sc', 'msc', 'm sc', 'master of science'] },
  { id: 'bcom', label: 'B.Com', keywords: ['b.com', 'bcom', 'b com', 'bachelor of commerce'] },
  { id: 'mcom', label: 'M.Com', keywords: ['m.com', 'mcom', 'master of commerce'] },
  { id: 'ba', label: 'BA / Arts', keywords: ['b.a', 'ba', 'bachelor of arts', 'arts', 'humanities'] },
  { id: 'law', label: 'Law', keywords: ['llb', 'll.b', 'llm', 'law', 'ba llb', 'bba llb'] },
  { id: 'medical', label: 'Medical', keywords: ['mbbs', 'md', 'bds', 'bams', 'bhms', 'medicine', 'medical'] },
  { id: 'nursing', label: 'Nursing', keywords: ['nursing', 'b.sc nursing', 'gnm', 'anm'] },
  { id: 'paramedical', label: 'Paramedical', keywords: ['paramedical', 'physiotherapy', 'bpt', 'lab technology', 'radiology', 'optometry'] },
  { id: 'pharmacy', label: 'Pharmacy', keywords: ['pharmacy', 'b.pharm', 'bpharm', 'd.pharm', 'pharm.d', 'pharmd'] },
  { id: 'design', label: 'Design', keywords: ['design', 'b.des', 'bdes', 'fashion', 'interior', 'animation', 'fine arts', 'bfa'] },
  { id: 'architecture', label: 'Architecture', keywords: ['architecture', 'b.arch', 'barch', 'm.arch'] },
  { id: 'hotel', label: 'Hotel Management', keywords: ['hotel management', 'hospitality', 'bhm', 'culinary'] },
  { id: 'agriculture', label: 'Agriculture', keywords: ['agriculture', 'b.sc agri', 'horticulture', 'veterinary'] },
  { id: 'diploma', label: 'Diploma', keywords: ['diploma', 'polytechnic'] },
  { id: 'phd', label: 'Ph.D / Research', keywords: ['ph.d', 'phd', 'doctorate', 'research'] },
];

const EMPTY_FILTERS = { location: '', type: '', budget: '', rating: '', specialization: '' };
const MAX_COMPARE = 4;

function annualFee(college) {
  const n = Number(college.fees?.tuitionAnnual ?? college.fees?.annual);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  if (num >= 100000) return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)}L`;
  return `₹${num.toLocaleString('en-IN')}`;
}
function formatLPA(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `₹${num} LPA`;
}

/* Course names, falling back to specializations - the field admins actually
 * fill in most often in Manage Colleges. */
function courseLabels(college) {
  const fromCourses = (college.coursesOffered || [])
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean);
  if (fromCourses.length) return fromCourses;
  return (college.specializations || []).filter(Boolean);
}

function courseHaystack(college) {
  const courses = (college.coursesOffered || [])
    .map((c) => (typeof c === 'string' ? c : `${c?.name || ''} ${c?.level || ''}`))
    .join(' | ');
  return `${courses} | ${(college.specializations || []).join(' | ')}`.toLowerCase();
}

/* Whole-word-ish match so "ba" doesn't match "Urban Planning" and
 * "be" doesn't match "Best". Dots in "b.e" are escaped. */
function keywordMatches(haystack, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(haystack);
}

function matchesCourseGroup(college, groupId) {
  if (!groupId) return true;
  const group = COURSE_GROUPS.find((g) => g.id === groupId);
  if (!group) return true;
  const hay = courseHaystack(college);
  return group.keywords.some((k) => keywordMatches(hay, k));
}

async function fetchAllColleges() {
  const first = await api.get('/colleges', { params: { page: 1, limit: 100 } });
  let list = first.data.colleges || [];
  const totalPages = first.data.pagination?.totalPages || 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const res = await api.get('/colleges', { params: { page, limit: 100 } });
    list = list.concat(res.data.colleges || []);
  }
  return list;
}

export default function Colleges() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState(MOCK_COLLEGES);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [courseGroup, setCourseGroup] = useState(''); // '' = All courses
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('ranking');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const [selected, setSelected] = useState([]); // array of college objects picked for compare
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'view'|'compare', college? }
  const compareSectionRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchAllColleges()
      .then((list) => { if (alive) { setColleges(list.length ? list : MOCK_COLLEGES); setStatus('ready'); } })
      .catch(() => { if (alive) { setColleges(MOCK_COLLEGES); setStatus('ready'); } });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(query.trim().toLowerCase()), 180);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reset paging whenever the result set changes, so "Show more" doesn't
  // leave the user scrolled past the end of a smaller list.
  useEffect(() => { setVisibleCount(9); }, [courseGroup, filters, search, sort]);

  /* Only show course chips that at least one college actually offers, with a
   * count beside each - a filter that returns nothing is worse than no filter. */
  const courseTabs = useMemo(() => {
    const counts = new Map();
    colleges.forEach((c) => {
      const hay = courseHaystack(c);
      COURSE_GROUPS.forEach((g) => {
        if (g.keywords.some((k) => keywordMatches(hay, k))) {
          counts.set(g.id, (counts.get(g.id) || 0) + 1);
        }
      });
    });
    const available = COURSE_GROUPS
      .filter((g) => counts.get(g.id))
      .map((g) => ({ ...g, count: counts.get(g.id) }));
    // Before any real data is loaded, still show the main streams so the strip
    // never renders as a lonely "All courses" chip.
    if (!available.length) {
      return COURSE_GROUPS.filter((g) => ['engineering', 'mba', 'mca', 'bca', 'bba', 'bsc', 'bcom'].includes(g.id))
        .map((g) => ({ ...g, count: 0 }));
    }
    return available;
  }, [colleges]);

  const specializations = useMemo(() => {
    const set = new Set();
    colleges.forEach((c) => (c.specializations || []).forEach((s) => s && set.add(s)));
    return [...set].sort();
  }, [colleges]);

  const locations = useMemo(() => [...new Set(colleges.map((c) => c.location).filter(Boolean))].sort(), [colleges]);
  const types = useMemo(() => [...new Set(colleges.map((c) => c.type).filter(Boolean))], [colleges]);

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      if (!matchesCourseGroup(c, courseGroup)) return false;
      if (filters.specialization && !(c.specializations || []).some((s) => s.toLowerCase() === filters.specialization.toLowerCase())) return false;
      if (filters.location && c.location !== filters.location) return false;
      if (filters.type && c.type !== filters.type) return false;
      if (filters.budget) {
        const opt = BUDGET_OPTIONS.find((o) => o.id === filters.budget);
        const fee = annualFee(c);
        if (opt?.max && (!fee || fee >= opt.max)) return false;
      }
      if (filters.rating) {
        const min = Number(filters.rating);
        if (!(Number(c.rating) >= min)) return false;
      }
      if (search) {
        const blob = `${c.name || ''} ${c.location || ''} ${c.type || ''} ${courseHaystack(c)}`.toLowerCase();
        if (!blob.includes(search)) return false;
      }
      return true;
    });
  }, [colleges, courseGroup, filters, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'rating': return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'placement': return list.sort((a, b) => (b.placements?.highestPackage || 0) - (a.placements?.highestPackage || 0));
      case 'fees-asc': return list.sort((a, b) => (annualFee(a) || Infinity) - (annualFee(b) || Infinity));
      case 'fees-desc': return list.sort((a, b) => (annualFee(b) || 0) - (annualFee(a) || 0));
      default: return list.sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
    }
  }, [filtered, sort]);

  const shown = sorted.slice(0, visibleCount);
  const featured = useMemo(() => colleges.filter((c) => c.featured).slice(0, 8), [colleges]);
  const filterCount = Object.values(filters).filter(Boolean).length;
  const activeCourseLabel = COURSE_GROUPS.find((g) => g.id === courseGroup)?.label || '';

  const alreadyUnlocked = () => sessionStorage.getItem('mmc_interest_submitted');

  const toggleCompare = (college) => {
    setSelected((prev) => {
      const exists = prev.find((c) => c._id === college._id);
      if (exists) return prev.filter((c) => c._id !== college._id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, college];
    });
  };

  const viewDetails = (college) => {
    if (alreadyUnlocked()) navigate(`/colleges/${college._id}`);
    else setPendingAction({ type: 'view', college });
  };

  const runCompare = async (list) => {
    setCompareLoading(true);
    try {
      const res = await api.post('/colleges/compare', { collegeIds: list.map((c) => c._id) });
      setCompareData(res.data.colleges);
    } catch {
      setCompareData(list.map((c) => ({ ...c, highlights: ['✅ Solid All-Round Choice'] })));
    } finally {
      setCompareLoading(false);
      requestAnimationFrame(() => compareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const startCompare = () => {
    if (selected.length < 2) return;
    if (alreadyUnlocked()) runCompare(selected);
    else setPendingAction({ type: 'compare' });
  };

  const onInterestSubmitted = () => {
    sessionStorage.setItem('mmc_interest_submitted', '1');
    const action = pendingAction;
    setPendingAction(null);
    if (action?.type === 'view' && action.college) navigate(`/colleges/${action.college._id}`);
    else if (action?.type === 'compare') runCompare(selected);
  };

  const removeFromCompare = (id) => {
    setSelected((prev) => prev.filter((c) => c._id !== id));
    setCompareData((prev) => (prev ? prev.filter((c) => c._id !== id) : prev));
  };

  const clearEverything = () => {
    setCourseGroup('');
    setFilters(EMPTY_FILTERS);
    setQuery('');
  };

  return (
    <div className="mmc-colleges-page">
      {/* HERO */}
      <header className="mmc-col-hero">
        <span className="mmc-col-hero-blob mmc-col-hero-blob-blue" aria-hidden="true" />
        <span className="mmc-col-hero-blob mmc-col-hero-blob-orange" aria-hidden="true" />
        <svg className="mmc-col-hero-contours" viewBox="0 0 1140 380" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50,90 C 200,40 400,140 650,85 C 850,40 1000,110 1200,70" stroke="#0174cc" strokeWidth="1" fill="none" />
          <path d="M-50,170 C 220,120 420,220 660,160 C 860,115 1010,190 1200,150" stroke="#f57c00" strokeWidth="1" fill="none" />
          <path d="M-50,250 C 240,200 440,300 680,240 C 880,195 1020,270 1200,230" stroke="#0174cc" strokeWidth="1" fill="none" />
        </svg>
        <div className="container mmc-col-hero-inner">
          <div className="mmc-col-hero-eyebrow">Explore &nbsp;·&nbsp; Filter &nbsp;·&nbsp; Compare</div>
          <h1>Find the Right <span className="mmc-col-hero-grad">College</span></h1>
          <p>Browse colleges by course, location and budget - then compare up to {MAX_COMPARE} side by side on fees, placements, hostel and more.</p>
          <label className="mmc-col-hero-search">
            <span className="mmc-col-hero-search-icon"><OutlineIcon name="search" size={18} /></span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search college, course, specialization or city"
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <OutlineIcon name="close" size={14} />
              </button>
            ) : null}
          </label>
        </div>
      </header>

      {/* TOP PICKS STRIP */}
      {status === 'ready' && featured.length > 0 && (
        <section className="mmc-col-picks">
          <div className="container">
            <div className="mmc-col-picks-head">
              <span className="mmc-col-picks-badge">Top Picks</span>
              <h2>Featured colleges worth a look</h2>
            </div>
            <div className="mmc-col-picks-row">
              {featured.map((c) => {
                const courses = courseLabels(c);
                return (
                  <button key={c._id} type="button" className="mmc-col-pick-card" onClick={() => viewDetails(c)}>
                    <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" />
                    <div>
                      <strong>{c.name}</strong>
                      <small><OutlineIcon name="pin" size={12} /> {c.location || 'Karnataka'}</small>
                      <span className="mmc-col-pick-rating">★ {c.rating || '—'} · {courses.length} course{courses.length === 1 ? '' : 's'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* COURSE TABS */}
      <section className="mmc-col-tabs-section">
        <div className="container">
          <div className="mmc-col-tabs" role="tablist" aria-label="Filter by course">
            <button
              type="button"
              role="tab"
              aria-selected={!courseGroup}
              className={`mmc-col-tab${!courseGroup ? ' is-active' : ''}`}
              onClick={() => setCourseGroup('')}
            >
              All courses
            </button>
            {courseTabs.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={courseGroup === g.id}
                className={`mmc-col-tab${courseGroup === g.id ? ' is-active' : ''}`}
                onClick={() => setCourseGroup(courseGroup === g.id ? '' : g.id)}
              >
                {g.label}{g.count ? <em className="mmc-col-tab-count">{g.count}</em> : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mmc-col-main">
        <div className="container">
          <div className="mmc-col-toolbar">
            <button
              type="button"
              className={`mmc-col-filter-btn${filterOpen ? ' is-open' : ''}`}
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <OutlineIcon name="filter" size={16} /> Filters {filterCount ? <em>{filterCount}</em> : null}
            </button>

            <div className="mmc-col-sort">
              <label htmlFor="mmc-col-sort-select">Sort</label>
              <select id="mmc-col-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className={`mmc-col-filters${filterOpen ? ' is-open' : ''}`}>
            <div className="mmc-col-filters-inner">
              <label>
                Course
                <select value={courseGroup} onChange={(e) => setCourseGroup(e.target.value)}>
                  <option value="">All courses</option>
                  {COURSE_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </label>
              <label>
                Specialization
                <select value={filters.specialization} onChange={(e) => setFilters((f) => ({ ...f, specialization: e.target.value }))}>
                  <option value="">Any specialization</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>
                Location
                <select value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}>
                  <option value="">Any location</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label>
                College Type
                <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                  <option value="">Any type</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                Budget (annual fee)
                <select value={filters.budget} onChange={(e) => setFilters((f) => ({ ...f, budget: e.target.value }))}>
                  {BUDGET_OPTIONS.map((o) => <option key={o.id || 'any'} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              <label>
                Rating
                <select value={filters.rating} onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value }))}>
                  {RATING_OPTIONS.map((o) => <option key={o.id || 'any'} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              {(filterCount || courseGroup) ? (
                <button type="button" className="mmc-col-reset" onClick={clearEverything}>Clear filters</button>
              ) : null}
            </div>
          </div>

          <p className="mmc-col-count">
            {status === 'loading' && 'Loading colleges…'}
            {status === 'ready' && (sorted.length
              ? `${sorted.length} college${sorted.length === 1 ? '' : 's'} found${activeCourseLabel ? ` for ${activeCourseLabel}` : ''}`
              : `No colleges match these filters yet.`)}
          </p>

          {status === 'ready' && sorted.length === 0 && (
            <div className="mmc-col-empty">
              <p>Try a wider course group, or clear the filters to see everything.</p>
              <button type="button" className="btn btn-outline" onClick={clearEverything}>Clear filters</button>
            </div>
          )}

          {status === 'ready' && shown.length > 0 && (
            <div className="mmc-col-grid">
              {shown.map((college) => (
                <CollegeCard
                  key={college._id}
                  college={college}
                  isSelected={!!selected.find((c) => c._id === college._id)}
                  compareFull={selected.length >= MAX_COMPARE}
                  onToggleCompare={toggleCompare}
                  onView={viewDetails}
                />
              ))}
            </div>
          )}

          {status === 'ready' && sorted.length > shown.length && (
            <div className="mmc-col-loadmore">
              <button type="button" className="btn btn-outline" onClick={() => setVisibleCount((n) => n + 9)}>
                Show more colleges
              </button>
            </div>
          )}
        </div>
      </section>

      {/* COMPARE RESULT */}
      <section className="mmc-col-compare-section" ref={compareSectionRef}>
        <div className="container">
          {compareLoading && <p className="mmc-col-count">Building your comparison…</p>}
          {compareData && compareData.length > 0 && (
            <CompareTable colleges={compareData} onRemove={removeFromCompare} />
          )}
        </div>
      </section>

      {/* STICKY COMPARE BAR */}
      {selected.length > 0 && (
        <div className="mmc-col-sticky-bar">
          <div className="mmc-col-sticky-inner">
            <div className="mmc-col-sticky-avatars">
              {selected.map((c) => (
                <span key={c._id} className="mmc-col-sticky-avatar" title={c.name}>
                  <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" />
                  <button type="button" onClick={() => toggleCompare(c)} aria-label={`Remove ${c.name}`}>×</button>
                </span>
              ))}
              <span className="mmc-col-sticky-count">{selected.length}/{MAX_COMPARE} selected</span>
            </div>
            <div className="mmc-col-sticky-actions">
              <button type="button" className="btn btn-outline" onClick={() => setSelected([])}>Clear</button>
              <button type="button" className="btn btn-primary" disabled={selected.length < 2} onClick={startCompare}>
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingAction && (
        <CollegeInterestModal
          collegeIds={pendingAction.type === 'compare' ? selected.map((c) => c._id) : [pendingAction.college?._id]}
          context={pendingAction.type === 'compare' ? 'compare' : 'view'}
          courseOptions={pendingAction.college ? courseLabels(pendingAction.college) : undefined}
          title="Tell us a bit about you 👋"
          subtitle={pendingAction.type === 'compare'
            ? 'Just a few details before we unlock your side-by-side comparison.'
            : `Just a few details before we open the full profile for ${pendingAction.college?.name}.`}
          submitLabel={pendingAction.type === 'compare' ? 'Show My Comparison →' : 'View College Details →'}
          onSuccess={onInterestSubmitted}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
function CollegeCard({ college, isSelected, compareFull, onToggleCompare, onView }) {
  const fee = annualFee(college);
  const courses = courseLabels(college);
  const accreds = (college.accreditations || []).slice(0, 2);
  const highest = formatLPA(college.placements?.highestPackage);
  const hostel = college.hostel?.available;

  return (
    <article className={`mmc-col-card${isSelected ? ' is-selected' : ''}`}>
      <div className="mmc-col-card-photo">
        <img src={getImageUrl(college.image) || '/images/college-placeholder.jpg'} alt={college.name} />
        {college.ranking ? <span className="mmc-col-card-rank">#{college.ranking}</span> : null}
        <span className="mmc-col-card-logo"><img src={getImageUrl(college.logo) || '/images/logo.png'} alt="" /></span>
      </div>
      <div className="mmc-col-card-body">
        <strong>{college.name}</strong>
        <small><OutlineIcon name="pin" size={13} /> {college.location || 'Karnataka'} {college.rating ? <>· ★ {college.rating}</> : null}</small>

        {accreds.length > 0 && (
          <div className="mmc-col-card-chips">
            {accreds.map((a) => <span key={a} className="mmc-col-chip">{a}</span>)}
          </div>
        )}

        {courses.length ? (
          <span className="mmc-col-card-courses">
            {courses.slice(0, 3).join(' · ')}{courses.length > 3 ? ` +${courses.length - 3} more` : ''}
          </span>
        ) : null}

        <div className="mmc-col-card-stats">
          <div>
            <span>Annual Fee</span>
            <strong>{fee ? formatINR(fee) : 'On request'}</strong>
          </div>
          <div>
            <span>Highest Package</span>
            <strong>{highest || 'On request'}</strong>
          </div>
          <div>
            <span>Hostel</span>
            <strong>{hostel ? 'Available' : 'Not listed'}</strong>
          </div>
        </div>

        <div className="mmc-col-card-actions">
          <button
            type="button"
            className={`mmc-col-card-compare${isSelected ? ' is-active' : ''}`}
            onClick={() => onToggleCompare(college)}
            disabled={!isSelected && compareFull}
          >
            <OutlineIcon name="scale" size={14} /> {isSelected ? 'Added' : 'Compare'}
          </button>
          <button type="button" className="mmc-col-card-view" onClick={() => onView(college)}>
            View Profile <OutlineIcon name="arrow" size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------- */
function CompareTable({ colleges, onRemove }) {
  const shareRow = (key, label) => (
    <tr>
      <td>{label}</td>
      {colleges.map((c) => {
        const share = c.hostel?.[key];
        return <td key={c._id}>{share?.available ? formatINR(share.feesPerYear) || 'Available' : '—'}</td>;
      })}
    </tr>
  );

  return (
    <div className="mmc-col-compare">
      <span className="mono">Comparison</span>
      <h3>How these stack up</h3>
      <p className="mmc-col-compare-note">Every college below has real strengths worth knowing - here's what stands out about each.</p>

      <div className="mmc-col-compare-highlights">
        {colleges.map((c) => (
          <div key={c._id} className="mmc-col-compare-highlight-card">
            <div className="mmc-col-compare-highlight-head">
              <strong>{c.name}</strong>
              <button type="button" onClick={() => onRemove(c._id)} aria-label={`Remove ${c.name} from comparison`}>×</button>
            </div>
            <div className="mmc-col-compare-tags">
              {(c.highlights || ['✅ Solid All-Round Choice']).map((h) => <span key={h}>{h}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="mmc-col-compare-table-wrap">
        <table className="mmc-col-compare-table">
          <thead>
            <tr>
              <th>Attribute</th>
              {colleges.map((c) => <th key={c._id}>{c.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><td>Location</td>{colleges.map((c) => <td key={c._id}>{c.location || '-'}</td>)}</tr>
            <tr><td>Type</td>{colleges.map((c) => <td key={c._id}>{c.type || '-'}</td>)}</tr>
            <tr><td>Ranking</td>{colleges.map((c) => <td key={c._id}>{c.ranking ? `#${c.ranking}` : '-'}</td>)}</tr>
            <tr><td>Rating</td>{colleges.map((c) => <td key={c._id}>{c.rating ? `★ ${c.rating}` : '-'}</td>)}</tr>
            <tr><td>Accreditation</td>{colleges.map((c) => <td key={c._id}>{(c.accreditations || []).join(', ') || '-'}</td>)}</tr>
            <tr><td>Specializations</td>{colleges.map((c) => <td key={c._id}>{(c.specializations || []).join(', ') || '-'}</td>)}</tr>
            <tr><td>Courses Offered</td>{colleges.map((c) => <td key={c._id}>{courseLabels(c).join(', ') || '-'}</td>)}</tr>
            <tr><td>Annual Tuition Fee</td>{colleges.map((c) => <td key={c._id}>{formatINR(c.fees?.tuitionAnnual ?? c.fees?.annual) || 'On request'}</td>)}</tr>
            <tr><td>Total Course Fee</td>{colleges.map((c) => <td key={c._id}>{formatINR(c.fees?.totalCourse) || 'On request'}</td>)}</tr>
            <tr><td>Highest Package</td>{colleges.map((c) => <td key={c._id}>{formatLPA(c.placements?.highestPackage) || 'On request'}</td>)}</tr>
            <tr><td>Average Package</td>{colleges.map((c) => <td key={c._id}>{formatLPA(c.placements?.averagePackage) || 'On request'}</td>)}</tr>
            <tr><td>Placement %</td>{colleges.map((c) => <td key={c._id}>{c.placements?.placementPercentage ? `${c.placements.placementPercentage}%` : '-'}</td>)}</tr>
            {shareRow('twoShare', 'Hostel (2-Share) / yr')}
            {shareRow('threeShare', 'Hostel (3-Share) / yr')}
            {shareRow('fourShare', 'Hostel (4-Share) / yr')}
            <tr><td>Facilities</td>{colleges.map((c) => <td key={c._id}>{(c.facilities || []).join(', ') || '-'}</td>)}</tr>
          </tbody>
        </table>
      </div>

      <div className="mmc-col-compare-cta">
        <Link to="/college-admission-enquiry" className="btn btn-primary">Talk to a Counsellor →</Link>
      </div>
    </div>
  );
}