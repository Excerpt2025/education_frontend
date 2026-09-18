import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = page, s = search) => {
    setLoading(true);
    api.get('/admin/students', { params: { page: p, limit: 15, search: s } })
      .then((res) => { setStudents(res.data.students); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, search); setPage(1); }, [search]); // eslint-disable-line
  useEffect(() => { load(page, search); }, [page]); // eslint-disable-line

  const removeStudent = async (id) => {
    if (!window.confirm('Remove this student? This cannot be undone.')) return;
    await api.delete(`/admin/students/${id}`);
    load(page, search);
  };

  const toggleActive = async (student) => {
    await api.put(`/admin/students/${student._id}`, { isActive: !student.isActive });
    load(page, search);
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Manage Students</h1>
          <p>View, search and manage all registered students.</p>
        </div>
      </div>

      <div className="mmc-admin-toolbar">
        <input className="mmc-admin-search-input" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <div className="loading-state">Loading...</div> : students.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Referral Code</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.referralCode}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-safe' : 'badge-dream'}`}>{s.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-edit" onClick={() => toggleActive(s)}>{s.isActive ? 'Disable' : 'Enable'}</button>
                      <button className="mmc-admin-btn-delete" onClick={() => removeStudent(s._id)}>Delete</button>
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
