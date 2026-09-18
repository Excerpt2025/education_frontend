import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import '../AdminCommon.css';

const emptyForm = { name: '', level: 'UG', durationYears: 4 };

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get('/courses').then((res) => setCourses(res.data.courses || []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, level: c.level, durationYears: c.durationYears }); setEditingId(c._id); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/admin/courses/${editingId}`, form);
    else await api.post('/admin/courses', form);
    setShowModal(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/admin/courses/${id}`);
    load();
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Manage Courses</h1>
          <p>Courses referenced by colleges and used by the KCET/PGCET predictors.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Course</button>
      </div>

      <div className="card">
        {courses.length === 0 ? <div className="empty-state">No courses yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Level</th><th>Duration</th><th>Actions</th></tr></thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.level}</td>
                    <td>{c.durationYears} years</td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-edit" onClick={() => openEdit(c)}>Edit</button>
                      <button className="mmc-admin-btn-delete" onClick={() => remove(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={save}>
              <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group">
                <label>Level</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option value="UG">UG</option><option value="PG">PG</option><option value="Diploma">Diploma</option>
                </select>
              </div>
              <div className="form-group"><label>Duration (years)</label><input type="number" value={form.durationYears} onChange={(e) => setForm({ ...form, durationYears: e.target.value })} /></div>
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
