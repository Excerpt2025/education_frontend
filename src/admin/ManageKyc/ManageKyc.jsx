import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';
import './ManageKyc.css';

const STATUS_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const STATUS_BADGE = {
  pending: { label: 'Under review', cls: 'badge-moderate' },
  verified: { label: 'Verified', cls: 'badge-safe' },
  rejected: { label: 'Rejected', cls: 'mmc-kyc-badge-rejected' },
};

const DOCS = [
  { key: 'passbook', title: 'Bank passbook' },
  { key: 'panCard', title: 'PAN card' },
  { key: 'aadhaarCard', title: 'Aadhaar card' },
];

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
}

export default function ManageKyc() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [reviewId, setReviewId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [docs, setDocs] = useState({}); // { key: { url, type } | 'loading' | 'missing' | 'error' }
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const urlsRef = useRef([]);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    return api.get('/admin/kyc', { params: { page, limit: 15, status, search } })
      .then((res) => {
        setRows(res.data.students || []);
        setPagination(res.data.pagination);
        setCounts(res.data.counts || { pending: 0, verified: 0, rejected: 0 });
      })
      .catch((err) => {
        setRows([]);
        const code = err?.response?.status;
        const msg = err?.response?.data?.message || err.message || 'Request failed';
        setLoadError(code ? `${msg} (error ${code})` : msg);
      })
      .finally(() => setLoading(false));
  }, [page, status, search]);

  // Single effect: reloads whenever page, tab or search changes.
  useEffect(() => { load(); }, [load]);

  const releaseUrls = () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  };
  useEffect(() => releaseUrls, []);

  const closeReview = () => {
    releaseUrls();
    setReviewId(null); setDetail(null); setDocs({});
    setRejecting(false); setReason(''); setError('');
  };

  const openReview = async (id) => {
    releaseUrls();
    setReviewId(id); setDetail(null); setDocs({}); setRejecting(false); setReason(''); setError('');
    try {
      const res = await api.get(`/admin/kyc/${id}`);
      const student = res.data.student;
      setDetail(student);

      const initial = {};
      DOCS.forEach((d) => { initial[d.key] = student.kyc?.documents?.[d.key] ? 'loading' : 'missing'; });
      setDocs(initial);

      // Documents are private: fetch each one with the admin token and show it from a temporary blob URL.
      DOCS.forEach(async (d) => {
        if (!student.kyc?.documents?.[d.key]) return;
        try {
          const file = await api.get(`/admin/kyc/${id}/document/${d.key}`, { responseType: 'blob' });
          const url = URL.createObjectURL(file.data);
          urlsRef.current.push(url);
          setDocs((prev) => ({ ...prev, [d.key]: { url, type: file.data.type } }));
        } catch {
          setDocs((prev) => ({ ...prev, [d.key]: 'error' }));
        }
      });
    } catch {
      setError('Could not load this KYC record.');
    }
  };

  const decide = async (action) => {
    if (action === 'reject' && !reason.trim()) {
      setError('Please tell the student what to fix before rejecting.');
      return;
    }
    setActing(true); setError('');
    try {
      await api.put(`/admin/kyc/${reviewId}`, { action, reason });
      closeReview();
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save your decision. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const kyc = detail?.kyc;
  const allDocsPresent = kyc && DOCS.every((d) => kyc.documents?.[d.key]);

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>KYC Verification</h1>
          <p>Review the bank details and ID documents students submit before their referral payouts.</p>
        </div>
      </div>

      <div className="mmc-kyc-tabs" role="tablist">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id} type="button" role="tab" aria-selected={status === t.id}
            className={status === t.id ? 'is-active' : ''}
            onClick={() => { setStatus(t.id); setPage(1); }}
          >
            {t.label}
            {t.id !== 'all' && <em>{counts[t.id] || 0}</em>}
          </button>
        ))}
      </div>

      <div className="mmc-admin-toolbar">
        <input
          className="mmc-admin-search-input"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card">
        {loading ? <div className="loading-state">Loading KYC submissions…</div>
          : loadError ? (
            <div className="error-state">
              <p>Could not load KYC submissions: {loadError}</p>
              <button type="button" className="btn btn-outline" onClick={load}>Try again</button>
            </div>
          )
          : rows.length === 0 ? <div className="empty-state">No {status === 'all' ? '' : status} KYC submissions.</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Bank</th><th>Account</th><th>Documents</th><th>Submitted</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const badge = STATUS_BADGE[s.kyc.status] || STATUS_BADGE.pending;
                    const docCount = DOCS.filter((d) => s.kyc.documents?.[d.key]).length;
                    return (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.fullName}</strong>
                          <div className="mmc-kyc-sub">{s.email}</div>
                          <div className="mmc-kyc-sub">{s.phone}</div>
                        </td>
                        <td>{s.kyc.bankName || '-'}</td>
                        <td>{s.kyc.accountNumber || '-'}</td>
                        <td>
                          <span className={docCount === 3 ? 'mmc-kyc-docs-ok' : 'mmc-kyc-docs-missing'}>{docCount}/3 uploaded</span>
                        </td>
                        <td>{formatDate(s.kyc.submittedAt)}</td>
                        <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                        <td>
                          <button className="mmc-admin-btn-edit" onClick={() => openReview(s._id)}>
                            {s.kyc.status === 'pending' ? 'Review' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>

      {reviewId && (
        <div className="mmc-admin-modal-backdrop" onClick={closeReview}>
          <div className="mmc-admin-modal mmc-kyc-modal" onClick={(e) => e.stopPropagation()}>
            {!detail ? (
              <p>{error || 'Loading…'}</p>
            ) : (
              <>
                <div className="mmc-kyc-modal-head">
                  <div>
                    <h3>{detail.fullName}</h3>
                    <span className="mmc-kyc-sub">{detail.email} · {detail.phone}</span>
                  </div>
                  <span className={`badge ${(STATUS_BADGE[kyc.status] || STATUS_BADGE.pending).cls}`}>
                    {(STATUS_BADGE[kyc.status] || STATUS_BADGE.pending).label}
                  </span>
                </div>

                <dl className="mmc-kyc-details">
                  <div><dt>Account holder</dt><dd>{kyc.accountHolderName || '-'}</dd></div>
                  <div><dt>Bank</dt><dd>{kyc.bankName || '-'}</dd></div>
                  <div><dt>Account number</dt><dd>{kyc.accountNumber || '-'}</dd></div>
                  <div><dt>IFSC</dt><dd>{kyc.ifsc || '-'}</dd></div>
                  <div><dt>PAN</dt><dd>{kyc.panNumber || '-'}</dd></div>
                  <div><dt>UPI ID</dt><dd>{kyc.upiId || '-'}</dd></div>
                  <div><dt>Submitted</dt><dd>{formatDate(kyc.submittedAt)}</dd></div>
                  {kyc.status === 'verified' && <div><dt>Verified on</dt><dd>{formatDate(kyc.verifiedAt)}</dd></div>}
                </dl>

                {kyc.status === 'rejected' && kyc.rejectionReason && (
                  <p className="mmc-kyc-reject-note">Rejected: {kyc.rejectionReason}</p>
                )}

                <p className="mmc-kyc-check-tip">
                  Check that the name on the passbook, PAN and Aadhaar matches the account holder name, and that the account number and IFSC match the passbook.
                </p>

                <div className="mmc-kyc-doc-grid">
                  {DOCS.map((d) => {
                    const doc = docs[d.key];
                    return (
                      <div className="mmc-kyc-doc" key={d.key}>
                        <strong>{d.title}</strong>
                        <div className="mmc-kyc-doc-box">
                          {doc === 'loading' && <span>Loading…</span>}
                          {doc === 'missing' && <span className="mmc-kyc-docs-missing">Not uploaded</span>}
                          {doc === 'error' && <span className="mmc-kyc-docs-missing">Could not load file</span>}
                          {doc && typeof doc === 'object' && (
                            doc.type.startsWith('image/') ? (
                              <a href={doc.url} target="_blank" rel="noreferrer" title="Open full size">
                                <img src={doc.url} alt={d.title} />
                              </a>
                            ) : (
                              <a href={doc.url} target="_blank" rel="noreferrer" className="mmc-kyc-pdf-link">Open PDF in new tab</a>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {rejecting && (
                  <div className="form-group">
                    <label>Reason for rejection (shown to the student)</label>
                    <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. PAN image is blurry, please upload a clearer photo." />
                  </div>
                )}

                {error && <p className="error-state">{error}</p>}

                <div className="mmc-admin-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={closeReview}>Close</button>
                  {kyc.status !== 'not_submitted' && !rejecting && (
                    <>
                      <button type="button" className="btn btn-outline mmc-kyc-reject-btn" onClick={() => setRejecting(true)} disabled={acting}>Reject</button>
                      {kyc.status !== 'verified' && (
                        <button type="button" className="btn btn-primary" onClick={() => decide('verify')} disabled={acting || !allDocsPresent} title={allDocsPresent ? '' : 'All three documents are needed to verify'}>
                          {acting ? 'Saving…' : 'Verify KYC'}
                        </button>
                      )}
                    </>
                  )}
                  {rejecting && (
                    <>
                      <button type="button" className="btn btn-outline" onClick={() => { setRejecting(false); setError(''); }} disabled={acting}>Back</button>
                      <button type="button" className="btn btn-primary mmc-kyc-reject-confirm" onClick={() => decide('reject')} disabled={acting}>
                        {acting ? 'Saving…' : 'Confirm rejection'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}