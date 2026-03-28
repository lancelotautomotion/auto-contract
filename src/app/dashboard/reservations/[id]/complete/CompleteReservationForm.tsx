"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labelStyle = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

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
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>Confirmer les dates</p>
        <div style={grid2}>
          <div><label style={labelStyle}>Arrivée *</label><input required type="date" style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} /></div>
          <div><label style={labelStyle}>Départ *</label><input required type="date" style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} /></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>Tarifs</p>
        <div style={grid2}>
          <div><label style={labelStyle}>Loyer (€) *</label><input required type="number" step="0.01" style={inputStyle} placeholder="ex: 1200" value={form.rent} onChange={e => set('rent', e.target.value)} /></div>
          <div><label style={labelStyle}>Acompte (€) *</label><input required type="number" step="0.01" style={inputStyle} placeholder="ex: 400" value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
          <div><label style={labelStyle}>Frais de ménage (€)</label><input type="number" step="0.01" style={inputStyle} value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} /></div>
          <div><label style={labelStyle}>Taxe de séjour (€/nuit)</label><input type="number" step="0.01" style={inputStyle} value={form.touristTax} onChange={e => set('touristTax', e.target.value)} /></div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Notes internes</label>
        <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Informations complémentaires..." />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 1, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px', backgroundColor: loading ? '#CEC8BF' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
        >
          {loading ? 'Validation...' : 'Valider la réservation →'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          style={{ padding: '14px 20px', backgroundColor: 'transparent', color: '#7A7570', border: '1px solid #CEC8BF', cursor: 'pointer', borderRadius: '8px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Plus tard
        </button>
      </div>
    </form>
  );
}
