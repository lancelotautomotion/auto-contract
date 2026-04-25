"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/defaultContractTemplate";
import DocumentsTab from "./DocumentsTab";

const EXAMPLE_DATA: Record<string, string> = {
  prenom_client: 'Marie', nom_client: 'Dupont', email_client: 'marie.dupont@email.com',
  telephone_client: '06 12 34 56 78', adresse_client: '12 rue des Lilas',
  ville_client: 'Lyon', code_postal_client: '69003',
  date_entree: '15 juillet 2025', date_sortie: '22 juillet 2025',
  loyer: '1 200,00', acompte: '600,00', solde: '600,00',
  menage: '90,00', taxe_sejour: '1,65',
  options: '- Bain nordique : 50,00 €\n- Linge de maison : inclus',
  date_du_jour: '28 mars 2026', code_postal_gite: '93400',
};

function buildPreview(template: string, form: { giteName: string; address: string; city: string; zipCode: string; email: string; phone: string }): string {
  const vars: Record<string, string> = {
    ...EXAMPLE_DATA,
    nom_gite: form.giteName || 'Le Clos du Marida',
    adresse_gite: form.address || '26 rue Soubise',
    ville_gite: form.city || 'Saint-Ouen-sur-Seine',
    code_postal_gite: form.zipCode || '93400',
    email_gite: form.email || 'contact@gite.fr',
    telephone_gite: form.phone || '07 81 52 27 76',
  };
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), template);
}

function PreviewLine({ line, i }: { line: string; i: number }) {
  const trimmed = line.trim();
  if (trimmed === '') return <div key={i} style={{ height: '8px' }} />;
  if (trimmed.includes(' | ')) {
    const [left, right] = trimmed.split(' | ', 2);
    const l = left.trim(); const r = right.trim();
    const isSigLine = /^_+$/.test(l) && /^_+$/.test(r);
    const isHeader = l === l.toUpperCase() && l.length > 2 && !isSigLine;
    if (isSigLine) return (
      <div style={{ display: 'flex', gap: '16px', margin: '6px 0 4px' }}>
        <div style={{ flex: 1, borderBottom: '0.5px solid #CEC8BF', height: '12px' }} />
        <div style={{ flex: 1, borderBottom: '0.5px solid #CEC8BF', height: '12px' }} />
      </div>
    );
    return (
      <div style={{ display: 'flex', gap: '16px', margin: isHeader ? '10px 0 4px' : '2px 0' }}>
        <p style={{ flex: 1, margin: 0, fontSize: isHeader ? '7.5px' : '8.5px', fontWeight: isHeader ? 700 : 400, color: isHeader ? '#7A7570' : '#1C1C1A', letterSpacing: isHeader ? '0.8px' : 0 }}>{l}</p>
        <p style={{ flex: 1, margin: 0, fontSize: isHeader ? '7.5px' : '8.5px', fontWeight: isHeader ? 700 : 400, color: isHeader ? '#7A7570' : '#1C1C1A', letterSpacing: isHeader ? '0.8px' : 0 }}>{r}</p>
      </div>
    );
  }
  const isArticle = /^ARTICLE\s+\d+/i.test(trimmed);
  const isSection = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 40 && !trimmed.includes(':') && !trimmed.startsWith('-') && !/^\d/.test(trimmed);
  if (isArticle) return <p style={{ fontSize: '9px', fontWeight: 700, color: '#1C1C1A', margin: '10px 0 3px', letterSpacing: '0.3px' }}>{trimmed}</p>;
  if (isSection) return <p style={{ fontSize: '8px', fontWeight: 700, color: '#7A7570', letterSpacing: '1px', margin: '12px 0 4px', borderBottom: '0.5px solid #CEC8BF', paddingBottom: '3px' }}>{trimmed}</p>;
  if (trimmed.startsWith('-')) return <p style={{ fontSize: '8.5px', color: '#1C1C1A', margin: '1px 0', paddingLeft: '8px' }}>{trimmed}</p>;
  return <p style={{ fontSize: '8.5px', color: '#1C1C1A', margin: '1px 0', lineHeight: 1.5 }}>{line}</p>;
}

interface GiteOption { id?: string; label: string; price: number; }
interface GiteDoc { id: string; label: string; fileName: string; mimeType: string; createdAt: string; }
interface GiteData {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  slug: string; contractTemplate: string; logoUrl: string;
  capacity: number; cleaningFee: number; touristTax: number;
  options: GiteOption[];
  documents: GiteDoc[];
}

