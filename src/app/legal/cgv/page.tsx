import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Prysme",
  description: "CGV Prysme : abonnement 9,99 € HT/mois, essai 30 jours sans CB, résiliation à tout moment.",
};

const tk = { ink: '#0A0A0B', inkSoft: '#4B5563', inkMuted: '#9CA3AF', border: '#E5E7EB', surface: '#F9FAFB', blue: '#2563EB', green: '#16A34A', greenBg: '#F0FDF4', font: 'Inter, -apple-system, sans-serif' };
const h1s: React.CSSProperties = { fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: tk.ink, marginBottom: '8px', lineHeight: 1.1, letterSpacing: '-0.03em' };
const dates: React.CSSProperties = { fontSize: '12px', color: tk.inkMuted, fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '48px', display: 'block', paddingBottom: '32px', borderBottom: `1px solid ${tk.border}` };
const h2s: React.CSSProperties = { fontFamily: tk.font, fontSize: '18px', fontWeight: 700, color: tk.ink, marginTop: '40px', marginBottom: '10px', letterSpacing: '-0.02em' };
const ps: React.CSSProperties = { fontSize: '14px', color: tk.inkSoft, lineHeight: 1.75, marginBottom: '12px', fontWeight: 400 };
const lis: React.CSSProperties = { fontSize: '14px', color: tk.inkSoft, lineHeight: 1.75, marginBottom: '6px', fontWeight: 400 };
const strongs: React.CSSProperties = { color: tk.ink, fontWeight: 600 };

export default function CGVPage() {
  return (
    <>
      <h1 style={h1s}>Conditions Générales de Vente</h1>
      <span style={dates}>Version en vigueur : avril 2026</span>

      {/* Résumé */}
      <div style={{ background: tk.greenBg, border: `1px solid #BBF7D0`, borderRadius: '10px', padding: '16px 20px', marginBottom: '40px' }}>
        <p style={{ ...ps, marginBottom: 0, color: '#166534' }}>
          <strong>En résumé :</strong> abonnement mensuel à <strong>9,99 € HT/mois</strong>, avec <strong>30 jours d&apos;essai gratuit</strong> sans carte bancaire. Sans engagement, résiliable à tout moment.
        </p>
      </div>

      <h2 style={h2s}>1. Objet</h2>
      <p style={ps}>Les présentes CGV régissent les relations entre Prysme et tout utilisateur souscrivant à un abonnement. Prysme est un SaaS permettant aux gérants de gîtes d&apos;automatiser la gestion de leurs contrats de location.</p>

      <h2 style={h2s}>2. Prestataire</h2>
      <p style={ps}>Lancelot Automotion — [SIRET — à compléter] — <a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none' }}>contact@prysme.fr</a></p>

      <h2 style={h2s}>3. Essai gratuit (30 jours)</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Tout nouveau compte bénéficie de <strong style={strongs}>30 jours d&apos;essai gratuit</strong> à compter de l&apos;inscription</li>
        <li style={lis}>Aucune carte bancaire requise pour accéder à l&apos;essai</li>
        <li style={lis}>Toutes les fonctionnalités sont accessibles pendant l&apos;essai</li>
        <li style={lis}>À l&apos;issue de l&apos;essai, l&apos;accès est suspendu jusqu&apos;à souscription</li>
        <li style={lis}>Les données sont conservées 30 jours après expiration</li>
      </ul>

      <h2 style={h2s}>4. Tarif</h2>
      <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontFamily: tk.font, fontSize: '36px', fontWeight: 800, color: tk.ink, letterSpacing: '-0.04em', lineHeight: 1 }}>9,99 €</span>
        <span style={{ fontSize: '14px', color: tk.inkMuted, fontWeight: 400 }}>HT / mois · par gîte</span>
      </div>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Prix hors taxes (TVA en vigueur applicable)</li>
        <li style={lis}>Facturation mensuelle à date anniversaire</li>
        <li style={lis}>Sans engagement de durée</li>
        <li style={lis}>Toute modification tarifaire notifiée par email sous 30 jours</li>
      </ul>

      <h2 style={h2s}>5. Paiement</h2>
      <p style={ps}>Paiements sécurisés via <strong style={strongs}>Stripe</strong>. Moyens acceptés : Visa, Mastercard, American Express. En cas d&apos;échec de paiement, l&apos;accès peut être suspendu après 7 jours sans régularisation.</p>

      <h2 style={h2s}>6. Résiliation</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
        <li style={lis}>Résiliable à tout moment depuis Paramètres → Gérer mon abonnement</li>
        <li style={lis}>La résiliation prend effet à la fin de la période mensuelle en cours</li>
        <li style={lis}>Aucun remboursement proratisé pour la période restante</li>
        <li style={lis}>Les données sont conservées 30 jours après la fin d&apos;accès</li>
      </ul>

      <h2 style={h2s}>7. Droit de rétractation</h2>
      <p style={ps}>Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux services entièrement exécutés. Dans un esprit de satisfaction client, Prysme étudie toute demande de remboursement formulée dans les 7 jours suivant la première souscription à <a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none' }}>contact@prysme.fr</a>.</p>

      <h2 style={h2s}>8. Obligations et responsabilités</h2>
      <p style={ps}><strong style={strongs}>Client :</strong> utiliser le service conformément à la loi, ne pas partager ses identifiants, vérifier la conformité légale de ses contrats.</p>
      <p style={ps}><strong style={strongs}>Prysme :</strong> maintenir le service disponible, assurer la sécurité des données, fournir un support sous 48h ouvrées. La responsabilité de Prysme est limitée aux sommes versées au cours des 3 derniers mois.</p>

      <h2 style={h2s}>9. Propriété intellectuelle</h2>
      <p style={ps}>Le logiciel Prysme est protégé. Le Client bénéficie d&apos;une licence d&apos;utilisation personnelle, non exclusive, limitée à la durée de son abonnement.</p>

      <h2 style={h2s}>10. Droit applicable</h2>
      <p style={ps}>Ces CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français compétents seront saisis.</p>

      <h2 style={h2s}>11. Contact</h2>
      <p style={ps}><a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none', fontWeight: 500 }}>contact@prysme.fr</a></p>
    </>
  );
}
