import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import CareerReportCard from '../../components/CareerReportCard/CareerReportCard.jsx';
import './StudentDashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'profile', label: 'Profile', icon: 'target' },
  { id: 'tools', label: 'Career Tools', icon: 'compass' },
  { id: 'payments', label: 'Payments', icon: 'chart' },
  { id: 'referrals', label: 'Refer & Earn', icon: 'handshake' },
  { id: 'kyc', label: 'KYC', icon: 'shield' },
  { id: 'colleges', label: 'My Colleges', icon: 'bookmark' },
];

const KYC_STATUS_META = {
  not_submitted: { label: 'Not Submitted', cls: 'is-pending' },
  pending: { label: 'Under Review', cls: 'is-pending' },
  verified: { label: 'Verified', cls: 'is-verified' },
  rejected: { label: 'Rejected', cls: 'is-rejected' },
};

const TOOLS = [
  {
    key: 'assessment', title: 'Career Assessment', theme: 'orange', icon: 'compass',
    blurb: 'Discover the streams and careers that fit your interests, aptitude and values.',
    to: '/career-assessment', price: '₹199 one-time',
  },
  {
    key: 'kcet', title: 'KCET Predictor', theme: 'blue', icon: 'cap',
    blurb: 'See which colleges you can realistically get into based on your KCET rank.',
    to: '/kcet-predictor', price: '₹99 one-time',
  },
  {
    key: 'pgcet', title: 'PGCET Predictor', theme: 'purple', icon: 'book',
    blurb: 'Match your PGCET rank against real cutoffs across Karnataka colleges.',
    to: '/pgcet-predictor', price: '₹99 one-time',
  },
];

