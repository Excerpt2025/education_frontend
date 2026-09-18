import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PredictorResultTable from '../../components/PredictorResultTable/PredictorResultTable.jsx';
import PredictorPaywall from '../../components/PredictorPaywall/PredictorPaywall.jsx';
import '../KcetPredictor/KcetPredictor.css';

// Same KEA category convention as KCET - see KcetPredictor.jsx for the
// G/K/R (General/Kannada Medium/Rural) explanation. Falls back to the raw
// code for anything not covered, so newly uploaded data always works.
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

export default function PgcetPredictor() {
  const { student } = useAuth();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [metaError, setMetaError] = useState('');

  const [form, setForm] = useState({
    rank: '', category: '', course: '', collegeType: '', year: '',
    name: student?.fullName || '', phone: student?.phone || '', email: student?.email || '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(null);

  useEffect(() => {
    api.get('/pgcet-cutoffs/meta').then((res) => {
      setMeta(res.data);
      setForm((f) => ({
        ...f,
        category: f.category || res.data.categories[0] || '',
        year: f.year || (res.data.years[0] ? String(res.data.years[0]) : ''),
      }));
      if (!res.data.categories.length) {
        setMetaError('No PGCET cutoff data has been uploaded yet - ask an admin to upload the PGCET cutoff Excel/PDF first.');
      }
    }).catch(() => setMetaError('Could not load category list. Please refresh the page.'));
  }, []);

  const groupedCategories = React.useMemo(() => {
    if (!meta) return [];
    const groups = {};
    meta.categories.forEach((code) => {
      const g = categoryGroupOf(code);
      groups[g] = groups[g] || [];
      groups[g].push(code);
    });
    return CATEGORY_GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({ group: GROUP_LABELS[g], options: groups[g] }));
  }, [meta]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const runPredict = async (extra = {}) => {
    const payload = { ...form, ...extra };
    if (!payload.course) delete payload.course;
    if (!payload.year) delete payload.year;
    if (!payload.collegeType) delete payload.collegeType;
    const res = await api.post('/predictors/pgcet', payload);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) { navigate('/login', { state: { from: '/pgcet-predictor' } }); return; }

    setLoading(true); setError(''); setResult(null); setPaywall(null);
    try {
      const data = await runPredict();
      setResult(data);
    } catch (err) {
      if (err.response?.status === 402) setPaywall(err.response.data);
      else setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mmc-predictor-page">
      <div className="mmc-pred-title-row container">
        <span className="mono mmc-pred-eyebrow">PGCET · Postgraduate Admissions</span>
        <h1>Chart your route into <span className="mmc-pred-grad">postgraduate study.</span></h1>
        <p>Enter your rank, category, course and college type to see postgraduate college predictions - based on real KEA cutoff data.</p>
      </div>

      <section className="mmc-pred-section">
        <div className="container mmc-predictor-layout">
          <form className="mmc-pred-form" onSubmit={handleSubmit}>
            <h3>Enter Your Details</h3>

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
                <label>PGCET Rank *</label>
                <input type="number" name="rank" value={form.rank} onChange={handleChange} required min="1" placeholder="e.g. 4200" />
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
                <span className="mmc-field-hint">This is the exact reservation category shown on your PGCET rank card.</span>
              </div>
              <div className="mmc-form-row">
                <div className="form-group">
                  <label>College Type</label>
                  <select name="collegeType" value={form.collegeType} onChange={handleChange}>
                    <option value="">Any</option>
                    <option>Government</option><option>Private</option><option>Autonomous</option>
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
            </div>

            {error && <p className="mmc-pred-error">{error}</p>}
            <button className="btn-primary" disabled={loading || !meta?.categories.length}>
              {loading ? 'Predicting...' : 'Predict Colleges →'}
            </button>
            {!student && <p className="mmc-pred-hint">You'll need to login first - your details above are saved, nothing is lost.</p>}
          </form>

          <div className="mmc-predictor-output">
            <div className="mmc-output-label">
              <span className="mono">Predicted routes</span>
              <span className="mmc-output-legend">
                <em className="dot safe" />Safe <em className="dot moderate" />Moderate <em className="dot dream" />Dream
              </span>
            </div>
            {paywall ? (
              <PredictorPaywall
                predictorName="PGCET"
                oneTimeFee={paywall?.oneTimeFee}
                formData={form}
                predictorEndpoint="/predictors/pgcet"
                onSubscribe={() => navigate('/subscription', { state: { from: '/pgcet-predictor' } })}
                onUnlocked={(data) => { setResult(data); setPaywall(null); }}
              />
            ) : result ? (
              <PredictorResultTable result={result} />
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
