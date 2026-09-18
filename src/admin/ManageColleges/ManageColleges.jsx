import React, { useEffect, useState } from 'react';
import api, { getImageUrl } from '../../api/api.js';
import AdminPagination from '../AdminPagination.jsx';
import '../AdminCommon.css';
import './ManageColleges.css';

const emptyForm = {
  name: '', code: '', location: '', state: '', type: 'Private',
  establishedYear: '', affiliatedUniversity: '',
  about: '', description: '', rating: '', ranking: '',
  accreditations: '', specializations: '', facilities: '',
  tuitionAnnual: '', totalCourse: '', applicationFee: '',
  highestPackage: '', averagePackage: '', placementPercentage: '', topRecruiters: '',
  hostelAvailable: false,
  twoShareAvailable: false, twoShareFees: '',
  threeShareAvailable: false, threeShareFees: '',
  fourShareAvailable: false, fourShareFees: '',
  phone: '', email: '', website: '', brochureUrl: '', featured: false,
};

function toCommaList(arr) { return (arr || []).join(', '); }

export default function ManageColleges() {
  const [colleges, setColleges] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = (p = page, s = search) =>
    api.get('/colleges', { params: { page: p, limit: 12, search: s } })
      .then((res) => { setColleges(res.data.colleges); setPagination(res.data.pagination); });

  useEffect(() => { load(page, search); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); load(1, search); }, [search]); // eslint-disable-line

  const openNew = () => {
    setForm(emptyForm); setEditingId(null); setImageFile(null); setLogoFile(null); setGalleryFiles([]); setError('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || '', code: c.code || '', location: c.location || '', state: c.state || '', type: c.type || 'Private',
      establishedYear: c.establishedYear || '', affiliatedUniversity: c.affiliatedUniversity || '',
      about: c.about || '', description: c.description || '', rating: c.rating || '', ranking: c.ranking || '',
      accreditations: toCommaList(c.accreditations), specializations: toCommaList(c.specializations), facilities: toCommaList(c.facilities),
      tuitionAnnual: c.fees?.tuitionAnnual || c.fees?.annual || '', totalCourse: c.fees?.totalCourse || '', applicationFee: c.fees?.applicationFee || '',
      highestPackage: c.placements?.highestPackage || '', averagePackage: c.placements?.averagePackage || '',
      placementPercentage: c.placements?.placementPercentage || '', topRecruiters: toCommaList(c.placements?.topRecruiters),
      hostelAvailable: !!c.hostel?.available,
      twoShareAvailable: !!c.hostel?.twoShare?.available, twoShareFees: c.hostel?.twoShare?.feesPerYear || '',
      threeShareAvailable: !!c.hostel?.threeShare?.available, threeShareFees: c.hostel?.threeShare?.feesPerYear || '',
      fourShareAvailable: !!c.hostel?.fourShare?.available, fourShareFees: c.hostel?.fourShare?.feesPerYear || '',
      phone: c.contact?.phone || '', email: c.contact?.email || '', website: c.contact?.website || '',
      brochureUrl: c.brochureUrl || '', featured: !!c.featured,
    });
    setEditingId(c._id);
    setImageFile(null); setLogoFile(null); setGalleryFiles([]);
    setError('');
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('code', form.code);
      fd.append('location', form.location);
      fd.append('state', form.state);
      fd.append('type', form.type);
      if (form.establishedYear) fd.append('establishedYear', form.establishedYear);
      fd.append('affiliatedUniversity', form.affiliatedUniversity);
      fd.append('about', form.about);
      fd.append('description', form.description);
      if (form.rating) fd.append('rating', form.rating);
      if (form.ranking) fd.append('ranking', form.ranking);
      fd.append('accreditations', form.accreditations);
      fd.append('specializations', form.specializations);
      fd.append('facilities', form.facilities);
      fd.append('fees', JSON.stringify({
        tuitionAnnual: Number(form.tuitionAnnual) || 0,
        totalCourse: Number(form.totalCourse) || 0,
        applicationFee: Number(form.applicationFee) || 0,
      }));
      fd.append('placements', JSON.stringify({
        highestPackage: Number(form.highestPackage) || 0,
        averagePackage: Number(form.averagePackage) || 0,
        placementPercentage: Number(form.placementPercentage) || 0,
        topRecruiters: form.topRecruiters.split(',').map((s) => s.trim()).filter(Boolean),
      }));
      fd.append('hostel', JSON.stringify({
        available: form.hostelAvailable,
        twoShare: { available: form.twoShareAvailable, feesPerYear: Number(form.twoShareFees) || 0 },
        threeShare: { available: form.threeShareAvailable, feesPerYear: Number(form.threeShareFees) || 0 },
        fourShare: { available: form.fourShareAvailable, feesPerYear: Number(form.fourShareFees) || 0 },
      }));
      fd.append('contact', JSON.stringify({ phone: form.phone, email: form.email, website: form.website }));
      fd.append('brochureUrl', form.brochureUrl);
      fd.append('featured', form.featured);
      if (imageFile) fd.append('image', imageFile);
      if (logoFile) fd.append('logo', logoFile);
      galleryFiles.forEach((f) => fd.append('gallery', f));

      if (editingId) await api.put(`/admin/colleges/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/admin/colleges', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      load(page, search);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save this college. Please check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this college? This cannot be undone.')) return;
    await api.delete(`/admin/colleges/${id}`);
    load(page, search);
  };

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Manage Colleges</h1>
          <p>One record per college powers the public college hub, compare table and detail page.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add College</button>
      </div>

      <div className="mmc-admin-toolbar">
        <input className="mmc-admin-search-input" placeholder="Search colleges..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {colleges.length === 0 ? <div className="empty-state">No colleges yet. Click "+ Add College" to create the first one.</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>College</th><th>Location</th><th>Type</th><th>Rating</th>
                  <th>Highest Package</th><th>Hostel</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleges.map((c) => (
                  <tr key={c._id}>
                    <td className="mmc-mc-name-cell">
                      <img src={getImageUrl(c.logo) || getImageUrl(c.image) || '/images/logo.png'} alt="" />
                      <div>
                        <strong>{c.name}</strong>
                        <span>{c.ranking ? `Rank #${c.ranking}` : '—'}</span>
                      </div>
                    </td>
                    <td>{c.location || '-'}</td>
                    <td>{c.type}</td>
                    <td>{c.rating ? `★ ${c.rating}` : '-'}</td>
                    <td>{c.placements?.highestPackage ? `₹${c.placements.highestPackage} LPA` : '-'}</td>
                    <td>{c.hostel?.available ? 'Yes' : 'No'}</td>
                    <td>{c.featured ? '⭐' : '-'}</td>
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
        <AdminPagination pagination={pagination} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="mmc-admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="mmc-admin-modal mmc-mc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit College' : 'Add College'}</h3>
            <form onSubmit={save}>

              <fieldset className="mmc-mc-fieldset">
                <legend>Basic Info</legend>
                <div className="mmc-mc-grid">
                  <div className="form-group"><label>College Name *</label><input value={form.name} onChange={set('name')} required /></div>
                  <div className="form-group"><label>Code</label><input value={form.code} onChange={set('code')} placeholder="e.g. RVCE" /></div>
                  <div className="form-group"><label>Location (City) *</label><input value={form.location} onChange={set('location')} required /></div>
                  <div className="form-group"><label>State</label><input value={form.state} onChange={set('state')} /></div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={set('type')}>
                      <option>Government</option><option>Government-Aided</option><option>Private</option><option>Deemed</option><option>Autonomous</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Established Year</label><input type="number" value={form.establishedYear} onChange={set('establishedYear')} /></div>
                  <div className="form-group"><label>Affiliated University</label><input value={form.affiliatedUniversity} onChange={set('affiliatedUniversity')} /></div>
                  <div className="form-group"><label>Ranking (optional)</label><input type="number" value={form.ranking} onChange={set('ranking')} /></div>
                  <div className="form-group"><label>Rating (0-5)</label><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={set('rating')} /></div>
                  <div className="form-group mmc-mc-checkbox">
                    <label><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show in "Top Picks" on the home page</label>
                  </div>
                </div>
                <div className="form-group"><label>Short Description (shown on cards)</label><input value={form.description} onChange={set('description')} placeholder="One line summary" /></div>
                <div className="form-group"><label>About (full description)</label><textarea rows="3" value={form.about} onChange={set('about')} /></div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Accreditation &amp; Specialization</legend>
                <div className="form-group"><label>Accreditations (comma separated)</label><input value={form.accreditations} onChange={set('accreditations')} placeholder="NAAC A+, NBA Accredited, AICTE Approved" /></div>
                <div className="form-group"><label>Specializations (comma separated)</label><input value={form.specializations} onChange={set('specializations')} placeholder="Marketing, Finance, HR, Operations" /></div>
                <div className="form-group"><label>Facilities / Amenities (comma separated)</label><input value={form.facilities} onChange={set('facilities')} placeholder="Library, Labs, Sports Complex, Wi-Fi Campus" /></div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Fees</legend>
                <div className="mmc-mc-grid">
                  <div className="form-group"><label>Annual Tuition Fee (₹)</label><input type="number" value={form.tuitionAnnual} onChange={set('tuitionAnnual')} /></div>
                  <div className="form-group"><label>Total Course Fee (₹)</label><input type="number" value={form.totalCourse} onChange={set('totalCourse')} /></div>
                  <div className="form-group"><label>Application Fee (₹)</label><input type="number" value={form.applicationFee} onChange={set('applicationFee')} /></div>
                </div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Placements</legend>
                <div className="mmc-mc-grid">
                  <div className="form-group"><label>Highest Package (₹ LPA)</label><input type="number" value={form.highestPackage} onChange={set('highestPackage')} /></div>
                  <div className="form-group"><label>Average Package (₹ LPA)</label><input type="number" value={form.averagePackage} onChange={set('averagePackage')} /></div>
                  <div className="form-group"><label>Placement %</label><input type="number" min="0" max="100" value={form.placementPercentage} onChange={set('placementPercentage')} /></div>
                </div>
                <div className="form-group"><label>Top Recruiters (comma separated)</label><input value={form.topRecruiters} onChange={set('topRecruiters')} placeholder="TCS, Infosys, Amazon" /></div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Hostel</legend>
                <div className="form-group mmc-mc-checkbox">
                  <label><input type="checkbox" checked={form.hostelAvailable} onChange={set('hostelAvailable')} /> Hostel available at this college</label>
                </div>
                <div className="mmc-mc-hostel-grid">
                  <div className="mmc-mc-hostel-row">
                    <label className="mmc-mc-checkbox"><input type="checkbox" checked={form.twoShareAvailable} onChange={set('twoShareAvailable')} /> 2-Share</label>
                    <input type="number" placeholder="Fees per year (₹)" value={form.twoShareFees} onChange={set('twoShareFees')} disabled={!form.twoShareAvailable} />
                  </div>
                  <div className="mmc-mc-hostel-row">
                    <label className="mmc-mc-checkbox"><input type="checkbox" checked={form.threeShareAvailable} onChange={set('threeShareAvailable')} /> 3-Share</label>
                    <input type="number" placeholder="Fees per year (₹)" value={form.threeShareFees} onChange={set('threeShareFees')} disabled={!form.threeShareAvailable} />
                  </div>
                  <div className="mmc-mc-hostel-row">
                    <label className="mmc-mc-checkbox"><input type="checkbox" checked={form.fourShareAvailable} onChange={set('fourShareAvailable')} /> 4-Share</label>
                    <input type="number" placeholder="Fees per year (₹)" value={form.fourShareFees} onChange={set('fourShareFees')} disabled={!form.fourShareAvailable} />
                  </div>
                </div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Contact &amp; Links</legend>
                <div className="mmc-mc-grid">
                  <div className="form-group"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set('email')} /></div>
                  <div className="form-group"><label>Website</label><input value={form.website} onChange={set('website')} placeholder="https://" /></div>
                  <div className="form-group"><label>Brochure URL</label><input value={form.brochureUrl} onChange={set('brochureUrl')} placeholder="https://... or /uploads/..." /></div>
                </div>
              </fieldset>

              <fieldset className="mmc-mc-fieldset">
                <legend>Media</legend>
                <div className="mmc-mc-grid">
                  <div className="form-group"><label>Cover / Banner Image</label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} /></div>
                  <div className="form-group"><label>Logo</label><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} /></div>
                </div>
                <div className="form-group"><label>Gallery Photos (adds to existing gallery)</label><input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files))} /></div>
              </fieldset>

              {error && <p className="error-state">{error}</p>}
              <div className="mmc-admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save College'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
