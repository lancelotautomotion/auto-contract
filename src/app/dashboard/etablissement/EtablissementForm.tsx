"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { CheckCircle, Home, Clock, Link as LinkIcon, Check, Copy, ExternalLink, AlertTriangle, AlertCircle, FileText, Image, Eye, ArrowRight, Plus, Trash2, X, Upload } from "lucide-react";
import { DEFAULT_CONTRACT_TEMPLATE, DEFAULT_GUESTHOUSE_CONTRACT_TEMPLATE, mergeTemplates } from "@/lib/defaultContractTemplate";
import {
  parseStored, serializeLines, classifyLine, splitRunsAtPipe,
  resolveRun, runsPlain, templateHasVar, domToLines, PREVIEW_SIZE_PX,
  type Line, type Run,
} from "@/lib/contractFormat";
import DocumentsTab from "./DocumentsTab";
import IcalTab from "./IcalTab";
import RoomsManager from "@/app/dashboard/maisons-hotes/RoomsManager";

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

function buildPreviewVars(form: { giteName: string; address: string; city: string; zipCode: string; email: string; phone: string }): Record<string, string> {
  return {
    ...EXAMPLE_DATA,
    nom_gite: form.giteName || 'Le Clos du Marida',
    adresse_gite: form.address || '26 rue Soubise',
    ville_gite: form.city || 'Saint-Ouen-sur-Seine',
    code_postal_gite: form.zipCode || '93400',
    email_gite: form.email || 'contact@gite.fr',
    telephone_gite: form.phone || '07 81 52 27 76',
  };
}

function runCss(run: Run): React.CSSProperties {
  return {
    fontWeight: run.bold === true ? 700 : run.bold === false ? 400 : undefined,
    fontStyle: run.italic ? 'italic' : undefined,
    textDecoration: run.underline ? 'underline' : undefined,
    fontSize: run.size ? `${PREVIEW_SIZE_PX[run.size]}px` : undefined,
  };
}

function RunsView({ runs, vars }: { runs: Run[]; vars: Record<string, string> }) {
  return (
    <>
      {runs.map((r, i) => {
        const text = resolveRun(r, vars);
        if (!text) return null;
        return <span key={i} style={runCss(r)}>{text}</span>;
      })}
    </>
  );
}

function PreviewLine({ line, vars }: { line: Line; vars: Record<string, string> }) {
  const kind = classifyLine(line);
  if (kind === 'empty') return <div style={{ height: '8px' }} />;

  if (kind === 'twocol') {
    const split = splitRunsAtPipe(line.runs);
    if (!split) return null;
    const lPlain = runsPlain(split.left).trim();
    const rPlain = runsPlain(split.right).trim();
    const isSigLine = /^_+$/.test(lPlain) && /^_+$/.test(rPlain);
    const isHeader = lPlain === lPlain.toUpperCase() && lPlain.length > 2 && !isSigLine;
    if (isSigLine) return (
      <div style={{ display: 'flex', gap: '16px', margin: '6px 0 4px' }}>
        <div style={{ flex: 1, borderBottom: '0.5px solid #CEC8BF', height: '12px' }} />
        <div style={{ flex: 1, borderBottom: '0.5px solid #CEC8BF', height: '12px' }} />
      </div>
    );
    const sideStyle: React.CSSProperties = { flex: 1, margin: 0, fontSize: isHeader ? '10px' : '11px', fontWeight: isHeader ? 700 : 400, color: isHeader ? '#7A7570' : '#1C1C1A', letterSpacing: isHeader ? '0.8px' : 0 };
    return (
      <div style={{ display: 'flex', gap: '16px', margin: isHeader ? '10px 0 4px' : '2px 0' }}>
        <p style={sideStyle}>{isHeader ? lPlain : <RunsView runs={split.left} vars={vars} />}</p>
        <p style={sideStyle}>{isHeader ? rPlain : <RunsView runs={split.right} vars={vars} />}</p>
      </div>
    );
  }

  if (kind === 'article') {
    return <p style={{ fontSize: '12px', fontWeight: 700, color: '#1C1C1A', margin: '10px 0 3px', letterSpacing: '0.3px' }}><RunsView runs={line.runs} vars={vars} /></p>;
  }
  if (kind === 'label') {
    return <p style={{ fontSize: '11px', fontWeight: 700, color: '#7A7570', letterSpacing: '1px', margin: '12px 0 4px', borderBottom: '0.5px solid #CEC8BF', paddingBottom: '3px' }}><RunsView runs={line.runs} vars={vars} /></p>;
  }

  // Expand multi-line resolved values (e.g. {{options}} → plusieurs lignes)
  const resolvedFull = line.runs.map(r => resolveRun(r, vars)).join('');
  if (resolvedFull.includes('\n')) {
    const subLines = resolvedFull.split('\n');
    return (
      <>
        {subLines.map((sub, i) => {
          if (!sub.trim()) return <div key={i} style={{ height: '4px' }} />;
          const isBullet = sub.trimStart().startsWith('-');
          return <p key={i} style={{ fontSize: '11px', color: '#1C1C1A', margin: '1px 0', lineHeight: 1.5, paddingLeft: isBullet ? '8px' : undefined }}>{sub}</p>;
        })}
      </>
    );
  }

  const isBullet = runsPlain(line.runs).trimStart().startsWith('-');
  return (
    <p style={{ fontSize: '11px', color: '#1C1C1A', margin: '1px 0', lineHeight: 1.5, textAlign: line.align, paddingLeft: isBullet ? '8px' : undefined }}>
      <RunsView runs={line.runs} vars={vars} />
    </p>
  );
}

