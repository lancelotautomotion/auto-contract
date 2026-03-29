"use client";

import { useState, useRef } from "react";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";

const lbl = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-white)', fontSize: '14px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const, borderRadius: '8px' };
const sec = { marginBottom: '36px' };
const secTitle = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

// Données d'exemple pour la prévisualisation live
const EXAMPLE_DATA: Record<string, string> = {
  prenom_client: 'Marie',
  nom_client: 'Dupont',
  email_client: 'marie.dupont@email.com',
  telephone_client: '06 12 34 56 78',
  adresse_client: '12 rue des Lilas',
  ville_client: 'Lyon',
  code_postal_client: '69003',
  date_entree: '15 juillet 2025',
  date_sortie: '22 juillet 2025',
  loyer: '1 200,00',
  acompte: '600,00',
  solde: '600,00',
  menage: '90,00',
  taxe_sejour: '1,65',
  options: '- Bain nordique : 50,00 €\n- Linge de maison : inclus',
  date_du_jour: '28 mars 2026',
};

function buildPreview(template: string, form: { giteName: string; address: string; city: string; email: string; phone: string }): string {
  const vars: Record<string, string> = {
    ...EXAMPLE_DATA,
    nom_gite: form.giteName || 'Le Clos du Marida',
    adresse_gite: form.address || '26 rue Soubise',
    ville_gite: form.city || 'Saint-Ouen-sur-Seine',
    email_gite: form.email || 'contact@gite.fr',
    telephone_gite: form.phone || '07 81 52 27 76',
  };
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), template);
}

function PreviewLine({ line, i }: { line: string; i: number }) {
  const trimmed = line.trim();
  if (trimmed === '') return <div key={i} style={{ height: '8px' }} />;
  const isArticle = /^ARTICLE\s+\d+/i.test(trimmed);
  const isSection = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 40 && !trimmed.includes(':') && !trimmed.startsWith('-') && !/^\d/.test(trimmed);
  if (isArticle) return <p style={{ fontSize: '9px', fontWeight: 700, color: '#1C1C1A', margin: '10px 0 3px', letterSpacing: '0.3px' }}>{trimmed}</p>;
  if (isSection) return <p style={{ fontSize: '8px', fontWeight: 700, color: '#7A7570', letterSpacing: '1px', margin: '12px 0 4px', borderBottom: '0.5px solid #CEC8BF', paddingBottom: '3px' }}>{trimmed}</p>;
  if (trimmed.startsWith('-')) return <p style={{ fontSize: '8.5px', color: '#1C1C1A', margin: '1px 0', paddingLeft: '8px' }}>{trimmed}</p>;
  return <p style={{ fontSize: '8.5px', color: '#1C1C1A', margin: '1px 0', lineHeight: 1.5 }}>{line}</p>;
}

interface GiteOption { id?: string; label: string; price: number; }
interface GiteData {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  slug: string; contractTemplate: string; logoDataUrl: string;
  capacity: number; cleaningFee: number; touristTax: number;
  options: GiteOption[];
}

const TABS = ['Informations', 'Options', 'Contrat', 'Logo'] as const;
type Tab = typeof TABS[number];

const VARIABLES = [
  ['{{prenom_client}}', 'Prénom du client'], ['{{nom_client}}', 'Nom du client'],
  ['{{email_client}}', 'Email du client'], ['{{telephone_client}}', 'Téléphone'],
  ['{{adresse_client}}', 'Adresse client'], ['{{ville_client}}', 'Ville client'],
  ['{{code_postal_client}}', 'Code postal client'], ['{{date_entree}}', "Date d'arrivée"],
  ['{{date_sortie}}', 'Date de départ'], ['{{loyer}}', 'Loyer (€)'],
  ['{{acompte}}', 'Acompte (€)'], ['{{solde}}', 'Solde à payer (€)'],
  ['{{menage}}', 'Frais de ménage (€)'], ['{{taxe_sejour}}', 'Taxe de séjour (€/nuit)'],
  ['{{options}}', 'Options sélectionnées'], ['{{nom_gite}}', 'Nom du gîte'],
  ['{{adresse_gite}}', 'Adresse du gîte'], ['{{ville_gite}}', 'Ville du gîte'],
  ['{{email_gite}}', 'Email du gîte'], ['{{telephone_gite}}', 'Téléphone du gîte'],
  ['{{date_du_jour}}', "Date du jour"],
];

