"use client";

import { useState } from "react";

const labelStyle = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const sectionStyle = { marginBottom: '36px' };
const sectionTitleStyle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

interface GiteOption { id: string; label: string; price: number; }

interface Props {
  giteSlug: string;
  giteName: string;
  options: GiteOption[];
}

export default function BookingForm({ giteSlug, options }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zipCode: '',
    checkIn: '', checkOut: '',
    notes: '',
    gdprConsent: false,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const toggleOption = (id: string) => setSelectedOptions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gdprConsent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/book/${giteSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedOptionIds: Array.from(selectedOptions) }),
      });
      if (res.ok) setStep('success');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#F7F4F0', borderRadius: '20px', border: '1px solid #CEC8BF' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>✓</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '32px', fontWeight: 300, color: '#1C1C1A', marginBottom: '16px' }}>
          Demande envoyée !
        </h2>
        <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
          Votre demande de réservation a bien été transmise. Le gérant vous contactera prochainement pour confirmer les détails et vous envoyer le contrat.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Vos informations</p>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div><label style={labelStyle}>Prénom *</label><input required style={inputStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
          <div><label style={labelStyle}>Nom *</label><input required style={inputStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
          <div><label style={labelStyle}>Email *</label><input required type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label style={labelStyle}>Téléphone *</label><input required style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Adresse *</label>
          <input required style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
        <div style={grid2}>
          <div><label style={labelStyle}>Ville *</label><input required style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div><label style={labelStyle}>Code postal *</label><input required style={inputStyle} value={form.zipCode} onChange={e => set('zipCode', e.target.value)} /></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Dates souhaitées</p>
        <div style={grid2}>
          <div><label style={labelStyle}>Date d&apos;arrivée *</label><input required type="date" style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} /></div>
          <div><label style={labelStyle}>Date de départ *</label><input required type="date" style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} /></div>
        </div>
      </div>

      {options.length > 0 && (
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Options souhaitées</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {options.map(opt => {
              const checked = selectedOptions.has(opt.id);
              return (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 16px', border: '1px solid #CEC8BF', backgroundColor: checked ? '#E5DED5' : '#F7F4F0', borderRadius: '10px' }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleOption(opt.id)} style={{ width: '16px', height: '16px', accentColor: '#1C1C1A', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '13px', color: '#1C1C1A' }}>{opt.label}</span>
                  {opt.price > 0 && (
                    <span style={{ fontSize: '12px', color: '#7A7570', fontWeight: 500 }}>{opt.price} €</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div style={sectionStyle}>
        <p style={sectionTitleStyle}>Message (optionnel)</p>
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Nombre de personnes, demandes particulières..."
        />
      </div>

      {/* RGPD */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            required
            checked={form.gdprConsent}
            onChange={e => set('gdprConsent', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#1C1C1A', flexShrink: 0, marginTop: '2px' }}
          />
          <span style={{ fontSize: '12px', color: '#7A7570', lineHeight: 1.6 }}>
            J&apos;accepte que mes données personnelles soient utilisées pour le traitement de ma demande de réservation. *
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !form.gdprConsent}
        style={{ width: '100%', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '16px', backgroundColor: loading || !form.gdprConsent ? '#CEC8BF' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading || !form.gdprConsent ? 'not-allowed' : 'pointer', borderRadius: '100px' }}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer ma demande →'}
      </button>

      <p style={{ fontSize: '11px', color: '#7A7570', textAlign: 'center', marginTop: '12px' }}>
        Aucun paiement requis à cette étape.
      </p>

    </form>
  );
}
