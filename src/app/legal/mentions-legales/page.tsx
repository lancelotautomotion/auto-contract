import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Prysme",
  description: "Mentions légales de Prysme, logiciel de gestion de contrats de location pour gîtes.",
  robots: { index: true, follow: true },
};

const h1: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#1C1C1A', marginBottom: '8px', lineHeight: 1.2 };
const date: React.CSSProperties = { fontSize: '12px', color: '#7A7570', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px', display: 'block' };
const h2: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#1C1C1A', marginTop: '40px', marginBottom: '12px' };
const p: React.CSSProperties = { fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, marginBottom: '12px', fontWeight: 300 };
const muted: React.CSSProperties = { fontSize: '13px', color: '#7A7570', lineHeight: 1.7, marginBottom: '8px', fontWeight: 300 };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 style={h1}>Mentions légales</h1>
      <span style={date}>Mise à jour : avril 2026</span>

      <h2 style={h2}>1. Éditeur du site</h2>
      <p style={p}>
        Le site Prysme (accessible à l'adresse <strong>prysme.fr</strong>) est édité par :
      </p>
      <p style={muted}>
        <strong>Lancelot Automotion</strong><br />
        [Forme juridique : auto-entrepreneur / SAS / SARL — à compléter]<br />
        SIRET : [À compléter]<br />
        Adresse : [Adresse complète — à compléter]<br />
        Email : contact@prysme.fr
      </p>

      <h2 style={h2}>2. Directeur de la publication</h2>
      <p style={muted}>
        Lancelot [Nom — à compléter], en qualité de représentant légal.
      </p>

      <h2 style={h2}>3. Hébergement</h2>
      <p style={muted}>
        Le site est hébergé par :<br />
        <strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133<br />
        Covina, CA 91723, États-Unis<br />
        Site : <a href="https://vercel.com" style={{ color: '#7A7570' }}>vercel.com</a>
      </p>
      <p style={muted}>
        Les données des utilisateurs (base de données) sont hébergées par :<br />
        <strong>Neon (Neon Inc.)</strong> — serveurs localisés en Europe (région eu-west).<br />
        Les fichiers (documents, PDF) sont stockés via <strong>Vercel Blob</strong>.
      </p>

      <h2 style={h2}>4. Propriété intellectuelle</h2>
      <p style={p}>
        L'ensemble des éléments constituant le site Prysme (textes, graphismes, logiciels, interface, base de données) sont la propriété exclusive de l'éditeur ou font l'objet d'une autorisation d'utilisation.
      </p>
      <p style={p}>
        Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie de ces éléments est interdite et constituerait une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
      </p>

      <h2 style={h2}>5. Limitation de responsabilité</h2>
      <p style={p}>
        Prysme met tout en œuvre pour offrir aux utilisateurs des informations fiables et à jour. Toutefois, l'éditeur ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées sur le site. L'utilisateur reste responsable de l'utilisation qu'il fait des informations et fonctionnalités proposées.
      </p>
      <p style={p}>
        Les contrats générés via Prysme sont fournis à titre d'outil d'automatisation. L'éditeur ne fournit pas de conseil juridique. Il appartient à l'utilisateur de vérifier la conformité de ses contrats avec la législation applicable.
      </p>

      <h2 style={h2}>6. Données personnelles</h2>
      <p style={p}>
        Le traitement des données personnelles est détaillé dans notre{' '}
        <a href="/legal/confidentialite" style={{ color: '#1C1C1A' }}>Politique de confidentialité</a>.
      </p>

      <h2 style={h2}>7. Contact</h2>
      <p style={muted}>
        Pour toute question relative au site : <strong>contact@prysme.fr</strong>
      </p>
    </>
  );
}
