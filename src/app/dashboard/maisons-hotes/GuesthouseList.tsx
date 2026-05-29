"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GuesthouseItem { id: string; name: string; roomCount: number; }

export default function GuesthouseList({ initial }: { initial: GuesthouseItem[] }) {
  const router = useRouter();
  const [items] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Le nom est requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/guesthouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de la création."); return; }
      router.push(`/dashboard/maisons-hotes/${data.guesthouse.id}/chambres`);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {items.length === 0 && !showForm && (
        <div className="form-card" style={{ maxWidth: "560px", textAlign: "center", padding: "40px 32px" }}>
          <p style={{ fontSize: "14px", color: "var(--ink-lighter)", marginBottom: "20px" }}>
            Vous n&apos;avez pas encore de maison d&apos;hôtes. Créez-en une pour gérer vos chambres et réservations.
          </p>
          <button className="btn btn-violet" onClick={() => setShowForm(true)}>Créer une maison d&apos;hôtes</button>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", marginBottom: "20px" }}>
          {items.map((g) => (
            <Link key={g.id} href={`/dashboard/maisons-hotes/${g.id}`} className="form-card" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#2C2C2A", marginBottom: "4px" }}>{g.name}</div>
              <div style={{ fontSize: "12.5px", color: "var(--ink-lighter)" }}>{g.roomCount} chambre{g.roomCount > 1 ? "s" : ""}</div>
            </Link>
          ))}
        </div>
      )}

      {items.length > 0 && !showForm && (
        <button className="btn btn-outline" onClick={() => setShowForm(true)}>+ Nouvelle maison d&apos;hôtes</button>
      )}

      {showForm && (
        <form onSubmit={create} className="form-card" style={{ maxWidth: "480px" }}>
          <div className="form-card-title">Nouvelle maison d&apos;hôtes</div>
          <div className="form-group">
            <label className="form-label">Nom <span className="req">*</span></label>
            <input className="form-input" autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="La Maison des Glycines" />
          </div>
          {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginBottom: "10px" }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
            <button type="submit" className="btn btn-violet" disabled={loading}>{loading ? "Création…" : "Créer"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
