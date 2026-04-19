import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Prysme",
  description: "Comment Prysme collecte, utilise et protège vos données personnelles. Conformité RGPD.",
};

const tk = { ink: '#2C2C2A', inkSoft: '#71716E', inkMuted: '#A3A3A0', border: '#E8E6E1', surface: '#F3F2EE', blue: '#7F77DD', font: "'Plus Jakarta Sans', system-ui, sans-serif" };
const h1s: React.CSSProperties = { fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: tk.ink, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.03em' };
const dates: React.CSSProperties = { fontSize: '12px', color: tk.inkMuted, fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '48px', display: 'block', paddingBottom: '32px', borderBottom: `1px solid ${tk.border}` };
const h2s: React.CSSProperties = { fontFamily: tk.font, fontSize: '18px', fontWeight: 700, color: tk.ink, marginTop: '40px', marginBottom: '10px', letterSpacing: '-0.02em' };
const h3s: React.CSSProperties = { fontFamily: tk.font, fontSize: '14px', fontWeight: 600, color: tk.ink, marginTop: '20px', marginBottom: '6px' };
const ps: React.CSSProperties = { fontSize: '14px', color: tk.inkSoft, lineHeight: 1.75, marginBottom: '12px', fontWeight: 400 };
const lis: React.CSSProperties = { fontSize: '14px', color: tk.inkSoft, lineHeight: 1.75, marginBottom: '6px', fontWeight: 400 };
const strongs: React.CSSProperties = { color: tk.ink, fontWeight: 600 };
const tds: React.CSSProperties = { padding: '10px 14px', fontSize: '13px', borderBottom: `1px solid ${tk.border}` };

export default function ConfidentialitePage() {
  return (
    <>
      <h1 style={h1s}>Politique de confidentialité</h1>
      <span style={dates}>Mise à jour : avril 2026</span>

      <p style={ps}>Prysme accorde une importance particulière à la protection de vos données. Cette politique décrit ce que nous collectons, pourquoi, et quels sont vos droits.</p>

      <h2 style={h2s}>1. Responsable du traitement</h2>
      <p style={ps}>Lancelot Automotion — [Adresse] — <a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none' }}>contact@prysme.fr</a></p>

      <h2 style={h2s}>2. Données collectées</h2>
      <h3 style={h3s}>Données de compte</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Adresse email, identifiant Clerk (via Clerk, notre fournisseur d&apos;authentification)</li>
      </ul>
      <h3 style={h3s}>Données de votre gîte</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Nom, adresse, coordonnées du gîte</li>
        <li style={lis}>Logo et documents (RIB, règlement) — stockés sur Vercel Blob</li>
      </ul>
      <h3 style={h3s}>Données de réservation</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Nom, prénom, email, téléphone, adresse du locataire</li>
        <li style={lis}>Dates de séjour, montants, contrats PDF générés</li>
      </ul>
      <h3 style={h3s}>Données de paiement</h3>
      <p style={ps}>Traitées exclusivement par <strong style={strongs}>Stripe</strong>. Prysme ne stocke jamais vos coordonnées bancaires — uniquement l&apos;identifiant client Stripe et le statut d&apos;abonnement.</p>

      <h2 style={h2s}>3. Finalités</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Fourniture du service (génération de contrats, envoi d&apos;emails)</li>
        <li style={lis}>Gestion de l&apos;abonnement et facturation</li>
        <li style={lis}>Emails transactionnels (confirmations, rappels d&apos;acompte)</li>
        <li style={lis}>Amélioration du service (métriques agrégées)</li>
      </ul>

      <h2 style={h2s}>4. Base légale</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}><strong style={strongs}>Exécution du contrat</strong> — fourniture du service souscrit</li>
        <li style={lis}><strong style={strongs}>Intérêt légitime</strong> — amélioration du service, sécurité</li>
        <li style={lis}><strong style={strongs}>Obligation légale</strong> — conservation des données comptables</li>
      </ul>

      <h2 style={h2s}>5. Durée de conservation</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Données de compte : jusqu&apos;à suppression du compte + 30 jours</li>
        <li style={lis}>Données de réservation et contrats : 5 ans après le séjour</li>
        <li style={lis}>Données de paiement : 10 ans (obligations légales)</li>
      </ul>

      <h2 style={h2s}>6. Sous-traitants</h2>
      <div style={{ overflowX: 'auto', marginBottom: '16px', borderRadius: '8px', border: `1px solid ${tk.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: tk.surface }}>
              <th style={{ ...tds, textAlign: 'left', fontWeight: 600, color: tk.ink }}>Prestataire</th>
              <th style={{ ...tds, textAlign: 'left', fontWeight: 600, color: tk.ink }}>Rôle</th>
              <th style={{ ...tds, textAlign: 'left', fontWeight: 600, color: tk.ink }}>Localisation</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Clerk',  'Authentification',          'États-Unis (SCC)'],
              ['Neon',   'Base de données PostgreSQL', 'Europe (eu-west)'],
              ['Vercel', 'Hébergement & fichiers',     'Europe / USA'],
              ['Resend', 'Emails transactionnels',     'États-Unis (SCC)'],
              ['Stripe', 'Paiement & facturation',     'États-Unis (SCC)'],
            ].map(([name, role, loc]) => (
              <tr key={name}>
                <td style={{ ...tds, fontWeight: 500, color: tk.ink }}>{name}</td>
                <td style={{ ...tds, color: tk.inkSoft }}>{role}</td>
                <td style={{ ...tds, color: tk.inkMuted }}>{loc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...ps, fontSize: '12px', color: tk.inkMuted }}>SCC = Clauses contractuelles types approuvées par la Commission européenne.</p>

      <h2 style={h2s}>7. Vos droits (RGPD)</h2>
      <p style={ps}>Vous disposez des droits d&apos;accès, rectification, effacement, portabilité, opposition et limitation. Pour les exercer : <a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none' }}>contact@prysme.fr</a>. Vous pouvez également saisir la <strong style={strongs}>CNIL</strong> (cnil.fr).</p>

      <h2 style={h2s}>8. Cookies</h2>
      <p style={ps}>Prysme utilise uniquement les cookies strictement nécessaires au fonctionnement du service (session d&apos;authentification Clerk). Aucun cookie publicitaire ou de tracking.</p>

      <h2 style={h2s}>9. Contact</h2>
      <p style={ps}><a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none', fontWeight: 500 }}>contact@prysme.fr</a></p>
    </>
  );
}
