"use client";

import { useState, useEffect } from "react";

const PLATFORMS: { value: string; label: string; hint: string }[] = [
  { value: "airbnb",           label: "Airbnb",             hint: "Calendrier → Exporter → Copier le lien" },
  { value: "abritel",          label: "Abritel / VRBO",     hint: "Calendrier → Synchroniser → Exporter l'URL iCal" },
  { value: "booking",          label: "Booking.com",        hint: "Extranet → Calendrier → Exporter le calendrier" },
  { value: "leboncoin",        label: "Leboncoin",          hint: "Annonce → Calendrier → Synchroniser → URL iCal" },
  { value: "gites_de_france",  label: "Gîtes de France",   hint: "Espace pro → Calendrier → Exporter (iCal)" },
  { value: "autre",            label: "Autre plateforme",   hint: "Copiez l'URL .ics fournie par la plateforme" },
];

interface Feed { id: string; platform: string; label: string; url: string; syncedAt: string | null; }

const PLATFORM_COLORS: Record<string, string> = {
  airbnb: "#FF385C", abritel: "#1B6BCD", booking: "#003580",
  leboncoin: "#F56B2A", gites_de_france: "#5A8A3B", autre: "#7F77DD",
};

function platformLabel(p: string) {
  return PLATFORMS.find(x => x.value === p)?.label ?? p;
}

function fmtSync(iso: string | null) {
  if (!iso) return "jamais synchronisé";
  const d = new Date(iso);
  return `Sync. le ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function IcalTab() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: '', label: '', url: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gite/ical')
      .then(r => r.json())
      .then(d => { setFeeds(d.feeds ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handlePlatformChange(p: string) {
    const plat = PLATFORMS.find(x => x.value === p);
    setForm(f => ({ ...f, platform: p, label: plat ? plat.label : f.label }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.platform || !form.url) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch('/api/gite/ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? "Erreur"); setAdding(false); return; }
      setFeeds(f => [...f, data.feed]);
      setForm({ platform: '', label: '', url: '' });
      setShowForm(false);
    } catch {
      setAddError("Erreur réseau");
    } finally {
      setAdding(false);
    }
  }

  async function handleSync(feedId: string) {
    setSyncing(feedId);
    try {
      const res = await fetch(`/api/gite/ical/${feedId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeeds(f => f.map(feed => feed.id === feedId ? { ...feed, syncedAt: data.syncedAt } : feed));
      }
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(feedId: string) {
    if (!confirm("Supprimer ce calendrier iCal ?")) return;
    setDeleting(feedId);
    try {
      await fetch(`/api/gite/ical/${feedId}`, { method: 'DELETE' });
      setFeeds(f => f.filter(feed => feed.id !== feedId));
    } finally {
      setDeleting(null);
    }
  }

  const selectedPlatform = PLATFORMS.find(p => p.value === form.platform);

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="form-card">
        <div className="form-card-title">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M5 1.5v2M11 1.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M5 9.5h2m2 0h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Synchronisation iCal
        </div>

        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Importez les calendriers de vos autres plateformes (Airbnb, Abritel…) pour visualiser les dates déjà réservées sur votre planning Kordia et détecter les conflits automatiquement.
        </p>

        {/* Liste des feeds */}
        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : feeds.length === 0 && !showForm ? (
          <div style={{ background: '#F7F4F0', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 12px' }}>Aucun calendrier connecté pour l'instant.</p>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(true)}>
              + Ajouter un calendrier
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {feeds.map(feed => (
              <div key={feed.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#F7F4F0', borderRadius: '10px', padding: '12px 14px',
                border: '1px solid #E8E6E1',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  background: PLATFORM_COLORS[feed.platform] ?? '#7F77DD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="#fff" strokeWidth="1.2"/>
                    <path d="M1 5h12" stroke="#fff" strokeWidth="1.2"/>
                    <path d="M4 1v2M10 1v2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>
                    {platformLabel(feed.platform)}
                    {feed.platform === 'autre' && feed.label !== platformLabel(feed.platform) && (
                      <span style={{ fontWeight: 400, color: 'var(--ink-soft)', marginLeft: '6px' }}>— {feed.label}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{fmtSync(feed.syncedAt)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSync(feed.id)}
                  disabled={syncing === feed.id}
                  title="Synchroniser maintenant"
                  style={{
                    background: 'none', border: '1px solid #E8E6E1', borderRadius: '6px',
                    padding: '5px 8px', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '11px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ animation: syncing === feed.id ? 'spin 1s linear infinite' : 'none' }}>
                    <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5c1.5 0 2.8.72 3.65 1.85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M9.5 1.5v2h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {syncing === feed.id ? 'Sync…' : 'Sync'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(feed.id)}
                  disabled={deleting === feed.id}
                  title="Supprimer"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A0', padding: '4px' }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}

            {!showForm && (
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(true)} style={{ alignSelf: 'flex-start' }}>
                + Ajouter un calendrier
              </button>
            )}
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showForm && (
          <form onSubmit={handleAdd} style={{ background: '#F7F4F0', borderRadius: '10px', padding: '16px', border: '1px solid #E8E6E1' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '14px' }}>Nouveau calendrier iCal</div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Plateforme</label>
              <select value={form.platform} onChange={e => handlePlatformChange(e.target.value)} required>
                <option value="" disabled>Choisir une plateforme…</option>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {form.platform === 'autre' && (
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Nom de la plateforme</label>
                <input
                  type="text" placeholder="ex : Clévacances, Abritel…"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label>URL du calendrier iCal (.ics)</label>
              <input
                type="url" placeholder="https://…"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
              />
              {selectedPlatform && (
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                  💡 {selectedPlatform.hint}
                </div>
              )}
            </div>

            {addError && <p style={{ fontSize: '12px', color: '#C0392B', margin: '8px 0 0' }}>{addError}</p>}

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button type="submit" className="btn btn-violet" disabled={adding}>
                {adding ? 'Ajout en cours…' : 'Ajouter et synchroniser'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setAddError(null); }}>
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
