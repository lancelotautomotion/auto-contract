"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const label = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const input = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const section = { marginBottom: '36px' };
const sectionTitle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

const OPTIONS = [
  { key: 'offerNordicBath', priceKey: 'nordicBathPrice', label: 'Bain nordique' },
  { key: 'offerSheet160',   priceKey: 'sheet160Price',   label: 'Draps 160x200' },
  { key: 'offerSheet90',    priceKey: 'sheet90Price',    label: 'Draps 90x190' },
  { key: 'offerTowels',     priceKey: 'towelsPrice',     label: 'Linge de toilette' },
];

export default function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    giteName: '', email: defaultEmail, phone: '',
    address: '', city: '', zipCode: '',
    capacity: '12', cleaningFee: '90', touristTax: '1.32',
    n8nWebhookUrl: '', driveTemplateFolderId: '', driveOutputFolderId: '',
    offerNordicBath: true,  nordicBathPrice: '120',
    offerSheet160: true,    sheet160Price: '0',
    offerSheet90: true,     sheet90Price: '0',
    offerTowels: true,      towelsPrice: '0',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k: string) => setForm(f => ({ ...f, [k]: !f[k as keyof typeof f] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
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
    <form onSubmit={handleSubmit}>

      <div style={section}>
        <p style={sectionTitle}>Votre gîte</p>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Nom du gîte *</label>
            <input required style={input} placeholder="Le Clos du Marida" value={form.giteName} onChange={e => set('giteName', e.target.value)} />
          </div>
          <div><label style={label}>Email de contact *</label><input required type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label style={label}>Téléphone</label><input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '16px' }}><label style={label}>Adresse</label><input style={input} value={form.address} onChange={e => set('address', e.target.value)} /></div>
        <div style={grid2}>
          <div><label style={label}>Ville</label><input style={input} value={form.city} onChange={e => set('city', e.target.value)} /></div>
          <div><label style={label}>Code postal</label><input style={input} value={form.zipCode} onChange={e => set('zipCode', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Tarifs par défaut</p>
        <div style={grid2}>
          <div><label style={label}>Capacité (personnes)</label><input type="number" style={input} value={form.capacity} onChange={e => set('capacity', e.target.value)} /></div>
          <div><label style={label}>Frais de ménage (€)</label><input type="number" step="0.01" style={input} value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} /></div>
          <div><label style={label}>Taxe de séjour (€/nuit)</label><input type="number" step="0.01" style={input} value={form.touristTax} onChange={e => set('touristTax', e.target.value)} /></div>
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Options proposées aux clients</p>
        <p style={{ fontSize: '12px', color: '#7A7570', marginBottom: '16px', lineHeight: 1.6 }}>
          Sélectionnez les options disponibles dans votre gîte. Indiquez 0 € si l&apos;option est incluse dans le loyer.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {OPTIONS.map(opt => (
            <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', border: '1px solid #CEC8BF', borderRadius: '8px', backgroundColor: form[opt.key as keyof typeof form] ? '#E5DED5' : '#F7F4F0' }}>
              <input
                type="checkbox"
                checked={form[opt.key as keyof typeof form] as boolean}
                onChange={() => toggle(opt.key)}
                style={{ width: '16px', height: '16px', accentColor: '#1C1C1A', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ flex: 1, fontSize: '13px', color: '#1C1C1A', fontWeight: form[opt.key as keyof typeof form] ? 500 : 400 }}>{opt.label}</span>
              {form[opt.key as keyof typeof form] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#7A7570', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Prix</span>
                  <input
                    type="number" step="0.01" min="0"
                    value={form[opt.priceKey as keyof typeof form] as string}
                    onChange={e => set(opt.priceKey, e.target.value)}
                    style={{ width: '80px', padding: '6px 10px', border: '1px solid #CEC8BF', backgroundColor: '#EDE8E1', fontSize: '13px', color: '#1C1C1A', outline: 'none', borderRadius: '6px', textAlign: 'right' }}
                  />
                  <span style={{ fontSize: '13px', color: '#7A7570' }}>€</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Automatisation n8n</p>
        <p style={{ fontSize: '12px', color: '#7A7570', marginBottom: '16px', lineHeight: 1.6 }}>
          Optionnel pour commencer — vous pourrez le configurer plus tard dans les paramètres.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={label}>URL Webhook n8n (génération contrat)</label><input style={input} placeholder="https://votre-n8n.com/webhook/..." value={form.n8nWebhookUrl} onChange={e => set('n8nWebhookUrl', e.target.value)} /></div>
          <div><label style={label}>ID Dossier Drive (template)</label><input style={input} placeholder="1YVny7v79gQ..." value={form.driveTemplateFolderId} onChange={e => set('driveTemplateFolderId', e.target.value)} /></div>
          <div><label style={label}>ID Dossier Drive (contrats générés)</label><input style={input} placeholder="1keNh6CvAH..." value={form.driveOutputFolderId} onChange={e => set('driveOutputFolderId', e.target.value)} /></div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ width: '100%', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px', backgroundColor: loading ? '#CEC8BF' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
      >
        {loading ? 'Enregistrement...' : 'Accéder au tableau de bord →'}
      </button>
    </form>
  );
}
