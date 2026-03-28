import 'server-only';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
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

const styles = StyleSheet.create({
  page: { paddingTop: 50, paddingBottom: 50, paddingHorizontal: 56, fontSize: 10, lineHeight: 1.55, color: '#1C1C1A' },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 4 },
  article: { fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 3 },
  line: { marginBottom: 1 },
  empty: { marginBottom: 7 },
});

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  const text = buildText(data);
  const lines = text.split('\n');

  const elements = lines.map((line, i) => {
    if (line.trim() === '') return React.createElement(View, { key: i, style: styles.empty });
    const upper = line.trim().toUpperCase();
    const isTitle = line === upper && upper.length > 5 && !upper.includes(':') && !upper.startsWith('-');
    const isArticle = /^ARTICLE\s+\d/i.test(line.trim());
    const style = isTitle ? styles.title : isArticle ? styles.article : styles.line;
    return React.createElement(Text, { key: i, style }, line);
  });

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page }, ...elements)
  );

  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}
