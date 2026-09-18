import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page) => {
    setLoading(true);
    api.get('/admin/payments', { params: { page: p, limit: 20, status: status || undefined, purpose: purpose || undefined } })
      .then((res) => { setPayments(res.data.payments); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); load(1); }, [status, purpose]); // eslint-disable-line

  const deletePayment = async (id) => {
    if (!window.confirm('Remove this payment record?')) return;
    try {
      await api.delete(`/admin/payments/${id}`);
      load(page);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove payment record');
    }
  };

  const clearStale = async () => {
    if (!window.confirm('Remove all "created" and "failed" payment attempts? Successful payments are never affected.')) return;
    try {
      const res = await api.delete('/admin/payments/cleanup/stale');
      alert(`${res.data.deletedCount} stale records removed`);
      load(page);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to clear stale records');
    }
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Payments & Transactions</h1>
          <p>Track every assessment and subscription payment.</p>
        </div>
      </div>

      <div className="mmc-admin-toolbar">
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">All Purposes</option>
          <option value="assessment">Assessment</option>
          <option value="subscription">Subscription</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="created">Created</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <button className="btn btn-outline" onClick={clearStale}>Clear Stale Records</button>
        {pagination && (
          <span className="mmc-admin-count">
            {pagination.total} payment{pagination.total !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="empty-state">No payments found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Student</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Gateway</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{p.invoiceNumber || '-'}</td>
                    <td>{p.student?.fullName} <br /><small>{p.student?.email}</small></td>
                    <td style={{ textTransform: 'capitalize' }}>{p.purpose}</td>
                    <td>₹{p.amount}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.gateway}</td>
                    <td><span className={`badge ${p.status === 'success' ? 'badge-safe' : p.status === 'failed' ? 'badge-dream' : 'badge-moderate'}`}>{p.status}</span></td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      {p.status !== 'success' && (
                        <button className="btn-icon" onClick={() => deletePayment(p._id)} title="Remove">🗑</button>
                      )}
                    </td>
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