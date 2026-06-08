import 'server-only';
import PDFDocument from 'pdfkit';
import {
  parseStored,
  classifyLine,
  splitRunsAtPipe,
  resolveRun,
  runsPlain,
  PDF_SIZE_PT,
  type Run,
} from './contractFormat';

export interface ContractData {
  template: string;
  nom_client: string;
  prenom_client: string;
  email_client: string;
  telephone_client: string;
  adresse_client: string | null;
  ville_client: string | null;
  code_postal_client: string | null;
  date_entree: string;
  date_sortie: string;
  loyer: number;
  acompte: number;
  menage: number;
  taxe_sejour: number;
  // Maison d'hôtes : ventilation hébergement / restauration / total.
  // Pour un Gîte, restauration = 0, hebergement = loyer, total_sejour = loyer.
  hebergement?: number;
  restauration?: number;
  total_sejour?: number;
  nombre_nuits?: number;
  options: { label: string; price: number }[];
  nom_gite: string;
  adresse_gite: string | null;
  ville_gite: string | null;
  code_postal_gite?: string | null;
  email_gite: string | null;
  telephone_gite: string | null;
  // Variables "chambre" — résolues quand la réservation porte sur une maison d'hôtes.
  nom_chambre?: string | null;
  capacite_chambre?: number | null;
  prix_chambre_nuit?: number | null;
  specificites_chambre?: string | null;
  // Coordonnees du mediateur (maison d'hotes pro). null/vide => article du contrat masque.
  mediateur?: string | null;
  logoUrl?: string | null;
}

export interface SignatureInfo {
  signedByName: string;
  signedAt: Date;
  signedByIp: string;
  reservationId: string;
  managerName: string;
  managerSignedAt: Date;
}

// ─── Valeurs des balises dynamiques ────────────────────────────────────────────
function buildVars(data: ContractData): Record<string, string> {
  const optionsText = data.options.length === 0
    ? 'Aucune option sélectionnée'
    : data.options.map(o => o.price > 0
        ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €`
        : `- ${o.label} : inclus`
      ).join('\n');

  const hebergement = data.hebergement ?? data.loyer;
  const restauration = data.restauration ?? 0;
  const totalSejour = data.total_sejour ?? hebergement + restauration;
  const solde = Math.max(0, totalSejour - data.acompte);
  const dateJour = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const eur = (n: number) => n.toFixed(2).replace('.', ',');

  return {
    nom_client:          data.nom_client,
    prenom_client:       data.prenom_client,
    email_client:        data.email_client,
    telephone_client:    data.telephone_client,
    adresse_client:      data.adresse_client ?? '',
    ville_client:        data.ville_client ?? '',
    code_postal_client:  data.code_postal_client ?? '',
    date_entree:         data.date_entree,
    date_sortie:         data.date_sortie,
    loyer:               eur(data.loyer),
    hebergement:         eur(hebergement),
    restauration:        eur(restauration),
    total_sejour:        eur(totalSejour),
    nombre_nuits:        data.nombre_nuits != null ? String(data.nombre_nuits) : '',
    acompte:             eur(data.acompte),
    solde:               eur(solde),
    menage:              eur(data.menage),
    taxe_sejour:         eur(data.taxe_sejour),
    options:             optionsText,
    nom_gite:            data.nom_gite,
    adresse_gite:        data.adresse_gite ?? '',
    ville_gite:          data.ville_gite ?? '',
    code_postal_gite:    data.code_postal_gite ?? '',
    email_gite:          data.email_gite ?? '',
    telephone_gite:      data.telephone_gite ?? '',
    nom_chambre:         data.nom_chambre ?? '',
    capacite_chambre:    data.capacite_chambre != null ? String(data.capacite_chambre) : '',
    prix_chambre_nuit:   data.prix_chambre_nuit != null ? data.prix_chambre_nuit.toFixed(2).replace('.', ',') : '',
    specificites_chambre: (data.specificites_chambre ?? '').trim(),
    // Quand un mediateur est renseigne, on insere le paragraphe legal complet.
    // Sinon variable vide => l'article entier est masque par le rendu (cf _render).
    mediateur:           (data.mediateur ?? '').trim()
      ? `Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige non résolu à l'amiable, le client peut saisir gratuitement le médiateur de la consommation suivant : ${(data.mediateur ?? '').trim()}`
      : '',
    date_du_jour:        dateJour,
  };
}

