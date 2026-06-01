"use client";

import { useState } from "react";
import { Settings } from "lucide-react";

export default function TableDhotesCapacitySettings({
  guesthouseId,
  initialCapacity,
}: {
  guesthouseId: string;
  initialCapacity: number;
}) {
  const [value, setValue] = useState(String(initialCapacity));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableDhotesCapacity: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error ?? "Erreur lors de l'enregistrement." });
        return;
      }
      setMessage({ kind: "ok", text: "Capacité enregistrée." });
    } finally {
      setSaving(false);
    }
  };

  const numericValue = Math.max(0, parseInt(value) || 0);
  const unlimited = numericValue === 0;

  return (
    <div className="form-card">
      <div className="form-card-title">
        <Settings size={14} strokeWidth={1.7} />
        Paramètres
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-group" style={{ flex: "1 1 240px", margin: 0 }}>
          <label className="form-label">Capacité maximale de la table d&apos;hôtes par soir</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="number" min="0" step="1"
              className="form-input"
              style={{ width: "120px" }}
              value={value}
              onChange={(e) => { setValue(e.target.value); setMessage(null); }}
            />
            <span style={{ fontSize: "13px", color: "var(--ink-lighter)" }}>
              {unlimited ? "0 = pas de limite" : `${numericValue} couvert${numericValue > 1 ? "s" : ""}`}
            </span>
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "6px 0 0", lineHeight: 1.4 }}>
            Permet de bloquer les ventes de dîner au-delà de ce nombre. Réglez sur 0 pour ne fixer aucune limite.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" className="btn btn-green" onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {message && (
            <span style={{ fontSize: "12px", color: message.kind === "ok" ? "#3E7A48" : "#b91c1c" }}>{message.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