interface GiteOption { id?: string; label: string; price: number; }
interface GiteDoc { id: string; label: string; fileName: string; mimeType: string; createdAt: string; }
interface GiteData {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  slug: string;
  contractTemplateGeneral: string;
  contractTemplateHouseRules: string;
  logoUrl: string;
  capacity: number; cleaningFee: number; touristTax: number;
  options: GiteOption[];
  documents: GiteDoc[];
}

interface GuesthouseRoomLite { id: string; name: string; slug: string | null; capacity: number; basePrice: number; cleaningFee: number; specificClauses: string | null; active: boolean; }
interface GuesthouseData {
  slug: string | null;
  id: string; name: string; email: string; phone: string;
  address: string; city: string; zipCode: string;
  contractTemplateGeneral: string;
  contractTemplateHouseRules: string;
  logoUrl: string;
  capacity: number; touristTax: number;
  rooms: GuesthouseRoomLite[];
  documents: GiteDoc[];
}

const TABS_GITE = ['Informations', 'Options', 'Contrat', 'Logo', 'Documents', 'iCal'] as const;
const TABS_GUESTHOUSE = ['Informations', 'Chambres', 'Contrat', 'Logo', 'Documents', 'iCal'] as const;
type Tab = (typeof TABS_GITE)[number] | (typeof TABS_GUESTHOUSE)[number];
type EditorZone = 'general' | 'houseRules';

type VarCat = 'client' | 'booking' | 'gite' | 'chambre';

