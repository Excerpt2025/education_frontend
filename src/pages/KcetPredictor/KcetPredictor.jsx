import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PredictorPaywall from '../../components/PredictorPaywall/PredictorPaywall.jsx';
import './KcetPredictor.css';

// Friendly labels for the real KEA category codes (the ones that actually
// appear in uploaded cutoff data - G/K/R suffixes are General / Kannada
// Medium / Rural eligibility within each caste category). Anything not in
// this map just falls back to showing the raw code, so a newly-uploaded
// dataset with an unfamiliar code still works instead of being hidden.
const CATEGORY_LABELS = {
  GM: 'GM — General Merit', GMK: 'GMK — General Merit (Kannada Medium)', GMR: 'GMR — General Merit (Rural)', GMP: 'GMP — General Merit (PH)',
  '1G': '1G — Category 1 (General)', '1K': '1K — Category 1 (Kannada Medium)', '1R': '1R — Category 1 (Rural)',
  '2AG': '2AG — Category 2A (General)', '2AK': '2AK — Category 2A (Kannada Medium)', '2AR': '2AR — Category 2A (Rural)',
  '2BG': '2BG — Category 2B (General)', '2BK': '2BK — Category 2B (Kannada Medium)', '2BR': '2BR — Category 2B (Rural)',
  '3AG': '3AG — Category 3A (General)', '3AK': '3AK — Category 3A (Kannada Medium)', '3AR': '3AR — Category 3A (Rural)',
  '3BG': '3BG — Category 3B (General)', '3BK': '3BK — Category 3B (Kannada Medium)', '3BR': '3BR — Category 3B (Rural)',
  S1G: 'S1G — SC (SCA) General', S1K: 'S1K — SC (SCA) Kannada Medium', S1R: 'S1R — SC (SCA) Rural',
  S2G: 'S2G — SC (SCB) General', S2K: 'S2K — SC (SCB) Kannada Medium', S2R: 'S2R — SC (SCB) Rural',
  S3G: 'S3G — SC (SCC 80%) General', S3K: 'S3K — SC (SCC 80%) Kannada Medium', S3R: 'S3R — SC (SCC 80%) Rural',
  S4G: 'S4G — SC (SCC 20%) General', S4K: 'S4K — SC (SCC 20%) Kannada Medium', S4R: 'S4R — SC (SCC 20%) Rural',
  STG: 'STG — ST (General)', STK: 'STK — ST (Kannada Medium)', STR: 'STR — ST (Rural)',
  NRI: 'NRI', OPN: 'OPN — Persons with Disability', OTH: 'OTH — Other',
};
const CATEGORY_GROUP_ORDER = ['GM', '1', '2A', '2B', '3A', '3B', 'SC', 'ST', 'Other'];
function categoryGroupOf(code) {
  if (code.startsWith('GM')) return 'GM';
  if (code.startsWith('1')) return '1';
  if (code.startsWith('2A')) return '2A';
  if (code.startsWith('2B')) return '2B';
  if (code.startsWith('3A')) return '3A';
  if (code.startsWith('3B')) return '3B';
  if (code.startsWith('S') && /^S\d/.test(code)) return 'SC';
  if (code.startsWith('ST')) return 'ST';
  return 'Other';
}
const GROUP_LABELS = { GM: 'General Merit', 1: 'Category 1', '2A': 'Category 2A', '2B': 'Category 2B', '3A': 'Category 3A', '3B': 'Category 3B', SC: 'SC', ST: 'ST', Other: 'Other / Special' };

const ZONES = [
  { id: 'safe', label: 'Safe', dotClass: 'safe' },
  { id: 'moderate', label: 'Moderate', dotClass: 'moderate' },
  { id: 'dream', label: 'Dream', dotClass: 'dream' },
];
const PAGE_SIZE = 8;