function initials(name) {
  if (!name) return 'S';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'; }

export default function StudentDashboard() {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [referral, setReferral] = useState(null);
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [kycForm, setKycForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', panNumber: '', upiId: '' });
  const [kycSaving, setKycSaving] = useState(false);
  const [kycMsg, setKycMsg] = useState({ type: '', text: '' });
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    api.get('/students/dashboard').then((res) => {
      setData(res.data);
      setProfileForm({
        fullName: res.data.profile.fullName, phone: res.data.profile.phone,
        gender: res.data.profile.gender || '', address: res.data.profile.address || '',
      });
      const kyc = res.data.profile.kyc;
      if (kyc) {
        setKycForm({
          accountHolderName: kyc.accountHolderName || '', bankName: kyc.bankName || '',
          accountNumber: kyc.accountNumber || '', confirmAccountNumber: kyc.accountNumber || '',
          ifsc: kyc.ifsc || '', panNumber: kyc.panNumber || '', upiId: kyc.upiId || '',
        });
      }
    }).catch(() => {});
    api.get('/referrals/my').then((res) => setReferral(res.data)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSavedMsg('');
    try {
      await api.put('/students/me', profileForm);
      setSavedMsg('Profile updated successfully.');
    } catch {
      setSavedMsg('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveKyc = async (e) => {
    e.preventDefault();
    setKycMsg({ type: '', text: '' });
    if (kycForm.accountNumber !== kycForm.confirmAccountNumber) {
      setKycMsg({ type: 'error', text: 'Account number and confirmation do not match.' });
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(kycForm.ifsc.trim())) {
      setKycMsg({ type: 'error', text: 'Enter a valid 11-character IFSC code (e.g. HDFC0001234).' });
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(kycForm.panNumber.trim())) {
      setKycMsg({ type: 'error', text: 'Enter a valid 10-character PAN (e.g. ABCDE1234F).' });
      return;
    }
    setKycSaving(true);
    try {
      const res = await api.put('/students/kyc', {
        accountHolderName: kycForm.accountHolderName,
        bankName: kycForm.bankName,
        accountNumber: kycForm.accountNumber,
        ifsc: kycForm.ifsc,
        panNumber: kycForm.panNumber,
        upiId: kycForm.upiId,
      });
      setData((d) => ({ ...d, profile: res.data.student }));
      setKycMsg({ type: 'success', text: 'KYC submitted! We\'ll verify it within 24-48 hours before your first payout.' });
    } catch (err) {
      setKycMsg({ type: 'error', text: err?.response?.data?.message || 'Could not submit KYC. Please check the details and try again.' });
    } finally {
      setKycSaving(false);
    }
  };

  const referralLink = referral ? `${window.location.origin}/register?ref=${referral.referralCode}` : '';
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const totalSpent = useMemo(() => (data?.paymentHistory || [])
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + (p.amount || 0), 0), [data]);

  const convertedReferrals = useMemo(() => (referral?.referrals || []).filter((r) => r.status === 'converted').length, [referral]);

  if (!data) return <div className="loading-state">Loading your dashboard...</div>;

  const access = data.moduleAccess || { subscription: false, assessment: false, kcet: false, pgcet: false };
  const unlockedCount = ['assessment', 'kcet', 'pgcet'].filter((k) => access[k]).length;
  const kyc = data.profile?.kyc || {};
  const kycMeta = KYC_STATUS_META[kyc.status || 'not_submitted'];

  return (
    <div className="mmc-dashboard-page">
      {/* HERO */}
      <div className="mmc-dash-hero">
        <span className="mmc-dash-hero-blob mmc-dash-hero-blob-a" aria-hidden="true" />
        <span className="mmc-dash-hero-blob mmc-dash-hero-blob-b" aria-hidden="true" />
        <div className="container mmc-dash-hero-inner">
          <div className="mmc-dash-avatar">{initials(student?.fullName)}</div>
          <div>
            <h1>Welcome back, {student?.fullName?.split(' ')[0] || 'Student'} 👋</h1>
            <p>Manage your profile, subscription, career tools and referrals from one place.</p>
            <span className={`mmc-dash-sub-chip${access.subscription ? ' is-active' : ''}`}>
              <OutlineIcon name={access.subscription ? 'shield' : 'signal'} size={13} />
              {access.subscription ? `${data.activeSubscription?.plan?.name || 'Subscription'} · Active` : 'No active subscription'}
            </span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* TABS */}
          <div className="mmc-dash-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
                <OutlineIcon name={t.icon} size={15} /> {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="mmc-dash-grid">
                <div className="mmc-dash-stat theme-purple">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="shield" size={20} /></span>
                  <span className="mmc-dash-stat-label">Subscription</span>
                  <strong>{access.subscription ? (data.activeSubscription?.plan?.name || 'Active') : 'None'}</strong>
                  {access.subscription ? (
                    <span className="mmc-dash-stat-note">Valid till {formatDate(data.activeSubscription?.endDate)}</span>
                  ) : (
                    <Link to="/subscription" className="mmc-dash-cta">Subscribe now →</Link>
                  )}
                </div>
                <div className="mmc-dash-stat theme-orange">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="compass" size={20} /></span>
                  <span className="mmc-dash-stat-label">Career Tools Unlocked</span>
                  <strong>{unlockedCount}/3</strong>
                  <button type="button" className="mmc-dash-cta" onClick={() => setTab('tools')}>View tools →</button>
                </div>
                <div className="mmc-dash-stat theme-teal">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="chart" size={20} /></span>
                  <span className="mmc-dash-stat-label">Total Spent</span>
                  <strong>₹{totalSpent.toLocaleString('en-IN')}</strong>
                  <button type="button" className="mmc-dash-cta" onClick={() => setTab('payments')}>View payments →</button>
                </div>
                <div className="mmc-dash-stat theme-pink">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="handshake" size={20} /></span>
                  <span className="mmc-dash-stat-label">Referrals Converted</span>
                  <strong>{convertedReferrals}</strong>
                  <button type="button" className="mmc-dash-cta" onClick={() => setTab('referrals')}>Refer & earn →</button>
                </div>
              </div>

              <div className="mmc-dash-two-col">
                <div className="card mmc-dash-panel">
                  <h3><OutlineIcon name="compass" size={16} /> Your Career Tools</h3>
                  <div className="mmc-dash-tool-mini-list">
                    {TOOLS.map((t) => (
                      <div key={t.key} className={`mmc-dash-tool-mini theme-${t.theme}`}>
                        <span className="mmc-dash-tool-mini-icon"><OutlineIcon name={t.icon} size={16} /></span>
                        <span className="mmc-dash-tool-mini-title">{t.title}</span>
                        <span className={`mmc-dash-lock-badge ${access[t.key] ? 'is-unlocked' : 'is-locked'}`}>
                          {access[t.key] ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!access.subscription && (
                    <Link to="/subscription" className="mmc-dash-inline-banner">
                      <OutlineIcon name="shield" size={16} />
                      Unlock all 3 career tools instantly with a subscription
                      <OutlineIcon name="arrow" size={14} />
                    </Link>
                  )}
                </div>

                <div className="card mmc-dash-panel">
                  <h3><OutlineIcon name="bookmark" size={16} /> Colleges You've Explored</h3>
                  {data.myColleges?.length ? (
                    <div className="mmc-dash-mini-colleges">
                      {data.myColleges.slice(0, 4).map((c) => (
                        <Link to={`/colleges/${c._id}`} key={c._id} className="mmc-dash-mini-college">
                          <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" />
                          <span>{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mmc-dash-empty-hint">You haven't compared any colleges yet.</p>
                  )}
                  <Link to="/college-compare" className="mmc-dash-cta">Explore & compare colleges →</Link>
                </div>
              </div>
            </>
          )}

          {/* PROFILE */}
          {tab === 'profile' && (
            <form className="card mmc-dash-form" onSubmit={saveProfile}>
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input value={profileForm.fullName || ''} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={profileForm.phone || ''} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={profileForm.gender || ''} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
                  <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows="3" value={profileForm.address || ''} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
              </div>
              {savedMsg && <p className="mmc-success-msg">{savedMsg}</p>}
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {/* CAREER TOOLS */}
          {tab === 'tools' && (
            <div className="mmc-dash-tools-wrap">
              {access.subscription ? (
                <div className="mmc-dash-banner banner-success">
                  <OutlineIcon name="shield" size={18} />
                  <div>
                    <strong>You're subscribed — every career tool below is unlocked.</strong>
                    <span>Your {data.activeSubscription?.plan?.name || 'plan'} is valid till {formatDate(data.activeSubscription?.endDate)}.</span>
                  </div>
                </div>
              ) : (
                <div className="mmc-dash-banner banner-gradient">
                  <OutlineIcon name="shield" size={18} />
                  <div>
                    <strong>Pay per tool, or unlock all 3 at once.</strong>
                    <span>Buy Career Assessment, KCET Predictor and PGCET Predictor separately, or subscribe for full access.</span>
                  </div>
                  <Link to="/subscription" className="btn btn-primary mmc-dash-banner-cta">Subscribe →</Link>
                </div>
              )}

              <div className="mmc-dash-tool-grid">
                {TOOLS.map((t) => (
                  <div key={t.key} className={`mmc-dash-tool-card theme-${t.theme}`}>
                    <div className="mmc-dash-tool-card-top">
                      <span className="mmc-dash-tool-icon"><OutlineIcon name={t.icon} size={22} /></span>
                      <span className={`mmc-dash-lock-badge ${access[t.key] ? 'is-unlocked' : 'is-locked'}`}>
                        <OutlineIcon name={access[t.key] ? 'shield' : 'signal'} size={12} />
                        {access[t.key] ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <h4>{t.title}</h4>
                    <p>{t.blurb}</p>
                    <div className="mmc-dash-tool-card-footer">
                      <span className="mmc-dash-tool-price">{access[t.key] ? 'Included' : t.price}</span>
                      <Link to={t.to} className="mmc-dash-tool-btn">
                        {access[t.key] ? 'Open' : 'Unlock'} <OutlineIcon name="arrow" size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card mmc-dash-reports-panel">
                <h3><OutlineIcon name="compass" size={16} /> Your Career Assessment Reports</h3>
                {data.assessmentHistory?.length ? (
                  <div className="mmc-dash-report-list">
                    {data.assessmentHistory.map((r) => (
                      <button key={r._id} type="button" className="mmc-dash-report-row" onClick={() => setViewingReport(r)}>
                        <div>
                          <strong>{r.result?.archetype || 'Career Assessment Report'}</strong>
                          <span>{r.result?.topField || 'Report'} · {formatDate(r.createdAt)}</span>
                        </div>
                        <span className="mmc-dash-report-view">View Report <OutlineIcon name="arrow" size={13} /></span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mmc-dash-empty-hint">No assessment reports yet - take the Career Assessment to get your first one.</p>
                )}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div className="card mmc-dash-table">
              <div className="mmc-dash-table-head">
                <h3>Payment History</h3>
                <span className="mmc-dash-total-chip">Total paid: ₹{totalSpent.toLocaleString('en-IN')}</span>
              </div>
              {data.paymentHistory.length === 0 ? (
                <div className="empty-state">No payments yet.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Invoice</th><th>Purpose</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {data.paymentHistory.map((p) => (
                        <tr key={p._id}>
                          <td>{p.invoiceNumber || '-'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{p.purpose}</td>
                          <td>₹{p.amount}</td>
                          <td><span className={`badge ${p.status === 'success' ? 'badge-safe' : 'badge-moderate'}`}>{p.status}</span></td>
                          <td>{formatDate(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REFER & EARN */}
          {tab === 'referrals' && (
            <div className="mmc-dash-refer-wrap">
              <div className="mmc-dash-refer-hero">
                <span className="mmc-dash-refer-blob" aria-hidden="true" />
                <div className="mmc-dash-refer-hero-inner">
                  <span className="mmc-dash-refer-badge"><OutlineIcon name="handshake" size={14} /> Refer & Earn</span>
                  <h3>Share MapMyCareer360, both of you win</h3>
                  <p>Send your link to a friend. When they subscribe or take the assessment, it shows up here.</p>
                  <div className="mmc-referral-link">
                    <input readOnly value={referralLink} />
                    <button type="button" className="btn btn-secondary" onClick={copyLink}>{copied ? 'Copied ✓' : 'Copy'}</button>
                    <a
                      className="mmc-dash-whatsapp-btn"
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out MapMyCareer360 for career guidance & college admissions: ${referralLink}`)}`}
                      target="_blank" rel="noreferrer"
                    >
                      <OutlineIcon name="whatsapp" size={16} /> Share
                    </a>
                  </div>
                </div>
              </div>

              {kyc.status !== 'verified' && (
                <button type="button" className="mmc-dash-inline-banner mmc-dash-kyc-nudge" onClick={() => setTab('kyc')}>
                  <OutlineIcon name="shield" size={16} />
                  {kyc.status === 'pending'
                    ? 'Your KYC is under review - payouts unlock once it\'s verified.'
                    : 'Add your bank/UPI details so we can pay out your referral earnings.'}
                  <OutlineIcon name="arrow" size={14} />
                </button>
              )}

              <div className="mmc-dash-grid mmc-dash-grid--3">
                <div className="mmc-dash-stat theme-blue">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="handshake" size={20} /></span>
                  <span className="mmc-dash-stat-label">Total Referred</span>
                  <strong>{referral?.referrals?.length || 0}</strong>
                </div>
                <div className="mmc-dash-stat theme-teal">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="shield" size={20} /></span>
                  <span className="mmc-dash-stat-label">Converted</span>
                  <strong>{convertedReferrals}</strong>
                </div>
                <div className="mmc-dash-stat theme-orange">
                  <span className="mmc-dash-stat-icon"><OutlineIcon name="signal" size={20} /></span>
                  <span className="mmc-dash-stat-label">Pending</span>
                  <strong>{(referral?.referrals?.length || 0) - convertedReferrals}</strong>
                </div>
              </div>

              <div className="card mmc-dash-table">
                <h3>Referral Activity</h3>
                {!referral?.referrals?.length ? (
                  <div className="empty-state">No referrals yet - start sharing your link above!</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
                      <tbody>
                        {referral.referrals.map((r) => (
                          <tr key={r._id}>
                            <td>{r.referredName || r.referredEmail || '-'}</td>
                            <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                            <td><span className={`badge ${r.status === 'converted' ? 'badge-safe' : 'badge-moderate'}`}>{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC */}
          {tab === 'kyc' && (
            <div className="mmc-dash-kyc-wrap">
              <div className="card mmc-dash-kyc-card">
                <div className="mmc-dash-kyc-head">
                  <div>
                    <h3><OutlineIcon name="shield" size={17} /> Payout KYC</h3>
                    <p>These bank/UPI details are used only to pay out your referral earnings - required once before your first payout.</p>
                  </div>
                  <span className={`mmc-dash-kyc-status ${kycMeta.cls}`}>{kycMeta.label}</span>
                </div>

                {kyc.status === 'rejected' && kyc.rejectionReason && (
                  <p className="mmc-dash-kyc-rejection"><OutlineIcon name="close" size={13} /> {kyc.rejectionReason} - please correct and resubmit.</p>
                )}

                <form onSubmit={saveKyc} className="mmc-dash-kyc-form">
                  <div className="mmc-dash-form-grid">
                    <div className="form-group">
                      <label>Account Holder Name *</label>
                      <input value={kycForm.accountHolderName} onChange={(e) => setKycForm({ ...kycForm, accountHolderName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Bank Name *</label>
                      <input value={kycForm.bankName} onChange={(e) => setKycForm({ ...kycForm, bankName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Account Number *</label>
                      <input value={kycForm.accountNumber} onChange={(e) => setKycForm({ ...kycForm, accountNumber: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Confirm Account Number *</label>
                      <input value={kycForm.confirmAccountNumber} onChange={(e) => setKycForm({ ...kycForm, confirmAccountNumber: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>IFSC Code *</label>
                      <input value={kycForm.ifsc} onChange={(e) => setKycForm({ ...kycForm, ifsc: e.target.value.toUpperCase() })} placeholder="e.g. HDFC0001234" required />
                    </div>
                    <div className="form-group">
                      <label>PAN Number *</label>
                      <input value={kycForm.panNumber} onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })} placeholder="e.g. ABCDE1234F" required />
                    </div>
                    <div className="form-group">
                      <label>UPI ID (optional)</label>
                      <input value={kycForm.upiId} onChange={(e) => setKycForm({ ...kycForm, upiId: e.target.value })} placeholder="yourname@upi" />
                    </div>
                  </div>

                  {kycMsg.text && <p className={kycMsg.type === 'error' ? 'mmc-dash-kyc-error' : 'mmc-success-msg'}>{kycMsg.text}</p>}

                  <button className="btn btn-primary" disabled={kycSaving}>
                    {kycSaving ? 'Submitting...' : kyc.status === 'not_submitted' ? 'Submit KYC' : 'Update & Resubmit'}
                  </button>
                  <p className="mmc-dash-kyc-note"><OutlineIcon name="shield" size={12} /> Your details are stored securely and used only for referral payouts.</p>
                </form>
              </div>
            </div>
          )}

          {/* MY COLLEGES */}
          {tab === 'colleges' && (
            <div className="mmc-dash-colleges-wrap">
              <div className="mmc-dash-table-head">
                <h3 className="mmc-dash-section-title">Colleges you've viewed or compared</h3>
                <Link to="/college-compare" className="btn btn-primary">Explore All Colleges →</Link>
              </div>
              {data.myColleges?.length ? (
                <div className="mmc-dash-college-grid">
                  {data.myColleges.map((c, i) => (
                    <Link to={`/colleges/${c._id}`} key={c._id} className={`mmc-dash-college-card accent-${i % 3}`}>
                      <div className="mmc-dash-college-photo">
                        <img src={getImageUrl(c.image) || '/images/college-placeholder.jpg'} alt={c.name} />
                        {c.ranking ? <span className="mmc-dash-college-rank">#{c.ranking}</span> : null}
                      </div>
                      <div className="mmc-dash-college-body">
                        <strong>{c.name}</strong>
                        <small><OutlineIcon name="pin" size={12} /> {c.location || 'Karnataka'} {c.rating ? `· ★ ${c.rating}` : ''}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  You haven't explored any colleges yet. <Link to="/college-compare">Browse colleges</Link> and compare a few to see them here.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {viewingReport && (
        <div className="mmc-dash-report-modal-backdrop" onClick={() => setViewingReport(null)}>
          <div className="mmc-dash-report-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="mmc-dash-report-modal-close" onClick={() => setViewingReport(null)} aria-label="Close">×</button>
            <CareerReportCard report={viewingReport} studentName={student?.fullName} />
          </div>
        </div>
      )}
    </div>
  );
}