// ─── Sélection de police / taille selon le formatage du run ────────────────────
function runFont(r: Run): string {
  if (r.bold && r.italic) return 'Helvetica-BoldOblique';
  if (r.bold) return 'Helvetica-Bold';
  if (r.italic) return 'Helvetica-Oblique';
  return 'Helvetica';
}
function runSize(r: Run, base: number): number {
  if (r.size === 'sm') return PDF_SIZE_PT.sm;
  if (r.size === 'lg') return PDF_SIZE_PT.lg;
  return base;
}

// ─── Fetch logo image ─────────────────────────────────────────────────────────
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  dark:   '#1C1C1A',
  muted:  '#7A7570',
  border: '#CEC8BF',
  bg:     '#F7F4F0',
  violet:       '#5B52B5',
  violetLight:  '#7F77DD',
  violetBg:     '#F4F2FB',
  violetBorder: '#DAD7F0',
};

type Doc = InstanceType<typeof PDFDocument>;

// Rendu d'une séquence de runs dans le flux normal (retour à la ligne auto).
function renderFlowRuns(
  doc: Doc, runs: Run[], vars: Record<string, string>,
  width: number, baseSize: number, align: 'left' | 'center' | 'right'
) {
  const segs = runs
    .map(r => ({ text: resolveRun(r, vars), font: runFont(r), size: runSize(r, baseSize), underline: !!r.underline }))
    .filter(s => s.text.length > 0);
  if (segs.length === 0) { doc.moveDown(0.5); return; }
  segs.forEach((s, i) => {
    const isLast = i === segs.length - 1;
    doc.font(s.font).fontSize(s.size).fillColor(C.dark);
    doc.text(s.text, { continued: !isLast, underline: s.underline, width, align, lineGap: 2, paragraphGap: 0 });
  });
}

// Rendu d'une séquence de runs à une position fixe (colonnes bailleur/locataire).
function renderRunsAt(
  doc: Doc, runs: Run[], vars: Record<string, string>,
  x: number, y: number, colW: number, baseSize: number, color: string, forceFont?: string
) {
  const segs = runs
    .map(r => ({ text: resolveRun(r, vars), font: forceFont ?? runFont(r), size: runSize(r, baseSize), underline: !!r.underline }))
    .filter(s => s.text.length > 0);
  if (segs.length === 0) return;
  segs.forEach((s, i) => {
    const isLast = i === segs.length - 1;
    doc.font(s.font).fontSize(s.size).fillColor(color);
    if (i === 0) doc.text(s.text, x, y, { continued: !isLast, underline: s.underline, width: colW, lineBreak: false });
    else doc.text(s.text, { continued: !isLast, underline: s.underline, width: colW, lineBreak: false });
  });
}

