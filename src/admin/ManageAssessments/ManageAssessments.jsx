import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';
import './ManageAssessments.css';

const CATEGORIES = [
  { id: 'interest', label: 'Interests' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'personality', label: 'Personality' },
  { id: 'adaptive', label: 'Career Orientation (adaptive)' },
];

function emptyOption() { return { label: '', weights: {} }; }
function emptyForm() { return { category: 'interest', question: '', adaptiveForField: '', options: [emptyOption(), emptyOption()] }; }

export default function ManageAssessments() {
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [fields, setFields] = useState([]); // career field names, for the weight grid
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);

  const loadQuestions = () => api.get('/admin/assessment-questions').then((res) => setQuestions(res.data.questions));
  const loadFields = () => api.get('/admin/career-fields').then((res) => setFields(res.data.fields.map((f) => f.name)));
  const loadResults = (p = page) => api.get('/admin/assessment-results', { params: { page: p, limit: 15 } })
    .then((res) => { setResults(res.data.results); setPagination(res.data.pagination); });

  useEffect(() => { loadQuestions(); loadFields(); }, []);
  useEffect(() => { if (tab === 'results') loadResults(page); }, [tab, page]); // eslint-disable-line

  const openNew = () => { setForm(emptyForm()); setError(''); setShowModal(true); };

  const setOptionLabel = (i, label) => {
    const options = [...form.options];
    options[i] = { ...options[i], label };
    setForm({ ...form, options });
  };
  const setOptionWeight = (i, field, value) => {
    const options = [...form.options];
    const weights = { ...options[i].weights, [field]: Number(value) || 0 };
    if (!weights[field]) delete weights[field];
    options[i] = { ...options[i], weights };
    setForm({ ...form, options });
  };
  const addOption = () => setForm({ ...form, options: [...form.options, emptyOption()] });
  const removeOption = (i) => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const cleanOptions = form.options.filter((o) => o.label.trim());
    if (cleanOptions.length < 2) { setError('Add at least 2 options.'); return; }
    try {
      await api.post('/admin/assessment-questions', {
        category: form.category,
        question: form.question,
        adaptiveForField: form.category === 'adaptive' ? form.adaptiveForField : '',
        options: cleanOptions,
      });
      setShowModal(false);
      loadQuestions();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save this question.');
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/admin/assessment-questions/${id}`);
    loadQuestions();
  };

  const uploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadMsg('Uploading...');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/assessment-questions/upload-excel', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg(`Imported ${res.data.imported} question(s)${res.data.skipped ? `, skipped ${res.data.skipped}` : ''}.`);
      loadQuestions();
    } catch (err) {
      setUploadMsg(err?.response?.data?.message || 'Upload failed.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const filteredQuestions = categoryFilter ? questions.filter((q) => q.category === categoryFilter) : questions;

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Career Assessments</h1>
          <p>Manage the weighted question bank (by career field) and review student results.</p>
        </div>
        {tab === 'questions' && (
          <div className="mmc-ca-admin-header-actions">
            <label className="btn btn-outline mmc-ca-upload-btn">
              ⬆ Upload Excel
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={uploadExcel} hidden />
            </label>
            <button className="btn btn-primary" onClick={openNew}>+ Add Question</button>
          </div>
        )}
      </div>
      {uploadMsg && <p className="mmc-ca-upload-msg">{uploadMsg}</p>}

      <div className="mmc-dash-tabs" style={{ marginBottom: 20 }}>
        <button className={tab === 'questions' ? 'active' : ''} onClick={() => setTab('questions')}>Question Bank</button>
        <button className={tab === 'results' ? 'active' : ''} onClick={() => setTab('results')}>Results</button>
      </div>

      {tab === 'results' ? (
        <div className="card">
          {results.length === 0 ? <div className="empty-state">No assessment results yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Archetype</th><th>Top Field</th><th>Date</th></tr></thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r._id}>
                      <td>{r.student?.fullName} <br /><small>{r.student?.email}</small></td>
                      <td>{r.result?.archetype || '-'}</td>
                      <td>{r.result?.topField || r.recommendedStreams?.join(', ') || '-'}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : (
        <div className="card">
          <div className="mmc-ca-category-filter">
            <button className={!categoryFilter ? 'active' : ''} onClick={() => setCategoryFilter('')}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={categoryFilter === c.id ? 'active' : ''} onClick={() => setCategoryFilter(c.id)}>{c.label}</button>
            ))}
          </div>
          {filteredQuestions.length === 0 ? <div className="empty-state">No questions yet. Add your first question or upload an Excel file.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Question</th><th>Category</th><th>Options &amp; Weights</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q._id}>
                      <td style={{ maxWidth: 260 }}>{q.question}</td>
                      <td style={{ textTransform: 'capitalize' }}>{q.category}</td>
                      <td>
                        <div className="mmc-ca-option-preview">
                          {(q.options || []).map((o, i) => (
                            <div key={i}>
                              <strong>{o.label}</strong>
                              {Object.entries(o.weights || {}).map(([f, w]) => <span key={f} className="mmc-ca-weight-chip">{f}: {w}</span>)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="mmc-admin-actions"><button className="mmc-admin-btn-delete" onClick={() => deleteQuestion(q._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal mmc-ca-question-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Assessment Question</h3>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              {form.category === 'adaptive' && (
                <div className="form-group">
                  <label>Primary Career Field (which field this question sharpens)</label>
                  <select value={form.adaptiveForField} onChange={(e) => setForm({ ...form, adaptiveForField: e.target.value })}>
                    <option value="">Select</option>
                    {fields.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Question</label>
                <textarea rows="2" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
              </div>

              <label className="mmc-ca-options-label">Options - each option can nudge one or more career fields</label>
              {form.options.map((opt, i) => (
                <div className="mmc-ca-option-row" key={i}>
                  <div className="mmc-ca-option-row-head">
                    <input
                      placeholder={`Option ${i + 1} text`}
                      value={opt.label}
                      onChange={(e) => setOptionLabel(i, e.target.value)}
                    />
                    {form.options.length > 2 && (
                      <button type="button" className="mmc-ca-option-remove" onClick={() => removeOption(i)}>×</button>
                    )}
                  </div>
                  <div className="mmc-ca-weights-grid">
                    {fields.map((f) => (
                      <label key={f} className="mmc-ca-weight-input">
                        <span>{f}</span>
                        <input
                          type="number" min="0" max="5"
                          value={opt.weights[f] || ''}
                          onChange={(e) => setOptionWeight(i, f, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline mmc-ca-add-option" onClick={addOption}>+ Add Option</button>

              {error && <p className="error-state">{error}</p>}
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
