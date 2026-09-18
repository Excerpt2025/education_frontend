import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';

const emptyForm = { year: new Date().getFullYear(), college: '', course: '', category: 'GM', collegeType: 'Private', cutoffRank: '' };

export default function ManagePgcetData() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);

  const load = (p = page, y = yearFilter) => {
    setLoading(true);
    api.get('/admin/pgcet-cutoffs', { params: { page: p, limit: 20, year: y || undefined } })
      .then((res) => { setRecords(res.data.data); setPagination(res.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, yearFilter); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); load(1, yearFilter); }, [yearFilter]); // eslint-disable-line

  const addRecord = async (e) => {
    e.preventDefault();
    await api.post('/admin/pgcet-cutoffs', { ...form, cutoffRank: Number(form.cutoffRank), year: Number(form.year) });
    setShowModal(false);
    setForm(emptyForm);
    load(page, yearFilter);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this cutoff record?')) return;
    await api.delete(`/admin/pgcet-cutoffs/${id}`);
    load(page, yearFilter);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/admin/pgcet-cutoffs/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult({ success: true, ...res.data });
      load(1, yearFilter);
      setPage(1);
    } catch (err) {
      setUploadResult({ success: false, message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfUploading(true);
    setPdfResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/admin/pgcet-cutoffs/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPdfResult({ success: true, ...res.data });
      load(1, yearFilter);
      setPage(1);
    } catch (err) {
      setPdfResult({ success: false, message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setPdfUploading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>PGCET Cutoff Data</h1>
          <p>Upload previous-year PGCET cutoff data via Excel, or add records manually. Powers the PGCET College Predictor.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Record Manually</button>
      </div>

      <div className="mmc-upload-box card">
        <strong>📥 Bulk Upload via Excel</strong>
        <p style={{ margin: '6px 0', color: 'var(--mmc-muted)', fontSize: '0.88rem' }}>
          Columns expected (header row): <code>Year, College, Course, Category, CollegeType, CutoffRank</code>.
          College/Course names not already in the system will be created automatically.
        </p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={uploading} />
        {uploading && <p className="mmc-upload-hint">Uploading and processing... this may take a moment for large files.</p>}
        {uploadResult && (
          <div className="mmc-upload-result">
            {uploadResult.success ? (
              <p className="success">✔ Imported {uploadResult.insertedCount} rows{uploadResult.skipped ? `, skipped ${uploadResult.skipped}` : ''}.</p>
            ) : (
              <p className="error-state">{uploadResult.message}</p>
            )}
            {uploadResult.errors?.length > 0 && (
              <ul>{uploadResult.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}
          </div>
        )}
      </div>

      <div className="mmc-upload-box card">
        <strong>📄 Bulk Upload via Official KEA PDF</strong>
        <p style={{ margin: '6px 0', color: 'var(--mmc-muted)', fontSize: '0.88rem' }}>
          Upload the official KEA "Allotment Cut-Off Ranks" PDF exactly as published. Colleges, courses
          and every category's cutoff rank are read automatically - no manual re-typing.
        </p>
        <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} disabled={pdfUploading} />
        {pdfUploading && <p className="mmc-upload-hint">Reading PDF and processing rows... this can take a moment for large documents.</p>}
        {pdfResult && (
          <div className="mmc-upload-result">
            {pdfResult.success ? (
              <p className="success">✔ Imported {pdfResult.insertedCount} cutoff rows for {pdfResult.year}{pdfResult.skipped ? `, skipped ${pdfResult.skipped}` : ''}.</p>
            ) : (
              <p className="error-state">{pdfResult.message}</p>
            )}
            {pdfResult.errors?.length > 0 && (
              <ul>{pdfResult.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}
          </div>
        )}
      </div>

      <div className="mmc-admin-toolbar">
        <input placeholder="Filter by year (e.g. 2025)" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ maxWidth: 220 }} />
      </div>

      <div className="card">
        {loading ? <div className="loading-state">Loading...</div> : records.length === 0 ? (
          <div className="empty-state">No cutoff data yet. Upload an Excel sheet above to get started.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Year</th><th>College</th><th>Course</th><th>Category</th><th>College Type</th><th>Cutoff Rank</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.year}</td>
                    <td>{r.college?.name || '-'}</td>
                    <td>{r.course?.name || '-'}</td>
                    <td>{r.category}</td>
                    <td>{r.collegeType}</td>
                    <td>{r.cutoffRank}</td>
                    <td className="mmc-admin-actions">
                      <button className="mmc-admin-btn-delete" onClick={() => deleteRecord(r._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add PGCET Cutoff Record</h3>
            <form onSubmit={addRecord}>
              <div className="form-group"><label>Year</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required /></div>
              <div className="form-group"><label>College Name</label><input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="Will be created if new" required /></div>
              <div className="form-group"><label>Course Name</label><input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="Will be created if new" required /></div>
              <div className="form-group"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
              <div className="form-group">
                <label>College Type</label>
                <select value={form.collegeType} onChange={(e) => setForm({ ...form, collegeType: e.target.value })}>
                  <option>Government</option><option>Private</option><option>Autonomous</option>
                </select>
              </div>
              <div className="form-group"><label>Cutoff Rank</label><input type="number" value={form.cutoffRank} onChange={(e) => setForm({ ...form, cutoffRank: e.target.value })} required /></div>
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
