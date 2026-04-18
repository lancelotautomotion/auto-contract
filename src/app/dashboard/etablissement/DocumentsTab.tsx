"use client";

import { useState, useRef } from "react";

interface GiteDoc {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export default function DocumentsTab({ initialDocs }: { initialDocs: GiteDoc[] }) {
  const [docs, setDocs] = useState<GiteDoc[]>(initialDocs);
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!label.trim()) { setError("Donnez un nom au document avant de l'importer."); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) { setError("Erreur lors de l'upload"); return; }
      const { url: fileUrl } = await uploadRes.json();
      const res = await fetch('/api/etablissement/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), fileName: file.name, mimeType: file.type || 'application/octet-stream', fileUrl }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error ?? "Erreur lors de l'import"); return; }
      const doc = await res.json();
      setDocs(d => [...d, doc]);
      setLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch { setError("Erreur lors de l'import"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/etablissement/documents/${id}`, { method: 'DELETE' });
      setDocs(d => d.filter(doc => doc.id !== id));
    } finally { setDeletingId(null); }
  };

  const DocIcon = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#4A7353" strokeWidth="1.2"/>
      <path d="M6 6h4M6 9h3" stroke="#4A7353" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div>
      {/* Existing documents */}
      <div className="form-card">
        <div className="form-card-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="3" y="5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 7l4 2.5L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Documents joints automatiquement
        </div>
        <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', marginBottom: '16px', lineHeight: 1.6 }}>
          Ces documents (RIB, règlement intérieur, etc.) sont automatiquement joints à l&apos;email contenant le lien de signature et à l&apos;email de relance acompte. Le locataire recevra ainsi toutes les informations nécessaires dès le premier contact.
        </p>
        {docs.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', fontStyle: 'italic' }}>Aucun document enregistré.</p>
        )}
        {docs.map(doc => (
          <div key={doc.id} className="doc-row">
            <div className="doc-icon"><DocIcon /></div>
            <div className="doc-info">
              <div className="doc-name">{doc.label}</div>
              <div className="doc-file">{doc.fileName}</div>
            </div>
            <button
              type="button"
              className="doc-del"
              disabled={deletingId === doc.id}
              onClick={() => handleDelete(doc.id)}
            >
              {deletingId === doc.id ? '...' : 'Supprimer'}
            </button>
          </div>
        ))}
      </div>

      {/* Add document */}
      <div className="form-card">
        <div className="form-card-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Ajouter un document
        </div>
        <div className="form-group">
          <label className="form-label">Nom du document <span className="req">*</span></label>
          <input
            className="form-input"
            type="text"
            placeholder="Ex : RIB, Règlement intérieur, Livret d'accueil..."
            value={label}
            onChange={e => { setLabel(e.target.value); setError(null); }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fichier (PDF, image) <span className="req">*</span></label>
          <div className="upload-zone" style={{ padding: '24px' }} onClick={() => fileInputRef.current?.click()}>
            <div className="upload-zone-text" style={{ fontSize: '13px' }}>
              {uploading ? 'Import en cours…' : 'Cliquez ou glissez votre fichier ici'}
            </div>
            <div className="upload-zone-hint">PDF, PNG, JPG — 5 Mo max</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
        {error && <p style={{ fontSize: '12px', color: 'var(--red)', margin: '0 0 12px' }}>{error}</p>}
        <button
          type="button"
          className="btn btn-violet"
          disabled={uploading}
          onClick={() => { if (!label.trim()) { setError("Donnez un nom au document avant de l'importer."); return; } fileInputRef.current?.click(); }}
        >
          Ajouter le document
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}
