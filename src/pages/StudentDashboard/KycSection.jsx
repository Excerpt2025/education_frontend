import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/api.js';           // BASE_URL import no longer needed
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';

const MAX_MB = 5;
const MAX_DIM = 1800;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Shrinks big phone photos so they fit under the 5 MB server limit.
function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.size <= 1.5 * 1024 * 1024) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob || blob.size >= file.size) return resolve(file);
        resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const DOCS = [
  { key: 'passbook', title: 'Bank passbook', hint: 'Front page showing your name, account number and IFSC. A cancelled cheque also works.' },
  { key: 'panCard', title: 'PAN card', hint: 'A clear photo or scan of the front of your PAN card.' },
  { key: 'aadhaarCard', title: 'Aadhaar card', hint: 'Front and back in one image or PDF. A masked Aadhaar (first 8 digits hidden) is fine.' },
];

const EMPTY_FILES = { passbook: null, panCard: null, aadhaarCard: null };

export default function KycSection({ kyc = {}, meta, onSubmitted }) {
  const [form, setForm] = useState(() => ({
    accountHolderName: kyc.accountHolderName || '',
    bankName: kyc.bankName || '',
    accountNumber: kyc.accountNumber || '',
    confirmAccountNumber: kyc.accountNumber || '',
    ifsc: kyc.ifsc || '',
    panNumber: kyc.panNumber || '',
    upiId: kyc.upiId || '',
  }));
  const [files, setFiles] = useState(EMPTY_FILES); // { key: { file, url } | null }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const filesRef = useRef(files);
  const msgRef = useRef(null);
useEffect(() => {
  if (msg.text) msgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, [msg]);
  filesRef.current = files;

  // Free any preview URLs when the tab is left.
  useEffect(() => () => {
    Object.values(filesRef.current).forEach((f) => f?.url && URL.revokeObjectURL(f.url));
  }, []);

  const uploaded = kyc.documents || {};

 const pickFile = async (key, e) => {
  const original = e.target.files?.[0];
  e.target.value = '';
  if (!original) return;
  if (!ALLOWED_TYPES.includes(original.type)) {
    setMsg({ type: 'error', text: 'Please upload a JPG, PNG, WEBP or PDF file (iPhone HEIC photos are not supported).' });
    return;
  }
  const file = await compressImage(original);
  if (file.size > MAX_MB * 1024 * 1024) {
    setMsg({ type: 'error', text: `Each file must be ${MAX_MB} MB or smaller.` });
    return;
  }
  setMsg({ type: '', text: '' });
  setFiles((prev) => {
    if (prev[key]?.url) URL.revokeObjectURL(prev[key].url);
    return { ...prev, [key]: { file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '' } };
  });
};

  const clearFile = (key) => {
    setFiles((prev) => {
      if (prev[key]?.url) URL.revokeObjectURL(prev[key].url);
      return { ...prev, [key]: null };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    // Clean values once, use the cleaned copy for both checks and upload
    const clean = {
      accountHolderName: form.accountHolderName.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.replace(/\s+/g, ''),
      confirmAccountNumber: form.confirmAccountNumber.replace(/\s+/g, ''),
      ifsc: form.ifsc.trim().toUpperCase(),
      panNumber: form.panNumber.trim().toUpperCase(),
      upiId: form.upiId.trim(),
    };

    if (clean.accountNumber !== clean.confirmAccountNumber) {
      setMsg({ type: 'error', text: 'Account number and confirmation do not match.' });
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean.ifsc)) {
      setMsg({ type: 'error', text: 'Enter a valid 11-character IFSC code (e.g. HDFC0001234).' });
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean.panNumber)) {
      setMsg({ type: 'error', text: 'Enter a valid 10-character PAN (e.g. ABCDE1234F).' });
      return;
    }
    const missing = DOCS.find((d) => !files[d.key] && !uploaded[d.key]);
    if (missing) {
      setMsg({ type: 'error', text: `Please upload your ${missing.title.toLowerCase()}.` });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      ['accountHolderName', 'bankName', 'accountNumber', 'ifsc', 'panNumber', 'upiId'].forEach((k) => fd.append(k, clean[k]));
      DOCS.forEach((d) => { if (files[d.key]) fd.append(d.key, files[d.key].file); });

      // Native fetch on purpose: the browser builds the multipart body and its
      // boundary itself, so nothing (default headers, interceptors) can corrupt
      // the upload. Only the auth header is added.
     const response = await api.put('/students/kyc', fd, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 120000,
});
const data = response.data;
if (!data.success) throw new Error(data.message || 'Could not submit KYC.');

      Object.values(files).forEach((f) => f?.url && URL.revokeObjectURL(f.url));
      setFiles(EMPTY_FILES);
      onSubmitted?.(data.student);
      setMsg({ type: 'success', text: "KYC submitted! We'll verify it within 24-48 hours before your first payout." });
   } catch (err) {
  const d = err.response?.data;
  const detail = Array.isArray(d?.errors) && d.errors.length ? d.errors.join('. ') : d?.message;
  setMsg({ type: 'error', text: detail || err.message || 'Could not submit KYC. Please check the details and try again.' });
} finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const status = kyc.status || 'not_submitted';

  return (
    <div className="card mmc-dash-kyc-card">
      <div className="mmc-dash-kyc-head">
        <div>
          <h3><OutlineIcon name="shield" size={17} /> Payout KYC</h3>
          <p>Your bank details and ID documents are used only to verify you and pay out referral earnings - required once before your first payout.</p>
        </div>
        <span className={`mmc-dash-kyc-status ${meta.cls}`}>{meta.label}</span>
      </div>

      {status === 'rejected' && kyc.rejectionReason && (
        <p className="mmc-dash-kyc-rejection"><OutlineIcon name="close" size={13} /> {kyc.rejectionReason} - please correct and resubmit.</p>
      )}
      {status === 'verified' && (
        <p className="mmc-dash-kyc-verified-note"><OutlineIcon name="shield" size={13} /> Your KYC is verified. Changing any detail or document sends it back for review.</p>
      )}

      <form onSubmit={submit} className="mmc-dash-kyc-form">
        <div className="mmc-dash-form-grid">
          <div className="form-group">
            <label>Account Holder Name *</label>
            <input value={form.accountHolderName} onChange={set('accountHolderName')} required />
          </div>
          <div className="form-group">
            <label>Bank Name *</label>
            <input value={form.bankName} onChange={set('bankName')} required />
          </div>
          <div className="form-group">
            <label>Account Number *</label>
            <input value={form.accountNumber} onChange={set('accountNumber')} required />
          </div>
          <div className="form-group">
            <label>Confirm Account Number *</label>
            <input value={form.confirmAccountNumber} onChange={set('confirmAccountNumber')} required />
          </div>
          <div className="form-group">
            <label>IFSC Code *</label>
            <input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} placeholder="e.g. HDFC0001234" required />
          </div>
          <div className="form-group">
            <label>PAN Number *</label>
            <input value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })} placeholder="e.g. ABCDE1234F" required />
          </div>
          <div className="form-group">
            <label>UPI ID (optional)</label>
            <input value={form.upiId} onChange={set('upiId')} placeholder="yourname@upi" />
          </div>
        </div>

        <h4 className="mmc-dash-kyc-docs-title">Upload documents</h4>
        <p className="mmc-dash-kyc-docs-sub">JPG, PNG, WEBP or PDF, up to {MAX_MB} MB each. Make sure the text is readable.</p>

        <div className="mmc-dash-kyc-docs">
          {DOCS.map((d) => {
            const picked = files[d.key];
            const already = !!uploaded[d.key];
            return (
              <div key={d.key} className={`mmc-dash-kyc-doc${picked || already ? ' is-done' : ''}`}>
                <div className="mmc-dash-kyc-doc-head">
                  <strong>{d.title} *</strong>
                  <span className={`mmc-dash-kyc-doc-chip${picked || already ? ' is-ok' : ''}`}>
                    {picked ? 'Ready to upload' : already ? 'Uploaded' : 'Required'}
                  </span>
                </div>
                <p>{d.hint}</p>

                <div className="mmc-dash-kyc-doc-preview">
                  {picked?.url ? (
                    <img src={picked.url} alt={`${d.title} preview`} />
                  ) : picked ? (
                    <span className="mmc-dash-kyc-doc-file">PDF · {picked.file.name}</span>
                  ) : already ? (
                    <span className="mmc-dash-kyc-doc-file">File on record. Choose a new one only to replace it.</span>
                  ) : (
                    <span className="mmc-dash-kyc-doc-file is-empty">No file chosen</span>
                  )}
                </div>

                <div className="mmc-dash-kyc-doc-actions">
                  <label className="mmc-dash-kyc-doc-btn">
                    {picked || already ? 'Replace file' : 'Choose file'}
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => pickFile(d.key, e)} />
                  </label>
                  {picked && (
                    <button type="button" className="mmc-dash-kyc-doc-remove" onClick={() => clearFile(d.key)}>Remove</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {msg.text && <p className={msg.type === 'error' ? 'mmc-dash-kyc-error' : 'mmc-success-msg'}>{msg.text}</p>}

        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Uploading...' : status === 'not_submitted' ? 'Submit KYC' : 'Update & Resubmit'}
        </button>
        <p className="mmc-dash-kyc-note"><OutlineIcon name="shield" size={12} /> Documents are stored privately and seen only by our verification team.</p>
      </form>
    </div>
  );
}