export default function KcetPredictor() {
  const { student } = useAuth();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null); // { categories, years, courses }
  const [metaError, setMetaError] = useState('');

  const [form, setForm] = useState({
    rank: '', category: '', course: '', year: '', gender: 'Any', is371J: false,
    name: student?.fullName || '', phone: student?.phone || '', email: student?.email || '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(null);

  const [activeZone, setActiveZone] = useState('safe');
  const [page, setPage] = useState(1);
  const [mobileFormOpen, setMobileFormOpen] = useState(true);

  useEffect(() => {
    api.get('/kcet-cutoffs/meta').then((res) => {
      setMeta(res.data);
      setForm((f) => ({
        ...f,
        category: f.category || res.data.categories[0] || '',
        year: f.year || (res.data.years[0] ? String(res.data.years[0]) : ''),
      }));
      if (!res.data.categories.length) {
        setMetaError('No cutoff data has been uploaded yet - ask an admin to upload the KCET cutoff Excel/PDF first.');
      }
    }).catch(() => setMetaError('Could not load category list. Please refresh the page.'));
  }, []);

  const groupedCategories = useMemo(() => {
    if (!meta) return [];
    const groups = {};
    meta.categories.forEach((code) => {
      const g = categoryGroupOf(code);
      groups[g] = groups[g] || [];
      groups[g].push(code);
    });
    return CATEGORY_GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({ group: GROUP_LABELS[g], options: groups[g] }));
  }, [meta]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const runPredict = async (extra = {}) => {
    const payload = { ...form, ...extra };
    if (!payload.course) delete payload.course; // "Any course" - don't restrict the filter
    if (!payload.year) delete payload.year;
    const res = await api.post('/predictors/kcet', payload);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) { navigate('/login', { state: { from: '/kcet-predictor' } }); return; }

    setLoading(true); setError(''); setResult(null); setPaywall(null);
    try {
      const data = await runPredict();
      setResult(data);
      const firstNonEmpty = ZONES.find((z) => (data[z.id] || []).length > 0);
      setActiveZone(firstNonEmpty ? firstNonEmpty.id : 'safe');
      setPage(1);
      setMobileFormOpen(false); // collapses on mobile only (see CSS); no-op on desktop
    } catch (err) {
      if (err.response?.status === 402) setPaywall(err.response.data);
      else setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const zoneCounts = {
    safe: result?.safe?.length || 0,
    moderate: result?.moderate?.length || 0,
    dream: result?.dream?.length || 0,
  };
  const totalCount = zoneCounts.safe + zoneCounts.moderate + zoneCounts.dream;

  const activeList = result?.[activeZone] || [];
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const pageItems = activeList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToZone = (zoneId) => { setActiveZone(zoneId); setPage(1); };

  // Small window of page numbers around the current page so pagination stays
  // compact even with 50+ pages of results (MAX_PREDICTOR_RESULTS = 60 on the backend).
  const pageWindow = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="mmc-predictor-page">
      <div className="mmc-pred-title-row container">
        <span className="mono mmc-pred-eyebrow">KCET · Engineering Admissions</span>
        <h1>Chart your route into <span className="mmc-pred-grad">engineering.</span></h1>
        <p>Enter your rank &amp; category to see your Safe, Moderate and Dream engineering colleges - based on real KEA cutoff data.</p>
      </div>

      <section className="mmc-pred-section">
        <div className="container mmc-predictor-layout">
          <form className={`mmc-pred-form ${!mobileFormOpen ? 'is-collapsed' : ''}`} onSubmit={handleSubmit}>
            <div className="mmc-pred-form-head">
              <h3>Enter Your Details</h3>
              {result && (
                <button
                  type="button"
                  className="mmc-pred-form-toggle"
                  onClick={() => setMobileFormOpen((o) => !o)}
                  aria-expanded={mobileFormOpen}
                >
                  {mobileFormOpen ? 'Hide' : 'Edit search'} <OutlineChevron open={mobileFormOpen} />
                </button>
              )}
            </div>

            <div className="mmc-form-body">
              {metaError && <p className="mmc-pred-error">{metaError}</p>}

              <div className="mmc-form-section">
                <span className="mono mmc-form-section-label">01 — Identity</span>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required minLength={2} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required minLength={8} />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="mmc-form-section">
                <span className="mono mmc-form-section-label">02 — Rank &amp; Category</span>
                <div className="form-group">
                  <label>KCET Rank *</label>
                  <input type="number" name="rank" value={form.rank} onChange={handleChange} required min="1" placeholder="e.g. 12500" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} required disabled={!meta?.categories.length}>
                    {!meta && <option>Loading categories...</option>}
                    {groupedCategories.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map((code) => <option key={code} value={code}>{CATEGORY_LABELS[code] || code}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <span className="mmc-field-hint">This is the exact reservation category shown on your KCET rank card.</span>
                </div>
                <div className="mmc-form-row">
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option>Any</option><option>Male</option><option>Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Round / Year</label>
                    <select name="year" value={form.year} onChange={handleChange}>
                      <option value="">Any available year</option>
                      {meta?.years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mmc-form-section">
                <span className="mono mmc-form-section-label">03 — Narrow It Down (optional)</span>
                <div className="form-group">
                  <label>Branch / Course</label>
                  <select name="course" value={form.course} onChange={handleChange}>
                    <option value="">Any branch</option>
                    {meta?.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group mmc-checkbox-group">
                  <label>
                    <input type="checkbox" name="is371J" checked={form.is371J} onChange={handleChange} />
                    {' '}371J / Hyderabad-Karnataka Reservation
                  </label>
                </div>
              </div>

              {error && <p className="mmc-pred-error">{error}</p>}
              <button className="btn-primary" disabled={loading || !meta?.categories.length}>
                {loading ? 'Predicting...' : 'Predict Colleges →'}
              </button>
              {!student && <p className="mmc-pred-hint">You'll need to login first - your details above are saved, nothing is lost.</p>}
            </div>
          </form>

          <div className="mmc-predictor-output">
            {paywall ? (
              <PredictorPaywall
                predictorName="KCET"
                oneTimeFee={paywall?.oneTimeFee}
                formData={form}
                predictorEndpoint="/predictors/kcet"
                onSubscribe={() => navigate('/subscription', { state: { from: '/kcet-predictor' } })}
                onUnlocked={(data) => {
                  setResult(data);
                  const firstNonEmpty = ZONES.find((z) => (data[z.id] || []).length > 0);
                  setActiveZone(firstNonEmpty ? firstNonEmpty.id : 'safe');
                  setPage(1);
                  setPaywall(null);
                }}
              />
            ) : loading ? (
              <ResultSkeleton />
            ) : result ? (
              totalCount === 0 ? (
                <div className="mmc-empty-state">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 15c1.2-1.2 2.6-1.8 4-1.8s2.8.6 4 1.8M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  No colleges matched rank {result.inputRank} for this category. Try a different category, branch, or year.
                </div>
              ) : (
                <>
                  <div className="mmc-stat-row">
                    <div className="mmc-stat-card mmc-stat-total">
                      <span className="mmc-stat-num">{totalCount}</span>
                      <span className="mmc-stat-label">Colleges found</span>
                    </div>
                    <div className="mmc-stat-card">
                      <span className="mmc-stat-num" style={{ color: 'var(--success)' }}>{zoneCounts.safe}</span>
                      <span className="mmc-stat-label"><em className="dot safe" />Safe</span>
                    </div>
                    <div className="mmc-stat-card">
                      <span className="mmc-stat-num" style={{ color: 'var(--brass)' }}>{zoneCounts.moderate}</span>
                      <span className="mmc-stat-label"><em className="dot moderate" />Moderate</span>
                    </div>
                    <div className="mmc-stat-card">
                      <span className="mmc-stat-num" style={{ color: 'var(--coral)' }}>{zoneCounts.dream}</span>
                      <span className="mmc-stat-label"><em className="dot dream" />Dream</span>
                    </div>
                  </div>

                  <div className="mmc-zone-tabs" role="tablist">
                    {ZONES.map((z) => (
                      <button
                        key={z.id}
                        type="button"
                        role="tab"
                        aria-selected={activeZone === z.id}
                        className={`mmc-zone-tab ${activeZone === z.id ? 'is-active' : ''} zone-${z.id}`}
                        onClick={() => goToZone(z.id)}
                      >
                        <em className={`dot ${z.dotClass}`} />{z.label}
                        <span className="mmc-zone-count">{zoneCounts[z.id]}</span>
                      </button>
                    ))}
                  </div>

                  {activeList.length === 0 ? (
                    <div className="mmc-empty-state mmc-empty-state-zone">
                      No colleges in the {activeZone} zone for these filters — try another tab above.
                    </div>
                  ) : (
                    <>
                      <div className="mmc-result-grid">
                        {pageItems.map((m, i) => (
                          <ResultCard key={`${m.college?._id || m.college}-${m.course?._id || m.course}-${i}`} match={m} zone={activeZone} />
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="mmc-pagination">
                          <button
                            type="button"
                            className="mmc-page-btn mmc-page-nav"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            ‹ Prev
                          </button>
                          {pageWindow[0] > 1 && (
                            <>
                              <button type="button" className="mmc-page-btn" onClick={() => setPage(1)}>1</button>
                              {pageWindow[0] > 2 && <span className="mmc-page-ellipsis">…</span>}
                            </>
                          )}
                          {pageWindow.map((p) => (
                            <button
                              key={p}
                              type="button"
                              className={`mmc-page-btn ${p === page ? 'is-active' : ''}`}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </button>
                          ))}
                          {pageWindow[pageWindow.length - 1] < totalPages && (
                            <>
                              {pageWindow[pageWindow.length - 1] < totalPages - 1 && <span className="mmc-page-ellipsis">…</span>}
                              <button type="button" className="mmc-page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                            </>
                          )}
                          <button
                            type="button"
                            className="mmc-page-btn mmc-page-nav"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          >
                            Next ›
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )
            ) : (
              <div className="mmc-empty-state">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M12 3 L13.6 10.4 L21 12 L13.6 13.6 L12 21 L10.4 13.6 L3 12 L10.4 10.4 Z" fill="currentColor" opacity="0.9" />
                </svg>
                Fill the form and click "Predict Colleges" to see your Safe, Moderate and Dream colleges.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultCard({ match, zone }) {
  const college = match.college || {};
  const course = match.course || {};
  const logo = getImageUrl(college.image);
  return (
    <div className={`mmc-result-card zone-${zone}`}>
      <div className="mmc-result-thumb">
        {logo ? <img src={logo} alt="" /> : <span className="mmc-result-thumb-fallback">{(college.name || '?').charAt(0)}</span>}
      </div>
      <div className="mmc-result-main">
        <div className="mmc-result-top">
          <h4>{college.name || 'College'}</h4>
          <span className={`mmc-result-zone-badge zone-${zone}`}>{zone}</span>
        </div>
        {college.location && <span className="mmc-result-location">📍 {college.location}{college.type ? ` · ${college.type}` : ''}</span>}
        <div className="mmc-result-details">
          <div><span>Course</span><strong>{course.name || '—'}</strong></div>
          <div><span>Category</span><strong>{match.category}</strong></div>
          <div><span>Cutoff Rank</span><strong>{match.cutoffRank?.toLocaleString?.('en-IN') ?? match.cutoffRank}</strong></div>
          {match.year && <div><span>Year</span><strong>{match.year}{match.round ? ` · ${match.round}` : ''}</strong></div>}
        </div>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="mmc-result-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="mmc-skeleton-card" key={i}>
          <div className="mmc-skeleton-thumb" />
          <div className="mmc-skeleton-lines">
            <div className="mmc-skeleton-line" style={{ width: '55%' }} />
            <div className="mmc-skeleton-line" style={{ width: '35%' }} />
            <div className="mmc-skeleton-line" style={{ width: '75%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OutlineChevron({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}