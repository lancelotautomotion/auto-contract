"use client";

import { useState } from "react";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";

const label = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570', display: 'block', marginBottom: '6px' };
const input = { width: '100%', padding: '10px 14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '14px', color: '#1C1C1A', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const section = { marginBottom: '36px' };
const sectionTitle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

interface GiteOption {
  id?: string;
  label: string;
  price: number;
}

interface GiteData {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  slug: string; contractTemplate: string;
  capacity: number; cleaningFee: number; touristTax: number;
  options: GiteOption[];
}

const VARIABLES = [
  ['{{prenom_client}}', 'Prénom du client'],
  ['{{nom_client}}', 'Nom du client'],
  ['{{email_client}}', 'Email du client'],
  ['{{telephone_client}}', 'Téléphone'],
  ['{{adresse_client}}', 'Adresse client'],
  ['{{ville_client}}', 'Ville client'],
  ['{{code_postal_client}}', 'Code postal client'],
  ['{{date_entree}}', "Date d'arrivée"],
  ['{{date_sortie}}', 'Date de départ'],
  ['{{loyer}}', 'Loyer (€)'],
  ['{{acompte}}', 'Acompte (€)'],
  ['{{solde}}', 'Solde à payer (€)'],
  ['{{menage}}', 'Frais de ménage (€)'],
  ['{{taxe_sejour}}', 'Taxe de séjour (€/nuit)'],
  ['{{options}}', 'Options sélectionnées'],
  ['{{nom_gite}}', 'Nom du gîte'],
  ['{{adresse_gite}}', 'Adresse du gîte'],
  ['{{ville_gite}}', 'Ville du gîte'],
  ['{{email_gite}}', 'Email du gîte'],
  ['{{telephone_gite}}', 'Téléphone du gîte'],
  ['{{date_du_jour}}', "Date du jour"],
];

export default function SettingsForm({ gite }: { gite: GiteData }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    giteName: gite.name, email: gite.email, phone: gite.phone,
    address: gite.address, city: gite.city, zipCode: gite.zipCode,
    slug: gite.slug,
    capacity: gite.capacity.toString(),
    cleaningFee: gite.cleaningFee.toString(),
    touristTax: gite.touristTax.toString(),
  });
  const [contractTemplate, setContractTemplate] = useState(
    gite.contractTemplate || DEFAULT_CONTRACT_TEMPLATE
  );
  const [options, setOptions] = useState<GiteOption[]>(gite.options);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addOption = () => setOptions(o => [...o, { label: '', price: 0 }]);
  const removeOption = (i: number) => setOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i: number, field: 'label' | 'price', value: string) =>
    setOptions(o => o.map((opt, idx) => idx === i ? { ...opt, [field]: field === 'price' ? parseFloat(value) || 0 : value } : opt));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, contractTemplate, options }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {form.slug && (
        <div style={{ ...section, padding: '16px 20px', backgroundColor: '#F7F4F0', borderRadius: '10px', border: '1px solid #CEC8BF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '4px' }}>Lien de réservation client</p>
            <p style={{ fontSize: '13px', color: '#1C1C1A', margin: 0 }}>
              contratgite.com/book/<strong>{form.slug}</strong>
            </p>
          </div>
          <a href={`/book/${form.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid #CEC8BF', borderRadius: '8px', color: '#1C1C1A', textDecoration: 'none' }}>
            Voir →
          </a>
        </div>
      )}

      <div style={section}>
        <p style={sectionTitle}>Votre gîte</p>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Nom du gîte *</label>
            <input required style={input} value={form.giteName} onChange={e => set('giteName', e.target.value)} />
          </div>
          <div><label style={label}>Email de contact *</label><input required type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label style={label}>Téléphone</label><input style={input} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Slug (lien public) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#7A7570', flexShrink: 0 }}>/book/</span>
              <input required style={input} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="clos-du-marida" />
            </div>
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {options.length === 0 && (
            <p style={{ fontSize: '13px', color: '#7A7570', fontStyle: 'italic', padding: '12px 0' }}>Aucune option configurée.</p>
          )}
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1px solid #CEC8BF', borderRadius: '8px', backgroundColor: '#F7F4F0' }}>
              <input type="text" placeholder="Nom de l'option (ex: Bain nordique)" value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1px solid #CEC8BF', backgroundColor: '#EDE8E1', fontSize: '13px', color: '#1C1C1A', outline: 'none', borderRadius: '6px' }} />
              <input type="number" min="0" step="0.01" placeholder="0" value={opt.price} onChange={e => updateOption(i, 'price', e.target.value)} style={{ width: '80px', padding: '8px 10px', border: '1px solid #CEC8BF', backgroundColor: '#EDE8E1', fontSize: '13px', color: '#1C1C1A', outline: 'none', borderRadius: '6px', textAlign: 'right' }} />
              <span style={{ fontSize: '13px', color: '#7A7570', flexShrink: 0 }}>€</span>
              <button type="button" onClick={() => removeOption(i)} style={{ padding: '6px 10px', border: '1px solid #CEC8BF', backgroundColor: 'transparent', color: '#7A7570', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid #CEC8BF', backgroundColor: 'transparent', color: '#1C1C1A', cursor: 'pointer', borderRadius: '8px' }}>
          + Ajouter une option
        </button>
      </div>

      <div style={section}>
        <p style={sectionTitle}>Modèle de contrat</p>
        <p style={{ fontSize: '12px', color: '#7A7570', marginBottom: '16px', lineHeight: 1.6 }}>
          Personnalisez votre contrat de location. Utilisez les variables ci-dessous pour insérer les données de chaque réservation automatiquement.
        </p>

        {/* Variables disponibles */}
        <div style={{ marginBottom: '16px', padding: '14px 16px', backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '8px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>Variables disponibles</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {VARIABLES.map(([v, desc]) => (
              <span key={v} title={desc} style={{ fontSize: '11px', fontFamily: 'monospace', padding: '3px 8px', backgroundColor: '#EDE8E1', border: '1px solid #CEC8BF', borderRadius: '4px', color: '#1C1C1A', cursor: 'pointer' }}
                onClick={() => {
                  const ta = document.getElementById('contract-template') as HTMLTextAreaElement;
                  if (ta) {
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const newVal = contractTemplate.slice(0, start) + v + contractTemplate.slice(end);
                    setContractTemplate(newVal);
                    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + v.length; ta.focus(); }, 0);
                  }
                }}
              >{v}</span>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#7A7570', marginTop: '8px', marginBottom: 0 }}>Cliquez sur une variable pour l&apos;insérer dans le contrat.</p>
        </div>

        <textarea
          id="contract-template"
          value={contractTemplate}
          onChange={e => setContractTemplate(e.target.value)}
          style={{ width: '100%', minHeight: '500px', padding: '14px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', fontSize: '12px', fontFamily: 'monospace', color: '#1C1C1A', outline: 'none', borderRadius: '8px', boxSizing: 'border-box', lineHeight: 1.6, resize: 'vertical' }}
        />

        <button
          type="button"
          onClick={() => { if (confirm('Remettre le contrat type par défaut ?')) setContractTemplate(DEFAULT_CONTRACT_TEMPLATE); }}
          style={{ marginTop: '8px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid #CEC8BF', backgroundColor: 'transparent', color: '#7A7570', cursor: 'pointer', borderRadius: '8px' }}
        >
          Réinitialiser le modèle par défaut
        </button>
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