const TABS = ['Informations', 'Options', 'Contrat', 'Logo', 'Documents'] as const;
type Tab = typeof TABS[number];

const VARIABLES: Array<[string, string, 'client' | 'booking' | 'gite']> = [
  ['{{prenom_client}}', 'Prénom client', 'client'],
  ['{{nom_client}}', 'Nom client', 'client'],
  ['{{email_client}}', 'Email client', 'client'],
  ['{{telephone_client}}', 'Tél. client', 'client'],
  ['{{adresse_client}}', 'Adresse client', 'client'],
  ['{{ville_client}}', 'Ville client', 'client'],
  ['{{code_postal_client}}', 'CP client', 'client'],
  ['{{date_entree}}', 'Arrivée', 'booking'],
  ['{{date_sortie}}', 'Départ', 'booking'],
  ['{{loyer}}', 'Loyer €', 'booking'],
  ['{{acompte}}', 'Acompte €', 'booking'],
  ['{{solde}}', 'Solde €', 'booking'],
  ['{{menage}}', 'Ménage €', 'booking'],
  ['{{taxe_sejour}}', 'Taxe séjour', 'booking'],
  ['{{options}}', 'Options', 'booking'],
  ['{{nom_gite}}', 'Nom gîte', 'gite'],
  ['{{adresse_gite}}', 'Adresse gîte', 'gite'],
  ['{{ville_gite}}', 'Ville gîte', 'gite'],
  ['{{code_postal_gite}}', 'CP gîte', 'gite'],
  ['{{email_gite}}', 'Email gîte', 'gite'],
  ['{{telephone_gite}}', 'Tél. gîte', 'gite'],
  ['{{date_du_jour}}', 'Date du jour', 'gite'],
];

const VAR_LABELS: Record<string, string> = Object.fromEntries(
  VARIABLES.map(([v, label]) => [v.slice(2, -2), label])
);

const VAR_CATEGORY: Record<string, 'client' | 'booking' | 'gite'> = Object.fromEntries(
  VARIABLES.map(([v, , cat]) => [v.slice(2, -2), cat])
);

const CHIP_COLORS = {
  client:  { bg: 'rgba(217,119,6,0.13)',   border: 'rgba(217,119,6,0.45)',   color: 'rgb(146,57,0)' },
  booking: { bg: 'rgba(127,119,221,0.13)', border: 'rgba(127,119,221,0.45)', color: '#5B52B5' },
  gite:    { bg: 'rgba(74,115,83,0.13)',   border: 'rgba(74,115,83,0.45)',   color: '#4A7353' },
};

function makeChipHTML(varName: string): string {
  const label = VAR_LABELS[varName] || varName;
  const cat = VAR_CATEGORY[varName] || 'client';
  const { bg, border, color } = CHIP_COLORS[cat];
  return (
    `<span contenteditable="false" data-var="${varName}" style="` +
    `display:inline-flex;align-items:center;` +
    `background:${bg};border:1px solid ${border};` +
    `border-radius:20px;padding:2px 6px 2px 10px;font-size:11.5px;color:${color};` +
    `font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-weight:500;` +
    `cursor:default;user-select:none;white-space:nowrap;line-height:1.5;vertical-align:middle;margin:0 2px;` +
    `">${label}` +
    `<span data-del="${varName}" style="cursor:pointer;opacity:0.4;font-size:15px;line-height:1;padding:0 5px 0 4px;">&times;</span>` +
    `</span>`
  );
}