// ─── PDF renderer ─────────────────────────────────────────────────────────────
async function _render(data: ContractData, sig: SignatureInfo | null): Promise<Buffer> {
  const vars = buildVars(data);
  const rawLines = parseStored(data.template);
  while (rawLines.length && classifyLine(rawLines[rawLines.length - 1]) === 'empty') rawLines.pop();

  // Masque les articles dont le corps est entierement compose de variables non
  // resolues (ex. {{mediateur}} laisse vide). On supprime l'entete + tout le
  // corps jusqu'au prochain article/label, afin de ne pas laisser un titre
  // orphelin dans le PDF.
  const resolvedEmpty = (line: typeof rawLines[number]) =>
    line.runs.map(r => resolveRun(r, vars)).join('').trim() === '';
  const lines: typeof rawLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (classifyLine(line) === 'article') {
      let j = i + 1;
      while (j < rawLines.length) {
        const k = classifyLine(rawLines[j]);
        if (k === 'article' || k === 'label') break;
        j++;
      }
      const body = rawLines.slice(i + 1, j);
      const bodyAllEmpty = body.every(l => classifyLine(l) === 'empty' || resolvedEmpty(l));
      if (bodyAllEmpty) { i = j - 1; continue; }
    }
    lines.push(line);
  }

  const logoBuffer = data.logoUrl ? await fetchImageBuffer(data.logoUrl) : null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 64, left: 64, right: 64 },
      autoFirstPage: true,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const ml = doc.page.margins.left;

    // ── Header ──────────────────────────────────────────────────────────────
    const headerY = doc.y;
    if (logoBuffer) {
      doc.image(logoBuffer, ml, headerY, { fit: [140, 48], align: 'left' });
    }

    const infoLines = [
      data.nom_gite,
      data.adresse_gite,
      data.code_postal_gite ? `${data.code_postal_gite} ${data.ville_gite ?? ''}` : data.ville_gite,
      data.email_gite,
      data.telephone_gite,
    ].filter(Boolean) as string[];

    let infoY = headerY;
    infoLines.forEach((line, i) => {
      doc
        .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(i === 0 ? 10 : 7.5)
        .fillColor(i === 0 ? C.dark : C.muted)
        .text(line, ml, infoY, { width: W, align: 'right' });
      infoY += i === 0 ? 14 : 11;
    });

    doc.y = Math.max(doc.y, headerY + 52);

    // ── Header separator ────────────────────────────────────────────────────
    doc.moveDown(0.6);
    doc.moveTo(ml, doc.y).lineTo(ml + W, doc.y).lineWidth(0.5).strokeColor(C.border).stroke();
    doc.moveDown(0.8);

    // ── Document title ───────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(13).fillColor(C.dark)
      .text('CONTRAT DE LOCATION SAISONNIÈRE', ml, doc.y, { width: W, align: 'center' });
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(8).fillColor(C.muted)
      .text(`Établi le ${dateJour}`, ml, doc.y, { width: W, align: 'center' });
    doc.moveDown(1.2);

    // ── Contract body ────────────────────────────────────────────────────────
    const colW = (W - 20) / 2;

    for (const line of lines) {
      const kind = classifyLine(line);

      // Empty line
      if (kind === 'empty') {
        doc.moveDown(0.6);
        continue;
      }

      // Two-column layout (bailleur | locataire)
      if (kind === 'twocol') {
        const split = splitRunsAtPipe(line.runs);
        if (!split) continue;
        const lPlain = runsPlain(split.left).trim();
        const rPlain = runsPlain(split.right).trim();
        const isSigLine  = /^_+$/.test(lPlain) && /^_+$/.test(rPlain);
        const isColHeader = lPlain === lPlain.toUpperCase() && lPlain.length > 2 && !isSigLine;
        const curY = doc.y;

        if (isSigLine) {
          if (sig) {
            const sigBaseY = curY + 4;
            doc.font('Times-Italic').fontSize(16).fillColor(C.violet);
            doc.text(sig.managerName, ml, sigBaseY, { width: colW, align: 'center', lineBreak: false });
            doc.text(sig.signedByName, ml + colW + 20, sigBaseY, { width: colW, align: 'center', lineBreak: false });

            const lineY = curY + 30;
            doc.moveTo(ml,             lineY).lineTo(ml + colW,         lineY).lineWidth(0.5).strokeColor(C.violetBorder).stroke();
            doc.moveTo(ml + colW + 20, lineY).lineTo(ml + W,            lineY).lineWidth(0.5).strokeColor(C.violetBorder).stroke();

            const dateMgr    = sig.managerSignedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const dateClient = sig.signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            doc.font('Helvetica').fontSize(7.5).fillColor(C.muted);
            doc.text(`Signé électroniquement le ${dateMgr}`,    ml,             lineY + 4, { width: colW, align: 'center', lineBreak: false });
            doc.text(`Signé électroniquement le ${dateClient}`, ml + colW + 20, lineY + 4, { width: colW, align: 'center', lineBreak: false });

            doc.fillColor(C.dark);
            doc.y = lineY + 18;
          } else {
            doc.moveTo(ml,             curY + 18).lineTo(ml + colW,         curY + 18).lineWidth(0.5).strokeColor(C.border).stroke();
            doc.moveTo(ml + colW + 20, curY + 18).lineTo(ml + W,            curY + 18).lineWidth(0.5).strokeColor(C.border).stroke();
            doc.y = curY + 26;
          }
        } else {
          const baseSize = isColHeader ? 8 : 10;
          const color = isColHeader ? C.muted : C.dark;
          const forceFont = isColHeader ? 'Helvetica-Bold' : undefined;
          renderRunsAt(doc, split.left,  vars, ml,             curY, colW, baseSize, color, forceFont);
          renderRunsAt(doc, split.right, vars, ml + colW + 20, curY, colW, baseSize, color, forceFont);
          doc.y = curY + (isColHeader ? 22 : 16);
        }
        continue;
      }

      // Article heading — bold par défaut, run.bold===false le désactive
      if (kind === 'article') {
        doc.moveDown(0.9);
        const boldRuns = line.runs.map(r => ({ ...r, bold: r.bold !== false }));
        renderFlowRuns(doc, boldRuns, vars, W, 10, 'left');
        doc.moveDown(0.4);
        continue;
      }

      // Section label (ALL CAPS, short) — bold par défaut, run.bold===false le désactive
      if (kind === 'label') {
        doc.moveDown(0.8);
        const boldRuns = line.runs.map(r => ({ ...r, bold: r.bold !== false }));
        const segs = boldRuns
          .map(r => ({ text: resolveRun(r, vars), font: runFont(r), size: runSize(r, 8), underline: !!r.underline }))
          .filter(s => s.text.length > 0);
        segs.forEach((s, i) => {
          const isLast = i === segs.length - 1;
          doc.font(s.font).fontSize(s.size).fillColor(C.muted)
            .text(s.text, { continued: !isLast, underline: s.underline, width: W, characterSpacing: 0.5, paragraphGap: 0 });
        });
        doc.moveDown(0.2);
        doc.moveTo(ml, doc.y).lineTo(ml + W, doc.y).lineWidth(0.5).strokeColor(C.border).stroke();
        doc.moveDown(0.4);
        doc.fillColor(C.dark);
        continue;
      }

      // Normal lines and list items (formatage inline + alignement)
      const align = line.align ?? 'left';
      // Expand multi-line resolved values (e.g. {{options}})
      const fullResolved = line.runs.map(r => resolveRun(r, vars)).join('');
      if (fullResolved.includes('\n')) {
        const subLines = fullResolved.split('\n').filter(s => s.trim() !== '');
        for (const sub of subLines) {
          const isBullet = sub.trimStart().startsWith('-');
          doc.font('Helvetica').fontSize(10).fillColor(C.dark)
            .text(isBullet ? '  ' + sub : sub, { width: W, align, lineGap: 2, paragraphGap: 1 });
        }
      } else {
        let runs = line.runs;
        if (runsPlain(runs).trimStart().startsWith('-')) {
          runs = runs.slice();
          const fi = runs.findIndex(r => r.text !== undefined && r.text.length > 0);
          if (fi >= 0) runs[fi] = { ...runs[fi], text: '  ' + runs[fi].text };
        }
        renderFlowRuns(doc, runs, vars, W, 10, align);
      }
    }

    // ── Signature block ──────────────────────────────────────────────────────
    if (sig) {
      doc.moveDown(0.6);
      const boxY = doc.y;
      const boxH = 96;
      const radius = 10;
      const padX = 18;
      const accentW = 3;

      doc.roundedRect(ml, boxY, W, boxH, radius)
        .fillAndStroke(C.violetBg, C.violetBorder);

      doc.save();
      doc.roundedRect(ml, boxY, W, boxH, radius).clip();
      doc.rect(ml, boxY, accentW, boxH).fill(C.violetLight);
      doc.restore();

      const badgeR = 7;
      const badgeCx = ml + padX + badgeR;
      const badgeCy = boxY + 16 + badgeR;
      doc.circle(badgeCx, badgeCy, badgeR).fill(C.violet);

      doc.save();
      doc.lineWidth(1.4).strokeColor('#FFFFFF').lineJoin('round').lineCap('round');
      doc.moveTo(badgeCx - 3, badgeCy + 0.3)
        .lineTo(badgeCx - 0.6, badgeCy + 2.6)
        .lineTo(badgeCx + 3.2, badgeCy - 1.8)
        .stroke();
      doc.restore();

      const textX = badgeCx + badgeR + 8;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.violet)
        .text('SIGNATURE ÉLECTRONIQUE', textX, boxY + 17, { characterSpacing: 0.6 });

      const dateStr = sig.signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      const timeStr = sig.signedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      doc.font('Helvetica').fontSize(8.5).fillColor(C.dark);
      doc.text(`Signé le : ${dateStr} à ${timeStr}`, ml + padX, boxY + 38);
      doc.text(`Par : ${sig.signedByName}`, ml + padX);
      doc.text(`Adresse IP : ${sig.signedByIp}`, ml + padX);
      doc.text(`Référence : ${sig.reservationId}`, ml + padX);

      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(C.muted)
        .text('Ce document constitue une signature électronique simple au sens du règlement eIDAS (UE) n°910/2014.', ml + padX, boxY + boxH + 8, { width: W - padX * 2 });
    }

    // ── Footer (on every page) ───────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0; // évite que pdfkit auto-pagine pendant le footer
      const footerY = doc.page.height - savedBottom + 16;
      doc.moveTo(ml, footerY - 8).lineTo(ml + W, footerY - 8).lineWidth(0.5).strokeColor(C.border).stroke();
      doc.font('Helvetica').fontSize(7.5).fillColor(C.muted)
        .text(data.nom_gite, ml, footerY, { width: W / 2, align: 'left' });
      doc.text(`${i + 1} / ${range.count}`, ml, footerY, { width: W, align: 'right' });
      doc.page.margins.bottom = savedBottom;
    }

    doc.end();
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function generateSignedContractPdf(data: ContractData, sig: SignatureInfo): Promise<Buffer> {
  return _render(data, sig);
}

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  return _render(data, null);
}

// ─── Nom de fichier normalisé pour le contrat signé ───────────────────────────
// Format : contrat-NOM-PRENOM-DDMMYYYY-DDMMYYYY.pdf (sans accent, sans espace)
export function buildSignedContractFilename(opts: {
  clientLastName: string;
  clientFirstName: string;
  checkIn: Date | string;
  checkOut: Date | string;
}): string {
  const slug = (s: string) => s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // accents (combining diacritics)
    .replace(/[^a-zA-Z0-9]+/g, '-')    // tout le reste → tiret
    .replace(/^-+|-+$/g, '')           // tirets en bordure
    .toLowerCase();

  const fmt = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}${mm}${yyyy}`;
  };

  const last = slug(opts.clientLastName) || 'locataire';
  const first = slug(opts.clientFirstName) || '';
  const name = first ? `${last}-${first}` : last;
  return `contrat-${name}-${fmt(opts.checkIn)}-${fmt(opts.checkOut)}.pdf`;
}
