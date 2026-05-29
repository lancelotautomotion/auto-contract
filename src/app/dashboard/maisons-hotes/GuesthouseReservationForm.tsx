"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { computeLodgingTotal, computeMealsTotal, computeTouristTax, nightsBetween } from "@/lib/billing";

interface Room { id: string; name: string; capacity: number; basePrice: number; active: boolean; }
type MealType = "BREAKFAST" | "HALF_BOARD" | "TABLE_HOTES";

const MEALS: { type: MealType; label: string }[] = [
  { type: "BREAKFAST", label: "Petit-déjeuner" },
  { type: "HALF_BOARD", label: "Demi-pension" },
  { type: "TABLE_HOTES", label: "Table d'hôtes" },
];

interface MealState { enabled: boolean; unitPrice: string; quantity: string; }

const fmtMoney = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function GuesthouseReservationForm({
  guesthouseId, rooms, touristTaxRate,
}: { guesthouseId: string; rooms: Room[]; touristTaxRate: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientFirstName: "", clientLastName: "", clientEmail: "", clientPhone: "",
    clientAddress: "", clientCity: "", clientZipCode: "",
    checkIn: "", checkOut: "", adultsCount: "2", deposit: "", dietaryNotes: "", notes: "",
  });
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [meals, setMeals] = useState<Record<MealType, MealState>>({
    BREAKFAST: { enabled: false, unitPrice: "", quantity: "1" },
    HALF_BOARD: { enabled: false, unitPrice: "", quantity: "1" },
    TABLE_HOTES: { enabled: false, unitPrice: "", quantity: "1" },
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleRoom = (id: string) => setSelectedRooms((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const setMeal = (type: MealType, patch: Partial<MealState>) =>
    setMeals((m) => ({ ...m, [type]: { ...m[type], ...patch } }));

  const nights = useMemo(() => (form.checkIn && form.checkOut ? nightsBetween(form.checkIn, form.checkOut) : 0), [form.checkIn, form.checkOut]);
  const chosenRooms = rooms.filter((r) => selectedRooms.has(r.id));
  const lodging = computeLodgingTotal(chosenRooms.map((r) => ({ price: r.basePrice })), nights);
  const mealsList = MEALS
    .filter((m) => meals[m.type].enabled)
    .map((m) => ({ unitPrice: parseFloat(meals[m.type].unitPrice) || 0, quantity: parseInt(meals[m.type].quantity) || 0 }));
  const mealsTotal = computeMealsTotal(mealsList);
  const adults = parseInt(form.adultsCount) || 0;
  const touristTax = computeTouristTax(adults, nights, touristTaxRate);
  const total = lodging + mealsTotal + touristTax;

  const selectedCapacity = chosenRooms.reduce((s, r) => s + r.capacity, 0);
  const overCapacity = adults > 0 && selectedCapacity > 0 && adults > selectedCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRooms.size === 0) { setError("Sélectionnez au moins une chambre."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        guesthouseId,
        ...form,
        roomIds: Array.from(selectedRooms),
        meals: MEALS.filter((m) => meals[m.type].enabled).map((m) => ({
          mealType: m.type,
          unitPrice: parseFloat(meals[m.type].unitPrice) || 0,
          quantity: parseInt(meals[m.type].quantity) || 1,
        })),
      };
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { router.push(`/dashboard/maisons-hotes/${guesthouseId}`); return; }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-layout">
        <div className="form-main">

          {/* CLIENT */}
          <div className="form-section">
            <div className="fs-title">Informations client</div>
            <div className="fs-divider" />
            <div className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom <span className="req">*</span></label>
                  <input required className="form-input" value={form.clientFirstName} onChange={(e) => set("clientFirstName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom <span className="req">*</span></label>
                  <input required className="form-input" value={form.clientLastName} onChange={(e) => set("clientLastName", e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input required type="email" className="form-input" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone <span className="req">*</span></label>
                  <input required type="tel" className="form-input" value={form.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* DATES + PERSONNES */}
          <div className="form-section">
            <div className="fs-title">Séjour</div>
            <div className="fs-divider" />
            <div className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Arrivée <span className="req">*</span></label>
                  <input required type="date" className="form-date" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Départ <span className="req">*</span></label>
                  <input required type="date" className="form-date" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre d&apos;adultes <span className="req">*</span> <span style={{ fontWeight: 400, color: "var(--ink-lighter)" }}>(base taxe de séjour)</span></label>
                <input required type="number" min="1" className="form-input" value={form.adultsCount} onChange={(e) => set("adultsCount", e.target.value)} />
              </div>
            </div>
          </div>

          {/* CHAMBRES */}
          <div className="form-section">
            <div className="fs-title">Chambre(s) <span className="req">*</span></div>
            <div className="fs-divider" />
            <div className="options-grid">
              {rooms.filter((r) => r.active).map((room) => {
                const checked = selectedRooms.has(room.id);
                return (
                  <div key={room.id} className={`option-check${checked ? " checked" : ""}`} onClick={() => toggleRoom(room.id)} role="checkbox" aria-checked={checked}>
                    <div className="oc-box">
                      {checked && (
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5L9.5 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                    </div>
                    <span className="oc-name">{room.name} <span style={{ color: "var(--ink-lighter)", fontWeight: 400 }}>· {room.capacity} pers.</span></span>
                    {room.basePrice > 0 && <span className="oc-price">{room.basePrice} €/nuit</span>}
                  </div>
                );
              })}
              {rooms.filter((r) => r.active).length === 0 && (
                <p style={{ fontSize: "13px", color: "var(--ink-lighter)" }}>Aucune chambre active. Configurez vos chambres d&apos;abord.</p>
              )}
            </div>
            {overCapacity && (
              <p style={{ fontSize: "12.5px", color: "#B7791F", marginTop: "8px" }}>
                Attention : {adults} adultes pour une capacité sélectionnée de {selectedCapacity} personnes.
              </p>
            )}
          </div>

          {/* RESTAURATION */}
          <div className="form-section">
            <div className="fs-title">Restauration / Options</div>
            <div className="fs-divider" />
            <div className="form-card">
              {MEALS.map((m) => {
                const state = meals[m.type];
                return (
                  <div key={m.type} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 160px", cursor: "pointer" }}>
                      <input type="checkbox" checked={state.enabled} onChange={(e) => setMeal(m.type, { enabled: e.target.checked })} />
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>{m.label}</span>
                    </label>
                    <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 120px" }} placeholder="Prix unitaire" value={state.unitPrice} disabled={!state.enabled} onChange={(e) => setMeal(m.type, { unitPrice: e.target.value })} />
                    <input type="number" min="1" className="form-input" style={{ flex: "0 1 100px" }} placeholder="Nb repas/jours" value={state.quantity} disabled={!state.enabled} onChange={(e) => setMeal(m.type, { quantity: e.target.value })} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALLERGIES */}
          <div className="form-section">
            <div className="fs-title">Allergies / Régimes spécifiques</div>
            <div className="fs-divider" />
            <div className="form-card">
              <div className="form-group">
                <textarea className="form-textarea" placeholder="Allergies, intolérances, régimes (végétarien, sans gluten...)..." value={form.dietaryNotes} onChange={(e) => set("dietaryNotes", e.target.value)} />
              </div>
              {form.dietaryNotes.trim() && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", background: "#FDECEC", border: "1px solid #F5B5B5", color: "#B91C1C", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "4px 12px" }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M6 1.5L11 10H1L6 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 5v2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="6" cy="8.6" r="0.6" fill="currentColor"/></svg>
                  Allergies / régime signalé
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ASIDE */}
        <div className="form-aside">
          <div className="form-section">
            <div className="fs-title">Acompte & notes</div>
            <div className="fs-divider" />
            <div className="form-card">
              <div className="form-group">
                <label className="form-label">Acompte (€)</label>
                <input type="number" step="0.01" className="form-input" value={form.deposit} onChange={(e) => set("deposit", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes internes</label>
                <textarea className="form-textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <div className="summary-title">Récapitulatif {nights > 0 ? `· ${nights} nuit${nights > 1 ? "s" : ""}` : ""}</div>
            </div>
            <div className="summary-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="sg-item"><div className="sg-label">Nuitées</div><div className="sg-value">{fmtMoney(lodging)}</div></div>
              <div className="sg-item"><div className="sg-label">Restauration</div><div className="sg-value">{fmtMoney(mealsTotal)}</div></div>
              <div className="sg-item"><div className="sg-label">Taxe de séjour</div><div className="sg-value">{fmtMoney(touristTax)}</div></div>
              <div className="sg-item"><div className="sg-label">Total</div><div className="sg-value green">{fmtMoney(total)}</div></div>
            </div>
            {error && <p style={{ fontSize: "12px", color: "#b91c1c", margin: "0 0 10px" }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-green" style={{ width: "100%", padding: "12px 24px", borderRadius: "10px" }}>
              {loading ? "Enregistrement…" : "Enregistrer la réservation"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