function buildEditorHTML(template: string): string {
  return template.split('\n').map(line => {
    const content = line
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\{\{([^}]+)\}\}/g, (_, v) => makeChipHTML(v));
    return `<div>${content || '<br>'}</div>`;
  }).join('');
}

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
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    giteName: gite.name, email: gite.email, phone: gite.phone,
    address: gite.address, city: gite.city, zipCode: gite.zipCode,
    slug: gite.slug,
    capacity: gite.capacity.toString(),
    cleaningFee: gite.cleaningFee.toString(),
    touristTax: gite.touristTax.toString(),
  });
  const [savedSlug, setSavedSlug] = useState(gite.slug);
  const [contractTemplate, setContractTemplate] = useState(gite.contractTemplate || DEFAULT_CONTRACT_TEMPLATE);
  const [options, setOptions] = useState<GiteOption[]>(gite.options);
  const [logoUrl, setLogoUrl] = useState(gite.logoUrl || '');

  useEffect(() => { setOrigin(window.location.origin); }, []);
  const [logoLoading, setLogoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'Contrat' && editorRef.current && !editorRef.current.dataset.initialized) {
      editorRef.current.innerHTML = buildEditorHTML(contractTemplate);
      editorRef.current.dataset.initialized = 'true';
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current) return;
    setContractTemplate(readEditorTemplate(editorRef.current));
    setSaved(false);
  }, []);

  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.del) {
      const chip = target.closest('[data-var]') as HTMLElement | null;
      if (chip) { chip.remove(); handleEditorInput(); }
    }
  }, [handleEditorInput]);

  const handleEditorPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '    '); }
  }, []);

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
      const after = document.createTextNode('\u200B');
      chip.parentNode!.insertBefore(after, chip.nextSibling);
      range.setStart(after, 1); range.setEnd(after, 1);
      sel.removeAllRanges(); sel.addRange(range);
    } else { el.innerHTML += chipHTML; }
    setContractTemplate(readEditorTemplate(el));
    setSaved(false);
  }, []);

  const handleEditorDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const varName = e.dataTransfer.getData('text/plain');
    if (!varName || !VAR_LABELS[varName]) return;
    const el = editorRef.current;
    if (!el) return;
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(e.clientX, e.clientY);
    } else {
      const pos = (document as any).caretPositionFromPoint?.(e.clientX, e.clientY);
      if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); range.collapse(true); }
    }
    if (range && el.contains(range.commonAncestorContainer)) {
      const sel = window.getSelection()!;
      sel.removeAllRanges(); sel.addRange(range);
    }
    insertVariable(varName);
  }, [insertVariable]);

  const handleReset = useCallback(() => {
    if (!confirm('Remettre le contrat type par défaut ?')) return;
    setContractTemplate(DEFAULT_CONTRACT_TEMPLATE);
    setSaved(false);
    if (editorRef.current) editorRef.current.innerHTML = buildEditorHTML(DEFAULT_CONTRACT_TEMPLATE);
  }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleGiteNameChange = (v: string) => {
    set('giteName', v);
    // Auto-suggest slug when it's still empty
    if (!form.slug) {
      const suggested = v.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (suggested) set('slug', suggested);
    }
  };

  const bookingUrl = form.slug ? `${origin}/book/${form.slug}` : '';
  const savedBookingUrl = savedSlug ? `${origin}/book/${savedSlug}` : '';
  const slugPendingSave = form.slug !== savedSlug;
  const handleCopy = () => {
    if (!savedBookingUrl) return;
    navigator.clipboard?.writeText(savedBookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const addOption = () => setOptions(o => [...o, { label: '', price: 0 }]);
  const removeOption = (i: number) => setOptions(o => o.filter((_, idx) => idx !== i));
  const updateOption = (i: number, field: 'label' | 'price', value: string) =>
    setOptions(o => o.map((opt, idx) => idx === i ? { ...opt, [field]: field === 'price' ? parseFloat(value) || 0 : value } : opt));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) { const { url } = await res.json(); setLogoUrl(url); setSaved(false); }
    } finally { setLogoLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    try {
      const res = await fetch('/api/etablissement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, contractTemplate, options, logoUrl }) });
      if (res.ok) { setSaved(true); setSavedSlug(form.slug); }
    } finally { setLoading(false); }
  };

  const previewLines = buildPreview(contractTemplate, form).split('\n');

  const SaveBar = ({ extra }: { extra?: React.ReactNode }) => (
    <div className="save-bar" style={{ marginTop: '8px' }}>
      {extra}
      <button type="submit" disabled={loading} className="btn btn-violet btn-lg">
        {loading ? 'Enregistrement...' : 'Sauvegarder'}
        {!loading && <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8m-3-3l3 3-3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      {saved && <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✓ Sauvegardé</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="etab-form">

      {/* TABS */}
      <div className="tabs">
        {TABS.map(tab => (
          <button key={tab} type="button" className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ INFORMATIONS ═══ */}
      {activeTab === 'Informations' && (
        <div style={{ maxWidth: '860px' }}>

          {/* ── Lien de réservation — carte explicative ── */}
          <div className="booking-card">
            <div className="booking-card-header">
              <div className="booking-card-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.507 6.507 0 0 0 8 1.5z" stroke="#7F77DD" strokeWidth="1.3"/>
                  <path d="M5.5 8.5l2 2 3.5-4" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="booking-card-title">Formulaire de réservation client</div>
                <div className="booking-card-desc">
                  Partagez ce lien sur votre site, par email ou sur vos réseaux. Vos futurs locataires remplissent leurs dates et coordonnées — vous recevez une notification et validez la réservation depuis votre tableau de bord.
                </div>
              </div>
            </div>

            {bookingUrl ? (
              <div className="booking-card-link">
                <div className="booking-card-url">
                  <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ flexShrink: 0, color: '#7F77DD' }}>
                    <path d="M4.5 7.5l3-3m0 0H5.5m2 0V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  <span>{bookingUrl}</span>
                </div>
                <div className="booking-card-actions">
                  <button type="button" className="lb-btn ghost" onClick={handleCopy} disabled={slugPendingSave || !savedSlug}>
                    {copied ? (
                      <>
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#689D71" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Copié !
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><rect x="1" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1h5A1.5 1.5 0 0112 2.5v5A1.5 1.5 0 0110.5 9H9" stroke="currentColor" strokeWidth="1.1"/></svg>
                        Copier le lien
                      </>
                    )}
                  </button>
                  {slugPendingSave || !savedSlug ? (
                    <span className="lb-btn primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} aria-disabled="true">
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4 8L8 4m0 0H5m3 0v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Voir la page
                    </span>
                  ) : (
                    <a href={`/book/${savedSlug}`} target="_blank" rel="noreferrer" className="lb-btn primary">
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4 8L8 4m0 0H5m3 0v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Voir la page
                    </a>
                  )}
                </div>
                {slugPendingSave && (
                  <div className="booking-card-pending">
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" stroke="#D97706" strokeWidth="1.2"/><path d="M6 3.5V6l1.5 1" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    Sauvegardez pour activer ce nouveau lien.
                  </div>
                )}
              </div>
            ) : (
              <div className="booking-card-empty">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" stroke="#A3A3A0" strokeWidth="1.2"/><path d="M7 5v2.5l1.5 1" stroke="#A3A3A0" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Définissez un identifiant ci-dessous pour générer votre lien de réservation.
              </div>
            )}
          </div>

          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 11V7l4-4 4 4v4a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2"/><path d="M6 12v-3h2v3" stroke="currentColor" strokeWidth="1.2"/></svg>
              Votre gîte
            </div>
            <div className="form-group">
              <label className="form-label">Nom du gîte <span className="req">*</span></label>
              <input required className="form-input" type="text" value={form.giteName} onChange={e => handleGiteNameChange(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email de contact <span className="req">*</span></label>
                <input required className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Identifiant de votre page de réservation <span className="req">*</span></label>
              <div className="form-prefix">
                <span className="form-prefix-text">/book/</span>
                <input
                  required className="form-input" type="text"
                  placeholder="mon-gite"
                  value={form.slug}
                  onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                />
              </div>
              <div className="form-hint">
                Cet identifiant unique apparaît dans l'URL partagée à vos clients. Choisissez quelque chose de court et mémorisable, ex. <em>les-3-epices</em>.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input className="form-input" type="text" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input className="form-input" type="text" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Code postal</label>
                <input className="form-input" type="text" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Tarifs par défaut
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Capacité (personnes)</label>
                <input className="form-input" type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Frais de ménage (€)</label>
                <input className="form-input" type="number" step="0.01" value={form.cleaningFee} onChange={e => set('cleaningFee', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Taxe de séjour (€/nuit)</label>
                <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={e => set('touristTax', e.target.value)} />
              </div>
            </div>
          </div>

          <SaveBar />
        </div>
      )}

      {/* ═══ OPTIONS ═══ */}
      {activeTab === 'Options' && (
        <div style={{ maxWidth: '860px' }}>
          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7l1.5 1.5L10 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Options proposées aux clients
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', marginBottom: '16px' }}>Ces options seront disponibles sur votre page de réservation client.</p>
            {options.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', fontStyle: 'italic', padding: '12px 0' }}>Aucune option configurée.</p>
            )}
            {options.map((opt, i) => (
              <div key={i} className="option-row">
                <input type="text" className="option-name" placeholder="Nom de l'option..." value={opt.label} onChange={e => updateOption(i, 'label', e.target.value)} />
                <input type="number" className="option-price" min="0" step="0.01" placeholder="Gratuit" value={opt.price === 0 ? '' : String(opt.price)} onChange={e => updateOption(i, 'price', e.target.value)} />
                <span className="option-unit">€</span>
                <button type="button" className="option-del" onClick={() => removeOption(i)} title="Supprimer">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M2.5 3.5h9M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M3.5 3.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5M5.5 6v4M8.5 6v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addOption}>
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Ajouter une option
            </button>
          </div>
          <SaveBar />
        </div>
      )}

      {/* ═══ CONTRAT ═══ */}
      {activeTab === 'Contrat' && (
        <div>
          <div className="contract-split">

            {/* LEFT: variables + editor */}
            <div className="contract-left-col">
              <div className="form-card">
                <div className="form-card-title">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M4 2h6a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h4M5 7h3M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Balises dynamiques
                </div>
                <div className="variables-bar">
                  {VARIABLES.map(([v, label, cat]) => {
                    const varName = v.slice(2, -2);
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`var-tag ${cat}`}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('text/plain', varName)}
                        onClick={() => insertVariable(varName)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="contract-editor"
                onInput={handleEditorInput}
                onClick={handleEditorClick}
                onPaste={handleEditorPaste}
                onKeyDown={handleEditorKeyDown}
                onDrop={handleEditorDrop}
                onDragOver={e => e.preventDefault()}
              />
            </div>

            {/* RIGHT: info box + preview */}
            <div className="contract-right-col">
              <div className="info-box">
                <strong>Comment fonctionnent les variables ?</strong><br />
                Les balises ci-dessus représentent les informations de votre client et les vôtres. Cliquez dessus (ou glissez-les) pour les insérer dans votre contrat. Lors de la génération, elles se transformeront automatiquement avec les vraies données.
              </div>
              <div className="contract-preview">
                <div className="cp-header">
                  <span>Aperçu en direct</span>
                  <span className="cp-sub">données d&apos;exemple</span>
                </div>
                <div className="cp-body">
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
                  <p style={{ fontSize: '7px', textAlign: 'center', color: '#7A7570', margin: '0 0 8px' }}>Établi le {EXAMPLE_DATA.date_du_jour}</p>
                  {previewLines.map((line, i) => <PreviewLine key={i} line={line} i={i} />)}
                </div>
              </div>

              {/* Actions pinned at bottom of right column */}
              <div className="contract-actions">
                <button type="button" onClick={handleReset} className="btn btn-outline contract-action-btn">
                  Réinitialiser le modèle
                </button>
                <button type="submit" disabled={loading} className="btn btn-violet contract-action-btn">
                  {loading ? 'Enregistrement...' : 'Sauvegarder'}
                  {!loading && <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                {saved && <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✓ Sauvegardé</span>}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══ LOGO ═══ */}
      {activeTab === 'Logo' && (
        <div style={{ maxWidth: '860px' }}>
          <div className="form-card">
            <div className="form-card-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 10l3-3 2 2 2.5-3L11.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Logo du gîte
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', marginBottom: '16px' }}>
              Votre logo sera affiché en haut de chaque contrat PDF généré. Formats acceptés : PNG, JPG, WEBP.
            </p>
            {logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px', background: 'var(--line-light)', borderRadius: '12px', marginBottom: '16px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500, margin: 0 }}>Logo actuel</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }} disabled={logoLoading} onClick={() => fileInputRef.current?.click()}>
                      {logoLoading ? 'Chargement...' : 'Remplacer'}
                    </button>
                    <button type="button" className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => { setLogoUrl(''); setSaved(false); }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-zone-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="#A3A3A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="#A3A3A0" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div className="upload-zone-text">{logoLoading ? 'Chargement...' : 'Cliquez ou glissez votre logo ici'}</div>
                <div className="upload-zone-hint">PNG, JPG ou WEBP — 2 Mo max</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
          </div>
          <SaveBar />
        </div>
      )}

      {/* ═══ DOCUMENTS ═══ */}
      {activeTab === 'Documents' && (
        <DocumentsTab initialDocs={gite.documents} />
      )}

    </form>
  );
}
