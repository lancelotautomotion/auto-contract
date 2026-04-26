import 'server-only';
import PDFDocument from 'pdfkit';

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
  options: { label: string; price: number }[];
  nom_gite: string;
  adresse_gite: string | null;
  ville_gite: string | null;
  code_postal_gite?: string | null;
  email_gite: string | null;
  telephone_gite: string | null;
  logoUrl?: string | null;
}

export interface SignatureInfo {
  signedByName: string;
  signedAt: Date;
  signedByIp: string;
  reservationId: string;
}

// ─── Template substitution ────────────────────────────────────────────────────
function buildText(data: ContractData): string {
  const optionsText = data.options.length === 0
    ? 'Aucune option sélectionnée'
    : data.options.map(o => o.price > 0
        ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €`
        : `- ${o.label} : inclus`
      ).join('\n');

  const solde = Math.max(0, data.loyer - data.acompte);
  const dateJour = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const vars: Record<string, string> = {
    nom_client:          data.nom_client,
    prenom_client:       data.prenom_client,
    email_client:        data.email_client,
    telephone_client:    data.telephone_client,
    adresse_client:      data.adresse_client ?? '',
    ville_client:        data.ville_client ?? '',
    code_postal_client:  data.code_postal_client ?? '',
    date_entree:         data.date_entree,
    date_sortie:         data.date_sortie,
    loyer:               data.loyer.toFixed(2).replace('.', ','),
    acompte:             data.acompte.toFixed(2).replace('.', ','),
    solde:               solde.toFixed(2).replace('.', ','),
    menage:              data.menage.toFixed(2).replace('.', ','),
    taxe_sejour:         data.taxe_sejour.toFixed(2).replace('.', ','),
    options:             optionsText,
    nom_gite:            data.nom_gite,
    adresse_gite:        data.adresse_gite ?? '',
    ville_gite:          data.ville_gite ?? '',
    code_postal_gite:    data.code_postal_gite ?? '',
    email_gite:          data.email_gite ?? '',
    telephone_gite:      data.telephone_gite ?? '',
    date_du_jour:        dateJour,
  };

  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), data.template);
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
};

// ─── PDF renderer ─────────────────────────────────────────────────────────────
async function _render(data: ContractData, sig: SignatureInfo | null): Promise<Buffer> {
  const text = buildText(data).replace(/\n+$/, ''); // strip trailing blank lines
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
    const lines = text.split('\n');
    const pending: string[] = [];

    const flushPending = () => {
      if (!pending.length) return;
      doc.font('Helvetica').fontSize(10).fillColor(C.dark)
        .text(pending.join('\n'), { paragraphGap: 0, lineGap: 2 });
      pending.length = 0;
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();

      // Empty line
      if (trimmed === '') {
        flushPending();
        doc.moveDown(0.6);
        continue;
      }

      // Two-column layout (bailleur | locataire)
      if (trimmed.includes(' | ')) {
        flushPending();
        const [left, right] = trimmed.split(' | ', 2);
        const l = left.trim(); const r = right.trim();
        const isSigLine  = /^_+$/.test(l) && /^_+$/.test(r);
        const isColHeader = l === l.toUpperCase() && l.length > 2 && !isSigLine;
        const colW = (W - 20) / 2;
        const curY = doc.y;

        if (isSigLine) {
          doc.moveTo(ml,             curY + 18).lineTo(ml + colW,         curY + 18).lineWidth(0.5).strokeColor(C.border).stroke();
          doc.moveTo(ml + colW + 20, curY + 18).lineTo(ml + W,            curY + 18).lineWidth(0.5).strokeColor(C.border).stroke();
          doc.y = curY + 26;
        } else {
          doc.font(isColHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(isColHeader ? 8 : 10)
            .fillColor(isColHeader ? C.muted : C.dark)
            .text(l, ml, curY, { width: colW, lineBreak: false });
          doc.font(isColHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(isColHeader ? 8 : 10)
            .fillColor(isColHeader ? C.muted : C.dark)
            .text(r, ml + colW + 20, curY, { width: colW, lineBreak: false });
          doc.y = curY + (isColHeader ? 22 : 16);
        }
        continue;
      }

      // Article heading
      if (/^ARTICLE\s+\d+/i.test(trimmed)) {
        flushPending();
        doc.moveDown(0.9);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(C.dark)
          .text(trimmed, { paragraphGap: 0 });
        doc.moveDown(0.4);
        continue;
      }

      // Section label (ALL CAPS, short)
      const isLabel = trimmed === trimmed.toUpperCase()
        && trimmed.length > 3
        && trimmed.length < 40
        && !trimmed.includes(':')
        && !trimmed.startsWith('-')
        && !/^\d/.test(trimmed);

      if (isLabel) {
        flushPending();
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(C.muted)
          .text(trimmed, { paragraphGap: 0, characterSpacing: 0.5 });
        doc.moveDown(0.2);
        doc.moveTo(ml, doc.y).lineTo(ml + W, doc.y).lineWidth(0.5).strokeColor(C.border).stroke();
        doc.moveDown(0.4);
        doc.fillColor(C.dark);
        continue;
      }

      // Lignes normales et items de liste — accumulés pour un seul appel text()
      pending.push(trimmed.startsWith('-') ? `  ${trimmed}` : rawLine);
    }
    flushPending();

    // ── Signature block ──────────────────────────────────────────────────────
    if (sig) {
      doc.moveDown(0.5);
      const boxY = doc.y;
      const boxH = 80;

      doc.rect(ml, boxY, W, boxH)
        .fill(C.bg)
        .lineWidth(0.5).strokeColor(C.border)
        .rect(ml, boxY, W, boxH).stroke();

      doc.font('Helvetica-Bold').fontSize(8).fillColor(C.muted)
        .text('SIGNATURE ÉLECTRONIQUE', ml + 14, boxY + 12);

      const dateStr = sig.signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      const timeStr = sig.signedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      doc.font('Helvetica').fontSize(8.5).fillColor(C.dark);
      doc.text(`Signé le : ${dateStr} à ${timeStr}`, ml + 14, boxY + 28);
      doc.text(`Par : ${sig.signedByName}`, ml + 14);
      doc.text(`Adresse IP : ${sig.signedByIp}`, ml + 14);
      doc.text(`Référence : ${sig.reservationId}`, ml + 14);

      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(C.muted)
        .text('Ce document constitue une signature électronique simple au sens du règlement eIDAS (UE) n°910/2014.', ml + 14);
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