const VARIABLES_BASE: Array<[string, string, VarCat]> = [
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

// Variables additionnelles disponibles uniquement en mode maison d'hôtes (location à la chambre).
const VARIABLES_GUESTHOUSE: Array<[string, string, VarCat]> = [
  ['{{nom_chambre}}', 'Nom de la chambre', 'chambre'],
  ['{{capacite_chambre}}', 'Capacité (pers.)', 'chambre'],
  ['{{prix_chambre_nuit}}', 'Prix/nuit chambre €', 'chambre'],
  ['{{specificites_chambre}}', 'Clauses spécifiques', 'chambre'],
];

// Balises dont l'absence rend le contrat juridiquement incomplet (selon le mode)
const MANDATORY_TAGS_GITE: Array<{ key: string; label: string }> = [
  { key: 'nom_client',    label: 'Nom client' },
  { key: 'prenom_client', label: 'Prénom client' },
  { key: 'date_entree',   label: 'Arrivée' },
  { key: 'date_sortie',   label: 'Départ' },
  { key: 'loyer',         label: 'Loyer €' },
  { key: 'acompte',       label: 'Acompte €' },
  { key: 'nom_gite',      label: 'Nom gîte' },
];
const MANDATORY_TAGS_GUESTHOUSE: Array<{ key: string; label: string }> = [
  ...MANDATORY_TAGS_GITE,
  { key: 'nom_chambre',   label: 'Nom de la chambre' },
];

const VAR_LABELS: Record<string, string> = Object.fromEntries(
  [...VARIABLES_BASE, ...VARIABLES_GUESTHOUSE].map(([v, label]) => [v.slice(2, -2), label])
);

const VAR_CATEGORY: Record<string, VarCat> = Object.fromEntries(
  [...VARIABLES_BASE, ...VARIABLES_GUESTHOUSE].map(([v, , cat]) => [v.slice(2, -2), cat])
);

const CHIP_COLORS: Record<VarCat, { bg: string; border: string; color: string }> = {
  client:  { bg: 'rgba(217,119,6,0.13)',   border: 'rgba(217,119,6,0.45)',   color: 'rgb(146,57,0)' },
  booking: { bg: 'rgba(127,119,221,0.13)', border: 'rgba(127,119,221,0.45)', color: '#5B52B5' },
  gite:    { bg: 'rgba(74,115,83,0.13)',   border: 'rgba(74,115,83,0.45)',   color: '#4A7353' },
  chambre: { bg: 'rgba(196,93,122,0.13)',  border: 'rgba(196,93,122,0.45)',  color: '#9B3E5A' },
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function runToEditorHTML(run: Run): string {
  if (run.varName) return makeChipHTML(run.varName);
  let html = escapeHtml(run.text ?? '');
  if (run.size === 'sm') html = `<span class="sz-sm">${html}</span>`;
  else if (run.size === 'lg') html = `<span class="sz-lg">${html}</span>`;
  if (run.underline) html = `<u>${html}</u>`;
  if (run.italic) html = `<i>${html}</i>`;
  if (run.bold) html = `<b>${html}</b>`;
  return html;
}

function lineToEditorHTML(line: Line): string {
  const kind = classifyLine(line);
  const inner = line.runs.map(runToEditorHTML).join('') || '<br>';
  const align = line.align ? ` style="text-align:${line.align}"` : '';
  const kindAttr = (kind !== 'normal' && kind !== 'empty') ? ` data-kind="${kind}"` : '';
  return `<div${kindAttr}${align}>${inner}</div>`;
}

function applyEditorKinds(el: HTMLDivElement) {
  const lines = domToLines(el);
  Array.from(el.querySelectorAll(':scope > div')).forEach((div, i) => {
    const line = lines[i];
    if (!line) { div.removeAttribute('data-kind'); return; }
    const kind = classifyLine(line);
    if (kind !== 'normal' && kind !== 'empty') div.setAttribute('data-kind', kind);
    else div.removeAttribute('data-kind');
  });
}

function buildEditorHTML(stored: string): string {
  const lines = parseStored(stored);
  if (lines.length === 0) return '<div><br></div>';
  return lines.map(lineToEditorHTML).join('');
}

function readEditorTemplate(el: HTMLDivElement): string {
  return serializeLines(domToLines(el));
}

// Nettoie le texte brut collé depuis Word ou d'autres sources
function sanitizePastedText(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")   // guillemets simples typographiques → apostrophe droite
    .replace(/[“”„‟]/g, '"')    // guillemets doubles typographiques → guillemet droit
    .replace(/[«»]/g, '"')                // guillemets français «» → guillemet droit
    .replace(/[   ]/g, ' ')          // espaces insécables/fines → espace normale
    .replace(/­/g, '')                         // tiret conditionnel (soft hyphen) → supprimé
    .replace(/‑/g, '-')                        // tiret insécable → tiret normal
    .replace(/–/g, '-')                        // tiret moyen (en-dash) → tiret normal
    .replace(/—/g, ' - ')                      // tiret long (em-dash) → espace-tiret-espace
    .replace(/…/g, '...')                      // points de suspension → trois points
    .replace(/[​‌‍﻿]/g, '')     // caractères de largeur nulle
    .replace(/\r\n/g, '\n')                       // fins de ligne Windows \u2192 Unix
    .replace(/\n{3,}/g, '\n\n');                 // max 2 lignes vides consécutives
}

export default function EtablissementForm({ gite, guesthouse }: { gite?: GiteData; guesthouse?: GuesthouseData }) {
  const mode: 'gite' | 'guesthouse' = guesthouse ? 'guesthouse' : 'gite';
  // Source d'information unifiée — toutes les UIs lisent depuis "src" sauf champs gite-spécifiques.
  const src = (guesthouse ?? gite)!;
  const TABS = mode === 'guesthouse' ? TABS_GUESTHOUSE : TABS_GITE;
  const activeVariables = mode === 'guesthouse' ? [...VARIABLES_BASE, ...VARIABLES_GUESTHOUSE] : VARIABLES_BASE;
  const activeMandatoryTags = mode === 'guesthouse' ? MANDATORY_TAGS_GUESTHOUSE : MANDATORY_TAGS_GITE;
  const activeVarGroups: Array<{ cat: VarCat; label: string }> = mode === 'guesthouse'
    ? [
        { cat: 'client', label: 'Client' },
        { cat: 'booking', label: 'Réservation' },
        { cat: 'chambre', label: 'Chambre' },
        { cat: 'gite', label: 'Établissement' },
      ]
    : [
        { cat: 'client', label: 'Client' },
        { cat: 'booking', label: 'Réservation' },
        { cat: 'gite', label: 'Gîte' },
      ];

  const [activeTab, setActiveTab] = useState<Tab>('Informations');
  const [activeEditorZone, setActiveEditorZone] = useState<EditorZone>('general');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    giteName: src.name, email: src.email, phone: src.phone,
    address: src.address, city: src.city, zipCode: src.zipCode,
    slug: gite?.slug ?? '',
    capacity: src.capacity.toString(),
    cleaningFee: (gite?.cleaningFee ?? 0).toString(),
    touristTax: src.touristTax.toString(),
  });
  const [savedSlug, setSavedSlug] = useState(gite?.slug ?? '');
  const DEFAULT_TEMPLATE = mode === 'guesthouse' ? DEFAULT_GUESTHOUSE_CONTRACT_TEMPLATE : DEFAULT_CONTRACT_TEMPLATE;
  const [contractTemplateGeneral, setContractTemplateGeneral] = useState(
    src.contractTemplateGeneral || DEFAULT_TEMPLATE
  );
  const [contractTemplateHouseRules, setContractTemplateHouseRules] = useState(
    src.contractTemplateHouseRules || ''
  );
  const [options, setOptions] = useState<GiteOption[]>(gite?.options ?? []);
  const [logoUrl, setLogoUrl] = useState(src.logoUrl || '');

  useEffect(() => { setOrigin(window.location.origin); }, []);
  const [logoLoading, setLogoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorGeneralRef = useRef<HTMLDivElement>(null);
  const editorHouseRulesRef = useRef<HTMLDivElement>(null);

  // Initialise les deux éditeurs au premier affichage de l'onglet Contrat
  useEffect(() => {
    if (activeTab !== 'Contrat') return;
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* noop */ }
    if (editorGeneralRef.current && !editorGeneralRef.current.dataset.initialized) {
      editorGeneralRef.current.innerHTML = buildEditorHTML(contractTemplateGeneral);
      editorGeneralRef.current.dataset.initialized = 'true';
      applyEditorKinds(editorGeneralRef.current);
    }
    if (editorHouseRulesRef.current && !editorHouseRulesRef.current.dataset.initialized) {
      editorHouseRulesRef.current.innerHTML = buildEditorHTML(contractTemplateHouseRules);
      editorHouseRulesRef.current.dataset.initialized = 'true';
      applyEditorKinds(editorHouseRulesRef.current);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Balises obligatoires manquantes dans les Conditions Générales
  const missingMandatoryTags = useMemo(() =>
    activeMandatoryTags.filter(({ key }) => !templateHasVar(contractTemplateGeneral, key)),
    [contractTemplateGeneral, activeMandatoryTags]
  );

  const getActiveEditorRef = useCallback(() =>
    activeEditorZone === 'general' ? editorGeneralRef : editorHouseRulesRef,
    [activeEditorZone]
  );

  const handleEditorInput = useCallback((zone: EditorZone) => () => {
    const ref = zone === 'general' ? editorGeneralRef : editorHouseRulesRef;
    if (!ref.current) return;
    if (zone === 'general') setContractTemplateGeneral(readEditorTemplate(ref.current));
    else setContractTemplateHouseRules(readEditorTemplate(ref.current));
    setSaved(false);
    applyEditorKinds(ref.current);
  }, []);

  const handleEditorClick = useCallback((zone: EditorZone) => (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.del) {
      const chip = target.closest('[data-var]') as HTMLElement | null;
      if (chip) {
        chip.remove();
        handleEditorInput(zone)();
      }
    }
  }, [handleEditorInput]);

  const handleEditorPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text/plain');
    const clean = sanitizePastedText(raw);
    document.execCommand('insertText', false, clean);
  }, []);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '    '); }
  }, []);

  const syncActive = useCallback((el: HTMLDivElement) => {
    if (activeEditorZone === 'general') setContractTemplateGeneral(readEditorTemplate(el));
    else setContractTemplateHouseRules(readEditorTemplate(el));
    setSaved(false);
    applyEditorKinds(el);
  }, [activeEditorZone]);

  const exec = useCallback((cmd: string, value?: string) => {
    const el = getActiveEditorRef().current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, value);
    syncActive(el);
  }, [getActiveEditorRef, syncActive]);

  const toggleBullet = useCallback(() => {
    const el = getActiveEditorRef().current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== el && !(node.nodeType === Node.ELEMENT_NODE && ['DIV', 'P'].includes((node as HTMLElement).tagName))) {
      node = node.parentNode;
    }
    if (!node || node === el) return;
    const block = node as HTMLElement;
    if ((block.textContent || '').trimStart().startsWith('-')) {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const first = walker.nextNode();
      if (first) first.textContent = (first.textContent || '').replace(/^(\s*)-\s?/, '$1');
    } else {
      block.insertBefore(document.createTextNode('- '), block.firstChild);
    }
    syncActive(el);
  }, [getActiveEditorRef, syncActive]);

  const flashChip = useCallback((chip: HTMLElement | null) => {
    if (!chip) return;
    chip.classList.add('chip-flash');
    setTimeout(() => chip.classList.remove('chip-flash'), 700);
  }, []);

  const insertVariable = useCallback((varName: string) => {
    const el = getActiveEditorRef().current;
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
      const after = document.createTextNode('​');
      chip.parentNode!.insertBefore(after, chip.nextSibling);
      range.setStart(after, 1); range.setEnd(after, 1);
      sel.removeAllRanges(); sel.addRange(range);
      flashChip(chip as HTMLElement);
    } else {
      el.innerHTML += chipHTML;
      flashChip(el.querySelector('[data-var]:last-of-type'));
    }
    if (activeEditorZone === 'general') setContractTemplateGeneral(readEditorTemplate(el));
    else setContractTemplateHouseRules(readEditorTemplate(el));
    setSaved(false);
  }, [activeEditorZone, getActiveEditorRef, flashChip]);

  const handleEditorDrop = useCallback((zone: EditorZone) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const varName = e.dataTransfer.getData('text/plain');
    if (!varName || !VAR_LABELS[varName]) return;
    // Switche vers la zone sur laquelle on drop
    setActiveEditorZone(zone);
    const el = zone === 'general' ? editorGeneralRef.current : editorHouseRulesRef.current;
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
    // insertVariable lit activeEditorZone — on force via ref direct
    el.focus();
    const sel = window.getSelection();
    const chipHTML = makeChipHTML(varName);
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const tmp = document.createElement('span');
      tmp.innerHTML = chipHTML;
      const chip = tmp.firstChild!;
      r.insertNode(chip);
      const after = document.createTextNode('​');
      chip.parentNode!.insertBefore(after, chip.nextSibling);
      r.setStart(after, 1); r.setEnd(after, 1);
      sel.removeAllRanges(); sel.addRange(r);
      flashChip(chip as HTMLElement);
    } else {
      el.innerHTML += chipHTML;
      flashChip(el.querySelector('[data-var]:last-of-type'));
    }
    if (zone === 'general') setContractTemplateGeneral(readEditorTemplate(el));
    else setContractTemplateHouseRules(readEditorTemplate(el));
    setSaved(false);
  }, [flashChip]);

  const handleResetGeneral = useCallback(() => {
    if (!confirm('Remettre les Conditions Générales par défaut ?')) return;
    setContractTemplateGeneral(DEFAULT_TEMPLATE);
    setSaved(false);
    if (editorGeneralRef.current) editorGeneralRef.current.innerHTML = buildEditorHTML(DEFAULT_TEMPLATE);
  }, []);

  const handleResetHouseRules = useCallback(() => {
    if (!confirm('Effacer le Règlement Intérieur ?')) return;
    setContractTemplateHouseRules('');
    setSaved(false);
    if (editorHouseRulesRef.current) editorHouseRulesRef.current.innerHTML = buildEditorHTML('');
  }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleGiteNameChange = (v: string) => {
    set('giteName', v);
    if (!form.slug) {
      const suggested = v.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
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
      let res: Response;
      if (mode === 'guesthouse') {
        res = await fetch(`/api/guesthouse/${src.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.giteName,
            email: form.email, phone: form.phone,
            address: form.address, city: form.city, zipCode: form.zipCode,
            capacity: form.capacity, touristTax: form.touristTax,
            contractTemplateGeneral, contractTemplateHouseRules, logoUrl,
          }),
        });
      } else {
        res = await fetch('/api/etablissement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giteId: src.id, ...form, contractTemplateGeneral, contractTemplateHouseRules, options, logoUrl }),
        });
      }
      if (res.ok) { setSaved(true); setSavedSlug(form.slug); }
    } finally { setLoading(false); }
  };

  const previewVars = buildPreviewVars(form);
  const previewLineModels = parseStored(mergeTemplates(contractTemplateGeneral, contractTemplateHouseRules));

  const previewBody = (
    <>
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
      {previewLineModels.map((line, i) => <PreviewLine key={i} line={line} vars={previewVars} />)}
    </>
  );

  const SaveBar = ({ extra }: { extra?: React.ReactNode }) => (
    <div className="save-bar" style={{ marginTop: '8px' }}>
      {extra}
      <button type="submit" disabled={loading} className="btn btn-violet btn-lg">
        {loading ? 'Enregistrement...' : 'Sauvegarder'}
        {!loading && <ArrowRight size={14} strokeWidth={1.4} />}
      </button>
      {saved && <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✓ Sauvegardé</span>}
    </div>
  );

  const isChambresTab = activeTab === 'Chambres' && mode === 'guesthouse' && guesthouse;

  return (
    <div className="etab-form">

      {/* TABS */}
      <div className="tabs">
        {TABS.map(tab => (
          <button key={tab} type="button" className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Chambres tab renders outside the form to avoid nested-form HTML issue */}
      {isChambresTab && (
        <div style={{ maxWidth: '860px' }}>
          <RoomsManager guesthouseId={guesthouse!.id} guesthouseSlug={guesthouse!.slug ?? null} initialRooms={guesthouse!.rooms} />
        </div>
      )}

      {!isChambresTab && <form onSubmit={handleSubmit}>

      {/* ═══ INFORMATIONS ═══ */}
      {activeTab === 'Informations' && (
        <div style={{ maxWidth: '860px' }}>

          {mode === 'gite' && <div className="booking-card">
            <div className="booking-card-header">
              <div className="booking-card-icon">
                <CheckCircle size={16} strokeWidth={1.4} color="#7F77DD" />
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
                  <LinkIcon size={12} strokeWidth={1.4} style={{ flexShrink: 0, color: '#7F77DD' }} />
                  <span>{bookingUrl}</span>
                </div>
                <div className="booking-card-actions">
                  <button type="button" className="lb-btn ghost" onClick={handleCopy} disabled={slugPendingSave || !savedSlug}>
                    {copied ? (
                      <>
                        <Check size={12} strokeWidth={1.4} color="#689D71" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy size={12} strokeWidth={1.4} />
                        Copier le lien
                      </>
                    )}
                  </button>
                  {slugPendingSave || !savedSlug ? (
                    <span className="lb-btn primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} aria-disabled="true">
                      <ExternalLink size={12} strokeWidth={1.4} color="#fff" />
                      Voir la page
                    </span>
                  ) : (
                    <a href={`/book/${savedSlug}`} target="_blank" rel="noreferrer" className="lb-btn primary">
                      <ExternalLink size={12} strokeWidth={1.4} color="#fff" />
                      Voir la page
                    </a>
                  )}
                </div>
                {slugPendingSave && (
                  <div className="booking-card-pending">
                    <Clock size={12} strokeWidth={1.4} color="#D97706" />
                    Sauvegardez pour activer ce nouveau lien.
                  </div>
                )}
              </div>
            ) : (
              <div className="booking-card-empty">
                <Clock size={14} strokeWidth={1.4} color="#A3A3A0" />
                Définissez un identifiant ci-dessous pour générer votre lien de réservation.
              </div>
            )}
          </div>}

          <div className="form-card">
            <div className="form-card-title">
              <Home size={14} strokeWidth={1.4} />
              {mode === 'guesthouse' ? "Votre maison d'hôtes" : "Votre gîte"}
            </div>
            <div className="form-group">
              <label className="form-label">{mode === 'guesthouse' ? "Nom de l'établissement" : "Nom du gîte"} <span className="req">*</span></label>
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
            {mode === 'gite' && (
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
            )}
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
              <Clock size={14} strokeWidth={1.4} />
              Tarifs par défaut
            </div>
            {mode === 'gite' ? (
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
                  <label className="form-label">Taxe de séjour (€/nuit/pers.)</label>
                  <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={e => set('touristTax', e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacité max (personnes)</label>
                  <input className="form-input" type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Taxe de séjour (€/adulte/nuit)</label>
                  <input className="form-input" type="number" step="0.01" value={form.touristTax} onChange={e => set('touristTax', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <SaveBar />
        </div>
      )}

      {/* ═══ OPTIONS ═══ */}
      {activeTab === 'Options' && mode === 'gite' && (
        <div style={{ maxWidth: '860px' }}>
          <div className="form-card">
            <div className="form-card-title">
              <CheckCircle size={14} strokeWidth={1.4} />
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
                <button type="button" className="option-del" onClick={() => removeOption(i)} title="Supprimer" aria-label="Supprimer">
                  <Trash2 size={14} strokeWidth={1.4} />
                </button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={addOption}>
              <Plus size={12} strokeWidth={1.4} />
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

            {/* LEFT: balises + aide + sauvegarde */}
            <div className="contract-left-col">

              {/* Alerte balises obligatoires manquantes */}
              {missingMandatoryTags.length > 0 && (
                <div className="contract-alert">
                  <AlertTriangle size={16} strokeWidth={1.4} color="#B45309" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Balises obligatoires manquantes dans les Conditions Générales&nbsp;:</strong>
                    <span className="contract-alert-tags">
                      {missingMandatoryTags.map(({ label }) => label).join(', ')}
                    </span>
                    <span className="contract-alert-note">La sauvegarde reste possible, mais le contrat généré sera incomplet.</span>
                  </div>
                </div>
              )}

              <div className="editor-left-sticky">

                {/* Variables panel */}
                <div className="form-card variables-panel" style={{ marginBottom: 0 }}>
                  <div className="form-card-title">
                    <FileText size={14} strokeWidth={1.4} />
                    Balises dynamiques
                    <span className="contract-zone-hint">→ zone active : <strong>{activeEditorZone === 'general' ? 'Conditions Générales' : 'Règlement Intérieur'}</strong></span>
                  </div>
                  <div className="variables-groups">
                    {activeVarGroups.map(group => (
                      <div key={group.cat} className="variables-group">
                        <span className="variables-group-label">{group.label}</span>
                        <div className="variables-bar">
                          {activeVariables.filter(([, , cat]) => cat === group.cat).map(([v, label, cat]) => {
                            const varName = v.slice(2, -2);
                            const isMandatory = activeMandatoryTags.some(t => t.key === varName);
                            const isMissing = isMandatory && missingMandatoryTags.some(t => t.key === varName);
                            return (
                              <button
                                key={v}
                                type="button"
                                className={`var-tag ${cat}${isMissing ? ' var-tag-missing' : ''}`}
                                draggable
                                onDragStart={e => e.dataTransfer.setData('text/plain', varName)}
                                onClick={() => insertVariable(varName)}
                              >
                                {isMissing && (
                                                  <AlertTriangle size={9} strokeWidth={1.4} style={{ marginRight: '3px', flexShrink: 0 }} />
                                )}
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info box — centrée entre balises et actions */}
                <div className="info-box" style={{ marginBottom: 0 }}>
                  <strong>Comment fonctionnent les balises ?</strong><br />
                  Les balises ci-dessus sont des variables qui seront remplacées par les données réelles de chaque réservation au moment de la génération du PDF. Cliquez sur une balise ou glissez-la dans la zone d&apos;édition pour l&apos;insérer à l&apos;endroit voulu dans votre contrat.
                </div>

                {/* CTA Aperçu — dans la colonne gauche */}
                <button type="button" className="contract-preview-btn" onClick={() => {
                  // Sync DOM → state before opening so the preview reflects the latest editor content
                  if (editorGeneralRef.current) setContractTemplateGeneral(readEditorTemplate(editorGeneralRef.current));
                  if (editorHouseRulesRef.current) setContractTemplateHouseRules(readEditorTemplate(editorHouseRulesRef.current));
                  setShowMobilePreview(true);
                }}>
                  <Eye size={15} strokeWidth={1.4} />
                  Aperçu du contrat
                </button>

                {/* Sauvegarde */}
                <div className="contract-actions">
                  <button type="submit" disabled={loading} className="btn btn-violet contract-action-btn">
                    {loading ? 'Enregistrement...' : 'Sauvegarder'}
                    {!loading && <ArrowRight size={14} strokeWidth={1.4} />}
                  </button>
                  {saved && <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>✓ Sauvegardé</span>}
                </div>

              </div>{/* end editor-left-sticky */}
            </div>

            {/* RIGHT: éditeur (pleine largeur) */}
            <div className="contract-right-col">

              {/* Onglets + toolbar — sticky au scroll */}
              <div className="editor-sticky-header">
                <div className="editor-zone-tabs">
                  <button
                    type="button"
                    className={`editor-zone-tab${activeEditorZone === 'general' ? ' active' : ''}`}
                    onClick={() => setActiveEditorZone('general')}
                  >
                    Conditions Générales
                  </button>
                  <button
                    type="button"
                    className={`editor-zone-tab${activeEditorZone === 'houseRules' ? ' active' : ''}`}
                    onClick={() => setActiveEditorZone('houseRules')}
                  >
                    Règlement Intérieur
                  </button>
                  {activeEditorZone === 'general' ? (
                    <button type="button" className="editor-zone-reset" onClick={handleResetGeneral} title="Réinitialiser les Conditions Générales">
                      Réinitialiser
                    </button>
                  ) : (
                    <button type="button" className="editor-zone-reset" onClick={handleResetHouseRules} title="Effacer le Règlement Intérieur">
                      Effacer
                    </button>
                  )}
                </div>

                {/* Hint Règlement Intérieur */}
                {activeEditorZone === 'houseRules' && (
                  <div className="editor-zone-desc">
                    Zone libre pour les règles spécifiques de votre gîte (ménage, piscine, animaux, horaires…). Ce texte sera ajouté à la suite des Conditions Générales dans le PDF.
                  </div>
                )}

                {/* Barre de formatage */}
                <div className="contract-toolbar" onMouseDown={e => e.preventDefault()}>
                  <button type="button" className="ct-btn" title="Annuler" onClick={() => exec('undo')}>↶</button>
                  <button type="button" className="ct-btn" title="Rétablir" onClick={() => exec('redo')}>↷</button>
                  <span className="ct-sep" />
                  <button type="button" className="ct-btn" title="Gras" onClick={() => exec('bold')} style={{ fontWeight: 700 }}>B</button>
                  <button type="button" className="ct-btn" title="Italique" onClick={() => exec('italic')} style={{ fontStyle: 'italic' }}>I</button>
                  <button type="button" className="ct-btn" title="Souligné" onClick={() => exec('underline')} style={{ textDecoration: 'underline' }}>U</button>
                  <span className="ct-sep" />
                  <button type="button" className="ct-btn" title="Liste à puces" onClick={toggleBullet}>•</button>
                </div>
              </div>

              {/* Éditeur Conditions Générales */}
              <div
                ref={editorGeneralRef}
                contentEditable
                suppressContentEditableWarning
                className="contract-editor"
                style={{ display: activeEditorZone === 'general' ? undefined : 'none' }}
                onInput={handleEditorInput('general')}
                onClick={handleEditorClick('general')}
                onFocus={() => setActiveEditorZone('general')}
                onPaste={handleEditorPaste}
                onKeyDown={handleEditorKeyDown}
                onDrop={handleEditorDrop('general')}
                onDragOver={e => e.preventDefault()}
              />

              {/* Éditeur Règlement Intérieur */}
              <div
                ref={editorHouseRulesRef}
                contentEditable
                suppressContentEditableWarning
                className="contract-editor"
                style={{ display: activeEditorZone === 'houseRules' ? undefined : 'none' }}
                onInput={handleEditorInput('houseRules')}
                onClick={handleEditorClick('houseRules')}
                onFocus={() => setActiveEditorZone('houseRules')}
                onPaste={handleEditorPaste}
                onKeyDown={handleEditorKeyDown}
                onDrop={handleEditorDrop('houseRules')}
                onDragOver={e => e.preventDefault()}
              />

            </div>

          </div>

          {/* Modale aperçu — bottom-sheet mobile, dialog centré desktop */}
          {showMobilePreview && (
            <div className="preview-modal-overlay" onClick={() => setShowMobilePreview(false)}>
              <div className="preview-modal-dialog" onClick={e => e.stopPropagation()}>
                <div className="cp-header">
                  <span>Aperçu en direct</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="cp-sub">données d&apos;exemple — les deux zones fusionnées</span>
                    <button type="button" className="mobile-preview-close" onClick={() => setShowMobilePreview(false)} aria-label="Fermer l'aperçu">
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div className="cp-body">
                  {previewBody}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ LOGO ═══ */}
      {activeTab === 'Logo' && (
        <div style={{ maxWidth: '860px' }}>
          <div className="form-card">
            <div className="form-card-title">
              <Image size={14} strokeWidth={1.4} />
              {mode === 'guesthouse' ? "Logo de l'établissement" : "Logo du gîte"}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', marginBottom: '16px' }}>
              Votre logo sera affiché en haut de chaque contrat PDF généré. Formats acceptés : PNG, JPG, WEBP.
            </p>
            {logoUrl ? (
              <div className="logo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" />
                <div className="logo-preview-info">
                  <p className="logo-preview-label">Logo actuel</p>
                  <div className="logo-preview-actions">
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
                  <Upload size={24} strokeWidth={1.5} color="#A3A3A0" />
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
        mode === 'guesthouse'
          ? <DocumentsTab guesthouseId={src.id} initialDocs={src.documents} />
          : <DocumentsTab giteId={src.id} initialDocs={src.documents} />
      )}

      {activeTab === 'iCal' && (
        mode === 'guesthouse'
          ? <IcalTab guesthouseId={src.id} rooms={guesthouse!.rooms} />
          : <IcalTab giteId={src.id} />
      )}

      </form>}

    </div>
  );
}
