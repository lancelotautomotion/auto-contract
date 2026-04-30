"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultCleaningFee: string;
  defaultTouristTax: string;
}

export default function CompleteReservationForm({ id, defaultCheckIn, defaultCheckOut, defaultCleaningFee, defaultTouristTax }: Props) {
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
      if (res.ok) router.push(`/dashboard/reservations/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validate-card">
      <div className="vc-header">
        <div className="vc-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Compléter et valider la réservation
        </div>
      </div>
      <div className="vc-body">
        <form onSubmit={handleSubmit}>

          {/* Dates */}
          <div className="req-fs-label">
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <rect x="1" y="2.5" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
            </svg>
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
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M6 3v6M4 5h3.5a1.5 1.5 0 010 2.5H4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
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
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M4 4.5h4M4 7h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
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
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button
              type="button"
              className="btn btn-later btn-lg"
              onClick={() => router.push('/dashboard/reservations')}
            >
              Plus tard
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
