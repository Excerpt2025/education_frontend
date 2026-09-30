import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import CollegeInterestModal from '../../components/CollegeInterestModal/CollegeInterestModal.jsx';
import { MOCK_COLLEGES } from '../../data/collegeMocks.js';
import {
  COURSE_CATEGORIES,
  getCategory,
  matchesCategory,
  categoryCounts,
  courseHaystack,
  courseLabels,
} from '../../data/courseCategories.js';
import './Colleges.css';

/* ============================================================================
 *  ONE college hub page: search, filters, result grid, inline compare.
 *
 *  Filters (Shiksha-style drawer, applied with "Apply Filter"):
 *    - Course Type   : Full Time / Part Time / Online
 *    - Specialization: Stream > Degree > Course > Specialization (cascading)
 *    - Budget        : dual slider + From/To inputs (annual fee)
 *    - Area          : Bangalore North / South / East / West / Central
 *    - More          : college type, location, rating
 *
 *  Stream + Course (program) still live in the URL so Home page cards can
 *  deep link:  /colleges?category=engineering&program=be
 * ==========================================================================*/

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

const COURSE_TYPES = ['Full Time', 'Part Time', 'Online'];
const AREA_OPTIONS = ['North', 'South', 'East', 'West', 'Central'];
const DEGREE_OPTIONS = [
  { id: 'UG', label: 'Under Graduate' },
  { id: 'PG', label: 'Post Graduate' },
  { id: 'Diploma', label: 'Diploma' },
];

const BUDGET_MIN = 10000;      // 10 k
const BUDGET_MAX = 50000000;   // 5.00 Cr

const EMPTY_FILTERS = {
  location: '',
  type: '',
  rating: '',
  specialization: '',
  degree: '',
  courseTypes: [],
  areas: [],
  budgetMin: BUDGET_MIN,
  budgetMax: BUDGET_MAX,
};

const MAX_COMPARE = 4;
const PLACEHOLDER = '/images/college-placeholder.jpg';

