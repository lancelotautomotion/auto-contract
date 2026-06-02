"use client";

import { useState, useRef } from "react";
import { Settings, Check } from "lucide-react";

export default function TableDhotesCapacitySettings({
  guesthouseId,
  initialCapacity,
}: {
  guesthouseId: string;
  initialCapacity: number;
}) {
  const [value, setValue] = useState(String(initialCapacity));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedValue = useRef(String(initialCapacity));

  const save = async (v: string) => {
    if (v === savedValue.current) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableDhotesCapacity: v }),
      });
      if (!res.ok) { setStatus("error"); return; }
      savedValue.current = v;
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
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
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Capacité maximale de la table d&apos;hôtes par soir</label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="number" min="0" step="1"
            className="form-input"
            style={{ width: "120px" }}
            value={value}
            onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
            onBlur={(e) => save(e.target.value)}
          />
          <span style={{ fontSize: "13px", color: "var(--ink-lighter)" }}>
            {unlimited ? "0 = pas de limite" : `${numericValue} couvert${numericValue > 1 ? "s" : ""}`}
          </span>
          {status === "saving" && (
            <span style={{ fontSize: "12px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Enregistrement…</span>
          )}
          {status === "saved" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#3E7A48", fontWeight: 600 }}>
              <Check size={13} strokeWidth={1.8} />Enregistré
            </span>
          )}
          {status === "error" && (
            <span style={{ fontSize: "12px", color: "#b91c1c" }}>Erreur lors de l&apos;enregistrement.</span>
          )}
        </div>
        <p style={{ fontSize: "11.5px", color: "var(--ink-lighter)", margin: "6px 0 0", lineHeight: 1.4 }}>
          Permet de bloquer les ventes de dîner au-delà de ce nombre. Réglez sur 0 pour ne fixer aucune limite.
        </p>
      </div>
    </div>
  );
}
