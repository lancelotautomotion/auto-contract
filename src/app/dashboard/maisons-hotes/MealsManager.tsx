"use client";

import { useMemo, useState } from "react";
import MealFormModal, { TAG_OPTIONS, type MealDraft, type MealService, type MealTag } from "./[id]/restauration/MealFormModal";

export type { MealService } from "./[id]/restauration/MealFormModal";

export interface GuesthouseMeal {
  id: string;
  name: string;
  description: string | null;
  price: number;
  service: MealService;
  tags: MealTag[];
  active: boolean;
}

// Ordre d'affichage des sections par moment de service
const SERVICE_SECTIONS: { value: MealService; label: string; icon: React.ReactNode }[] = [
  {
    value: "BREAKFAST",
    label: "Petits-déjeuners",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
  },
  {
    value: "LUNCH",
    label: "Déjeuners",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>
    ),
  },
  {
    value: "DINNER",
    label: "Dîners / Table d'hôtes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11h18"/>
        <path d="M5 11a7 7 0 0114 0"/>
        <path d="M4 15h16"/>
        <path d="M2 19h20"/>
      </svg>
    ),
  },
  {
    value: "OTHER",
    label: "Autres formules",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
];

const TAG_MAP = Object.fromEntries(TAG_OPTIONS.map((t) => [t.value, t]));

function MealTagBadge({ tag }: { tag: MealTag }) {
  const cfg = TAG_MAP[tag];
  if (!cfg) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: "10.5px", fontWeight: 700,
      padding: "2px 8px", borderRadius: "20px",
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

export default function MealsManager({
  guesthouseId,
  initialMeals,
}: {
  guesthouseId: string;
  initialMeals: GuesthouseMeal[];
}) {
  const [meals, setMeals] = useState<GuesthouseMeal[]>(initialMeals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GuesthouseMeal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<MealService, GuesthouseMeal[]>();
    for (const s of SERVICE_SECTIONS) map.set(s.value, []);
    for (const m of meals) {
      const bucket = map.get(m.service) ?? [];
      bucket.push(m);
      map.set(m.service, bucket);
    }
    return map;
  }, [meals]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (m: GuesthouseMeal) => { setEditing(m); setModalOpen(true); };

  const handleSubmit = async (draft: MealDraft) => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price: draft.price,
        service: draft.service,
        tags: draft.tags,
      };
      if (draft.id) {
        const res = await fetch(`/api/guesthouse/${guesthouseId}/meals/${draft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Erreur lors de la mise à jour."); return; }
        setMeals((ms) => ms.map((m) => (m.id === draft.id ? data.meal : m)));
      } else {
        const res = await fetch(`/api/guesthouse/${guesthouseId}/meals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Erreur lors de la création."); return; }
        setMeals((ms) => [...ms, data.meal]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const updateMeal = async (id: string, patch: Partial<GuesthouseMeal>) => {
    const prev = meals;
    setMeals((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/meals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) setMeals(prev);
    } catch { setMeals(prev); }
  };

  const removeMeal = async (id: string) => {
    if (!confirm("Supprimer cette formule ?")) return;
    const prev = meals;
    setMeals((ms) => ms.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/meals/${id}`, { method: "DELETE" });
      if (!res.ok) setMeals(prev);
    } catch { setMeals(prev); }
  };

  const draftFromMeal = (m: GuesthouseMeal | null): MealDraft | null =>
    m ? {
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      price: String(m.price),
      service: m.service,
      tags: m.tags ?? [],
    } : null;

  return (
    <div className="form-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
        <div>
          <div className="form-card-title" style={{ marginBottom: "4px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h18M5 11a7 7 0 0114 0M4 15h16M2 19h20"/>
            </svg>
            Mes formules ({meals.length})
          </div>
          <p style={{ fontSize: "13px", color: "var(--ink-lighter)", margin: 0 }}>
            Configurez vos formules. Elles seront proposées dans le formulaire de réservation et apparaîtront sur le contrat.
          </p>
        </div>
        <button type="button" className="btn btn-green" onClick={openNew}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7 2v10M2 7h10"/>
          </svg>
          Nouvelle formule
        </button>
      </div>

      {meals.length === 0 ? (
        <div style={{
          marginTop: "16px", padding: "32px 16px",
          background: "#F8F6F1", borderRadius: "12px",
          textAlign: "center", fontSize: "13px", color: "var(--ink-lighter)",
        }}>
          Aucune formule pour le moment. Cliquez sur <strong>Nouvelle formule</strong> pour démarrer.
        </div>
      ) : (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {SERVICE_SECTIONS.map((s) => {
            const items = grouped.get(s.value) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={s.value}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  fontSize: "11px", fontWeight: 700, color: "#5B52B5",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  marginBottom: "10px",
                }}>
                  <span style={{ color: "#5B52B5" }}>{s.icon}</span>
                  {s.label} <span style={{ color: "#A3A3A0", fontWeight: 600 }}>· {items.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {items.map((meal) => (
                    <div
                      key={meal.id}
                      style={{
                        border: "1px solid #EFEDE8",
                        borderRadius: "12px",
                        padding: "14px 16px",
                        background: meal.active ? "#FFFFFF" : "#FAF9F6",
                        display: "flex", gap: "12px",
                        alignItems: "flex-start", flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>{meal.name}</span>
                          {(meal.tags ?? []).map((t) => <MealTagBadge key={t} tag={t} />)}
                          {!meal.active && (
                            <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#71716E", background: "#EFEDE8", padding: "2px 8px", borderRadius: "20px" }}>
                              Inactif
                            </span>
                          )}
                        </div>
                        {meal.description && (
                          <p style={{ fontSize: "12.5px", color: "var(--ink-lighter)", margin: "6px 0 0", whiteSpace: "pre-wrap" }}>
                            {meal.description}
                          </p>
                        )}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#689D71", flexShrink: 0, alignSelf: "center" }}>
                        {meal.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignSelf: "center" }}>
                        <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => openEdit(meal)}>
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={`btn ${meal.active ? "btn-outline" : "btn-violet"}`}
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                          onClick={() => updateMeal(meal.id, { active: !meal.active })}
                        >
                          {meal.active ? "Actif" : "Inactif"}
                        </button>
                        <button type="button" className="option-del" onClick={() => removeMeal(meal.id)} title="Supprimer" aria-label="Supprimer">
                          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                            <path d="M2.5 3.5h9M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M3.5 3.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginTop: "10px" }}>{error}</p>}

      <MealFormModal
        open={modalOpen}
        initial={draftFromMeal(editing)}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
