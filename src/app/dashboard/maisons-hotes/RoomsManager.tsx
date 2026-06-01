"use client";

import { useEffect, useRef, useState } from "react";
import { isValidSlug, slugError, suggestSlug } from "@/lib/slug";
import {
  BedDouble, Plus, AlertTriangle, Check, X, Trash2,
  ExternalLink, Copy, ChevronDown, Users, Euro, Sparkles,
  Link as LinkIcon, Settings2,
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  slug: string | null;
  capacity: number;
  basePrice: number;
  cleaningFee: number;
  specificClauses: string | null;
  active: boolean;
}

const MAX_ROOMS = 5;
const MAX_CAPACITY = 15;

// Palette de couleurs Kordia pour les cartes (violet, vert, puis variations)
const ROOM_ACCENTS = ["#7F77DD", "#689D71", "#C87D4A", "#5B99C0", "#9B68A0"];

type AvailState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function RoomsManager({
  guesthouseId,
  guesthouseSlug: initialGuesthouseSlug,
  initialRooms,
}: {
  guesthouseId: string;
  guesthouseSlug: string | null;
  initialRooms: Room[];
}) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [draft, setDraft] = useState({ name: "", capacity: "2", basePrice: "", cleaningFee: "", slug: "" });
  const [draftSlugTouched, setDraftSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [ghSlug, setGhSlug] = useState(initialGuesthouseSlug ?? "");
  const [savedGhSlug, setSavedGhSlug] = useState(initialGuesthouseSlug ?? "");
  const [ghSlugState, setGhSlugState] = useState<AvailState>("idle");
  const [ghSlugReason, setGhSlugReason] = useState("");
  const [ghSlugSaving, setGhSlugSaving] = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const capacityExceeded = totalCapacity > MAX_CAPACITY;
  const maxReached = rooms.length >= MAX_ROOMS;

  useEffect(() => {
    if (!ghSlug) { setGhSlugState("idle"); setGhSlugReason(""); return; }
    if (ghSlug === savedGhSlug) { setGhSlugState("available"); setGhSlugReason(""); return; }
    const fmt = slugError(ghSlug);
    if (fmt) { setGhSlugState("invalid"); setGhSlugReason(fmt); return; }
    setGhSlugState("checking");
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guesthouse/check-slug?slug=${encodeURIComponent(ghSlug)}&excludeId=${guesthouseId}`, { signal: ctrl.signal });
        const data = await res.json();
        setGhSlugState(data.available ? "available" : "taken");
        setGhSlugReason(data.reason ?? "");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setGhSlugState("idle");
      }
    }, 350);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [ghSlug, savedGhSlug, guesthouseId]);

  const saveGhSlug = async () => {
    if (ghSlug === savedGhSlug) return;
    if (ghSlugState !== "available") return;
    setGhSlugSaving(true);
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ghSlug || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setGhSlugState("taken"); setGhSlugReason(data.error ?? "Erreur."); return; }
      setSavedGhSlug(ghSlug);
    } finally {
      setGhSlugSaving(false);
    }
  };

  useEffect(() => {
    if (!showAdd || draftSlugTouched) return;
    setDraft((d) => ({ ...d, slug: suggestSlug(d.name) }));
  }, [draft.name, showAdd, draftSlugTouched]);

  const baseBookUrl = (savedGhSlug || "").trim();
  const roomUrl = (room: Room) => {
    if (!baseBookUrl || !room.slug) return "";
    return `${origin || "https://kordia.fr"}/book/${baseBookUrl}/${room.slug}`;
  };

  const copyUrl = async (room: Room) => {
    const url = roomUrl(room);
    if (!url) return;
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedId(room.id);
      setTimeout(() => setCopiedId((c) => (c === room.id ? null : c)), 2000);
    } catch { /* clipboard indisponible */ }
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError("Le nom est requis."); return; }
    if (draft.slug && slugError(draft.slug)) { setError(slugError(draft.slug)!); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name.trim(), capacity: draft.capacity, basePrice: draft.basePrice, cleaningFee: parseFloat(draft.cleaningFee) || 0, slug: draft.slug || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur."); return; }
      setRooms((rs) => [...rs, data.room]);
      setWarning(data.warning ?? null);
      setDraft({ name: "", capacity: "2", basePrice: "", cleaningFee: "", slug: "" });
      setDraftSlugTouched(false);
      setShowAdd(false);
    } catch { setError("Impossible de contacter le serveur."); }
    finally { setLoading(false); }
  };

  const updateRoom = async (id: string, patch: Partial<Room>) => {
    const prev = rooms;
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const data = await res.json();
      if (!res.ok) { setRooms(prev); setError(data.error ?? "Erreur."); return false; }
      setWarning(data.warning ?? null);
      return true;
    } catch { setRooms(prev); setError("Impossible de contacter le serveur."); return false; }
  };

  const removeRoom = async (id: string) => {
    if (!confirm("Supprimer cette chambre ?")) return;
    const prev = rooms;
    setRooms((rs) => rs.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) setRooms(prev);
    } catch { setRooms(prev); }
  };

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BedDouble size={18} strokeWidth={1.4} color="var(--violet)" />
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>
              Chambres <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-lighter)" }}>({rooms.length}/{MAX_ROOMS})</span>
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--ink-lighter)", marginTop: "4px" }}>
            Capacité totale :{" "}
            <strong style={{ color: totalCapacity > MAX_CAPACITY ? "#b91c1c" : "var(--ink)" }}>{totalCapacity}</strong>
            <span style={{ color: "var(--ink-lighter)" }}> / {MAX_CAPACITY} personnes</span>
          </p>
        </div>
        {!maxReached && (
          <button type="button" className="btn btn-green" onClick={() => { setShowAdd((s) => !s); setError(""); }}>
            <Plus size={14} strokeWidth={1.6} />
            Nouvelle chambre
          </button>
        )}
      </div>

      {capacityExceeded && (
        <div style={{ display: "flex", gap: "10px", background: "#FEF3CD", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "12.5px", color: "#7B4F0A" }}>
          <AlertTriangle size={15} strokeWidth={1.4} style={{ flexShrink: 0, color: "#B7791F", marginTop: "1px" }} />
          <span>Capacité totale ({totalCapacity} pers.) supérieure au plafond légal de {MAX_CAPACITY} pour une maison d&apos;hôtes.</span>
        </div>
      )}

      {/* Préfixe URL — bandeau discret en haut si pas encore configuré */}
      {!savedGhSlug && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "10px 14px", background: "#EEF0FB", border: "1px solid #D5D2F0", borderRadius: "10px", marginBottom: "16px" }}>
          <LinkIcon size={14} strokeWidth={1.4} color="#7F77DD" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#5B52B5", fontWeight: 600, flexShrink: 0 }}>URL de l&apos;établissement :</span>
          <span style={{ fontSize: "12px", color: "var(--ink-lighter)", flexShrink: 0 }}>kordia.fr/book/</span>
          <input
            type="text" placeholder="le-clous" value={ghSlug}
            onChange={(e) => setGhSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            style={{ flex: "1 1 140px", border: "1px solid #D5D2F0", borderRadius: "7px", padding: "5px 10px", fontSize: "12.5px", fontFamily: "inherit", outline: "none", background: "#fff" }}
          />
          <SlugStateBadge state={ghSlugState} reason={ghSlugReason} />
          <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "5px 12px" }}
            onClick={saveGhSlug} disabled={ghSlugSaving || ghSlug === savedGhSlug || ghSlugState !== "available"}>
            {ghSlugSaving ? "…" : "Enregistrer"}
          </button>
        </div>
      )}

      {/* Cards chambres */}
      {rooms.length === 0 && !showAdd && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-lighter)", fontSize: "13px", fontStyle: "italic" }}>
          Aucune chambre configurée. Cliquez sur &quot;Nouvelle chambre&quot; pour commencer.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rooms.map((room, idx) => (
          <RoomCard
            key={room.id}
            room={room}
            accent={ROOM_ACCENTS[idx % ROOM_ACCENTS.length]}
            origin={origin}
            guesthouseId={guesthouseId}
            guesthouseSlug={savedGhSlug}
            ghSlug={ghSlug}
            copied={copiedId === room.id}
            onCopy={() => copyUrl(room)}
            onUpdate={(patch) => updateRoom(room.id, patch)}
            onRemove={() => removeRoom(room.id)}
            buildUrl={() => roomUrl(room)}
          />
        ))}
      </div>

      {/* Préfixe URL — inline en bas si déjà configuré */}
      {savedGhSlug && (
        <details style={{ marginTop: "16px" }}>
          <summary style={{ cursor: "pointer", fontSize: "12px", color: "var(--ink-lighter)", listStyle: "none", display: "flex", alignItems: "center", gap: "6px", userSelect: "none" }}>
            <Settings2 size={13} strokeWidth={1.4} />
            Modifier le préfixe d&apos;URL de l&apos;établissement (<strong style={{ color: "var(--violet)" }}>{savedGhSlug}</strong>)
          </summary>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", padding: "10px 14px", background: "#F8F6F1", border: "1px solid #EFEDE8", borderRadius: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>kordia.fr/book/</span>
            <input
              type="text" value={ghSlug}
              onChange={(e) => setGhSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              style={{ flex: "1 1 160px", border: "1px solid var(--line)", borderRadius: "7px", padding: "6px 10px", fontSize: "12.5px", fontFamily: "inherit", outline: "none" }}
            />
            <SlugStateBadge state={ghSlugState} reason={ghSlugReason} />
            <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={saveGhSlug} disabled={ghSlugSaving || ghSlug === savedGhSlug || ghSlugState !== "available"}>
              {ghSlugSaving ? "…" : "Enregistrer"}
            </button>
          </div>
        </details>
      )}

      {warning && <p style={{ fontSize: "12px", color: "#B7791F", marginTop: "8px" }}>{warning}</p>}

      {/* Formulaire ajout chambre */}
      {showAdd && !maxReached && (
        <form onSubmit={addRoom} style={{ marginTop: "16px", padding: "16px", background: "#F8F6F1", border: "1px solid #EFEDE8", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} strokeWidth={1.4} color="var(--violet)" />
            Nouvelle chambre
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="text" className="form-input" style={{ flex: "2 1 180px", fontWeight: 600 }} placeholder="Nom / numéro" value={draft.name} onChange={(e) => { setDraft((d) => ({ ...d, name: e.target.value })); setError(""); }} autoFocus />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="1" className="form-input" style={{ width: "70px" }} placeholder="Pers." value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))} />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>pers.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="0" step="0.01" className="form-input" style={{ width: "90px" }} placeholder="Prix/nuit" value={draft.basePrice} onChange={(e) => setDraft((d) => ({ ...d, basePrice: e.target.value }))} />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€/nuit</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="0" step="0.01" className="form-input" style={{ width: "90px" }} placeholder="Ménage" value={draft.cleaningFee} onChange={(e) => setDraft((d) => ({ ...d, cleaningFee: e.target.value }))} />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€ ménage</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>URL :</span>
            <input type="text" className="form-input" style={{ flex: "1 1 180px" }} placeholder="chambre-rose" value={draft.slug}
              onChange={(e) => { setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })); setDraftSlugTouched(true); }} />
            {draft.slug && savedGhSlug && (
              <span style={{ fontSize: "11px", color: "var(--ink-lighter)" }}>kordia.fr/book/{savedGhSlug}/<strong>{draft.slug}</strong></span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" className="btn btn-green" disabled={loading}>{loading ? "Ajout…" : "Ajouter"}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowAdd(false); setDraft({ name: "", capacity: "2", basePrice: "", cleaningFee: "", slug: "" }); setDraftSlugTouched(false); setError(""); }}>Annuler</button>
          </div>
        </form>
      )}

      {maxReached && (
        <p style={{ fontSize: "12.5px", color: "var(--ink-lighter)", marginTop: "12px", fontStyle: "italic" }}>Limite de {MAX_ROOMS} chambres atteinte.</p>
      )}
      {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

function SlugStateBadge({ state, reason }: { state: AvailState; reason: string }) {
  if (state === "idle") return null;
  if (state === "checking") return <span style={{ fontSize: "11.5px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Vérification…</span>;
  if (state === "available") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#3E7A48" }}>
      <Check size={12} strokeWidth={1.6} />Disponible
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#b91c1c" }} title={reason}>
      <X size={12} strokeWidth={1.6} />{state === "invalid" ? "Invalide" : "Indisponible"}
    </span>
  );
}

function RoomCard({
  room, accent, origin, guesthouseId, guesthouseSlug, ghSlug, copied,
  onCopy, onUpdate, onRemove, buildUrl,
}: {
  room: Room; accent: string; origin: string; guesthouseId: string;
  guesthouseSlug: string; ghSlug: string; copied: boolean;
  onCopy: () => void; onUpdate: (patch: Partial<Room>) => Promise<boolean>;
  onRemove: () => void; buildUrl: () => string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [basePrice, setBasePrice] = useState(String(room.basePrice));
  const [cleaningFee, setCleaningFee] = useState(String(room.cleaningFee));
  const [slug, setSlug] = useState(room.slug ?? "");
  const [slugState, setSlugState] = useState<AvailState>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [savingSlug, setSavingSlug] = useState(false);
  const savedSlug = useRef(room.slug ?? "");

  const [clausesOpen, setClausesOpen] = useState(false);
  const [clauses, setClauses] = useState(room.specificClauses ?? "");
  const savedClauses = useRef(room.specificClauses ?? "");
  const [savingClauses, setSavingClauses] = useState(false);
  const [clausesMsg, setClausesMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => { setName(room.name); }, [room.name]);
  useEffect(() => { setCapacity(String(room.capacity)); }, [room.capacity]);
  useEffect(() => { setBasePrice(String(room.basePrice)); }, [room.basePrice]);
  useEffect(() => { setCleaningFee(String(room.cleaningFee)); }, [room.cleaningFee]);
  useEffect(() => { setSlug(room.slug ?? ""); savedSlug.current = room.slug ?? ""; }, [room.slug]);
  useEffect(() => { setClauses(room.specificClauses ?? ""); savedClauses.current = room.specificClauses ?? ""; }, [room.specificClauses]);

  useEffect(() => {
    if (!slug) { setSlugState("idle"); setSlugReason(""); return; }
    if (slug === savedSlug.current) { setSlugState("available"); setSlugReason(""); return; }
    const fmt = slugError(slug);
    if (fmt) { setSlugState("invalid"); setSlugReason(fmt); return; }
    setSlugState("checking");
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms/check-slug?slug=${encodeURIComponent(slug)}&excludeRoomId=${room.id}`, { signal: ctrl.signal });
        const data = await res.json();
        setSlugState(data.available ? "available" : "taken");
        setSlugReason(data.reason ?? "");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSlugState("idle");
      }
    }, 350);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [slug, guesthouseId, room.id]);

  const saveSlug = async () => {
    if (slug === savedSlug.current) return;
    if (slug && !isValidSlug(slug)) return;
    setSavingSlug(true);
    const ok = await onUpdate({ slug: slug || null });
    if (ok) { savedSlug.current = slug; setSlugState(slug ? "available" : "idle"); setSlugReason(""); }
    setSavingSlug(false);
  };

  const fullUrl = buildUrl();

  return (
    <div style={{
      background: room.active ? "#fff" : "#FAFAF8",
      border: "1px solid #EFEDE8",
      borderLeft: `4px solid ${room.active ? accent : "#D0CEC8"}`,
      borderRadius: "12px",
      overflow: "hidden",
      transition: "box-shadow .15s",
    }}>
      {/* Ligne collapsed : toujours visible */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", cursor: "pointer", flexWrap: "wrap" }}
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-expanded={open}
      >
        {/* Icône chambre */}
        <span style={{ width: 32, height: 32, borderRadius: "8px", background: room.active ? `${accent}18` : "#F3F2EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BedDouble size={16} strokeWidth={1.4} color={room.active ? accent : "#A3A3A0"} />
        </span>

        {/* Nom */}
        <span style={{ fontSize: "14px", fontWeight: 700, color: room.active ? "var(--ink)" : "var(--ink-lighter)", flex: "1 1 120px", minWidth: 0 }}>{room.name}</span>

        {/* Badges */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 600, color: room.active ? accent : "#A3A3A0", background: room.active ? `${accent}14` : "#F3F2EE", padding: "3px 9px", borderRadius: "20px" }}>
            <Users size={11} strokeWidth={1.5} />{room.capacity} pers.
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 600, color: "#689D71", background: "#EEF5EF", padding: "3px 9px", borderRadius: "20px" }}>
            <Euro size={11} strokeWidth={1.5} />{room.basePrice} €/nuit
          </span>
          {!room.active && (
            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#A3A3A0", background: "#F3F2EE", padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Inactive
            </span>
          )}
        </div>

        {/* Bouton copier URL */}
        {fullUrl && room.active && (
          <button
            type="button"
            className={`btn ${copied ? "btn-green" : "btn-outline"}`}
            style={{ fontSize: "11.5px", padding: "5px 12px", flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
          >
            {copied ? <><Check size={12} strokeWidth={1.5} />Copié !</> : <><Copy size={12} strokeWidth={1.4} />Copier l&apos;URL</>}
          </button>
        )}

        {/* Chevron */}
        <ChevronDown size={16} strokeWidth={1.4} color="var(--ink-lighter)" style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
      </div>

      {/* Panneau déroulé */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F0EDE8" }}>

          {/* Champs d'édition */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }}>
            <input type="text" className="form-input" style={{ flex: "2 1 160px", fontWeight: 600 }} value={name}
              onChange={(e) => setName(e.target.value)} onBlur={() => name !== room.name && onUpdate({ name })}
              placeholder="Nom de la chambre" />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="1" className="form-input" style={{ width: "68px" }} value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                onBlur={() => parseInt(capacity) !== room.capacity && onUpdate({ capacity: parseInt(capacity) || 0 })}
                title="Capacité (personnes)" />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>pers.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="0" step="0.01" className="form-input" style={{ width: "86px" }} value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                onBlur={() => parseFloat(basePrice) !== room.basePrice && onUpdate({ basePrice: parseFloat(basePrice) || 0 })}
                title="Prix par nuit (€)" />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€/nuit</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="number" min="0" step="0.01" className="form-input" style={{ width: "86px" }} value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                onBlur={() => parseFloat(cleaningFee) !== room.cleaningFee && onUpdate({ cleaningFee: parseFloat(cleaningFee) || 0 })}
                title="Frais de ménage (€)" />
              <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€ ménage</span>
            </div>
          </div>

          {/* Slug + URL */}
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "#F8F6F1", borderRadius: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Identifiant URL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <input type="text" className="form-input" style={{ flex: "1 1 180px", background: "#fff" }} placeholder="chambre-rose" value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
              <SlugStateBadge state={slugState} reason={slugReason} />
              <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={saveSlug} disabled={savingSlug || slug === savedSlug.current || (!!slug && slugState !== "available")}>
                {savingSlug ? "…" : "Enregistrer"}
              </button>
            </div>
            {fullUrl ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: "1 1 220px", background: "#fff", border: "1px solid #EFEDE8", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", color: "#5B52B5", minWidth: 0 }}>
                  <ExternalLink size={12} strokeWidth={1.4} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullUrl}</span>
                </div>
                <button type="button" className={`btn ${copied ? "btn-green" : "btn-outline"}`} style={{ fontSize: "12px", padding: "6px 12px", flexShrink: 0 }} onClick={onCopy}>
                  {copied ? <><Check size={12} strokeWidth={1.5} />Copié !</> : <><Copy size={12} strokeWidth={1.4} />Copier</>}
                </button>
              </div>
            ) : !guesthouseSlug && ghSlug ? (
              <p style={{ fontSize: "11px", color: "#B7791F", marginTop: "6px" }}>Enregistrez d&apos;abord le préfixe d&apos;établissement pour activer le lien public.</p>
            ) : !savedSlug.current ? (
              <p style={{ fontSize: "11px", color: "var(--ink-lighter)", marginTop: "6px", fontStyle: "italic" }}>Enregistrez un identifiant pour activer le lien de réservation.</p>
            ) : null}
          </div>

          {/* Clauses contractuelles */}
          <div style={{ marginTop: "10px" }}>
            <button type="button" onClick={() => setClausesOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", padding: "4px 0", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, color: "var(--ink-lighter)" }}
              aria-expanded={clausesOpen}>
              <ChevronDown size={11} strokeWidth={1.5} style={{ transition: "transform .15s", transform: clausesOpen ? "rotate(0)" : "rotate(-90deg)" }} />
              Spécificités contractuelles
              {savedClauses.current && (
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#9B3E5A", background: "#F8E0E7", padding: "2px 7px", borderRadius: "10px" }}>Définies</span>
              )}
            </button>
            {clausesOpen && (
              <div style={{ marginTop: "6px" }}>
                <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "0 0 6px", lineHeight: 1.45 }}>
                  Injecté dans le contrat via{" "}
                  <span className="var-tag chambre" style={{ fontSize: "10.5px", cursor: "default", pointerEvents: "none", display: "inline-flex" }}>Clauses spécifiques</span>.
                </p>
                <textarea className="form-textarea" style={{ minHeight: "80px", fontSize: "12.5px" }}
                  placeholder="Ex. Cette chambre dispose d'une terrasse privative…"
                  value={clauses} maxLength={5000}
                  onChange={(e) => { setClauses(e.target.value); setClausesMsg(null); }} />
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                  <button type="button" className="btn btn-green" style={{ fontSize: "12px", padding: "6px 14px" }}
                    disabled={savingClauses || clauses === savedClauses.current}
                    onClick={async () => {
                      setSavingClauses(true); setClausesMsg(null);
                      const ok = await onUpdate({ specificClauses: clauses.trim() ? clauses : null } as Partial<Room>);
                      if (ok) { savedClauses.current = clauses.trim() ? clauses : ""; setClausesMsg({ kind: "ok", text: "Enregistré." }); }
                      else setClausesMsg({ kind: "err", text: "Erreur." });
                      setSavingClauses(false);
                    }}>
                    {savingClauses ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <span style={{ fontSize: "11px", color: "var(--ink-lighter)" }}>{clauses.length} / 5000</span>
                  {clausesMsg && <span style={{ fontSize: "11.5px", color: clausesMsg.kind === "ok" ? "#3E7A48" : "#b91c1c", fontWeight: 600 }}>{clausesMsg.text}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #EFEDE8", alignItems: "center", flexWrap: "wrap" }}>
            <button type="button"
              className={`btn ${room.active ? "btn-outline" : "btn-violet"}`}
              style={{ fontSize: "12px", padding: "6px 14px" }}
              onClick={() => onUpdate({ active: !room.active })}>
              {room.active ? "Désactiver" : "Activer"}
            </button>
            <button type="button" className="btn btn-danger" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={onRemove}>
              <Trash2 size={13} strokeWidth={1.4} />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
