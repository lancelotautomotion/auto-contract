import 'server-only';
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer, Font } from '@react-pdf/renderer';
import React from 'react';

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
  email_gite: string | null;
  telephone_gite: string | null;
  logoDataUrl?: string | null;
}

function buildText(data: ContractData): string {
  const optionsText = data.options.length === 0
    ? 'Aucune option sélectionnée'
    : data.options.map(o => o.price > 0 ? `- ${o.label} : ${o.price.toFixed(2).replace('.', ',')} €` : `- ${o.label} : inclus`).join('\n');

  const solde = Math.max(0, data.loyer - data.acompte);
  const dateJour = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const vars: Record<string, string> = {
    nom_client: data.nom_client,
    prenom_client: data.prenom_client,
    email_client: data.email_client,
    telephone_client: data.telephone_client,
    adresse_client: data.adresse_client ?? '',
    ville_client: data.ville_client ?? '',
    code_postal_client: data.code_postal_client ?? '',
    date_entree: data.date_entree,
    date_sortie: data.date_sortie,
    loyer: data.loyer.toFixed(2).replace('.', ','),
    acompte: data.acompte.toFixed(2).replace('.', ','),
    solde: solde.toFixed(2).replace('.', ','),
    menage: data.menage.toFixed(2).replace('.', ','),
    taxe_sejour: data.taxe_sejour.toFixed(2).replace('.', ','),
    options: optionsText,
    nom_gite: data.nom_gite,
    adresse_gite: data.adresse_gite ?? '',
    ville_gite: data.ville_gite ?? '',
    email_gite: data.email_gite ?? '',
    telephone_gite: data.telephone_gite ?? '',
    date_du_jour: dateJour,
  };

  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), data.template);
}

const C = {
  dark: '#1C1C1A',
  muted: '#7A7570',
  border: '#CEC8BF',
  bg: '#F7F4F0',
  accent: '#1C1C1A',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
    fontSize: 9.5,
    lineHeight: 1.6,
    color: C.dark,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logo: { maxHeight: 56, maxWidth: 140, objectFit: 'contain' as never },
  giteInfo: { textAlign: 'right', flex: 1 },
  giteName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 3 },
  giteDetail: { fontSize: 8, color: C.muted, lineHeight: 1.5 },

  // Document title
  docTitle: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    color: C.dark,
    marginBottom: 4,
    marginTop: 4,
  },
  docSubtitle: {
    textAlign: 'center',
    fontSize: 8,
    color: C.muted,
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  // Section labels (BAILLEUR, LOCATAIRE, etc.)
  sectionLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    color: C.muted,
    marginTop: 16,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },

  // Articles
  articleTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginTop: 14,
    marginBottom: 5,
    letterSpacing: 0.5,
  },

  // Body text
  line: { marginBottom: 1 },
  empty: { marginBottom: 5 },
  listItem: { marginBottom: 2, paddingLeft: 8, color: C.dark },

  // Signature block
  sigBox: {
    marginTop: 24,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 4,
    padding: 14,
    backgroundColor: C.bg,
  },
  sigTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 8,
  },
  sigLine: { fontSize: 8.5, color: C.dark, marginBottom: 3 },
  sigNote: { fontSize: 7.5, color: C.muted, marginTop: 6, fontStyle: 'italic' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 52,
    right: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: C.muted },
});

export interface SignatureInfo {
  signedByName: string;
  signedAt: Date;
  signedByIp: string;
  reservationId: string;
}

function SignatureBlock({ sig }: { sig: SignatureInfo }) {
  const dateStr = sig.signedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = sig.signedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return React.createElement(View, { style: styles.sigBox },
    React.createElement(Text, { style: styles.sigTitle }, 'SIGNATURE ÉLECTRONIQUE'),
    React.createElement(Text, { style: styles.sigLine }, `Signé le : ${dateStr} à ${timeStr}`),
    React.createElement(Text, { style: styles.sigLine }, `Par : ${sig.signedByName}`),
    React.createElement(Text, { style: styles.sigLine }, `Adresse IP : ${sig.signedByIp}`),
    React.createElement(Text, { style: styles.sigLine }, `Référence : ${sig.reservationId}`),
    React.createElement(Text, { style: styles.sigNote },
      'Ce document constitue une signature électronique simple au sens du règlement eIDAS (UE) n°910/2014.'
    )
  );
}

function Header({ data }: { data: ContractData }) {
  const logoEl = data.logoDataUrl
    ? React.createElement(Image, { src: data.logoDataUrl, style: styles.logo })
    : React.createElement(View, { style: { width: 140 } });

  const infoLines = [
    data.adresse_gite,
    data.ville_gite,
    data.email_gite,
    data.telephone_gite,
  ].filter(Boolean);

  const giteInfoEl = React.createElement(View, { style: styles.giteInfo },
    React.createElement(Text, { style: styles.giteName }, data.nom_gite),
    ...infoLines.map((line, i) =>
      React.createElement(Text, { key: i, style: styles.giteDetail }, line)
    )
  );

  return React.createElement(View, { style: styles.header }, logoEl, giteInfoEl);
}

function buildElements(text: string): React.ReactElement[] {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      elements.push(React.createElement(View, { key: i, style: styles.empty }));
      continue;
    }

    // Article title
    if (/^ARTICLE\s+\d+/i.test(trimmed)) {
      elements.push(React.createElement(Text, { key: i, style: styles.articleTitle }, trimmed));
      continue;
    }

    // Section labels (BAILLEUR, LOCATAIRE, SIGNATURE etc.) — all caps, short
    const isLabel = trimmed === trimmed.toUpperCase()
      && trimmed.length > 3
      && trimmed.length < 40
      && !trimmed.includes(':')
      && !trimmed.startsWith('-')
      && !/^\d/.test(trimmed);

    if (isLabel) {
      elements.push(React.createElement(Text, { key: i, style: styles.sectionLabel }, trimmed));
      continue;
    }

    // List item
    if (trimmed.startsWith('-')) {
      elements.push(React.createElement(Text, { key: i, style: styles.listItem }, trimmed));
      continue;
    }

    // Regular line
    elements.push(React.createElement(Text, { key: i, style: styles.line }, line));
  }

  return elements;
}

export async function generateSignedContractPdf(data: ContractData, sig: SignatureInfo): Promise<Buffer> {
  return _render(data, sig);
}

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  return _render(data, null);
}

async function _render(data: ContractData, sig: SignatureInfo | null): Promise<Buffer> {
  const text = buildText(data);
  const bodyElements = buildElements(text);

  if (sig) {
    bodyElements.push(SignatureBlock({ sig }));
  }

  const footer = React.createElement(View, { style: styles.footer, fixed: true },
    React.createElement(Text, { style: styles.footerText }, data.nom_gite),
    React.createElement(Text, { style: styles.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}` })
  );

  const page = React.createElement(Page, { size: 'A4', style: styles.page },
    React.createElement(Header, { data }),
    React.createElement(Text, { style: styles.docTitle }, 'CONTRAT DE LOCATION SAISONNIÈRE'),
    React.createElement(Text, { style: styles.docSubtitle }, `Établi le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`),
    ...bodyElements,
    footer
  );

  const doc = React.createElement(Document, null, page);
  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
