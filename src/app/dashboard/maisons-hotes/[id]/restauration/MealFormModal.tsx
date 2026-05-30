"use client";

import { useEffect, useState } from "react";

export type MealService = "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
export type MealTag = "VEGETARIAN" | "VEGAN" | "GLUTEN_FREE" | "LOCAL";

export interface MealDraft {
  id?: string;
  name: string;
  description: string;
  price: string;
  service: MealService;
  tags: MealTag[];
}

const SERVICE_OPTIONS: { value: MealService; label: string }[] = [
  { value: "BREAKFAST", label: "Petit-déjeuner" },
  { value: "LUNCH", label: "Déjeuner" },
  { value: "DINNER", label: "Dîner / Table d'hôtes" },
  { value: "OTHER", label: "Autre" },
];

export const TAG_OPTIONS: { value: MealTag; label: string; bg: string; color: string }[] = [
  { value: "VEGETARIAN", label: "Végétarien", bg: "#E6F0E8", color: "#3E7A48" },
  { value: "VEGAN", label: "Vegan", bg: "#D1EDD4", color: "#2D6A31" },
  { value: "GLUTEN_FREE", label: "Sans gluten", bg: "#FCE3B0", color: "#8C6A00" },
  { value: "LOCAL", label: "Local", bg: "#EFEDFC", color: "#5B52B5" },
];

export default function MealFormModal({
  open,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  open: boolean;
  initial: MealDraft | null;
  onClose: () => void;
  onSubmit: (draft: MealDraft) => void | Promise<void>;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<MealDraft>(() => initial ?? blankDraft());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(initial ?? blankDraft());
      setError("");
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleTag = (t: MealTag) =>
    setDraft((d) => ({ ...d, tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError("Le nom est requis."); return; }
    setError("");
    await onSubmit(draft);
  };

  const isEdit = !!initial?.id;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(28,28,26,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", zIndex: 1000, animation: "mfm-fade 120ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF", borderRadius: "16px", width: "100%",
          maxWidth: "540px", maxHeight: "calc(100dvh - 40px)", overflow: "auto",
          boxShadow: "0 24px 48px rgba(28,28,26,0.18)",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #EFEDE8" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--ink)" }}>
            {isEdit ? "Modifier la formule" : "Nouvelle formule"}
          </div>
          <button
            type="button" onClick={onClose} aria-label="Fermer"
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#71716E" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
          <div className="form-group">
            <label className="form-label">Nom <span className="req">*</span></label>
            <input
              className="form-input" autoFocus
              placeholder="ex. Petit-déjeuner continental"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Moment de service</label>
              <select
                className="form-input"
                value={draft.service}
                onChange={(e) => setDraft((d) => ({ ...d, service: e.target.value as MealService }))}
              >
                {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prix (€)</label>
              <input
                type="number" min="0" step="0.01" className="form-input"
                placeholder="0,00"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / composition <span style={{ fontWeight: 400, color: "var(--ink-lighter)" }}>(visible par le client)</span></label>
            <textarea
              className="form-textarea"
              style={{ minHeight: "80px" }}
              placeholder="ex. Croissant, pain au chocolat, jus d'orange frais, café"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TAG_OPTIONS.map((t) => {
                const on = draft.tags.includes(t.value);
                return (
                  <button
                    key={t.value} type="button"
                    onClick={() => toggleTag(t.value)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "6px 12px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      border: on ? `1.5px solid ${t.color}` : "1.5px solid #EFEDE8",
                      background: on ? t.bg : "#FFFFFF",
                      color: on ? t.color : "var(--ink-lighter)",
                      fontFamily: "inherit", transition: "all .12s",
                    }}
                  >
                    <span style={{
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: on ? t.color : "transparent",
                      border: on ? "none" : "1.5px solid #D1D0CC",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {on && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1.5 4l1.5 1.5L6.5 2"/>
                        </svg>
                      )}
                    </span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p style={{ fontSize: "12px", color: "#b91c1c", margin: "8px 0 0" }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid #EFEDE8", paddingTop: "16px" }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="btn btn-green" disabled={saving}>
              {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la formule"}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes mfm-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}

function blankDraft(): MealDraft {
  return { name: "", description: "", price: "", service: "DINNER", tags: [] };
}

export { SERVICE_OPTIONS };
