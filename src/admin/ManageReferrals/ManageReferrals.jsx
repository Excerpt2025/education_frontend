import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

export default function ManageReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page) => {
    setLoading(true);
    api.get('/admin/referrals', { params: { page: p, limit: 20, type: type || undefined } })
      .then((res) => { setReferrals(res.data.referrals); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); load(1); }, [type]); // eslint-disable-line

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Assessment / Subscription Referrals</h1>
          <p>Track student-to-student referrals and their conversion status.</p>
        </div>
      </div>

      <div className="mmc-admin-toolbar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option><option value="assessment">Assessment</option><option value="subscription">Subscription</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-state">Loading...</div> : referrals.length === 0 ? (
          <div className="empty-state">No referrals yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Referring Student</th><th>Referral Code</th><th>Referred</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td>{r.referringStudent?.fullName}</td>
                    <td>{r.referralCode}</td>
                    <td>{r.referredName || r.referredEmail || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                    <td><span className={`badge ${r.status === 'converted' ? 'badge-safe' : 'badge-moderate'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
