"use client";

import { useState } from "react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  active: boolean;
}

const MAX_ROOMS = 5;
const MAX_CAPACITY = 15;

export default function RoomsManager({ guesthouseId, initialRooms }: { guesthouseId: string; initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [draft, setDraft] = useState({ name: "", capacity: "2", basePrice: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const capacityExceeded = totalCapacity > MAX_CAPACITY;
  const maxReached = rooms.length >= MAX_ROOMS;

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError("Le nom de la chambre est requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draft.name.trim(), capacity: draft.capacity, basePrice: draft.basePrice }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'ajout."); return; }
      setRooms((rs) => [...rs, data.room]);
      setWarning(data.warning ?? null);
      setDraft({ name: "", capacity: "2", basePrice: "" });
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
      if (!res.ok) { setRooms(prev); setError(data.error ?? "Erreur."); return; }
      setWarning(data.warning ?? null);
    } catch {
      setRooms(prev);
      setError("Impossible de contacter le serveur.");
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
    <div className="form-card" style={{ maxWidth: "860px" }}>
      <div className="form-card-title">
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path d="M2 12V6.5L7 2l5 4.5V12a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
        Chambres ({rooms.length}/{MAX_ROOMS})
      </div>
      <p style={{ fontSize: "13px", color: "var(--ink-lighter)", marginBottom: "16px" }}>
        Configurez les chambres de votre maison d&apos;hôtes. Capacité totale : <strong>{totalCapacity}</strong> / {MAX_CAPACITY} personnes.
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

      {rooms.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic", padding: "12px 0" }}>Aucune chambre configurée.</p>
      )}

      {rooms.map((room) => (
        <div key={room.id} className="room-row" style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
          <input
            type="text" className="form-input" style={{ flex: "2 1 160px" }} value={room.name}
            onChange={(e) => setRooms((rs) => rs.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)))}
            onBlur={(e) => updateRoom(room.id, { name: e.target.value })}
          />
          <input
            type="number" min="1" className="form-input" style={{ flex: "0 1 90px" }} value={room.capacity}
            onChange={(e) => setRooms((rs) => rs.map((r) => (r.id === room.id ? { ...r, capacity: parseInt(e.target.value) || 0 } : r)))}
            onBlur={(e) => updateRoom(room.id, { capacity: parseInt(e.target.value) || 0 })}
            title="Capacité (personnes)"
          />
          <input
            type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 110px" }} value={room.basePrice}
            onChange={(e) => setRooms((rs) => rs.map((r) => (r.id === room.id ? { ...r, basePrice: parseFloat(e.target.value) || 0 } : r)))}
            onBlur={(e) => updateRoom(room.id, { basePrice: parseFloat(e.target.value) || 0 })}
            title="Prix par nuit (€)"
          />
          <button
            type="button"
            className={`btn ${room.active ? "btn-outline" : "btn-violet"}`}
            style={{ fontSize: "12px", padding: "6px 12px", flexShrink: 0 }}
            onClick={() => updateRoom(room.id, { active: !room.active })}
          >
            {room.active ? "Active" : "Inactive"}
          </button>
          <button type="button" className="option-del" onClick={() => removeRoom(room.id)} title="Supprimer" aria-label="Supprimer">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M2.5 3.5h9M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M3.5 3.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ))}

      {warning && (
        <p style={{ fontSize: "12px", color: "#B7791F", marginTop: "8px" }}>{warning}</p>
      )}

      {!maxReached ? (
        <form onSubmit={addRoom} style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "16px", flexWrap: "wrap", borderTop: "1px solid #EFEDE8", paddingTop: "16px" }}>
          <input type="text" className="form-input" style={{ flex: "2 1 160px" }} placeholder="Nom / numéro de la chambre" value={draft.name} onChange={(e) => { setDraft((d) => ({ ...d, name: e.target.value })); setError(""); }} />
          <input type="number" min="1" className="form-input" style={{ flex: "0 1 90px" }} placeholder="Pers." value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))} />
          <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 110px" }} placeholder="Prix/nuit" value={draft.basePrice} onChange={(e) => setDraft((d) => ({ ...d, basePrice: e.target.value }))} />
          <button type="submit" className="btn btn-green" style={{ flexShrink: 0 }} disabled={loading}>
            {loading ? "Ajout…" : "Ajouter"}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: "12.5px", color: "var(--ink-lighter)", marginTop: "16px", fontStyle: "italic" }}>
          Limite de {MAX_ROOMS} chambres atteinte pour une maison d&apos;hôtes.
        </p>
      )}

      {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
