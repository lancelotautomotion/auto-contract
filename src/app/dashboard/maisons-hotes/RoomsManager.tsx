"use client";

import { useEffect, useRef, useState } from "react";
import { isValidSlug, slugError, suggestSlug } from "@/lib/slug";

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

  // Slug d'établissement
  const [ghSlug, setGhSlug] = useState(initialGuesthouseSlug ?? "");
  const [savedGhSlug, setSavedGhSlug] = useState(initialGuesthouseSlug ?? "");
  const [ghSlugState, setGhSlugState] = useState<AvailState>("idle");
  const [ghSlugReason, setGhSlugReason] = useState("");
  const [ghSlugSaving, setGhSlugSaving] = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const capacityExceeded = totalCapacity > MAX_CAPACITY;
  const maxReached = rooms.length >= MAX_ROOMS;

  // Vérif live du slug établissement
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
        if ((e as Error).name !== "AbortError") {
          setGhSlugState("idle");
        }
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
      if (!res.ok) {
        setGhSlugState("taken");
        setGhSlugReason(data.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      setSavedGhSlug(ghSlug);
    } finally {
      setGhSlugSaving(false);
    }
  };

  // Slug suggéré à la création — uniquement si le gérant n'a pas tapé manuellement
  useEffect(() => {
    if (!showAdd) return;
    if (draftSlugTouched) return;
    const s = suggestSlug(draft.name);
    setDraft((d) => ({ ...d, slug: s }));
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
    if (!draft.name.trim()) { setError("Le nom de la chambre est requis."); return; }
    if (draft.slug && slugError(draft.slug)) { setError(slugError(draft.slug)!); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          capacity: draft.capacity,
          basePrice: draft.basePrice,
          cleaningFee: parseFloat(draft.cleaningFee) || 0,
          slug: draft.slug || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'ajout."); return; }
      setRooms((rs) => [...rs, data.room]);
      setWarning(data.warning ?? null);
      setDraft({ name: "", capacity: "2", basePrice: "", cleaningFee: "", slug: "" });
      setDraftSlugTouched(false);
      setShowAdd(false);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (id: string, patch: Partial<Room>) => {
    const prev = rooms;
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) { setRooms(prev); setError(data.error ?? "Erreur."); return false; }
      setWarning(data.warning ?? null);
      return true;
    } catch {
      setRooms(prev);
      setError("Impossible de contacter le serveur.");
      return false;
    }
  };

  const removeRoom = async (id: string) => {
    if (!confirm("Supprimer cette chambre ?")) return;
    const prev = rooms;
    setRooms((rs) => rs.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) setRooms(prev);
    } catch {
      setRooms(prev);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: "880px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "6px" }}>
        <div className="form-card-title" style={{ marginBottom: 0 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M2 12V6.5L7 2l5 4.5V12a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          Chambres ({rooms.length}/{MAX_ROOMS})
        </div>
        {!maxReached && (
          <button type="button" className="btn btn-green" onClick={() => { setShowAdd((s) => !s); setError(""); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
              <path d="M7 2v10M2 7h10"/>
            </svg>
            Nouvelle chambre
          </button>
        )}
      </div>
      <p style={{ fontSize: "13px", color: "var(--ink-lighter)", marginBottom: "16px" }}>
        Chaque chambre se loue <strong>entière</strong>, pour un nombre de personnes donné. Capacité totale : <strong>{totalCapacity}</strong> / {MAX_CAPACITY} personnes.
      </p>

      {capacityExceeded && (
        <div style={{ display: "flex", gap: "10px", background: "#FEF3CD", border: "1px solid #F5C842", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", fontSize: "12.5px", color: "#7B4F0A" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ flexShrink: 0, color: "#B7791F", marginTop: "1px" }}>
            <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
          </svg>
          <span>La capacité totale ({totalCapacity} pers.) dépasse le plafond légal de {MAX_CAPACITY} personnes pour une maison d&apos;hôtes.</span>
        </div>
      )}

      {/* Préfixe d'URL d'établissement */}
      <div style={{
        marginBottom: "20px", padding: "14px 16px",
        background: "#F8F6F1", border: "1px solid #EFEDE8", borderRadius: "12px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
          Préfixe d&apos;URL de votre établissement
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "stretch", flex: "1 1 280px", border: "1px solid #D9D7D0", borderRadius: "10px", background: "#FFF", overflow: "hidden" }}>
            <span style={{ padding: "0 12px", display: "flex", alignItems: "center", fontSize: "12.5px", color: "var(--ink-lighter)", background: "#FAF9F6", borderRight: "1px solid #EFEDE8" }}>
              kordia.fr/book/
            </span>
            <input
              type="text"
              placeholder="le-clous"
              value={ghSlug}
              onChange={(e) => setGhSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px", fontSize: "13px", fontFamily: "inherit", color: "var(--ink)", background: "transparent" }}
            />
          </div>
          <SlugStateBadge state={ghSlugState} reason={ghSlugReason} />
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: "12px", padding: "8px 14px" }}
            onClick={saveGhSlug}
            disabled={ghSlugSaving || ghSlug === savedGhSlug || ghSlugState !== "available"}
          >
            {ghSlugSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "8px 0 0", lineHeight: 1.4 }}>
          Toutes vos chambres seront accessibles via ce préfixe. Doit être unique parmi tous les hébergements Kordia. Lettres, chiffres et tirets uniquement.
        </p>
      </div>

      {rooms.length === 0 && !showAdd && (
        <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic", padding: "12px 0" }}>Aucune chambre configurée.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            origin={origin}
            guesthouseId={guesthouseId}
            guesthouseSlug={savedGhSlug}
            copied={copiedId === room.id}
            onCopy={() => copyUrl(room)}
            onUpdate={(patch) => updateRoom(room.id, patch)}
            onRemove={() => removeRoom(room.id)}
            buildUrl={() => roomUrl(room)}
          />
        ))}
      </div>

      {warning && (
        <p style={{ fontSize: "12px", color: "#B7791F", marginTop: "8px" }}>{warning}</p>
      )}

      {showAdd && !maxReached && (
        <form onSubmit={addRoom} style={{ marginTop: "16px", borderTop: "1px solid #EFEDE8", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>Nouvelle chambre</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" className="form-input" style={{ flex: "2 1 200px" }} placeholder="Nom / numéro de la chambre" value={draft.name} onChange={(e) => { setDraft((d) => ({ ...d, name: e.target.value })); setError(""); }} autoFocus />
            <input type="number" min="1" className="form-input" style={{ flex: "0 1 90px" }} placeholder="Pers." value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))} />
            <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 110px" }} placeholder="Prix/nuit" value={draft.basePrice} onChange={(e) => setDraft((d) => ({ ...d, basePrice: e.target.value }))} />
            <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 110px" }} placeholder="Ménage €" value={draft.cleaningFee} onChange={(e) => setDraft((d) => ({ ...d, cleaningFee: e.target.value }))} title="Frais de ménage (€)" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>Identifiant URL :</span>
            <input
              type="text"
              className="form-input"
              style={{ flex: "1 1 220px" }}
              placeholder="chambre-rose"
              value={draft.slug}
              onChange={(e) => { setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })); setDraftSlugTouched(true); }}
            />
            {draft.slug && savedGhSlug && (
              <span style={{ fontSize: "11.5px", color: "var(--ink-lighter)" }}>
                → kordia.fr/book/{savedGhSlug}/<strong>{draft.slug}</strong>
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? "Ajout…" : "Ajouter la chambre"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowAdd(false); setDraft({ name: "", capacity: "2", basePrice: "", cleaningFee: "", slug: "" }); setDraftSlugTouched(false); setError(""); }}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {maxReached && (
        <p style={{ fontSize: "12.5px", color: "var(--ink-lighter)", marginTop: "16px", fontStyle: "italic" }}>
          Limite de {MAX_ROOMS} chambres atteinte pour une maison d&apos;hôtes.
        </p>
      )}

      {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

function SlugStateBadge({ state, reason }: { state: AvailState; reason: string }) {
  if (state === "idle") return null;
  if (state === "checking") {
    return <span style={{ fontSize: "11.5px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Vérification…</span>;
  }
  if (state === "available") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#3E7A48" }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7l3 3 6-6"/></svg>
        Disponible
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: "#b91c1c" }} title={reason}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg>
      {state === "invalid" ? "Invalide" : "Indisponible"}
    </span>
  );
}

function RoomCard({
  room, origin, guesthouseId, guesthouseSlug, copied,
  onCopy, onUpdate, onRemove, buildUrl,
}: {
  room: Room;
  origin: string;
  guesthouseId: string;
  guesthouseSlug: string;
  copied: boolean;
  onCopy: () => void;
  onUpdate: (patch: Partial<Room>) => Promise<boolean>;
  onRemove: () => void;
  buildUrl: () => string;
}) {
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [basePrice, setBasePrice] = useState(String(room.basePrice));
  const [cleaningFee, setCleaningFee] = useState(String(room.cleaningFee));
  const [slug, setSlug] = useState(room.slug ?? "");
  const [slugState, setSlugState] = useState<AvailState>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [savingSlug, setSavingSlug] = useState(false);
  const savedSlug = useRef(room.slug ?? "");

  // Clauses spécifiques (contrat)
  const [clausesOpen, setClausesOpen] = useState(false);
  const [clauses, setClauses] = useState(room.specificClauses ?? "");
  const savedClauses = useRef(room.specificClauses ?? "");
  const [savingClauses, setSavingClauses] = useState(false);
  const [clausesMsg, setClausesMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Sync si la prop change (ex. rechargement)
  useEffect(() => { setName(room.name); }, [room.name]);
  useEffect(() => { setCapacity(String(room.capacity)); }, [room.capacity]);
  useEffect(() => { setBasePrice(String(room.basePrice)); }, [room.basePrice]);
  useEffect(() => { setCleaningFee(String(room.cleaningFee)); }, [room.cleaningFee]);
  useEffect(() => { setSlug(room.slug ?? ""); savedSlug.current = room.slug ?? ""; }, [room.slug]);
  useEffect(() => { setClauses(room.specificClauses ?? ""); savedClauses.current = room.specificClauses ?? ""; }, [room.specificClauses]);

  // Vérif live du slug chambre
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
    if (ok) {
      savedSlug.current = slug;
      setSlugState(slug ? "available" : "idle");
      setSlugReason("");
    }
    setSavingSlug(false);
  };

  const fullUrl = buildUrl();

  return (
    <div style={{
      border: "1px solid #EFEDE8",
      borderRadius: "12px",
      padding: "14px 16px",
      background: room.active ? "#FFFFFF" : "#FAF9F6",
    }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text" className="form-input" style={{ flex: "2 1 180px", fontWeight: 600 }} value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== room.name && onUpdate({ name })}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: "0 1 130px" }}>
          <input
            type="number" min="1" className="form-input" style={{ width: "70px" }} value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            onBlur={() => parseInt(capacity) !== room.capacity && onUpdate({ capacity: parseInt(capacity) || 0 })}
            title="Capacité (personnes)"
          />
          <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>pers.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: "0 1 130px" }}>
          <input
            type="number" min="0" step="0.01" className="form-input" style={{ width: "90px" }} value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            onBlur={() => parseFloat(basePrice) !== room.basePrice && onUpdate({ basePrice: parseFloat(basePrice) || 0 })}
            title="Prix par nuit (€)"
          />
          <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€/nuit</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: "0 1 140px" }}>
          <input
            type="number" min="0" step="0.01" className="form-input" style={{ width: "90px" }} value={cleaningFee}
            onChange={(e) => setCleaningFee(e.target.value)}
            onBlur={() => parseFloat(cleaningFee) !== room.cleaningFee && onUpdate({ cleaningFee: parseFloat(cleaningFee) || 0 })}
            title="Frais de ménage (€)"
          />
          <span style={{ fontSize: "12px", color: "var(--ink-lighter)" }}>€ ménage</span>
        </div>
        <button
          type="button"
          className={`btn ${room.active ? "btn-outline" : "btn-violet"}`}
          style={{ fontSize: "12px", padding: "6px 12px", flexShrink: 0 }}
          onClick={() => onUpdate({ active: !room.active })}
        >
          {room.active ? "Active" : "Inactive"}
        </button>
        <button type="button" className="option-del" onClick={onRemove} title="Supprimer" aria-label="Supprimer">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M2.5 3.5h9M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M3.5 3.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Slug + lien de réservation */}
      {room.active ? (
        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Identifiant URL de cette chambre
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: "1 1 240px" }}
              placeholder="chambre-rose"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
            <SlugStateBadge state={slugState} reason={slugReason} />
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: "12px", padding: "6px 12px" }}
              onClick={saveSlug}
              disabled={savingSlug || slug === savedSlug.current || (!!slug && slugState !== "available")}
            >
              {savingSlug ? "…" : "Enregistrer"}
            </button>
          </div>

          {/* URL preview + copier */}
          {!guesthouseSlug ? (
            <p style={{ fontSize: "11.5px", color: "#B7791F", margin: "8px 0 0" }}>
              Définissez d&apos;abord le préfixe d&apos;URL de votre établissement ci-dessus pour activer le lien public.
            </p>
          ) : !savedSlug.current ? (
            <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "8px 0 0", fontStyle: "italic" }}>
              Enregistrez un identifiant pour activer le lien de réservation de cette chambre.
            </p>
          ) : fullUrl ? (
            <>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 5px" }}>
                Lien de réservation
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{
                  flex: "1 1 240px", minWidth: 0,
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#F5F4F0", border: "1px solid #EFEDE8", borderRadius: "8px",
                  padding: "8px 10px", fontSize: "12.5px", color: "#5B52B5",
                }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ flexShrink: 0 }}>
                    <rect x="1" y="1" width="12" height="12" rx="2.5"/>
                    <path d="M4.5 7.5l3-3m0 0H5.5m2 0V6.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullUrl}</span>
                </div>
                <button
                  type="button"
                  className={`btn ${copied ? "btn-green" : "btn-outline"}`}
                  style={{ fontSize: "12px", padding: "8px 14px", flexShrink: 0 }}
                  onClick={onCopy}
                >
                  {copied ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7l3 3 6-6"/></svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1.5" y="4.5" width="8" height="8" rx="1.5"/><path d="M4.5 4.5V3A1.5 1.5 0 016 1.5h6A1.5 1.5 0 0113.5 3v6A1.5 1.5 0 0112 10.5h-1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Copier
                    </>
                  )}
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--ink-lighter)", margin: "5px 0 0" }}>
                Collez ce lien sur la page de cette chambre, sur votre propre site.
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", fontStyle: "italic", margin: "10px 0 0" }}>
          Chambre inactive — non réservable, aucun lien public.
        </p>
      )}

      {/* Clauses contractuelles spécifiques à cette chambre */}
      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed #EFEDE8" }}>
        <button
          type="button"
          onClick={() => setClausesOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "transparent", border: "none", padding: "2px 0",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: "12px", fontWeight: 600, color: "var(--ink-lighter)",
          }}
          aria-expanded={clausesOpen}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform .15s", transform: clausesOpen ? "rotate(0)" : "rotate(-90deg)" }}>
            <path d="M3 4.5l3 3 3-3"/>
          </svg>
          Spécificités contractuelles
          {savedClauses.current && (
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#9B3E5A", background: "#F8E0E7", padding: "2px 7px", borderRadius: "10px" }}>Définies</span>
          )}
        </button>
        {clausesOpen && (
          <div style={{ marginTop: "8px" }}>
            <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "0 0 6px", lineHeight: 1.45 }}>
              Texte libre injecté dans le contrat via la balise <code style={{ background: "#F5F4F0", padding: "1px 6px", borderRadius: "4px", fontSize: "11px", color: "#5B52B5" }}>{"{{specificites_chambre}}"}</code>. Laissez vide si aucune particularité.
            </p>
            <textarea
              className="form-textarea"
              style={{ minHeight: "80px", fontSize: "12.5px" }}
              placeholder="Ex. Cette chambre dispose d'une terrasse privative — usage entre 8h et 22h pour respecter le voisinage."
              value={clauses}
              maxLength={5000}
              onChange={(e) => { setClauses(e.target.value); setClausesMsg(null); }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
              <button
                type="button"
                className="btn btn-green"
                style={{ fontSize: "12px", padding: "6px 14px" }}
                disabled={savingClauses || clauses === savedClauses.current}
                onClick={async () => {
                  setSavingClauses(true);
                  setClausesMsg(null);
                  const ok = await onUpdate({ specificClauses: clauses.trim() ? clauses : null } as Partial<Room>);
                  if (ok) {
                    savedClauses.current = clauses.trim() ? clauses : "";
                    setClausesMsg({ kind: "ok", text: "Enregistré." });
                  } else {
                    setClausesMsg({ kind: "err", text: "Erreur." });
                  }
                  setSavingClauses(false);
                }}
              >
                {savingClauses ? "Enregistrement…" : "Enregistrer"}
              </button>
              <span style={{ fontSize: "11px", color: "var(--ink-lighter)" }}>{clauses.length} / 5000</span>
              {clausesMsg && (
                <span style={{ fontSize: "11.5px", color: clausesMsg.kind === "ok" ? "#3E7A48" : "#b91c1c", fontWeight: 600 }}>{clausesMsg.text}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
