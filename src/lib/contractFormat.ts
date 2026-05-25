// Modèle de contrat partagé entre l'éditeur, l'aperçu et la génération PDF.
// Un template est une liste de lignes ; chaque ligne est une liste de "runs"
// (fragments de texte ou balises dynamiques) portant le formatage inline.
// Stocké en JSON ; les anciens templates en texte brut sont détectés et convertis.

export type RunSize = 'sm' | 'lg';

export interface Run {
  text?: string;        // texte littéral
  varName?: string;     // clé de balise dynamique (ex: "nom_client")
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: RunSize;       // absent = taille normale
}

export interface Line {
  runs: Run[];
  align?: 'center' | 'right';   // absent = gauche
}

export type LineKind = 'empty' | 'twocol' | 'article' | 'label' | 'normal';

// ─── Tailles partagées (cohérence éditeur / aperçu / PDF) ──────────────────────
export const PREVIEW_SIZE_PX: Record<'normal' | RunSize, number> = { normal: 11, sm: 9, lg: 14 };
export const PDF_SIZE_PT: Record<'normal' | RunSize, number> = { normal: 10, sm: 8.5, lg: 13 };

// ─── Texte littéral d'une ligne (balises sous forme {{clé}}) ───────────────────
export function linePlainText(line: Line): string {
  return line.runs.map(r => (r.varName ? `{{${r.varName}}}` : r.text ?? '')).join('');
}

// ─── Classification structurelle (identique à l'ancien parseur ligne par ligne) ─
// On classe sur le texte littéral (balises sous forme {{clé}}) : cela préserve les
// espaces autour des séparateurs " | " et empêche qu'une valeur en majuscules ne
// transforme une ligne en libellé.
export function classifyLine(line: Line): LineKind {
  const t = linePlainText(line).trim();
  if (t === '') return 'empty';
  if (t.includes(' | ')) return 'twocol';
  if (/^ARTICLE\s+\d+/i.test(t)) return 'article';
  const isLabel =
    t === t.toUpperCase() &&
    t.length > 3 &&
    t.length < 40 &&
    !t.includes(':') &&
    !t.startsWith('-') &&
    !/^\d/.test(t);
  if (isLabel) return 'label';
  return 'normal';
}

// ─── Découpe les runs d'une ligne deux colonnes au niveau du " | " ─────────────
export function splitRunsAtPipe(runs: Run[]): { left: Run[]; right: Run[] } | null {
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    if (r.text && r.text.includes(' | ')) {
      const idx = r.text.indexOf(' | ');
      const left: Run[] = [...runs.slice(0, i)];
      const right: Run[] = [];
      const before = r.text.slice(0, idx);
      const after = r.text.slice(idx + 3);
      if (before) left.push({ ...r, text: before });
      if (after) right.push({ ...r, text: after });
      right.push(...runs.slice(i + 1));
      return { left, right };
    }
  }
  return null;
}

export function runsPlain(runs: Run[]): string {
  return runs.map(r => (r.varName ? `{{${r.varName}}}` : r.text ?? '')).join('');
}

// ─── Conversion texte brut hérité → modèle ─────────────────────────────────────
const VAR_RE = /\{\{([a-z_]+)\}\}/gi;

function textToRuns(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  VAR_RE.lastIndex = 0;
  while ((m = VAR_RE.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index) });
    runs.push({ varName: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs;
}

export function legacyTextToLines(text: string): Line[] {
  return text.split('\n').map(line => ({ runs: textToRuns(line) }));
}

// ─── Parsing du format stocké (JSON ou texte brut hérité) ──────────────────────
export function parseStored(stored: string | null | undefined): Line[] {
  if (!stored) return [];
  const trimmed = stored.trimStart();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as Line[];
    } catch {
      // chaîne commençant par '[' mais pas du JSON valide → texte brut
    }
  }
  return legacyTextToLines(stored);
}

export function serializeLines(lines: Line[]): string {
  return JSON.stringify(lines);
}

// ─── Fusion Conditions Générales + Règlement Intérieur ─────────────────────────
// Insère le règlement avant la ligne « Fait à … » (bloc signature), comme l'ancien
// mergeTemplates, mais au niveau du modèle.
export function mergeLines(general: Line[], houseRules: Line[]): Line[] {
  const rulesHaveContent = houseRules.some(l => linePlainText(l).trim() !== '');
  if (!rulesHaveContent) return general;

  const block: Line[] = [
    { runs: [] },
    { runs: [{ text: 'RÈGLEMENT INTÉRIEUR' }] },
    { runs: [] },
    ...houseRules,
  ];

  const idx = general.findIndex(l => linePlainText(l).trimStart().startsWith('Fait à '));
  if (idx === -1) return [...general, ...block];
  return [...general.slice(0, idx), ...block, ...general.slice(idx)];
}

