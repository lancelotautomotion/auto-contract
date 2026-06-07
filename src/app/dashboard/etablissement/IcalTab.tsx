"use client";

import { useState, useEffect } from "react";
import { CalendarDays, RefreshCw, Trash2 } from "lucide-react";

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

interface Feed { id: string; platform: string; label: string; url: string; syncedAt: string | null; roomId?: string | null; }
interface RoomLite { id: string; name: string; }

function platformLabel(p: string) { return PLATFORMS.find(x => x.value === p)?.label ?? p; }
function fmtSync(iso: string | null): { label: string; status: 'ok' | 'warn' | 'never' } {
  if (!iso) return { label: "Jamais synchronisé", status: 'never' };
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  let label: string;
  if (mins < 1) label = "À l'instant";
  else if (mins < 60) label = `Il y a ${mins} min`;
  else if (hours < 24) label = `Il y a ${hours}h`;
  else label = `Il y a ${days}j`;
  const status = hours < 6 ? 'ok' : hours < 48 ? 'warn' : 'never';
  return { label, status };
}

const STATUS_DOT: Record<string, { bg: string; text: string }> = {
  ok:    { bg: '#DCFCE7', text: '#166534' },
  warn:  { bg: '#FEF9C3', text: '#854D0E' },
  never: { bg: '#FEE2E2', text: '#991B1B' },
};

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

export default function IcalTab({ giteId, guesthouseId, rooms = [] }: { giteId?: string; guesthouseId?: string; rooms?: RoomLite[] }) {
  const mode = guesthouseId ? "guesthouse" : "gite";
  const listEndpoint = mode === "guesthouse" ? `/api/guesthouse/${guesthouseId}/ical` : "/api/gite/ical";
  const itemEndpointFor = (feedId: string) =>
    mode === "guesthouse" ? `/api/guesthouse/${guesthouseId}/ical/${feedId}` : `/api/gite/ical/${feedId}`;

  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [url, setUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const u = mode === "guesthouse" ? listEndpoint : (giteId ? `${listEndpoint}?giteId=${giteId}` : listEndpoint);
    fetch(u)
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
    if (mode === "guesthouse" && !roomId) { setAddError("Sélectionnez une chambre."); return; }
    const label = platform === 'autre' ? customLabel || 'Autre' : (PLATFORMS.find(x => x.value === platform)?.label ?? platform);
    setAdding(true);
    setAddError(null);
    try {
      const payload = mode === "guesthouse"
        ? { platform, label, url, roomId }
        : { giteId, platform, label, url };
      const res = await fetch(listEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error ?? "Erreur"); setAdding(false); return; }
      setFeeds(f => [...f, data.feed]);
      setPlatform(''); setCustomLabel(''); setUrl(''); setRoomId('');
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
      const res = await fetch(itemEndpointFor(feedId), { method: 'POST' });
      const data = await res.json();
      if (res.ok) setFeeds(f => f.map(feed => feed.id === feedId ? { ...feed, syncedAt: data.syncedAt } : feed));
    } finally { setSyncing(null); }
  }

  async function handleDelete(feedId: string) {
    if (!confirm("Supprimer ce calendrier ?")) return;
    setDeleting(feedId);
    try {
      await fetch(itemEndpointFor(feedId), { method: 'DELETE' });
      setFeeds(f => f.filter(feed => feed.id !== feedId));
    } finally { setDeleting(null); }
  }

  const roomNameFor = (id?: string | null) => rooms.find(r => r.id === id)?.name ?? "";

  const selectedPlat = PLATFORMS.find(p => p.value === platform);

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={s.card}>
        <div style={s.title}>
          <CalendarDays size={14} strokeWidth={1.4} />
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
            {/* En-tête tableau */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 80px', gap: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A3A3A0', marginBottom: '4px' }}>
              <span>Plateforme {mode === "guesthouse" ? "· Chambre" : ""}</span>
              <span>Dernière synchro</span>
              <span />
              <span />
            </div>

            {feeds.map(feed => {
              const sync = fmtSync(feed.syncedAt);
              const dot = STATUS_DOT[sync.status];
              return (
                <div key={feed.id} style={{ ...s.feedRow, display: 'grid', gridTemplateColumns: '1fr 1fr 140px 80px', gap: '8px', alignItems: 'center' }}>
                  {/* Plateforme */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: PLATFORM_COLORS[feed.platform] ?? '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarDays size={13} strokeWidth={1.4} color="#fff" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#2C2C2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {feed.platform === 'autre' ? feed.label : platformLabel(feed.platform)}
                      </div>
                      {mode === "guesthouse" && feed.roomId && (
                        <div style={{ fontSize: '11px', color: '#5B52B5', marginTop: '1px', fontWeight: 500 }}>{roomNameFor(feed.roomId)}</div>
                      )}
                    </div>
                  </div>

                  {/* Statut */}
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: dot.bg, color: dot.text, fontSize: '11.5px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot.text, flexShrink: 0 }} />
                      {sync.label}
                    </span>
                  </div>

                  {/* Sync */}
                  <button type="button" onClick={() => handleSync(feed.id)} disabled={syncing === feed.id}
                    style={{ background: '#fff', border: '1px solid #D9D7D0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#71716E', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit', justifyContent: 'center' }}>
                    <RefreshCw size={12} strokeWidth={1.4} style={{ animation: syncing === feed.id ? 'ical-spin 1s linear infinite' : 'none' }} />
                    {syncing === feed.id ? 'Sync…' : 'Synchroniser'}
                  </button>

                  {/* Supprimer */}
                  <button type="button" onClick={() => handleDelete(feed.id)} disabled={deleting === feed.id}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontFamily: 'inherit', justifyContent: 'center' }}>
                    <Trash2 size={13} strokeWidth={1.4} />
                    Supprimer
                  </button>
                </div>
              );
            })}

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

            {mode === "guesthouse" && (
              <div style={{ marginBottom: '14px' }}>
                <label style={s.label}>Chambre concernée</label>
                <select style={s.select} value={roomId} onChange={e => setRoomId(e.target.value)}>
                  <option value="" disabled>Choisir une chambre…</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            )}

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
