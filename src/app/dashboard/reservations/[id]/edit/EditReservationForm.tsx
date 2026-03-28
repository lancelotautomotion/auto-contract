"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labelStyle = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const sectionStyle = { marginBottom: '40px' };
const sectionTitleStyle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

interface GiteOption { id: string; label: string; price: number; }

interface FormData {
  clientFirstName: string; clientLastName: string; clientEmail: string; clientPhone: string;
  clientAddress: string; clientCity: string; clientZipCode: string;
  checkIn: string; checkOut: string;
  rent: string; deposit: string; cleaningFee: string; touristTax: string;
  notes: string;
}

interface Props {
  id: string;
  initial: FormData;
  availableOptions: GiteOption[];
  selectedOptionIds: string[];
}

export default function EditReservationForm({ id, initial, availableOptions, selectedOptionIds }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(initial);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set(selectedOptionIds));

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleOption = (optId: string) => setSelectedOptions(prev => {
    const next = new Set(prev);
    next.has(optId) ? next.delete(optId) : next.add(optId);
    return next;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) router.push(`/dashboard/reservations/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Informations client</p>
        <div style={{ ...gridStyle, marginBottom: '20px' }}>
          <div><label style={labelStyle}>Prénom *</label><input required style={inputStyle} value={form.clientFirstName} onChange={e => set('clientFirstName', e.target.value)} /></div>
          <div><label style={labelStyle}>Nom *</label><input required style={inputStyle} value={form.clientLastName} onChange={e => set('clientLastName', e.target.value)} /></div>
          <div><label style={labelStyle}>Email *</label><input required type="email" style={inputStyle} value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} /></div>
          <div><label style={labelStyle}>Téléphone *</label><input required style={inputStyle} value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Adresse</label><input style={inputStyle} value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} /></div>
        <div style={gridStyle}>
          <div><label style={labelStyle}>Ville</label><input style={inputStyle} value={form.clientCity} onChange={e => set('clientCity', e.target.value)} /></div>
          <div><label style={labelStyle}>Code postal</label><input style={inputStyle} value={form.clientZipCode} onChange={e => set('clientZipCode', e.target.value)} /></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Dates du séjour</p>
        <div style={gridStyle}>
          <div><label style={labelStyle}>Date d&apos;arrivée *</label><input required type="date" style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} /></div>
          <div><label style={labelStyle}>Date de départ *</label><input required type="date" style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} /></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Tarifs</p>
        <div style={gridStyle}>
          <div><label style={labelStyle}>Loyer (€) *</label><input required type="number" step="0.01" style={inputStyle} value={form.rent} onChange={e => set('rent', e.target.value)} /></div>
          <div><label style={labelStyle}>Acompte (€) *</label><input required type="number" step="0.01" style={inputStyle} value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
          <div><label style={labelStyle}>Frais de ménage (€)</label><input type="number" step="0.01" style={inputStyle} value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} /></div>
          <div><label style={labelStyle}>Taxe de séjour (€/nuit)</label><input type="number" step="0.01" style={inputStyle} value={form.touristTax} onChange={e => set('touristTax', e.target.value)} /></div>
        </div>
      </div>

      {availableOptions.length > 0 && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Options</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {availableOptions.map(opt => {
              const checked = selectedOptions.has(opt.id);
              return (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', border: '1px solid #CEC8BF', backgroundColor: checked ? '#E5DED5' : '#F7F4F0', borderRadius: '8px' }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleOption(opt.id)} style={{ width: '14px', height: '14px', accentColor: '#1C1C1A' }} />
                  <span style={{ fontSize: '13px', color: '#1C1C1A', flex: 1 }}>{opt.label}</span>
                  {opt.price > 0 && <span style={{ fontSize: '12px', color: '#7A7570' }}>{opt.price} €</span>}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Notes internes</p>
        <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Informations complémentaires..." />
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button type="submit" disabled={loading} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 32px', backgroundColor: loading ? '#CEC8BF' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', flex: 1, borderRadius: '8px' }}>
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications →'}
        </button>
        <button type="button" onClick={() => router.push(`/dashboard/reservations/${id}`)} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 32px', backgroundColor: '#E5DED5', color: '#1C1C1A', border: '1px solid #CEC8BF', cursor: 'pointer', borderRadius: '8px' }}>
          Annuler
        </button>
      </div>
    </form>
  );
}
