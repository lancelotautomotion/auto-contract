"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  ['{{prenom_client}}', 'Prénom'], ['{{nom_client}}', 'Nom'],
  ['{{email_client}}', 'Email client'], ['{{telephone_client}}', 'Téléphone'],
  ['{{adresse_client}}', 'Adresse client'], ['{{ville_client}}', 'Ville client'],
  ['{{code_postal_client}}', 'Code postal'], ['{{date_entree}}', "Arrivée"],
  ['{{date_sortie}}', 'Départ'], ['{{loyer}}', 'Loyer €'],
  ['{{acompte}}', 'Acompte €'], ['{{solde}}', 'Solde €'],
  ['{{menage}}', 'Ménage €'], ['{{taxe_sejour}}', 'Taxe séjour'],
  ['{{options}}', 'Options'], ['{{nom_gite}}', 'Nom du gîte'],
  ['{{adresse_gite}}', 'Adresse gîte'], ['{{ville_gite}}', 'Ville gîte'],
  ['{{email_gite}}', 'Email gîte'], ['{{telephone_gite}}', 'Tél. gîte'],
  ['{{date_du_jour}}', "Date du jour"],
];

// Map varName → label court pour affichage dans les chips
const VAR_LABELS: Record<string, string> = Object.fromEntries(
  VARIABLES.map(([v, label]) => [v.slice(2, -2), label])
);

// Génère le HTML d'un chip de variable (pour contentEditable)
function makeChipHTML(varName: string): string {
  const label = VAR_LABELS[varName] || varName;
  return (
    `<span contenteditable="false" data-var="${varName}" style="` +
    `display:inline-flex;align-items:center;` +
    `background:rgba(217,119,6,0.13);` +
    `border:1px solid rgba(217,119,6,0.45);` +
    `border-radius:20px;padding:2px 6px 2px 10px;` +
    `font-size:11.5px;color:rgb(146,57,0);` +
    `font-family:Inter,ui-sans-serif,sans-serif;font-weight:500;` +
    `cursor:default;user-select:none;white-space:nowrap;` +
    `line-height:1.5;vertical-align:middle;margin:0 2px;` +
    `">${label}` +
    `<span data-del="${varName}" style="cursor:pointer;opacity:0.4;font-size:15px;line-height:1;padding:0 5px 0 4px;">&times;</span>` +
    `</span>`
  );
}

// Convertit un template string en innerHTML pour le contentEditable
function buildEditorHTML(template: string): string {
  return template.split('\n').map(line => {
    const content = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\{\{([^}]+)\}\}/g, (_, v) => makeChipHTML(v));
    return `<div>${content || '<br>'}</div>`;
  }).join('');
}

// Lit le contentEditable et retourne le template string avec {{variables}}
function readEditorTemplate(el: HTMLDivElement): string {
  function readNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const elem = node as HTMLElement;
    if (elem.dataset.var) return `{{${elem.dataset.var}}}`;
    if (elem.tagName === 'BR') return '';
    return Array.from(elem.childNodes).map(readNode).join('');
  }
  const lines: string[] = [];
  el.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const div = child as HTMLElement;
      if (div.tagName === 'DIV' || div.tagName === 'P') { lines.push(readNode(div)); return; }
    }
    const t = readNode(child);
    if (t) lines.push(t);
  });
  return lines.join('\n');
}

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
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialise l'éditeur quand on ouvre l'onglet Contrat
  useEffect(() => {
    if (activeTab === 'Contrat' && editorRef.current && !editorRef.current.dataset.initialized) {
      editorRef.current.innerHTML = buildEditorHTML(contractTemplate);
      editorRef.current.dataset.initialized = 'true';
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sérialise le DOM → template string à chaque saisie
  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    setContractTemplate(readEditorTemplate(editorRef.current));
    setSaved(false);
  }, []);

  // Suppression d'un chip via le bouton ×
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.del) {
      const chip = target.closest('[data-var]') as HTMLElement | null;
      if (chip) { chip.remove(); handleEditorInput(); }
    }
  }, [handleEditorInput]);

  // Colle uniquement du texte brut (pas de HTML)
  const handleEditorPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Tab → insère 4 espaces au lieu de changer le focus
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  }, []);

  // Insère un chip à la position du curseur (clic sur palette)
  const insertVariable = useCallback((varName: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const chipHTML = makeChipHTML(varName);
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const tmp = document.createElement('span');
      tmp.innerHTML = chipHTML;
      const chip = tmp.firstChild!;
      range.insertNode(chip);
      // Place le curseur juste après le chip
      const after = document.createTextNode('\u200B');
      chip.parentNode!.insertBefore(after, chip.nextSibling);
      range.setStart(after, 1);
      range.setEnd(after, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      el.innerHTML += chipHTML;
    }
    setContractTemplate(readEditorTemplate(el));
    setSaved(false);
  }, []);

  // Reçoit le drop d'un chip depuis la palette
  const handleEditorDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const varName = e.dataTransfer.getData('text/plain');
    if (!varName || !VAR_LABELS[varName]) return;
    const el = editorRef.current;
    if (!el) return;

    // Positionne le curseur à l'endroit du drop
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else {
      const pos = (document as any).caretPositionFromPoint?.(e.clientX, e.clientY);
      if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); range.collapse(true); }
    }
    if (range && el.contains(range.commonAncestorContainer)) {
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
    }
    insertVariable(varName);
  }, [insertVariable]);

  // Réinitialise le template ET le contenu de l'éditeur
  const handleReset = useCallback(() => {
    if (!confirm('Remettre le contrat type par défaut ?')) return;
    setContractTemplate(DEFAULT_CONTRACT_TEMPLATE);
    setSaved(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = buildEditorHTML(DEFAULT_CONTRACT_TEMPLATE);
    }
  }, []);

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
        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '36px' }}>
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '36px' }}>
          <p style={secTitle}>Modèle de contrat</p>

          {/* Split éditeur / aperçu */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* Éditeur gauche */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Palette de variables (draggable) */}
              <div style={{ marginBottom: '0', padding: '12px 16px 12px', backgroundColor: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '10px 10px 0 0', borderBottom: 'none' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                  Glissez ou cliquez pour insérer une variable
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {VARIABLES.map(([v, label]) => {
                    const varName = v.slice(2, -2);
                    return (
                      <span
                        key={v}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('text/plain', varName)}
                        onClick={() => insertVariable(varName)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(217,119,6,0.1)',
                          border: '1px solid rgba(217,119,6,0.4)',
                          borderRadius: '20px',
                          padding: '3px 11px',
                          fontSize: '11.5px',
                          color: 'rgb(146,57,0)',
                          fontFamily: 'Inter,ui-sans-serif,sans-serif',
                          fontWeight: 500,
                          cursor: 'grab',
                          userSelect: 'none',
                          transition: 'background 0.12s',
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Zone d'édition riche (contentEditable) */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onClick={handleEditorClick}
                onPaste={handleEditorPaste}
                onKeyDown={handleEditorKeyDown}
                onDrop={handleEditorDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  minHeight: '560px',
                  padding: '20px 24px',
                  fontSize: '13px',
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  lineHeight: 1.9,
                  color: '#1C1C1A',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '0 0 10px 10px',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflowY: 'auto',
                  boxSizing: 'border-box' as const,
                  wordBreak: 'break-word',
                }}
              />
            </div>

            {/* Aperçu droite */}
            <div style={{ width: '380px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Aperçu en direct</p>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>données d&apos;exemple</span>
              </div>
              <div style={{ height: '648px', overflowY: 'auto', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '36px' }}>
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
          <button type="button" onClick={handleReset}
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
