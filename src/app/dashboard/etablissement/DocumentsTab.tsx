"use client";

import { useState, useRef } from "react";

interface GiteDoc {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

const lbl = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-white)', fontSize: '14px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };

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

    setUploading(true);
    setError(null);
    try {
      // Step 1: upload to Vercel Blob
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) { setError("Erreur lors de l'upload"); return; }
      const { url: fileUrl } = await uploadRes.json();

      // Step 2: save metadata in DB
      const res = await fetch('/api/etablissement/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de l'import");
        return;
      }
      const doc = await res.json();
      setDocs(d => [...d, doc]);
      setLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError("Erreur lors de l'import");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/etablissement/documents/${id}`, { method: 'DELETE' });
      setDocs(d => d.filter(doc => doc.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '36px' }}>

      {/* Explication */}
      <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-white)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 6px', fontWeight: 500 }}>Documents joints automatiquement aux emails</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Ces documents (RIB, règlement intérieur, etc.) sont automatiquement joints à l'email contenant le lien de signature et à l'email de relance acompte. Le locataire recevra ainsi toutes les informations nécessaires dès le premier contact.
        </p>
      </div>

      {/* Liste des documents */}
      {docs.length > 0 && (
        <div style={{ marginBottom: '28px', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Documents enregistrés</p>
          </div>
          {docs.map((doc, i) => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--bg-white)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '16px' }}>
                  {doc.mimeType === 'application/pdf' ? '📄' : doc.mimeType.startsWith('image/') ? '🖼️' : '📎'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0, fontWeight: 500 }}>{doc.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
              >
                {deletingId === doc.id ? '...' : 'Supprimer'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ajout d'un document */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Ajouter un document</p>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-white)' }}>
          <div>
            <label style={lbl}>Nom du document *</label>
            <input
              type="text"
              placeholder="Ex : RIB, Règlement intérieur, Livret d'accueil…"
              value={label}
              onChange={e => { setLabel(e.target.value); setError(null); }}
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>Fichier (PDF, image) *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleUpload}
              disabled={uploading}
              style={{ fontSize: '13px', color: 'var(--text)', cursor: 'pointer' }}
            />
          </div>
          {error && <p style={{ fontSize: '12px', color: '#c0392b', margin: 0 }}>{error}</p>}
          {uploading && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Import en cours…</p>}
        </div>
      </div>

    </div>
  );
}
