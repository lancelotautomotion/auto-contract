"use client";

import { useState } from "react";

const label = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const input = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const section = { marginBottom: '36px' };
const sectionTitle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

interface GiteData {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  capacity: number; cleaningFee: number; touristTax: number;
  n8nWebhookUrl: string; driveTemplateFolderId: string; driveOutputFolderId: string;
}

export default function SettingsForm({ gite }: { gite: GiteData }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    giteName: gite.name, email: gite.email, phone: gite.phone,
    address: gite.address, city: gite.city, zipCode: gite.zipCode,
    capacity: gite.capacity.toString(),
    cleaningFee: gite.cleaningFee.toString(),
    touristTax: gite.touristTax.toString(),
    n8nWebhookUrl: gite.n8nWebhookUrl,
    driveTemplateFolderId: gite.driveTemplateFolderId,
    driveOutputFolderId: gite.driveOutputFolderId,
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setSaved(true);
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
            <input required style={input} value={form.giteName} onChange={e => set('giteName', e.target.value)} />
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
        <p style={sectionTitle}>Automatisation n8n</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={label}>URL Webhook n8n (génération contrat)</label><input style={input} placeholder="https://votre-n8n.com/webhook/..." value={form.n8nWebhookUrl} onChange={e => set('n8nWebhookUrl', e.target.value)} /></div>
          <div><label style={label}>ID Dossier Drive (template)</label><input style={input} value={form.driveTemplateFolderId} onChange={e => set('driveTemplateFolderId', e.target.value)} /></div>
          <div><label style={label}>ID Dossier Drive (contrats générés)</label><input style={input} value={form.driveOutputFolderId} onChange={e => set('driveOutputFolderId', e.target.value)} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button type="submit" disabled={loading} style={{ flex: 1, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px', backgroundColor: loading ? '#CEC8BF' : '#1C1C1A', color: '#EDE8E1', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}>
          {loading ? 'Enregistrement...' : 'Sauvegarder les paramètres →'}
        </button>
        {saved && <span style={{ fontSize: '12px', color: '#7A7570' }}>✓ Sauvegardé</span>}
      </div>
    </form>
  );
}