/* ---------- small helpers ---------- */
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
function budgetLabel(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`;
  return `${Math.round(n / 1000)} k`;
}
// Slider works on a log scale (0-100) because 10k -> 5Cr is a huge range.
const LOG_SPAN = Math.log(BUDGET_MAX / BUDGET_MIN);
function sliderToBudget(p) {
  const raw = BUDGET_MIN * Math.exp((LOG_SPAN * p) / 100);
  if (p >= 100) return BUDGET_MAX;
  const step = raw >= 1000000 ? 100000 : raw >= 100000 ? 10000 : 1000;
  return Math.max(BUDGET_MIN, Math.round(raw / step) * step);
}
function budgetToSlider(v) {
  const clamped = Math.min(Math.max(Number(v) || BUDGET_MIN, BUDGET_MIN), BUDGET_MAX);
  return (Math.log(clamped / BUDGET_MIN) / LOG_SPAN) * 100;
}

// Area: use the admin-entered `area` field; for older records fall back to
// spotting "north/south/east/west/central" in the location text.
function collegeArea(c) {
  if (c.area) return c.area;
  const m = String(c.location || '').match(/\b(north|south|east|west|central)\b/i);
  return m ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : '';
}

// Degree level(s) a college offers: linked Course docs first, then a keyword
// scan of programs / course names for colleges that only have text data.
const UG_RE = /(^|[^a-z])(b\.?e|b\.?tech|bca|bba|b\.?com|b\.?sc|b\.?arch|b\.?des|mbbs|llb|ba)(?![a-z])/;
const PG_RE = /(^|[^a-z])(m\.?e|m\.?tech|mba|mca|pgdm|m\.?sc|m\.?com|m\.?arch|ma)(?![a-z])/;
function collegeLevels(c) {
  const set = new Set();
  (c.coursesOffered || []).forEach((x) => x?.level && set.add(x.level));
  const text = [...(c.programs || []), ...(c.coursesOffered || []).map((x) => x?.name || '')].join(' ').toLowerCase();
  if (UG_RE.test(text)) set.add('UG');
  if (PG_RE.test(text)) set.add('PG');
  if (/diploma/.test(text)) set.add('Diploma');
  return set;
}

// Colleges with no course-type data are treated as Full Time.
function collegeCourseTypes(c) {
  return Array.isArray(c.courseTypes) && c.courseTypes.length ? c.courseTypes : ['Full Time'];
}

function imgFallback(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Category (stream) + program (course) come from the URL (single source of truth).
  const rawCategory = searchParams.get('category') || '';
  const courseGroup = getCategory(rawCategory) ? rawCategory : '';
  const rawProgram = searchParams.get('program') || '';
  const program = courseGroup && getCategory(courseGroup).programs.some((p) => p.id === rawProgram) ? rawProgram : '';

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    next.delete('program');
    if (id) next.set('category', id); else next.delete('category');
    setSearchParams(next, { replace: true });
  };
  const setProgram = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('program', id); else next.delete('program');
    setSearchParams(next, { replace: true });
  };

  const [colleges, setColleges] = useState(MOCK_COLLEGES);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('ranking');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState({ ...EMPTY_FILTERS, category: '', program: '' });
  const [visibleCount, setVisibleCount] = useState(9);

  const [selected, setSelected] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
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

  useEffect(() => { setVisibleCount(9); }, [courseGroup, program, filters, search, sort]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // Lock page scroll while the filter drawer is open.
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filterOpen]);

  const counts = useMemo(() => categoryCounts(colleges), [colleges]);
  const activeCategory = getCategory(courseGroup);

  const locations = useMemo(() => [...new Set(colleges.map((c) => c.location).filter(Boolean))].sort(), [colleges]);
  const types = useMemo(() => [...new Set(colleges.map((c) => c.type).filter(Boolean))], [colleges]);

  // Specialization options follow the stream picked in the drawer (draft).
  const draftCategory = getCategory(draft.category);
  const draftSpecializations = useMemo(() => {
    const set = new Set();
    colleges
      .filter((c) => matchesCategory(c, draft.category, ''))
      .forEach((c) => (c.specializations || []).forEach((s) => s && set.add(s)));
    return [...set].sort();
  }, [colleges, draft.category]);

  const budgetActive = filters.budgetMin > BUDGET_MIN || filters.budgetMax < BUDGET_MAX;

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      if (!matchesCategory(c, courseGroup, program)) return false;
      if (filters.specialization && !(c.specializations || []).some((s) => s.toLowerCase() === filters.specialization.toLowerCase())) return false;
      if (filters.degree && !collegeLevels(c).has(filters.degree)) return false;
      if (filters.courseTypes.length && !collegeCourseTypes(c).some((t) => filters.courseTypes.includes(t))) return false;
      if (filters.areas.length && !filters.areas.includes(collegeArea(c))) return false;
      if (filters.location && c.location !== filters.location) return false;
      if (filters.type && c.type !== filters.type) return false;
      if (budgetActive) {
        const fee = annualFee(c);
        if (!fee || fee < filters.budgetMin || fee > filters.budgetMax) return false;
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
  }, [colleges, courseGroup, program, filters, budgetActive, search]);

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

  // Badge count on the Filters button = every active filter incl. stream/course.
  const filterCount =
    (courseGroup ? 1 : 0) + (program ? 1 : 0) +
    (filters.specialization ? 1 : 0) + (filters.degree ? 1 : 0) +
    filters.courseTypes.length + filters.areas.length +
    (filters.location ? 1 : 0) + (filters.type ? 1 : 0) + (filters.rating ? 1 : 0) +
    (budgetActive ? 1 : 0);

  const activeLabel = program
    ? activeCategory?.programs.find((p) => p.id === program)?.label
    : activeCategory?.label || '';

  /* ---------- filter drawer ---------- */
  const openFilters = () => {
    setDraft({ ...filters, category: courseGroup, program });
    setFilterOpen(true);
  };
  const patchDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const toggleDraftList = (key, value) => setDraft((d) => ({
    ...d,
    [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
  }));

  const applyFilters = () => {
    const min = Math.min(Math.max(Number(draft.budgetMin) || BUDGET_MIN, BUDGET_MIN), BUDGET_MAX);
    const max = Math.min(Math.max(Number(draft.budgetMax) || BUDGET_MAX, BUDGET_MIN), BUDGET_MAX);
    const { category, program: prog, ...rest } = draft;
    setFilters({ ...rest, budgetMin: Math.min(min, max), budgetMax: Math.max(min, max) });
    const next = new URLSearchParams(searchParams);
    if (category) next.set('category', category); else next.delete('category');
    if (category && prog) next.set('program', prog); else next.delete('program');
    setSearchParams(next, { replace: true });
    setFilterOpen(false);
  };

  const clearEverything = () => {
    setSearchParams({}, { replace: true });
    setFilters(EMPTY_FILTERS);
    setDraft({ ...EMPTY_FILTERS, category: '', program: '' });
    setQuery('');
  };

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
                    <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" onError={imgFallback} />
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

      {/* COURSE CATEGORY TABS */}
      <section className="mmc-col-tabs-section">
        <div className="container">
          <div className="mmc-col-tabs" role="tablist" aria-label="Filter by course category">
            <button
              type="button"
              role="tab"
              aria-selected={!courseGroup}
              className={`mmc-col-tab${!courseGroup ? ' is-active' : ''}`}
              onClick={() => setCategory('')}
            >
              All courses
            </button>
            {COURSE_CATEGORIES.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={courseGroup === g.id}
                className={`mmc-col-tab${courseGroup === g.id ? ' is-active' : ''}`}
                onClick={() => setCategory(courseGroup === g.id ? '' : g.id)}
              >
                {g.label}{counts[g.id] ? <em className="mmc-col-tab-count">{counts[g.id]}</em> : null}
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="mmc-col-programs" aria-label={`${activeCategory.label} programs`}>
              <button
                type="button"
                className={`mmc-col-program${!program ? ' is-active' : ''}`}
                onClick={() => setProgram('')}
              >
                All {activeCategory.label}
              </button>
              {activeCategory.programs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`mmc-col-program${program === p.id ? ' is-active' : ''}`}
                  onClick={() => setProgram(program === p.id ? '' : p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
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
              onClick={openFilters}
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

          <p className="mmc-col-count">
            {status === 'loading' && 'Loading colleges…'}
            {status === 'ready' && (sorted.length
              ? `${sorted.length} college${sorted.length === 1 ? '' : 's'} found${activeLabel ? ` for ${activeLabel}` : ''}`
              : `No colleges match these filters yet.`)}
          </p>

          {status === 'ready' && sorted.length === 0 && (
            <div className="mmc-col-empty">
              <p>
                {activeLabel
                  ? `We're adding ${activeLabel} colleges soon. Try another course, or talk to a counsellor for personal guidance.`
                  : 'Try a wider course group, or clear the filters to see everything.'}
              </p>
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
                  <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" onError={imgFallback} />
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

      {/* FILTER DRAWER */}
      {filterOpen && (
        <div className="mmc-fd-root" role="dialog" aria-modal="true" aria-label="Filter colleges">
          <div className="mmc-fd-overlay" onClick={() => setFilterOpen(false)} />
          <aside className="mmc-fd-panel">
            <div className="mmc-fd-head">
              <h2>Filters</h2>
              <button type="button" className="mmc-fd-close" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                <OutlineIcon name="close" size={16} />
              </button>
            </div>

            <div className="mmc-fd-body">
              {/* COURSE TYPE */}
              <section className="mmc-fd-section">
                <h3>Course Type {draft.courseTypes.length ? `(${draft.courseTypes.length})` : '(0)'}</h3>
                <div className="mmc-fd-chips">
                  {COURSE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`mmc-fd-chip${draft.courseTypes.includes(t) ? ' is-active' : ''}`}
                      aria-pressed={draft.courseTypes.includes(t)}
                      onClick={() => toggleDraftList('courseTypes', t)}
                    >
                      {t} <span aria-hidden="true">{draft.courseTypes.includes(t) ? '✓' : '+'}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* SPECIALIZATION: Stream > Degree > Course > Specialization */}
              <section className="mmc-fd-section">
                <h3>Specialization</h3>

                <label className="mmc-fd-field">
                  <span>Stream</span>
                  <select
                    value={draft.category}
                    onChange={(e) => patchDraft({ category: e.target.value, program: '', specialization: '' })}
                  >
                    <option value="">All streams</option>
                    {COURSE_CATEGORIES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </label>

                <label className="mmc-fd-field">
                  <span>Degree</span>
                  <select value={draft.degree} onChange={(e) => patchDraft({ degree: e.target.value })}>
                    <option value="">Any degree</option>
                    {DEGREE_OPTIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </label>

                <label className="mmc-fd-field">
                  <span>Course</span>
                  <select
                    value={draft.program}
                    disabled={!draftCategory}
                    onChange={(e) => patchDraft({ program: e.target.value })}
                  >
                    <option value="">{draftCategory ? 'All courses' : 'Select stream first'}</option>
                    {(draftCategory?.programs || []).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </label>

                <label className="mmc-fd-field">
                  <span>Specialization</span>
                  <select
                    value={draft.specialization}
                    disabled={!draftCategory}
                    onChange={(e) => patchDraft({ specialization: e.target.value })}
                  >
                    <option value="">{draftCategory ? 'Any specialization' : 'Select stream first'}</option>
                    {draftSpecializations.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </section>

              {/* BUDGET */}
              <section className="mmc-fd-section">
                <h3>Budget ({budgetLabel(BUDGET_MIN)} - {budgetLabel(BUDGET_MAX)})</h3>
                <BudgetSlider
                  min={draft.budgetMin}
                  max={draft.budgetMax}
                  onChange={(min, max) => patchDraft({ budgetMin: min, budgetMax: max })}
                />
                <div className="mmc-fd-budget-inputs">
                  <label>
                    <span>₹ From</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={BUDGET_MIN}
                      max={BUDGET_MAX}
                      value={draft.budgetMin}
                      onChange={(e) => patchDraft({ budgetMin: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    <span>₹ To</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={BUDGET_MIN}
                      max={BUDGET_MAX}
                      value={draft.budgetMax}
                      onChange={(e) => patchDraft({ budgetMax: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </label>
                </div>
                <p className="mmc-fd-hint">Based on annual fee. Colleges without a listed fee are hidden once you narrow the budget.</p>
              </section>

              {/* AREA */}
              <section className="mmc-fd-section">
                <h3>Area in Bangalore {draft.areas.length ? `(${draft.areas.length})` : '(0)'}</h3>
                <div className="mmc-fd-chips">
                  {AREA_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`mmc-fd-chip${draft.areas.includes(a) ? ' is-active' : ''}`}
                      aria-pressed={draft.areas.includes(a)}
                      onClick={() => toggleDraftList('areas', a)}
                    >
                      {a} <span aria-hidden="true">{draft.areas.includes(a) ? '✓' : '+'}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* MORE */}
              <section className="mmc-fd-section">
                <h3>More filters</h3>
                <label className="mmc-fd-field">
                  <span>Location</span>
                  <select value={draft.location} onChange={(e) => patchDraft({ location: e.target.value })}>
                    <option value="">Any location</option>
                    {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
                <label className="mmc-fd-field">
                  <span>College type</span>
                  <select value={draft.type} onChange={(e) => patchDraft({ type: e.target.value })}>
                    <option value="">Any type</option>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="mmc-fd-field">
                  <span>Rating</span>
                  <select value={draft.rating} onChange={(e) => patchDraft({ rating: e.target.value })}>
                    {RATING_OPTIONS.map((o) => <option key={o.id || 'any'} value={o.id}>{o.label}</option>)}
                  </select>
                </label>
              </section>
            </div>

            <div className="mmc-fd-foot">
              <button type="button" className="mmc-fd-clear" onClick={() => { clearEverything(); setFilterOpen(false); }}>
                Clear
              </button>
              <button type="button" className="mmc-fd-apply" onClick={applyFilters}>Apply Filter</button>
            </div>
          </aside>
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
/* Two-thumb budget slider (log scale so 10k..5Cr stays usable on a phone). */
function BudgetSlider({ min, max, onChange }) {
  const lo = budgetToSlider(min === '' ? BUDGET_MIN : min);
  const hi = budgetToSlider(max === '' ? BUDGET_MAX : max);
  return (
    <div className="mmc-fd-slider">
      <div className="mmc-fd-slider-labels">
        <span>{budgetLabel(BUDGET_MIN)}</span>
        <span>{budgetLabel(BUDGET_MAX)}</span>
      </div>
      <div className="mmc-fd-slider-track">
        <div className="mmc-fd-slider-fill" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0)}%` }} />
        <input
          type="range" min="0" max="100" step="1" value={lo}
          aria-label="Minimum budget"
          onChange={(e) => onChange(Math.min(sliderToBudget(Number(e.target.value)), max === '' ? BUDGET_MAX : max), max === '' ? BUDGET_MAX : max)}
        />
        <input
          type="range" min="0" max="100" step="1" value={hi}
          aria-label="Maximum budget"
          onChange={(e) => onChange(min === '' ? BUDGET_MIN : min, Math.max(sliderToBudget(Number(e.target.value)), min === '' ? BUDGET_MIN : min))}
        />
      </div>
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
  const area = collegeArea(college);

  return (
    <article className={`mmc-col-card${isSelected ? ' is-selected' : ''}`}>
      <div className="mmc-col-card-photo">
        <img src={getImageUrl(college.image) || PLACEHOLDER} alt="" onError={imgFallback} />
        {college.ranking ? <span className="mmc-col-card-rank">#{college.ranking}</span> : null}
        <span className="mmc-col-card-logo"><img src={getImageUrl(college.logo) || '/images/logo.png'} alt="" onError={imgFallback} /></span>
      </div>
      <div className="mmc-col-card-body">
        <strong>{college.name}</strong>
        <small>
          <OutlineIcon name="pin" size={13} /> {college.location || 'Karnataka'}
          {area && !String(college.location || '').toLowerCase().includes(area.toLowerCase()) ? ` (${area})` : ''}
          {college.rating ? <> · ★ {college.rating}</> : null}
        </small>

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
            <tr><td>Area</td>{colleges.map((c) => <td key={c._id}>{collegeArea(c) || '-'}</td>)}</tr>
            <tr><td>Type</td>{colleges.map((c) => <td key={c._id}>{c.type || '-'}</td>)}</tr>
            <tr><td>Ranking</td>{colleges.map((c) => <td key={c._id}>{c.ranking ? `#${c.ranking}` : '-'}</td>)}</tr>
            <tr><td>Rating</td>{colleges.map((c) => <td key={c._id}>{c.rating ? `★ ${c.rating}` : '-'}</td>)}</tr>
            <tr><td>Accreditation</td>{colleges.map((c) => <td key={c._id}>{(c.accreditations || []).join(', ') || '-'}</td>)}</tr>
            <tr><td>Specializations</td>{colleges.map((c) => <td key={c._id}>{(c.specializations || []).join(', ') || '-'}</td>)}</tr>
            <tr><td>Courses Offered</td>{colleges.map((c) => <td key={c._id}>{courseLabels(c).join(', ') || '-'}</td>)}</tr>
            <tr><td>Course Type</td>{colleges.map((c) => <td key={c._id}>{collegeCourseTypes(c).join(', ')}</td>)}</tr>
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