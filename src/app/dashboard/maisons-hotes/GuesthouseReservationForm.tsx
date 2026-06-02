"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { computeLodgingTotal, computeMealsTotal, computeTouristTax, nightsBetween } from "@/lib/billing";
import { Check, AlertTriangle } from "lucide-react";

interface Room { id: string; name: string; capacity: number; basePrice: number; active: boolean; }
type MealService = "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
interface MealOption { id: string; name: string; description: string | null; price: number; service: MealService; }

interface MealLineState { enabled: boolean; unitPrice: string; quantity: string; }

const fmtMoney = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function GuesthouseReservationForm({
  guesthouseId, rooms, meals: mealOptions = [], touristTaxRate,
}: { guesthouseId: string; rooms: Room[]; meals?: MealOption[]; touristTaxRate: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientFirstName: "", clientLastName: "", clientEmail: "", clientPhone: "",
    clientAddress: "", clientCity: "", clientZipCode: "",
    checkIn: "", checkOut: "", adultsCount: "2", rent: "", deposit: "", dietaryNotes: "", notes: "",
  });
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());

  const initialMealLines: Record<string, MealLineState> = useMemo(() => {
    const acc: Record<string, MealLineState> = {};
    for (const m of mealOptions) {
      acc[m.id] = { enabled: false, unitPrice: String(m.price ?? 0), quantity: "1" };
    }
    return acc;
  }, [mealOptions]);
  const [mealLines, setMealLines] = useState<Record<string, MealLineState>>(initialMealLines);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleRoom = (id: string) => setSelectedRooms((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const setMealLine = (mealId: string, patch: Partial<MealLineState>) =>
    setMealLines((m) => ({ ...m, [mealId]: { ...(m[mealId] ?? { enabled: false, unitPrice: "0", quantity: "1" }), ...patch } }));

  const nights = useMemo(() => (form.checkIn && form.checkOut ? nightsBetween(form.checkIn, form.checkOut) : 0), [form.checkIn, form.checkOut]);
  const chosenRooms = rooms.filter((r) => selectedRooms.has(r.id));
  const lodging = computeLodgingTotal(chosenRooms.map((r) => ({ price: r.basePrice })), nights);
  const mealsList = mealOptions
    .filter((m) => mealLines[m.id]?.enabled)
    .map((m) => ({
      unitPrice: parseFloat(mealLines[m.id]?.unitPrice ?? "0") || 0,
      quantity: parseInt(mealLines[m.id]?.quantity ?? "0") || 0,
    }));
  const mealsTotal = computeMealsTotal(mealsList);
  const adults = parseInt(form.adultsCount) || 0;
  const touristTax = computeTouristTax(adults, nights, touristTaxRate);
  const total = lodging + mealsTotal + touristTax;

  const selectedCapacity = chosenRooms.reduce((s, r) => s + r.capacity, 0);
  const overCapacity = adults > 0 && selectedCapacity > 0 && adults > selectedCapacity;

  const serviceToLegacyType = (s: MealService) =>
    s === "BREAKFAST" ? "BREAKFAST" : s === "DINNER" ? "TABLE_HOTES" : "HALF_BOARD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRooms.size === 0) { setError("Sélectionnez au moins une chambre."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        guesthouseId,
        ...form,
        rent: form.rent !== "" ? form.rent : undefined,
        roomIds: Array.from(selectedRooms),
        meals: mealOptions
          .filter((m) => mealLines[m.id]?.enabled)
          .map((m) => ({
            guesthouseMealId: m.id,
            mealType: serviceToLegacyType(m.service),
            service: m.service,
            label: m.name,
            unitPrice: parseFloat(mealLines[m.id]?.unitPrice ?? "0") || 0,
            quantity: parseInt(mealLines[m.id]?.quantity ?? "1") || 1,
          })),
      };
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { router.push(`/dashboard/maisons-hotes/${guesthouseId}/reservations`); return; }
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
                        <Check size={12} strokeWidth={1.5} color="#fff" />
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
              {mealOptions.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic", margin: 0 }}>
                  Aucun menu configuré. Ajoutez vos formules depuis la fiche établissement.
                </p>
              ) : (
                mealOptions.map((m) => {
                  const state = mealLines[m.id] ?? { enabled: false, unitPrice: String(m.price), quantity: "1" };
                  return (
                    <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", paddingBottom: "12px", borderBottom: "1px solid #F4F2EE" }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", flex: "1 1 200px", cursor: "pointer", paddingTop: "10px" }}>
                        <input type="checkbox" checked={state.enabled} onChange={(e) => setMealLine(m.id, { enabled: e.target.checked })} style={{ marginTop: "2px" }} />
                        <span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)", display: "block" }}>{m.name}</span>
                          {m.description && (
                            <span style={{ fontSize: "12px", color: "var(--ink-lighter)", display: "block", marginTop: "2px", whiteSpace: "pre-wrap" }}>{m.description}</span>
                          )}
                        </span>
                      </label>
                      <input type="number" min="0" step="0.01" className="form-input" style={{ flex: "0 1 120px" }} placeholder="Prix unitaire" value={state.unitPrice} disabled={!state.enabled} onChange={(e) => setMealLine(m.id, { unitPrice: e.target.value })} />
                      <input type="number" min="1" className="form-input" style={{ flex: "0 1 100px" }} placeholder="Nb / pers." value={state.quantity} disabled={!state.enabled} onChange={(e) => setMealLine(m.id, { quantity: e.target.value })} />
                    </div>
                  );
                })
              )}
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
                  <AlertTriangle size={12} strokeWidth={1.4} />
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
                <label className="form-label">Loyer total (€) <span style={{ fontWeight: 400, color: "var(--ink-lighter)" }}>— optionnel, remplace le calcul auto</span></label>
                <input type="number" step="0.01" min="0" className="form-input" placeholder={`${total.toFixed(2)} (calculé)`} value={form.rent} onChange={(e) => set("rent", e.target.value)} />
              </div>
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
