import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Prysme",
  description: "Mentions légales de Prysme, logiciel de gestion de contrats de location pour gîtes.",
};

const tk = { ink: '#2C2C2A', inkSoft: '#71716E', inkMuted: '#A3A3A0', border: '#E8E6E1', surface: '#F3F2EE', blue: '#7F77DD', font: "'Plus Jakarta Sans', system-ui, sans-serif" };
const h1s: React.CSSProperties = { fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: tk.ink, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.03em' };
const dates: React.CSSProperties = { fontSize: '12px', color: tk.inkMuted, fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '48px', display: 'block', paddingBottom: '32px', borderBottom: `1px solid ${tk.border}` };
const h2s: React.CSSProperties = { fontFamily: tk.font, fontSize: '18px', fontWeight: 700, color: tk.ink, marginTop: '40px', marginBottom: '10px', letterSpacing: '-0.02em' };
const ps: React.CSSProperties = { fontSize: '14px', color: tk.inkSoft, lineHeight: 1.75, marginBottom: '12px', fontWeight: 400 };
const strongs: React.CSSProperties = { color: tk.ink, fontWeight: 600 };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 style={h1s}>Mentions légales</h1>
      <span style={dates}>Mise à jour : avril 2026</span>

      <h2 style={h2s}>1. Éditeur du site</h2>
      <p style={ps}>Le site Prysme (accessible à l&apos;adresse <strong style={strongs}>prysme.fr</strong>) est édité par :</p>
      <p style={{ ...ps, background: tk.surface, borderRadius: '8px', padding: '16px 20px', border: `1px solid ${tk.border}`, fontFamily: 'monospace, monospace', fontSize: '13px' }}>
        <strong style={strongs}>Lancelot Automotion</strong><br />
        Forme juridique : [À compléter]<br />
        SIRET : [À compléter]<br />
        Adresse : [À compléter]<br />
        Email : contact@prysme.fr
      </p>

      <h2 style={h2s}>2. Directeur de la publication</h2>
      <p style={ps}>Lancelot [Nom — à compléter], en qualité de représentant légal.</p>

      <h2 style={h2s}>3. Hébergement</h2>
      <p style={ps}>Le site est hébergé par <strong style={strongs}>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      <p style={ps}>La base de données est hébergée par <strong style={strongs}>Neon Inc.</strong> — serveurs en Europe (région eu-west). Les fichiers (logos, PDF) sont stockés via <strong style={strongs}>Vercel Blob</strong>.</p>

      <h2 style={h2s}>4. Propriété intellectuelle</h2>
      <p style={ps}>L&apos;ensemble des éléments de Prysme (interface, textes, logiciels, base de données) sont la propriété exclusive de l&apos;éditeur. Toute reproduction non autorisée constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>

      <h2 style={h2s}>5. Limitation de responsabilité</h2>
      <p style={ps}>Les contrats générés via Prysme sont fournis à titre d&apos;outil d&apos;automatisation. Prysme ne fournit pas de conseil juridique. L&apos;utilisateur reste responsable de la conformité de ses contrats avec la législation applicable.</p>

      <h2 style={h2s}>6. Données personnelles</h2>
      <p style={ps}>Le traitement des données personnelles est détaillé dans notre <a href="/legal/confidentialite" style={{ color: tk.blue, textDecoration: 'none', fontWeight: 500 }}>Politique de confidentialité</a>.</p>

      <h2 style={h2s}>7. Contact</h2>
      <p style={ps}><a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none', fontWeight: 500 }}>contact@prysme.fr</a></p>
    </>
  );
}
