import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Prysme",
  description: "Comment Prysme collecte, utilise et protège vos données personnelles. Conformité RGPD.",
  robots: { index: true, follow: true },
};

const h1: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#1C1C1A', marginBottom: '8px', lineHeight: 1.2 };
const date: React.CSSProperties = { fontSize: '12px', color: '#7A7570', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px', display: 'block' };
const h2: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#1C1C1A', marginTop: '40px', marginBottom: '12px' };
const h3: React.CSSProperties = { fontSize: '14px', fontWeight: 500, color: '#1C1C1A', marginTop: '24px', marginBottom: '8px', letterSpacing: '0.05em' };
const p: React.CSSProperties = { fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, marginBottom: '12px', fontWeight: 300 };
const muted: React.CSSProperties = { fontSize: '13px', color: '#7A7570', lineHeight: 1.7, marginBottom: '8px', fontWeight: 300 };
const li: React.CSSProperties = { fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, marginBottom: '6px', fontWeight: 300 };

export default function ConfidentialitePage() {
  return (
    <>
      <h1 style={h1}>Politique de confidentialité</h1>
      <span style={date}>Mise à jour : avril 2026</span>

      <p style={p}>
        Prysme (ci-après «&nbsp;nous&nbsp;» ou «&nbsp;le Service&nbsp;») accorde une importance particulière à la protection de vos données personnelles. Cette politique décrit quelles données nous collectons, pourquoi, comment nous les utilisons, et quels sont vos droits.
      </p>

      <h2 style={h2}>1. Responsable du traitement</h2>
      <p style={muted}>
        Lancelot Automotion — [Adresse — à compléter] — contact@prysme.fr
      </p>

      <h2 style={h2}>2. Données collectées</h2>

      <h3 style={h3}>2.1 Données de compte</h3>
      <p style={p}>Lors de votre inscription via Clerk (notre fournisseur d'authentification) :</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Adresse email</li>
        <li style={li}>Nom (optionnel, selon la méthode d'inscription)</li>
        <li style={li}>Identifiant Clerk (généré automatiquement)</li>
      </ul>

      <h3 style={h3}>2.2 Données de votre établissement</h3>
      <p style={p}>Informations que vous renseignez pour configurer votre gîte :</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Nom, adresse et coordonnées du gîte</li>
        <li style={li}>Logo (stocké sur Vercel Blob)</li>
        <li style={li}>Documents joints (RIB, règlement intérieur) — stockés sur Vercel Blob</li>
      </ul>

      <h3 style={h3}>2.3 Données de réservation</h3>
      <p style={p}>Pour chaque réservation que vous créez :</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Nom, prénom, email, téléphone, adresse du locataire</li>
        <li style={li}>Dates de séjour, montants, options</li>
        <li style={li}>Contrats PDF générés (stockés sur Vercel Blob)</li>
      </ul>

      <h3 style={h3}>2.4 Données de paiement</h3>
      <p style={p}>
        Les paiements sont traités par <strong>Stripe</strong>. Prysme ne stocke jamais vos coordonnées bancaires. Seul Stripe y a accès, dans le cadre de sa politique de confidentialité disponible sur <a href="https://stripe.com/privacy" style={{ color: '#7A7570' }}>stripe.com/privacy</a>.
      </p>
      <p style={muted}>Nous stockons uniquement : l'identifiant client Stripe, le statut de l'abonnement et la date de fin de période.</p>

      <h3 style={h3}>2.5 Données techniques</h3>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Logs de connexion (gérés par Clerk)</li>
        <li style={li}>Préférence de thème (localStorage navigateur uniquement)</li>
      </ul>

      <h2 style={h2}>3. Finalités du traitement</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Fourniture du service (génération de contrats, envoi d'emails)</li>
        <li style={li}>Gestion de votre abonnement et facturation</li>
        <li style={li}>Envoi d'emails transactionnels (confirmation, rappels d'acompte)</li>
        <li style={li}>Support utilisateur</li>
        <li style={li}>Amélioration du service (métriques internes agrégées)</li>
      </ul>

      <h2 style={h2}>4. Base légale</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}><strong>Exécution du contrat</strong> : traitement nécessaire à la fourniture du service souscrit</li>
        <li style={li}><strong>Intérêt légitime</strong> : amélioration du service, sécurité</li>
        <li style={li}><strong>Obligation légale</strong> : conservation des données comptables et contractuelles</li>
      </ul>

      <h2 style={h2}>5. Durée de conservation</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Données de compte : jusqu'à la suppression du compte + 30 jours</li>
        <li style={li}>Données de réservation et contrats : 5 ans après la date du séjour (obligation comptable)</li>
        <li style={li}>Données de paiement : conformément aux obligations légales (10 ans)</li>
      </ul>

      <h2 style={h2}>6. Sous-traitants</h2>
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #CEC8BF' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#7A7570', fontWeight: 400 }}>Prestataire</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#7A7570', fontWeight: 400 }}>Rôle</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: '#7A7570', fontWeight: 400 }}>Localisation</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Clerk', 'Authentification utilisateurs', 'États-Unis (SCC)'],
              ['Neon', 'Base de données PostgreSQL', 'Europe (eu-west)'],
              ['Vercel', 'Hébergement & stockage fichiers', 'Europe / USA'],
              ['Resend', 'Envoi d\'emails transactionnels', 'États-Unis (SCC)'],
              ['Stripe', 'Paiement & facturation', 'États-Unis (SCC)'],
            ].map(([name, role, loc]) => (
              <tr key={name} style={{ borderBottom: '1px solid #CEC8BF' }}>
                <td style={{ padding: '10px 12px', color: '#1C1C1A', fontWeight: 500 }}>{name}</td>
                <td style={{ padding: '10px 12px', color: '#1C1C1A' }}>{role}</td>
                <td style={{ padding: '10px 12px', color: '#7A7570' }}>{loc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={muted}>SCC = Clauses contractuelles types approuvées par la Commission européenne.</p>

      <h2 style={h2}>7. Vos droits (RGPD)</h2>
      <p style={p}>Conformément au Règlement (UE) 2016/679, vous disposez des droits suivants :</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}><strong>Accès</strong> : obtenir une copie de vos données</li>
        <li style={li}><strong>Rectification</strong> : corriger des données inexactes</li>
        <li style={li}><strong>Effacement</strong> : demander la suppression de vos données («&nbsp;droit à l'oubli&nbsp;»)</li>
        <li style={li}><strong>Portabilité</strong> : recevoir vos données dans un format structuré</li>
        <li style={li}><strong>Opposition</strong> : vous opposer à certains traitements</li>
        <li style={li}><strong>Limitation</strong> : restreindre le traitement dans certains cas</li>
      </ul>
      <p style={p}>
        Pour exercer vos droits : <strong>contact@prysme.fr</strong><br />
        Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (cnil.fr).
      </p>

      <h2 style={h2}>8. Cookies</h2>
      <p style={p}>
        Prysme utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session d'authentification Clerk). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
      </p>

      <h2 style={h2}>9. Sécurité</h2>
      <p style={p}>
        Les données sont transmises via HTTPS. L'accès à la base de données est restreint et authentifié. Les fichiers stockés sur Vercel Blob sont accessibles via des URL signées ou publiques selon leur nature.
      </p>

      <h2 style={h2}>10. Modifications</h2>
      <p style={p}>
        Cette politique peut être mise à jour. En cas de modification substantielle, vous serez informé par email. La date de mise à jour est indiquée en haut de cette page.
      </p>
    </>
  );
}
