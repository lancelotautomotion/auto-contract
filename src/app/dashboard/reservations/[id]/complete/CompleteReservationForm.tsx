"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarDays, Euro, FileText, ArrowRight } from "lucide-react";

interface Props {
  id: string;
  giteId: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultCleaningFee: string;
  defaultTouristTax: string;
}

export default function CompleteReservationForm({ id, giteId, defaultCheckIn, defaultCheckOut, defaultCleaningFee, defaultTouristTax }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    rent: '',
    deposit: '',
    cleaningFee: defaultCleaningFee,
    touristTax: defaultTouristTax,
    notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push(`/dashboard/${giteId}/reservations/${id}`);
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
            Confirmer les dates
          </div>
          <div className="form-row" style={{ marginBottom: '0' }}>
            <div className="form-group">
              <label className="form-label">Arrivée <span className="req">*</span></label>
              <input className="form-date" type="date" required value={form.checkIn} onChange={e => set('checkIn', e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Départ <span className="req">*</span></label>
              <input className="form-date" type="date" required value={form.checkOut} onChange={e => set('checkOut', e.target.value)}/>
            </div>
          </div>

          {/* Tarifs */}
          <div className="req-fs-divider"/>
          <div className="req-fs-label">
            <Euro size={12} strokeWidth={1.4} />
            Tarifs
          </div>
          <div className="form-row" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Loyer (€) <span className="req">*</span></label>
              <input className="form-input" type="number" step="0.01" placeholder="ex: 1200" required value={form.rent} onChange={e => set('rent', e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Acompte (€) <span className="req">*</span></label>
              <input className="form-input" type="number" step="0.01" placeholder="ex: 400" required value={form.deposit} onChange={e => set('deposit', e.target.value)}/>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: '0' }}>
            <div className="form-group">
              <label className="form-label">Frais de ménage (€)</label>
              <input className="form-input" type="number" step="0.01" value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Taxe de séjour (€/nuit/pers.)</label>
              <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={e => set('touristTax', e.target.value)}/>
            </div>
          </div>

          {/* Notes */}
          <div className="req-fs-divider"/>
          <div className="req-fs-label">
            <FileText size={12} strokeWidth={1.4} />
            Notes internes
          </div>
          <textarea
            className="form-textarea"
            placeholder="Informations complémentaires..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />

          {/* Actions */}
          <div className="req-actions-bar">
            <button type="submit" className="btn btn-green btn-lg" disabled={loading}>
              {loading ? 'Validation...' : 'Valider la réservation'}
              {!loading && (
                <ArrowRight size={14} strokeWidth={1.4} />
              )}
            </button>
            <button
              type="button"
              className="btn btn-later btn-lg"
              onClick={() => router.push(`/dashboard/${giteId}/reservations`)}
            >
              Plus tard
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
