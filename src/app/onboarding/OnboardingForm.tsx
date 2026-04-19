"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const sans = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const OPTIONS = [
  { key: 'offerNordicBath', priceKey: 'nordicBathPrice', label: 'Bain nordique' },
  { key: 'offerSheet160',   priceKey: 'sheet160Price',   label: 'Draps 160×200' },
  { key: 'offerSheet90',    priceKey: 'sheet90Price',    label: 'Draps 90×190' },
  { key: 'offerTowels',     priceKey: 'towelsPrice',     label: 'Linge de toilette' },
];

export default function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    giteName: '', email: defaultEmail, phone: '',
    address: '', city: '', zipCode: '',
    capacity: '12', cleaningFee: '90', touristTax: '1.32',
    offerNordicBath: false, nordicBathPrice: '120',
    offerSheet160: false,   sheet160Price: '0',
    offerSheet90: false,    sheet90Price: '0',
    offerTowels: false,     towelsPrice: '0',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k: string) => setForm(f => ({ ...f, [k]: !f[k as keyof typeof f] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.giteName.trim()) { setError("Le nom de l'hébergement est requis."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    border: '1px solid #E8E6E1', backgroundColor: '#FAFAF7',
    fontSize: '15px', fontFamily: sans, color: '#2C2C2A',
    outline: 'none', borderRadius: '10px', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: 700,
    color: '#A3A3A0', textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '7px',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: '#2C2C2A',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '16px', paddingBottom: '10px',
    borderBottom: '1px solid #F0EDEA',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Section 1 — Hébergement */}
      <div>
        <p style={sectionTitle}>Votre hébergement</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nom de l'hébergement *</label>
            <input
              required style={inputStyle} placeholder="Le Clos du Marida"
              value={form.giteName} onChange={e => set('giteName', e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Email de contact *</label>
              <input
                required type="email" style={inputStyle}
                value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input
                style={inputStyle} placeholder="06 12 34 56 78"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Adresse</label>
            <input
              style={inputStyle} placeholder="12 chemin des Pins"
              value={form.address} onChange={e => set('address', e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Ville</label>
              <input
                style={inputStyle} placeholder="Bordeaux"
                value={form.city} onChange={e => set('city', e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Code postal</label>
              <input
                style={inputStyle} placeholder="33000"
                value={form.zipCode} onChange={e => set('zipCode', e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Tarifs */}
      <div>
        <p style={sectionTitle}>Tarifs par défaut</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Capacité (pers.)</label>
            <input
              type="number" min="1" style={inputStyle}
              value={form.capacity} onChange={e => set('capacity', e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Frais de ménage (€)</label>
            <input
              type="number" step="0.01" min="0" style={inputStyle}
              value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Taxe de séjour (€/nuit)</label>
            <input
              type="number" step="0.01" min="0" style={inputStyle}
              value={form.touristTax} onChange={e => set('touristTax', e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E6E1'; }}
            />
          </div>
        </div>
      </div>

      {/* Section 3 — Options */}
      <div>
        <p style={sectionTitle}>Options proposées <span style={{ fontWeight: 400, color: '#A3A3A0', textTransform: 'none', letterSpacing: 0 }}>— facultatif, modifiable plus tard</span></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {OPTIONS.map(opt => (
            <label
              key={opt.key}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '13px 16px', borderRadius: '10px',
                border: `1px solid ${form[opt.key as keyof typeof form] ? 'rgba(127,119,221,.3)' : '#E8E6E1'}`,
                backgroundColor: form[opt.key as keyof typeof form] ? '#EFEEF9' : '#FAFAF7',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <input
                type="checkbox"
                checked={form[opt.key as keyof typeof form] as boolean}
                onChange={() => toggle(opt.key)}
                style={{ width: '16px', height: '16px', accentColor: '#7F77DD', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ flex: 1, fontSize: '14px', color: '#2C2C2A', fontWeight: form[opt.key as keyof typeof form] ? 600 : 400 }}>
                {opt.label}
              </span>
              {form[opt.key as keyof typeof form] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="number" step="0.01" min="0"
                    value={form[opt.priceKey as keyof typeof form] as string}
                    onChange={e => set(opt.priceKey, e.target.value)}
                    onClick={e => e.preventDefault()}
                    style={{ width: '72px', padding: '6px 10px', border: '1px solid rgba(127,119,221,.3)', backgroundColor: '#fff', fontSize: '14px', fontFamily: sans, color: '#2C2C2A', outline: 'none', borderRadius: '8px', textAlign: 'right' }}
                  />
                  <span style={{ fontSize: '13px', color: '#A3A3A0' }}>€</span>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FBECEC', border: '1px solid #F3D1D1', borderRadius: '10px' }}>
          <p style={{ fontSize: '13px', color: '#B23A3A', margin: 0, lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '16px',
          fontFamily: sans, fontSize: '15px', fontWeight: 700,
          backgroundColor: loading ? '#C9D4CC' : '#689D71',
          color: '#FFFFFF', border: 'none', borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Configuration en cours…' : 'Accéder au tableau de bord →'}
      </button>

      <p style={{ fontSize: '12px', color: '#A3A3A0', textAlign: 'center', margin: '-12px 0 0', lineHeight: 1.5 }}>
        Vous pourrez compléter et modifier toutes ces informations dans vos paramètres.
      </p>
    </form>
  );
}
