import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import './ManagePredictorLeads.css';

export default function ManagePredictorLeads() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [examType, setExamType] = useState('');       // '' | 'kcet' | 'pgcet'
  const [accessType, setAccessType] = useState('');    // '' | 'subscription' | 'one-time'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLeads = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/admin/predictor-leads', {
        params: { page, limit: 20, examType: examType || undefined, accessType: accessType || undefined, search: search || undefined },
      });
      setLeads(res.data.leads || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(1); }, [examType, accessType]); // eslint-disable-line

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  return (
    <div className="mmc-admin-page">
      <div className="mmc-admin-header">
        <h2>Predictor Leads (KCET & PGCET)</h2>
        <p>Every visitor who ran a predictor - whether via subscription or one-time payment.</p>
      </div>

      <div className="mmc-admin-toolbar">
        <div className="mmc-tabs">
          <button className={examType === '' ? 'active' : ''} onClick={() => setExamType('')}>All</button>
          <button className={examType === 'kcet' ? 'active' : ''} onClick={() => setExamType('kcet')}>KCET</button>
          <button className={examType === 'pgcet' ? 'active' : ''} onClick={() => setExamType('pgcet')}>PGCET</button>
        </div>

        <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
          <option value="">All Access Types</option>
          <option value="subscription">Subscription</option>
          <option value="one-time">One-Time Payment</option>
        </select>

        <form onSubmit={handleSearchSubmit} className="mmc-admin-search">
          <input
            type="text"
            placeholder="Search name, phone or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      {error && <p className="error-state">{error}</p>}

      <div className="mmc-admin-table-wrap">
        <table className="mmc-admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Exam</th>
              <th>Rank</th>
              <th>Category</th>
              <th>Access</th>
              <th>Results Shown</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9}>Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={9}>No leads found</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td><a href={`tel:${lead.phone}`}>{lead.phone}</a></td>
                  <td>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : '-'}</td>
                  <td className="mmc-badge">{lead.examType.toUpperCase()}</td>
                  <td>{lead.rank}</td>
                  <td>{lead.category}</td>
                  <td>
                    <span className={`mmc-tag ${lead.accessType === 'subscription' ? 'mmc-tag-sub' : 'mmc-tag-onetime'}`}>
                      {lead.accessType === 'subscription' ? 'Subscription' : 'One-Time'}
                    </span>
                  </td>
                  <td>{lead.resultsShown}</td>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mmc-admin-pagination">
        <button disabled={pagination.page <= 1} onClick={() => fetchLeads(pagination.page - 1)}>Prev</button>
        <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
        <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchLeads(pagination.page + 1)}>Next</button>
      </div>
    </div>
  );
}