export default function EtablissementForm({ gite }: { gite: GiteData }) {
  const [activeTab, setActiveTab] = useState<Tab>('Informations');
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
  const [contractTemplate, setContractTemplate] = useState(gite.contractTemplate || DEFAULT_CONTRACT_TEMPLATE);
  const [options, setOptions] = useState<GiteOption[]>(gite.options);
  const [logoDataUrl, setLogoDataUrl] = useState(gite.logoDataUrl || '');
  const [logoLoading, setLogoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };
  const addOption = () => setOptions(o => [...o, { label: '', price: 0 }]);
  const removeOption = (i: number) => setOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i: number, field: 'label' | 'price', value: string) =>
    setOptions(o => o.map((opt, idx) => idx === i ? { ...opt, [field]: field === 'price' ? parseFloat(value) || 0 : value } : opt));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = () => { setLogoDataUrl(reader.result as string); setLogoLoading(false); setSaved(false); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    try {
      const res = await fetch('/api/etablissement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, contractTemplate, options, logoDataUrl }) });
      if (res.ok) setSaved(true);
    } finally { setLoading(false); }
  };

  const previewLines = buildPreview(contractTemplate, form).split('\n');

  return (
    <form onSubmit={handleSubmit}>
      {/* Sticky header : titre + tabs */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--bg)', paddingTop: '48px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>— Mon établissement</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: 'var(--text)', margin: '0 0 32px' }}>{form.giteName || 'Mon établissement'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '2px', maxWidth: '800px', margin: '0 auto', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 20px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)', borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent', marginBottom: '-1px', transition: 'color 0.15s ease' }}>
            {tab}
          </button>
        ))}
        </div>
      </div>{/* /sticky header */}

      {/* Tab: Informations */}
      {activeTab === 'Informations' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {form.slug && (
            <div style={{ ...sec, padding: '16px 20px', backgroundColor: 'var(--bg-white)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Lien de réservation client</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>contratgite.com/book/<strong>{form.slug}</strong></p>
              </div>
              <a href={`/book/${form.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', textDecoration: 'none' }}>Voir →</a>
            </div>
          )}
          <div style={sec}>
            <p style={secTitle}>Votre gîte</p>
            <div style={{ ...grid2, marginBottom: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Nom du gîte *</label><input required style={inp} value={form.giteName} onChange={e => set('giteName', e.target.value)} /></div>
              <div><label style={lbl}>Email de contact *</label><input required type="email" style={inp} value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label style={lbl}>Téléphone</label><input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Slug (lien public) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>/book/</span>
                  <input required style={inp} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}><label style={lbl}>Adresse</label><input style={inp} value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div style={grid2}>
              <div><label style={lbl}>Ville</label><input style={inp} value={form.city} onChange={e => set('city', e.target.value)} /></div>
              <div><label style={lbl}>Code postal</label><input style={inp} value={form.zipCode} onChange={e => set('zipCode', e.target.value)} /></div>
            </div>
          </div>
          <div style={sec}>
            <p style={secTitle}>Tarifs par défaut</p>
            <div style={grid2}>
              <div><label style={lbl}>Capacité (personnes)</label><input type="number" style={inp} value={form.capacity} onChange={e => set('capacity', e.target.value)} /></div>
              <div><label style={lbl}>Frais de ménage (€)</label><input type="number" step="0.01" style={inp} value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} /></div>
              <div><label style={lbl}>Taxe de séjour (€/nuit)</label><input type="number" step="0.01" style={inp} value={form.touristTax} onChange={e => set('touristTax', e.target.value)} /></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Options */}
      {activeTab === 'Options' && (
        <div style={{ ...sec, maxWidth: '800px', margin: '0 auto' }}>
          <p style={secTitle}>Options proposées aux clients</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>Ces options seront disponibles sur votre page de réservation client.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {options.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>Aucune option configurée.</p>}
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-white)' }}>
                <input type="text" placeholder="Nom de l'option (ex: Bain nordique)" value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontSize: '13px', color: 'var(--text)', outline: 'none', borderRadius: '6px' }} />
                <input type="number" min="0" step="0.01" placeholder="0" value={opt.price} onChange={e => updateOption(i, 'price', e.target.value)} style={{ width: '80px', padding: '8px 10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', fontSize: '13px', color: 'var(--text)', outline: 'none', borderRadius: '6px', textAlign: 'right' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>€</span>
                <button type="button" onClick={() => removeOption(i)} style={{ padding: '6px 10px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', borderRadius: '6px' }}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addOption} style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', borderRadius: '8px' }}>+ Ajouter une option</button>
        </div>
      )}

      {/* Tab: Contrat */}
      {activeTab === 'Contrat' && (
        <div style={{ ...sec, maxWidth: '1200px', margin: '0 auto' }}>
          <p style={secTitle}>Modèle de contrat</p>

          {/* Bloc éducatif */}
          <div style={{ marginBottom: '20px', padding: '16px 20px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>💡</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>Comment fonctionnent les balises ?</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                Les balises comme <span style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: 'var(--bg)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text)' }}>{'{{nom_client}}'}</span> sont des <strong>espaces réservés</strong> automatiquement remplacés par les vraies informations lors de la génération du contrat. <strong>L&apos;aperçu à droite</strong> vous montre le résultat en temps réel avec des données d&apos;exemple.
              </p>
            </div>
          </div>

          {/* Split éditeur / aperçu */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

            {/* Éditeur gauche */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '10px', padding: '12px 14px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>Cliquez pour insérer une balise</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {VARIABLES.map(([v, desc]) => (
                    <span key={v} title={desc}
                      style={{ fontSize: '10px', fontFamily: 'monospace', padding: '3px 7px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', cursor: 'pointer' }}
                      onClick={() => {
                        const ta = document.getElementById('contract-template') as HTMLTextAreaElement;
                        if (ta) {
                          const s = ta.selectionStart, e = ta.selectionEnd;
                          const nv = contractTemplate.slice(0, s) + v + contractTemplate.slice(e);
                          setContractTemplate(nv); setSaved(false);
                          setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + v.length; ta.focus(); }, 0);
                        }
                      }}
                    >{v}</span>
                  ))}
                </div>
              </div>

              <textarea
                id="contract-template"
                value={contractTemplate}
                onChange={e => { setContractTemplate(e.target.value); setSaved(false); }}
                style={{ width: '100%', height: '520px', padding: '14px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-white)', fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text)', outline: 'none', borderRadius: '8px', boxSizing: 'border-box', lineHeight: 1.6, resize: 'none' }}
              />
            </div>

            {/* Aperçu droite */}
            <div style={{ width: '420px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Aperçu en direct</p>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>données d&apos;exemple</span>
              </div>
              <div style={{ height: '600px', overflowY: 'auto', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Mini en-tête simulé */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '8px', borderBottom: '0.5px solid #CEC8BF', marginBottom: '8px' }}>
                  <div style={{ width: '50px', height: '20px', backgroundColor: '#EDE8E1', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '6px', color: '#7A7570' }}>LOGO</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 700, color: '#1C1C1A', margin: '0 0 1px' }}>{form.giteName || 'Nom du gîte'}</p>
                    <p style={{ fontSize: '7px', color: '#7A7570', margin: 0, lineHeight: 1.4 }}>{form.address || 'Adresse'}<br />{form.city || 'Ville'}</p>
                  </div>
                </div>
                <p style={{ fontSize: '8.5px', fontWeight: 700, textAlign: 'center', letterSpacing: '0.8px', color: '#1C1C1A', margin: '0 0 2px' }}>CONTRAT DE LOCATION SAISONNIÈRE</p>
                <p style={{ fontSize: '7px', textAlign: 'center', color: '#7A7570', margin: '0 0 8px' }}>Établi le 28 mars 2026</p>
                {previewLines.map((line, i) => <PreviewLine key={i} line={line} i={i} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logo */}
      {activeTab === 'Logo' && (
        <div style={{ ...sec, maxWidth: '800px', margin: '0 auto' }}>
          <p style={secTitle}>Logo du gîte</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>Votre logo sera affiché en haut de chaque contrat PDF généré. Formats acceptés : PNG, JPG, WEBP.</p>
          {logoDataUrl ? (
            <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoDataUrl} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', borderRadius: '4px' }} />
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>Logo actuel</p>
                <button type="button" onClick={() => { setLogoDataUrl(''); setSaved(false); }} style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px' }}>Supprimer</button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '24px', padding: '48px 24px', backgroundColor: 'var(--bg-white)', border: '2px dashed var(--border)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Aucun logo — cliquez pour en ajouter un</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
          <button type="button" disabled={logoLoading} onClick={() => fileInputRef.current?.click()} style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: logoLoading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}>
            {logoLoading ? 'Chargement...' : logoDataUrl ? 'Remplacer le logo' : '+ Importer un logo'}
          </button>
        </div>
      )}

      {/* Save */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '20px', marginTop: '8px', borderTop: '1px solid var(--border)', maxWidth: activeTab === 'Contrat' ? '1200px' : '800px', margin: '8px auto 0' }}>
        {activeTab === 'Contrat' && (
          <button type="button"
            onClick={() => { if (confirm('Remettre le contrat type par défaut ?')) { setContractTemplate(DEFAULT_CONTRACT_TEMPLATE); setSaved(false); } }}
            style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 20px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', flexShrink: 0 }}>
            Réinitialiser le modèle
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button type="submit" disabled={loading} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 40px', backgroundColor: loading ? 'var(--text-muted)' : 'var(--text)', color: 'var(--bg)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px' }}>
          {loading ? 'Enregistrement...' : 'Sauvegarder →'}
        </button>
        {saved && <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>✓ Sauvegardé</span>}
      </div>
    </form>
  );
}
