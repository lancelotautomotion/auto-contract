"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labelStyle = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const sectionStyle = { marginBottom: '40px' };
const sectionTitleStyle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

export default function NewReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientFirstName: '', clientLastName: '', clientEmail: '', clientPhone: '',
    clientAddress: '', clientCity: '', clientZipCode: '',
    checkIn: '', checkOut: '',
    rent: '', deposit: '', cleaningFee: '90', touristTax: '1.32',
    nordicBath: false, sheet160: false, sheet90: false, towels: false,
    notes: '',
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <button onClick={() => router.push('/dashboard')} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Retour
        </button>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Nouvelle réservation</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>Ajouter un séjour</h1>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Infos client */}
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

          {/* Dates */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Dates du séjour</p>
            <div style={gridStyle}>
              <div><label style={labelStyle}>Date d&apos;arrivée *</label><input required type="date" style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} /></div>
              <div><label style={labelStyle}>Date de départ *</label><input required type="date" style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} /></div>
            </div>
          </div>

          {/* Tarifs */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Tarifs</p>
            <div style={gridStyle}>
              <div><label style={labelStyle}>Loyer (€) *</label><input required type="number" step="0.01" style={inputStyle} value={form.rent} onChange={e => set('rent', e.target.value)} /></div>
              <div><label style={labelStyle}>Acompte (€) *</label><input required type="number" step="0.01" style={inputStyle} value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
              <div><label style={labelStyle}>Frais de ménage (€)</label><input type="number" step="0.01" style={inputStyle} value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} /></div>
              <div><label style={labelStyle}>Taxe de séjour (€/nuit)</label><input type="number" step="0.01" style={inputStyle} value={form.touristTax} onChange={e => set('touristTax', e.target.value)} /></div>
            </div>
          </div>

          {/* Options */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Options</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { key: 'nordicBath', label: 'Bain nordique (120 €)' },
                { key: 'sheet160', label: 'Draps 160x200' },
                { key: 'sheet90', label: 'Draps 90x190' },
                { key: 'towels', label: 'Linge de toilette' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', border: '1px solid #CEC8BF', backgroundColor: form[opt.key as keyof typeof form] ? '#E5DED5' : '#F7F4F0', borderRadius: '8px' }}>
                  <input type="checkbox" checked={form[opt.key as keyof typeof form] as boolean} onChange={e => set(opt.key, e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#1C1C1A' }} />
                  <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>Notes internes</p>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Informations complémentaires..." />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 32px', backgroundColor: loading ? '#7A7570' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', borderRadius: '8px' }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la réservation →'}
          </button>

        </form>
      </main>
    </div>
  );
}
