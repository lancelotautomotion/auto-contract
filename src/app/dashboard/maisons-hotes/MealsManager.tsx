"use client";

import { useState } from "react";

export type MealService = "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";

export interface GuesthouseMeal {
  id: string;
  name: string;
  description: string | null;
  price: number;
  service: MealService;
  active: boolean;
}

const SERVICE_OPTIONS: { value: MealService; label: string }[] = [
  { value: "BREAKFAST", label: "Petit-déjeuner" },
  { value: "LUNCH", label: "Déjeuner" },
  { value: "DINNER", label: "Dîner / Table d'hôtes" },
  { value: "OTHER", label: "Autre" },
];

const serviceLabel = (s: MealService) =>
  SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s;

export default function MealsManager({
  guesthouseId,
  initialMeals,
}: {
  guesthouseId: string;
  initialMeals: GuesthouseMeal[];
}) {
  const [meals, setMeals] = useState<GuesthouseMeal[]>(initialMeals);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    price: "",
    service: "DINNER" as MealService,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("Le nom du menu est requis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          price: draft.price,
          service: draft.service,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'ajout.");
        return;
      }
      setMeals((ms) => [...ms, data.meal]);
      setDraft({ name: "", description: "", price: "", service: "DINNER" });
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
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
      const data = await res.json();
      if (!res.ok) {
        setMeals(prev);
        setError(data.error ?? "Erreur.");
      }
    } catch {
      setMeals(prev);
      setError("Impossible de contacter le serveur.");
    }
  };

  const removeMeal = async (id: string) => {
    if (!confirm("Supprimer ce menu ?")) return;
    const prev = meals;
    setMeals((ms) => ms.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/guesthouse/${guesthouseId}/meals/${id}`, { method: "DELETE" });
      if (!res.ok) setMeals(prev);
    } catch {
      setMeals(prev);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: "860px" }}>
      <div className="form-card-title">
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path d="M2 12h10M3.5 12V6.5a3.5 3.5 0 017 0V12M5.5 2.5v2M7 2v2.5M8.5 2.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Restauration ({meals.length} menu{meals.length > 1 ? "s" : ""})
      </div>
      <p style={{ fontSize: "13px", color: "var(--ink-lighter)", marginBottom: "16px" }}>
        Configurez vos formules (petit-déjeuner, table d&apos;hôtes, etc.). Elles seront proposées dans le formulaire de réservation et apparaîtront sur le contrat.
      </p>

      {meals.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic", padding: "12px 0" }}>
          Aucun menu configuré.
        </p>
      )}

      {meals.map((meal) => {
        const isEditing = editing === meal.id;
        return (
          <div
            key={meal.id}
            style={{
              border: "1px solid #EFEDE8",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "10px",
              background: meal.active ? "#FFFFFF" : "#FAF9F6",
            }}
          >
            {!isEditing ? (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)" }}>{meal.name}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#5B52B5", background: "#EFEDFC", padding: "2px 8px", borderRadius: "20px" }}>
                      {serviceLabel(meal.service)}
                    </span>
                    {!meal.active && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#71716E", background: "#EFEDE8", padding: "2px 8px", borderRadius: "20px" }}>
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
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#689D71", flexShrink: 0 }}>
                  {meal.price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => setEditing(meal.id)}>
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
            ) : (
              <MealEditRow
                meal={meal}
                onCancel={() => setEditing(null)}
                onSave={async (patch) => {
                  await updateMeal(meal.id, patch);
                  setEditing(null);
                }}
              />
            )}
          </div>
        );
      })}

      <form onSubmit={addMeal} style={{ borderTop: "1px solid #EFEDE8", paddingTop: "16px", marginTop: "8px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", marginBottom: "10px" }}>Ajouter un menu</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: "2 1 200px" }}
            placeholder="Nom (ex. Petit-déj continental)"
            value={draft.name}
            onChange={(e) => { setDraft((d) => ({ ...d, name: e.target.value })); setError(""); }}
          />
          <select
            className="form-input"
            style={{ flex: "1 1 140px" }}
            value={draft.service}
            onChange={(e) => setDraft((d) => ({ ...d, service: e.target.value as MealService }))}
          >
            {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-input"
            style={{ flex: "0 1 110px" }}
            placeholder="Prix (€)"
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
          />
        </div>
        <textarea
          className="form-textarea"
          placeholder="Description / composition du menu (visible par le client)"
          style={{ marginBottom: "8px", minHeight: "60px" }}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
        <button type="submit" className="btn btn-green" disabled={loading}>
          {loading ? "Ajout…" : "Ajouter le menu"}
        </button>
      </form>

      {error && <p style={{ fontSize: "12px", color: "#b91c1c", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

function MealEditRow({
  meal,
  onCancel,
  onSave,
}: {
  meal: GuesthouseMeal;
  onCancel: () => void;
  onSave: (patch: Partial<GuesthouseMeal>) => void | Promise<void>;
}) {
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description ?? "");
  const [price, setPrice] = useState(String(meal.price));
  const [service, setService] = useState<MealService>(meal.service);
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <input type="text" className="form-input" style={{ flex: "2 1 200px" }} value={name} onChange={(e) => setName(e.target.value)} />
        <select className="form-input" style={{ flex: "1 1 140px" }} value={service} onChange={(e) => setService(e.target.value as MealService)}>
          {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 110px" }} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <textarea
        className="form-textarea"
        placeholder="Description / composition"
        style={{ marginBottom: "8px", minHeight: "60px" }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          className="btn btn-green"
          style={{ fontSize: "12px", padding: "6px 12px" }}
          onClick={() => onSave({
            name: name.trim(),
            description: description.trim() || null,
            price: parseFloat(price) || 0,
            service,
          })}
        >
          Enregistrer
        </button>
        <button type="button" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
}
