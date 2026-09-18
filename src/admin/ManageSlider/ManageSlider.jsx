import React, { useEffect, useState } from 'react';
import api, { getImageUrl } from '../../api/api.js';
import '../AdminCommon.css';

const emptyForm = { title: '', subtitle: '', ctaLink: '/career-assessment', order: 0, imageOnly: false };

export default function ManageSlider() {
  const [sliders, setSliders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const load = () => api.get('/sliders').then((res) => setSliders(res.data.sliders || []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({
      title: s.title || '',
      subtitle: s.subtitle || '',
      ctaLink: s.ctaLink || '/career-assessment',
      order: s.order,
      imageOnly: !!s.imageOnly,
    });
    setEditingId(s._id);
    setImageFile(null);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    if (editingId) await api.put(`/admin/sliders/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    else await api.post('/admin/sliders', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setShowModal(false);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    await api.delete(`/admin/sliders/${id}`);
    load();
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Slider / Banners</h1>
          <p>Manage the homepage slider. Image-only slides show no title, subtitle, or link — they just display.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Slide</button>
      </div>

      <div className="card">
        {sliders.length === 0 ? <div className="empty-state">No slides yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Image</th><th>Title</th><th>Navigates To</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {sliders.map((s) => (
                  <tr key={s._id}>
                    <td>
                      {s.image ? (
                        <img
                          src={getImageUrl(s.image)}
                          alt={s.title || 'slide'}
                          style={{ width: 72, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--mmc-muted)', fontSize: '0.78rem' }}>No image</span>
                      )}
                    </td>
                    <td>{s.imageOnly ? <em style={{ color: 'var(--mmc-muted)' }}>Image only</em> : s.title}</td>
                    <td>{s.imageOnly ? '—' : s.ctaLink}</td>
                    <td>{s.order}</td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-edit" onClick={() => openEdit(s)}>Edit</button>
                      <button className="mmc-admin-btn-delete" onClick={() => remove(s._id)}>Delete</button>
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
            <h3>{editingId ? 'Edit Slide' : 'Add Slide'}</h3>
            <form onSubmit={save}>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="imageOnly"
                  checked={form.imageOnly}
                  onChange={(e) => setForm({ ...form, imageOnly: e.target.checked })}
                />
                <label htmlFor="imageOnly" style={{ margin: 0 }}>
                  Image only (no title, subtitle, or link — just the picture)
                </label>
              </div>

              {!form.imageOnly && (
                <>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required={!form.imageOnly}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <textarea rows="2" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Navigation Link (where clicking the slide goes)</label>
                    <select value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}>
                      <option value="/career-assessment">Career Assessment</option>
                      <option value="/subscription">Subscription Plans</option>
                      <option value="/kcet-predictor">KCET Predictor</option>
                      <option value="/pgcet-predictor">PGCET Predictor</option>
                      <option value="/college-compare">Compare Colleges</option>
                      <option value="/register">Sign Up</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group"><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
              <div className="form-group">
                <label>Image {form.imageOnly ? '(required — shown as-is, full slide)' : '(one image only — used for both desktop and mobile)'}</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!editingId} />
                {imageFile && (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="preview"
                    style={{ marginTop: 10, width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }}
                  />
                )}
              </div>
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