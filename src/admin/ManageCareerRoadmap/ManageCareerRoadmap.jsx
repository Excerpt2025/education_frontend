import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import '../AdminCommon.css';
import './ManageCareerRoadmap.css';

function emptyFieldForm() {
  return {
    name: '', stream: '', workStyle: '', growth: '', isActive: true,
    careers: [{ name: '', blurb: '' }],
    courses: '',
    roadmap: [{ stage: '', detail: '' }],
  };
}
function emptyValueForm() { return { key: '', label: '', nudge: {} }; }

export default function ManageCareerRoadmap() {
  const [tab, setTab] = useState('fields');
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState([]);

  const [fieldModal, setFieldModal] = useState(false);
  const [fieldForm, setFieldForm] = useState(emptyFieldForm());
  const [editingFieldId, setEditingFieldId] = useState(null);

  const [valueModal, setValueModal] = useState(false);
  const [valueForm, setValueForm] = useState(emptyValueForm());
  const [editingValueId, setEditingValueId] = useState(null);

  const [error, setError] = useState('');

  const loadFields = () => api.get('/admin/career-fields').then((res) => setFields(res.data.fields));
  const loadValues = () => api.get('/admin/career-values').then((res) => setValues(res.data.values));

  useEffect(() => { loadFields(); loadValues(); }, []);

  /* ---- Career Fields (the roadmap) ---- */
  const openNewField = () => { setFieldForm(emptyFieldForm()); setEditingFieldId(null); setError(''); setFieldModal(true); };
  const openEditField = (f) => {
    setFieldForm({
      name: f.name || '', stream: f.stream || '', workStyle: f.workStyle || '', growth: f.growth || '',
      isActive: f.isActive !== false,
      careers: f.careers?.length ? f.careers : [{ name: '', blurb: '' }],
      courses: (f.courses || []).join(', '),
      roadmap: f.roadmap?.length ? f.roadmap : [{ stage: '', detail: '' }],
    });
    setEditingFieldId(f._id);
    setError('');
    setFieldModal(true);
  };

  const setCareer = (i, key, val) => {
    const careers = [...fieldForm.careers];
    careers[i] = { ...careers[i], [key]: val };
    setFieldForm({ ...fieldForm, careers });
  };
  const addCareer = () => setFieldForm({ ...fieldForm, careers: [...fieldForm.careers, { name: '', blurb: '' }] });
  const removeCareer = (i) => setFieldForm({ ...fieldForm, careers: fieldForm.careers.filter((_, idx) => idx !== i) });

  const setStage = (i, key, val) => {
    const roadmap = [...fieldForm.roadmap];
    roadmap[i] = { ...roadmap[i], [key]: val };
    setFieldForm({ ...fieldForm, roadmap });
  };
  const addStage = () => setFieldForm({ ...fieldForm, roadmap: [...fieldForm.roadmap, { stage: '', detail: '' }] });
  const removeStage = (i) => setFieldForm({ ...fieldForm, roadmap: fieldForm.roadmap.filter((_, idx) => idx !== i) });

  const saveField = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: fieldForm.name, stream: fieldForm.stream, workStyle: fieldForm.workStyle, growth: fieldForm.growth,
      isActive: fieldForm.isActive,
      careers: fieldForm.careers.filter((c) => c.name.trim()),
      courses: fieldForm.courses.split(',').map((c) => c.trim()).filter(Boolean),
      roadmap: fieldForm.roadmap.filter((r) => r.stage.trim()),
    };
    try {
      if (editingFieldId) await api.put(`/admin/career-fields/${editingFieldId}`, payload);
      else await api.post('/admin/career-fields', payload);
      setFieldModal(false);
      loadFields();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save this career field.');
    }
  };
  const deleteField = async (id) => {
    if (!window.confirm('Delete this career field? Any assessment results already pointing to it will keep their saved snapshot, but new matches will skip it.')) return;
    await api.delete(`/admin/career-fields/${id}`);
    loadFields();
  };

  /* ---- Career Values ---- */
  const openNewValue = () => { setValueForm(emptyValueForm()); setEditingValueId(null); setError(''); setValueModal(true); };
  const openEditValue = (v) => {
    setValueForm({ key: v.key || '', label: v.label || '', nudge: v.nudge || {} });
    setEditingValueId(v._id);
    setError('');
    setValueModal(true);
  };
  const setNudge = (field, val) => {
    const nudge = { ...valueForm.nudge };
    const n = Number(val) || 0;
    if (n) nudge[field] = n; else delete nudge[field];
    setValueForm({ ...valueForm, nudge });
  };
  const saveValue = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingValueId) await api.put(`/admin/career-values/${editingValueId}`, valueForm);
      else await api.post('/admin/career-values', valueForm);
      setValueModal(false);
      loadValues();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save this career value.');
    }
  };
  const deleteValue = async (id) => {
    if (!window.confirm('Delete this career value?')) return;
    await api.delete(`/admin/career-values/${id}`);
    loadValues();
  };

  const fieldNames = fields.map((f) => f.name);

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Career Map</h1>
          <p>Edit the career fields, courses and roadmap steps every assessment report is built from.</p>
        </div>
        {tab === 'fields'
          ? <button className="btn btn-primary" onClick={openNewField}>+ Add Career Field</button>
          : <button className="btn btn-primary" onClick={openNewValue}>+ Add Career Value</button>}
      </div>

      <div className="mmc-dash-tabs" style={{ marginBottom: 20 }}>
        <button className={tab === 'fields' ? 'active' : ''} onClick={() => setTab('fields')}>Career Fields &amp; Roadmap</button>
        <button className={tab === 'values' ? 'active' : ''} onClick={() => setTab('values')}>Career Values</button>
      </div>

      {tab === 'fields' ? (
        <div className="card">
          {fields.length === 0 ? <div className="empty-state">No career fields yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Field</th><th>Careers</th><th>Roadmap Stages</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {fields.map((f) => (
                    <tr key={f._id}>
                      <td><strong>{f.name}</strong><br /><small>{f.stream}</small></td>
                      <td>{(f.careers || []).length}</td>
                      <td>{(f.roadmap || []).length}</td>
                      <td>{f.isActive !== false ? 'Yes' : 'No'}</td>
                      <td className="mmc-admin-actions">
                        <button className="mmc-admin-btn-edit" onClick={() => openEditField(f)}>Edit</button>
                        <button className="mmc-admin-btn-delete" onClick={() => deleteField(f._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {values.length === 0 ? <div className="empty-state">No career values yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Key</th><th>Label</th><th>Nudges Toward</th><th>Actions</th></tr></thead>
                <tbody>
                  {values.map((v) => (
                    <tr key={v._id}>
                      <td>{v.key}</td>
                      <td>{v.label}</td>
                      <td>{Object.entries(v.nudge || {}).map(([f, w]) => `${f} (+${w})`).join(', ') || '-'}</td>
                      <td className="mmc-admin-actions">
                        <button className="mmc-admin-btn-edit" onClick={() => openEditValue(v)}>Edit</button>
                        <button className="mmc-admin-btn-delete" onClick={() => deleteValue(v._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {fieldModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setFieldModal(false)}>
          <div className="mmc-admin-modal mmc-cr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingFieldId ? 'Edit Career Field' : 'Add Career Field'}</h3>
            <form onSubmit={saveField}>
              <div className="mmc-cr-grid">
                <div className="form-group"><label>Field Name *</label><input value={fieldForm.name} onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })} required /></div>
                <div className="form-group"><label>Stream</label><input value={fieldForm.stream} onChange={(e) => setFieldForm({ ...fieldForm, stream: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Work Style</label><input value={fieldForm.workStyle} onChange={(e) => setFieldForm({ ...fieldForm, workStyle: e.target.value })} /></div>
              <div className="form-group"><label>Career Growth Outlook</label><input value={fieldForm.growth} onChange={(e) => setFieldForm({ ...fieldForm, growth: e.target.value })} /></div>
              <div className="form-group"><label>Suggested Courses (comma separated)</label><input value={fieldForm.courses} onChange={(e) => setFieldForm({ ...fieldForm, courses: e.target.value })} /></div>
              <div className="form-group mmc-cr-checkbox">
                <label><input type="checkbox" checked={fieldForm.isActive} onChange={(e) => setFieldForm({ ...fieldForm, isActive: e.target.checked })} /> Active (shown in reports)</label>
              </div>

              <label className="mmc-cr-section-label">Careers in this field</label>
              {fieldForm.careers.map((c, i) => (
                <div className="mmc-cr-row" key={i}>
                  <input placeholder="Career name" value={c.name} onChange={(e) => setCareer(i, 'name', e.target.value)} />
                  <input placeholder="One-line description" value={c.blurb} onChange={(e) => setCareer(i, 'blurb', e.target.value)} />
                  {fieldForm.careers.length > 1 && <button type="button" onClick={() => removeCareer(i)}>×</button>}
                </div>
              ))}
              <button type="button" className="btn btn-outline mmc-cr-add" onClick={addCareer}>+ Add Career</button>

              <label className="mmc-cr-section-label">Roadmap stages (shown as a timeline in the report)</label>
              {fieldForm.roadmap.map((r, i) => (
                <div className="mmc-cr-row" key={i}>
                  <input placeholder="Stage (e.g. Class 11-12)" value={r.stage} onChange={(e) => setStage(i, 'stage', e.target.value)} />
                  <input placeholder="Detail" value={r.detail} onChange={(e) => setStage(i, 'detail', e.target.value)} />
                  {fieldForm.roadmap.length > 1 && <button type="button" onClick={() => removeStage(i)}>×</button>}
                </div>
              ))}
              <button type="button" className="btn btn-outline mmc-cr-add" onClick={addStage}>+ Add Stage</button>

              {error && <p className="error-state">{error}</p>}
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setFieldModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Career Field</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {valueModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setValueModal(false)}>
          <div className="mmc-admin-modal mmc-cr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingValueId ? 'Edit Career Value' : 'Add Career Value'}</h3>
            <form onSubmit={saveValue}>
              <div className="mmc-cr-grid">
                <div className="form-group"><label>Key (unique, e.g. "stability") *</label><input value={valueForm.key} onChange={(e) => setValueForm({ ...valueForm, key: e.target.value })} required disabled={!!editingValueId} /></div>
                <div className="form-group"><label>Label (shown to students) *</label><input value={valueForm.label} onChange={(e) => setValueForm({ ...valueForm, label: e.target.value })} required /></div>
              </div>
              <label className="mmc-cr-section-label">Nudges toward (0 = no effect)</label>
              <div className="mmc-ca-weights-grid">
                {fieldNames.map((f) => (
                  <label key={f} className="mmc-ca-weight-input">
                    <span>{f}</span>
                    <input type="number" min="0" max="5" value={valueForm.nudge[f] || ''} onChange={(e) => setNudge(f, e.target.value)} />
                  </label>
                ))}
              </div>
              {error && <p className="error-state">{error}</p>}
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setValueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Career Value</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
