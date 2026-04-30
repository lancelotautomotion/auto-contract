"use client";

import { useState, useEffect } from "react";

const PLATFORMS: { value: string; label: string; hint: string }[] = [
  { value: "airbnb",          label: "Airbnb",            hint: "Calendrier → Exporter → Copier le lien iCal" },
  { value: "abritel",         label: "Abritel / VRBO",    hint: "Calendrier → Synchroniser → Exporter l'URL iCal" },
  { value: "booking",         label: "Booking.com",       hint: "Extranet → Calendrier → Exporter le calendrier" },
  { value: "gites_de_france", label: "Gîtes de France",  hint: "Espace pro → Calendrier → Exporter (iCal)" },
  { value: "autre",           label: "Autre plateforme",  hint: "Copiez l'URL .ics fournie par la plateforme" },
];

const PLATFORM_COLORS: Record<string, string> = {
  airbnb: "#FF385C", abritel: "#1B6BCD", booking: "#003580",
  gites_de_france: "#5A8A3B", autre: "#7F77DD",
};

interface Feed { id: string; platform: string; label: string; url: string; syncedAt: string | null; }

function platformLabel(p: string) { return PLATFORMS.find(x => x.value === p)?.label ?? p; }
function fmtSync(iso: string | null) {
  if (!iso) return "jamais synchronisé";
  const d = new Date(iso);
  return `Sync. ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

const s = {
  card: {
    background: '#fff', border: '1px solid #E8E6E1', borderRadius: '14px',
    padding: '24px', marginBottom: '20px',
  } as React.CSSProperties,
  title: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, color: '#7F77DD', marginBottom: '16px',
  },
  desc: { fontSize: '13px', color: '#71716E', lineHeight: 1.6, margin: '0 0 20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#2C2C2A', marginBottom: '6px' },
  input: {
    width: '100%', height: '40px', border: '1px solid #D9D7D0',
    borderRadius: '10px', padding: '0 12px', fontSize: '13px',
    color: '#2C2C2A', background: '#fff', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  select: {
    width: '100%', height: '40px', border: '1px solid #D9D7D0',
    borderRadius: '10px', padding: '0 12px', fontSize: '13px',
    color: '#2C2C2A', background: '#fff', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit', cursor: 'pointer',
  } as React.CSSProperties,
  btnViolet: {
    height: '38px', padding: '0 18px', borderRadius: '10px',
    background: '#7F77DD', color: '#fff', border: 'none',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  } as React.CSSProperties,
  btnOutline: {
    height: '38px', padding: '0 18px', borderRadius: '10px',
    background: '#fff', color: '#2C2C2A', border: '1px solid #D9D7D0',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  } as React.CSSProperties,
  hint: { fontSize: '11px', color: '#71716E', marginTop: '4px' },
  feedRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#F7F4F0', borderRadius: '10px', padding: '12px 14px',
    border: '1px solid #E8E6E1', marginBottom: '10px',
  } as React.CSSProperties,
  emptyBox: {
    background: '#F7F4F0', borderRadius: '10px', padding: '28px 24px',
    textAlign: 'center' as const, marginBottom: '16px',
  },
  formBox: {
    background: '#F7F4F0', borderRadius: '12px', padding: '20px',
    border: '1px solid #E8E6E1', marginTop: '4px',
  },
};

export default function IcalTab() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gite/ical')
      .then(r => r.json())
      .then(d => { setFeeds(d.feeds ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handlePlatformChange(p: string) {
    setPlatform(p);
    if (p !== 'autre') setCustomLabel(PLATFORMS.find(x => x.value === p)?.label ?? '');
  }

  async function handleAdd() {
    if (!platform || !url) return;
    const label = platform === 'autre' ? customLabel || 'Autre' : (PLATFORMS.find(x => x.value === platform)?.label ?? platform);
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch('/api/gite/ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, label, url }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? "Erreur"); setAdding(false); return; }
      setFeeds(f => [...f, data.feed]);
      setPlatform(''); setCustomLabel(''); setUrl('');
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
      if (res.ok) setFeeds(f => f.map(feed => feed.id === feedId ? { ...feed, syncedAt: data.syncedAt } : feed));
    } finally { setSyncing(null); }
  }

  async function handleDelete(feedId: string) {
    if (!confirm("Supprimer ce calendrier ?")) return;
    setDeleting(feedId);
    try {
      await fetch(`/api/gite/ical/${feedId}`, { method: 'DELETE' });
      setFeeds(f => f.filter(feed => feed.id !== feedId));
    } finally { setDeleting(null); }
  }

  const selectedPlat = PLATFORMS.find(p => p.value === platform);

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={s.card}>
        <div style={s.title}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1 5h12" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Synchronisation iCal
        </div>

        <p style={s.desc}>
          Importez les calendriers de vos autres plateformes (Airbnb, Abritel…) pour visualiser les dates déjà réservées sur votre planning Kordia et détecter les conflits automatiquement.
        </p>

        {/* Liste */}
        {loading ? (
          <p style={{ fontSize: '13px', color: '#71716E' }}>Chargement…</p>
        ) : feeds.length === 0 && !showForm ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: '13px', color: '#71716E', margin: '0 0 14px' }}>Aucun calendrier connecté.</p>
            <button type="button" style={s.btnOutline} onClick={() => setShowForm(true)}>
              + Ajouter un calendrier
            </button>
          </div>
        ) : (
          <>
            {feeds.map(feed => (
              <div key={feed.id} style={s.feedRow}>
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
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#2C2C2A' }}>
                    {platformLabel(feed.platform)}
                    {feed.platform === 'autre' && <span style={{ fontWeight: 400, color: '#71716E', marginLeft: '6px' }}>— {feed.label}</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#A3A3A0', marginTop: '2px' }}>{fmtSync(feed.syncedAt)}</div>
                </div>
                <button type="button" onClick={() => handleSync(feed.id)} disabled={syncing === feed.id}
                  style={{ background: '#fff', border: '1px solid #D9D7D0', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', color: '#71716E', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ animation: syncing === feed.id ? 'ical-spin 1s linear infinite' : 'none' }}>
                    <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5c1.5 0 2.8.72 3.65 1.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M9.5 1.5v2h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {syncing === feed.id ? 'Sync…' : 'Sync'}
                </button>
                <button type="button" onClick={() => handleDelete(feed.id)} disabled={deleting === feed.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A0', padding: '4px', lineHeight: 1 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}

            {!showForm && (
              <button type="button" style={{ ...s.btnOutline, marginTop: '4px' }} onClick={() => setShowForm(true)}>
                + Ajouter un calendrier
              </button>
            )}
          </>
        )}

        {/* Formulaire d'ajout — div, pas form (évite le form imbriqué) */}
        {showForm && (
          <div style={s.formBox}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#2C2C2A', margin: '0 0 16px' }}>Nouveau calendrier iCal</p>

            <div style={{ marginBottom: '14px' }}>
              <label style={s.label}>Plateforme</label>
              <select style={s.select} value={platform} onChange={e => handlePlatformChange(e.target.value)}>
                <option value="" disabled>Choisir une plateforme…</option>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {platform === 'autre' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={s.label}>Nom de la plateforme</label>
                <input style={s.input} type="text" placeholder="ex : Clévacances…"
                  value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
              </div>
            )}

            <div style={{ marginBottom: '6px' }}>
              <label style={s.label}>URL du calendrier iCal (.ics)</label>
              <input style={s.input} type="url" placeholder="https://…"
                value={url} onChange={e => setUrl(e.target.value)} />
              {selectedPlat && <p style={s.hint}>💡 {selectedPlat.hint}</p>}
            </div>

            {addError && <p style={{ fontSize: '12px', color: '#C0392B', margin: '8px 0 0' }}>{addError}</p>}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" style={{ ...s.btnViolet, opacity: adding ? 0.7 : 1 }}
                onClick={handleAdd} disabled={adding || !platform || !url}>
                {adding ? 'Ajout en cours…' : 'Ajouter et synchroniser'}
              </button>
              <button type="button" style={s.btnOutline}
                onClick={() => { setShowForm(false); setAddError(null); setPlatform(''); setUrl(''); }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes ical-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
