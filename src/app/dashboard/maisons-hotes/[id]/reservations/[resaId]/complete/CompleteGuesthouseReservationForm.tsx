"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarDays, Euro, FileText, ArrowRight } from "lucide-react";

interface Props {
  id: string;
  guesthouseId: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultTouristTax: string;
  defaultCleaningFee: string;
  defaultNights: number;
  defaultLodging: number;
  mealsAmount: number;
  defaultDeposit: number;
  defaultDepositPercentage: number;
}

function fmtEuro(n: number): string {
  return n.toFixed(2);
}

export default function CompleteGuesthouseReservationForm({
  id,
  guesthouseId,
  defaultCheckIn,
  defaultCheckOut,
  defaultTouristTax,
  defaultCleaningFee,
  defaultNights,
  defaultLodging,
  mealsAmount,
  defaultDeposit,
  defaultDepositPercentage,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    rent: fmtEuro(defaultLodging),
    deposit: fmtEuro(defaultDeposit),
    cleaningFee: defaultCleaningFee,
    touristTax: defaultTouristTax,
    notes: "",
  });
  const [depositTouched, setDepositTouched] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Recalcule automatiquement l'acompte tant que le gérant n'a pas modifié le champ
  // manuellement — préserve un geste commercial éventuel.
  useEffect(() => {
    if (depositTouched) return;
    const lodging = parseFloat(form.rent);
    if (isNaN(lodging)) return;
    const newDeposit = Math.round(lodging * defaultDepositPercentage) / 100;
    setForm((f) => ({ ...f, deposit: fmtEuro(newDeposit) }));
  }, [form.rent, defaultDepositPercentage, depositTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push(`/dashboard/maisons-hotes/${guesthouseId}/reservations/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validate-card">
      <div className="vc-header">
        <div className="vc-title">
          <Check size={14} strokeWidth={1.4} />
          Compléter et valider la réservation
        </div>
      </div>
      <div className="vc-body">
        <form onSubmit={handleSubmit}>

          {/* Dates */}
          <div className="req-fs-label">
            <CalendarDays size={12} strokeWidth={1.4} />
            Confirmer les dates ({defaultNights} nuit{defaultNights > 1 ? "s" : ""})
          </div>
          <div className="form-row" style={{ marginBottom: "0" }}>
            <div className="form-group">
              <label className="form-label">Arrivée <span className="req">*</span></label>
              <input className="form-date" type="date" required value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Départ <span className="req">*</span></label>
              <input className="form-date" type="date" required value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
            </div>
          </div>

          {/* Tarifs */}
          <div className="req-fs-divider" />
          <div className="req-fs-label">
            <Euro size={12} strokeWidth={1.4} />
            Tarifs
          </div>
          <div className="form-row" style={{ marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Hébergement (€) <span className="req">*</span></label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="ex: 800"
                required
                value={form.rent}
                onChange={(e) => set("rent", e.target.value)}
              />
              <div className="form-hint">Pré-rempli : {defaultNights} nuit{defaultNights > 1 ? "s" : ""} × prix par nuit de la chambre.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Restauration (€)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={fmtEuro(mealsAmount)}
                readOnly
                style={{ background: "#F4F3F0", color: "#71716E", cursor: "not-allowed" }}
              />
              <div className="form-hint">Somme automatique des repas sélectionnés.</div>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: "14px" }}>
            <div className="form-group">
              <label className="form-label">Acompte (€) <span className="req">*</span></label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="ex: 200"
                required
                value={form.deposit}
                onChange={(e) => { setDepositTouched(true); set("deposit", e.target.value); }}
              />
              <div className="form-hint">Calculé sur l&apos;hébergement à {defaultDepositPercentage}% (hors repas). Modifiable.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Frais de ménage (€)</label>
              <input className="form-input" type="number" step="0.01" value={form.cleaningFee} onChange={(e) => set("cleaningFee", e.target.value)} />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: "0" }}>
            <div className="form-group">
              <label className="form-label">Taxe de séjour (€/adulte/nuit)</label>
              <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={(e) => set("touristTax", e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="req-fs-divider" />
          <div className="req-fs-label">
            <FileText size={12} strokeWidth={1.4} />
            Notes internes
          </div>
          <textarea
            className="form-textarea"
            placeholder="Informations complémentaires..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />

          {/* Actions */}
          <div className="req-actions-bar">
            <button type="submit" className="btn btn-green btn-lg" disabled={loading}>
              {loading ? "Validation..." : "Valider la réservation"}
              {!loading && (
                <ArrowRight size={14} strokeWidth={1.4} color="#fff" />
              )}
            </button>
            <button
              type="button"
              className="btn btn-later btn-lg"
              onClick={() => router.push(`/dashboard/maisons-hotes/${guesthouseId}/reservations`)}
            >
              Plus tard
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