export function mergeStored(
  general: string | null | undefined,
  houseRules: string | null | undefined
): string {
  return serializeLines(mergeLines(parseStored(general), parseStored(houseRules)));
}

// ─── Une balise donnée est-elle présente dans le template ? ─────────────────────
export function templateHasVar(stored: string | null | undefined, key: string): boolean {
  return parseStored(stored).some(l => l.runs.some(r => r.varName === key));
}

// ─── Résolution d'un run en texte final ────────────────────────────────────────
export function resolveRun(run: Run, vars: Record<string, string>): string {
  if (run.varName) return vars[run.varName] ?? '';
  return run.text ?? '';
}

// ─── Lecture DOM → modèle (exécuté côté client uniquement) ─────────────────────
const ZWSP = /​/g;

interface InlineCtx { bold?: boolean; italic?: boolean; underline?: boolean; size?: RunSize; }

function applyCtx(run: Run, ctx: InlineCtx): Run {
  if (ctx.bold) run.bold = true;
  if (ctx.italic) run.italic = true;
  if (ctx.underline) run.underline = true;
  if (ctx.size) run.size = ctx.size;
  return run;
}

function emitText(runs: Run[], text: string, ctx: InlineCtx) {
  if (!text) return;
  const prev = runs[runs.length - 1];
  const same = prev && !prev.varName &&
    !!prev.bold === !!ctx.bold && !!prev.italic === !!ctx.italic &&
    !!prev.underline === !!ctx.underline && (prev.size ?? undefined) === (ctx.size ?? undefined);
  if (same) { prev.text = (prev.text ?? '') + text; return; }
  runs.push(applyCtx({ text }, ctx));
}

function walkInline(node: Node, ctx: InlineCtx, runs: Run[]) {
  node.childNodes.forEach(child => {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      emitText(runs, (child.textContent ?? '').replace(ZWSP, ''), ctx);
      return;
    }
    if (child.nodeType !== 1 /* ELEMENT_NODE */) return;
    const el = child as HTMLElement;
    if (el.dataset.var) { runs.push(applyCtx({ varName: el.dataset.var }, ctx)); return; }
    if (el.tagName === 'BR') return;
    const next: InlineCtx = { ...ctx };
    const tag = el.tagName.toLowerCase();
    if (tag === 'b' || tag === 'strong') next.bold = true;
    if (tag === 'i' || tag === 'em') next.italic = true;
    if (tag === 'u') next.underline = true;
    const fw = el.style.fontWeight;
    if (fw === 'bold' || (fw && parseInt(fw, 10) >= 600)) next.bold = true;
    if (el.style.fontStyle === 'italic') next.italic = true;
    const td = el.style.textDecorationLine || el.style.textDecoration;
    if (td && td.includes('underline')) next.underline = true;
    if (el.classList.contains('sz-sm')) next.size = 'sm';
    else if (el.classList.contains('sz-lg')) next.size = 'lg';
    if (tag === 'font') {
      const sz = el.getAttribute('size');
      if (sz === '1' || sz === '2') next.size = 'sm';
      else if (sz === '5' || sz === '6' || sz === '7') next.size = 'lg';
    }
    walkInline(el, next, runs);
  });
}

function blockAlign(el: HTMLElement): 'center' | 'right' | undefined {
  const ta = el.style.textAlign || el.getAttribute('align') || '';
  if (ta === 'center') return 'center';
  if (ta === 'right') return 'right';
  return undefined;
}

export function domToLines(root: HTMLElement): Line[] {
  const isBlock = (n: Node) => n.nodeType === 1 && ['DIV', 'P'].includes((n as HTMLElement).tagName);
  const children = Array.from(root.childNodes);
  if (!children.some(isBlock)) {
    const runs: Run[] = [];
    walkInline(root, {}, runs);
    return [{ runs }];
  }
  const lines: Line[] = [];
  children.forEach(node => {
    if (isBlock(node)) {
      const el = node as HTMLElement;
      const runs: Run[] = [];
      walkInline(el, {}, runs);
      const line: Line = { runs };
      const align = blockAlign(el);
      if (align) line.align = align;
      lines.push(line);
    } else if (node.nodeType === 3) {
      const text = (node.textContent ?? '').replace(ZWSP, '');
      if (text.trim()) lines.push({ runs: [{ text }] });
    } else if (node.nodeType === 1) {
      const runs: Run[] = [];
      walkInline(node, {}, runs);
      if (runs.length) lines.push({ runs });
    }
  });
  return lines;
}
