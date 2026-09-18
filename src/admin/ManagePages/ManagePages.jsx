import React, { useEffect, useState } from 'react';
import api from '../../api/api.js';
import '../AdminCommon.css';

const PAGE_SLUGS = ['home', 'about-us', 'services', 'contact-us'];

export default function ManagePages() {
  const [slug, setSlug] = useState('about-us');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setSavedMsg('');
    api.get(`/pages/${slug}`).then((res) => {
      const page = res.data.page;
      setTitle(page?.title || '');
      setContentText(page?.content?.body || '');
    });
  }, [slug]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setSavedMsg('');
    try {
      await api.put(`/admin/pages/${slug}`, { title, content: { body: contentText } });
      setSavedMsg('Saved successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mmc-admin-page-header">
        <div>
          <h1>Website Pages & Content</h1>
          <p>Edit flexible content blocks for static pages. (Structured sections like Home's slider and Services list are managed on the live pages/components directly.)</p>
        </div>
      </div>

      <div className="mmc-admin-toolbar">
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          {PAGE_SLUGS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <form className="card mmc-admin-card" onSubmit={save} style={{ maxWidth: 700 }}>
        <div className="form-group"><label>Page Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="form-group"><label>Content Body</label><textarea rows="8" value={contentText} onChange={(e) => setContentText(e.target.value)} /></div>
        {savedMsg && <p className="mmc-success-msg">{savedMsg}</p>}
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Page'}</button>
      </form>
    </div>
  );
}
