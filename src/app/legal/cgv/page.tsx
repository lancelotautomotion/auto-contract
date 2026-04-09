import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Prysme",
  description: "Conditions générales de vente de Prysme : abonnement, essai gratuit, résiliation, remboursement.",
  robots: { index: true, follow: true },
};

const h1: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#1C1C1A', marginBottom: '8px', lineHeight: 1.2 };
const date: React.CSSProperties = { fontSize: '12px', color: '#7A7570', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '48px', display: 'block' };
const h2: React.CSSProperties = { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#1C1C1A', marginTop: '40px', marginBottom: '12px' };
const p: React.CSSProperties = { fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, marginBottom: '12px', fontWeight: 300 };
const muted: React.CSSProperties = { fontSize: '13px', color: '#7A7570', lineHeight: 1.7, marginBottom: '8px', fontWeight: 300 };
const li: React.CSSProperties = { fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, marginBottom: '6px', fontWeight: 300 };
const infoBox: React.CSSProperties = { backgroundColor: '#E5DED5', border: '1px solid #CEC8BF', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' };

export default function CGVPage() {
  return (
    <>
      <h1 style={h1}>Conditions Générales de Vente</h1>
      <span style={date}>Version en vigueur : avril 2026</span>

      <div style={infoBox}>
        <p style={{ ...muted, marginBottom: 0 }}>
          <strong style={{ color: '#1C1C1A' }}>En résumé :</strong> Prysme propose un abonnement mensuel à 9,99&nbsp;€&nbsp;HT/mois. Vous bénéficiez de 30 jours d'essai gratuit, sans carte bancaire. Après l'essai, l'abonnement est sans engagement et résiliable à tout moment.
        </p>
      </div>

      <h2 style={h2}>1. Objet</h2>
      <p style={p}>
        Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Prysme (ci-après «&nbsp;le Prestataire&nbsp;») et tout utilisateur souscrivant à un abonnement payant (ci-après «&nbsp;le Client&nbsp;»).
      </p>
      <p style={p}>
        Prysme est un logiciel SaaS (Software as a Service) permettant aux gérants de gîtes et locations saisonnières d'automatiser la génération de contrats de location, l'envoi d'emails et le suivi des réservations.
      </p>

      <h2 style={h2}>2. Prestataire</h2>
      <p style={muted}>
        Lancelot Automotion<br />
        [Forme juridique et SIRET — à compléter]<br />
        Email : contact@prysme.fr
      </p>

      <h2 style={h2}>3. Accès au service</h2>
      <p style={p}>
        L'accès à Prysme requiert la création d'un compte via l'interface d'inscription. Le Client s'engage à fournir des informations exactes et à les maintenir à jour.
      </p>
      <p style={p}>
        Chaque compte permet la gestion d'un gîte. La gestion multi-gîtes fera l'objet d'une offre dédiée.
      </p>

      <h2 style={h2}>4. Période d'essai gratuit</h2>
      <p style={p}>
        Tout nouveau compte bénéficie d'une <strong>période d'essai gratuite de 30 jours</strong> à compter de la date d'inscription.
      </p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Aucune carte bancaire n'est requise pour accéder à l'essai</li>
        <li style={li}>L'ensemble des fonctionnalités est accessible pendant l'essai</li>
        <li style={li}>À l'issue de l'essai, l'accès au service est suspendu jusqu'à la souscription d'un abonnement</li>
        <li style={li}>Les données créées pendant l'essai sont conservées pendant 30 jours après l'expiration</li>
      </ul>

      <h2 style={h2}>5. Tarifs</h2>
      <div style={{ ...infoBox, display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '36px', fontWeight: 300, color: '#1C1C1A' }}>9,99&nbsp;€ HT</span>
        <span style={{ fontSize: '14px', color: '#7A7570' }}>par mois · par gîte</span>
      </div>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Prix hors taxes (TVA applicable selon la réglementation en vigueur)</li>
        <li style={li}>Facturation mensuelle, à date anniversaire</li>
        <li style={li}>Sans engagement de durée</li>
        <li style={li}>Prysme se réserve le droit de modifier ses tarifs avec un préavis de 30 jours par email</li>
      </ul>

      <h2 style={h2}>6. Paiement</h2>
      <p style={p}>
        Les paiements sont traités de manière sécurisée par <strong>Stripe</strong>. Les moyens de paiement acceptés sont : carte bancaire (Visa, Mastercard, American Express).
      </p>
      <p style={p}>
        En cas d'échec de paiement, le Client est notifié par email. L'accès au service peut être suspendu après un délai de 7 jours sans régularisation.
      </p>

      <h2 style={h2}>7. Résiliation</h2>
      <p style={p}>
        Le Client peut résilier son abonnement à tout moment depuis son espace «&nbsp;Paramètres&nbsp;» → «&nbsp;Gérer mon abonnement&nbsp;», accessible via le portail client Stripe.
      </p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>La résiliation prend effet à la fin de la période mensuelle en cours</li>
        <li style={li}>Aucun remboursement proratisé n'est effectué pour la période restante</li>
        <li style={li}>L'accès au service est maintenu jusqu'à la fin de la période payée</li>
        <li style={li}>Les données sont conservées 30 jours après la fin d'accès, puis supprimées</li>
      </ul>

      <h2 style={h2}>8. Droit de rétractation</h2>
      <p style={p}>
        Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services entièrement exécutés avant la fin du délai de rétractation.
      </p>
      <p style={p}>
        Toutefois, dans un esprit de satisfaction client, Prysme s'engage à étudier toute demande de remboursement formulée dans les 7 jours suivant la première souscription (hors période d'essai). Les demandes sont à adresser à contact@prysme.fr.
      </p>

      <h2 style={h2}>9. Obligations du Client</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Utiliser le service conformément à sa destination et aux lois en vigueur</li>
        <li style={li}>Ne pas partager ses identifiants de connexion</li>
        <li style={li}>S'assurer de la légalité des contrats générés au regard de la réglementation applicable à son activité</li>
        <li style={li}>Conserver une copie de ses données importantes (Prysme décline toute responsabilité en cas de perte de données)</li>
      </ul>

      <h2 style={h2}>10. Obligations du Prestataire</h2>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li style={li}>Maintenir le service disponible 24h/24, 7j/7, sauf maintenance planifiée notifiée à l'avance</li>
        <li style={li}>Assurer la sécurité des données conformément à la politique de confidentialité</li>
        <li style={li}>Fournir un support par email dans un délai de 48h ouvrées</li>
      </ul>

      <h2 style={h2}>11. Limitation de responsabilité</h2>
      <p style={p}>
        Prysme est un outil d'automatisation et ne fournit pas de conseil juridique. Le Prestataire ne saurait être tenu responsable de la non-conformité des contrats générés avec la législation applicable à l'activité du Client.
      </p>
      <p style={p}>
        La responsabilité du Prestataire est limitée au montant des sommes versées par le Client au cours des 3 derniers mois précédant le fait générateur.
      </p>

      <h2 style={h2}>12. Propriété intellectuelle</h2>
      <p style={p}>
        Le logiciel Prysme, son interface et ses éléments constitutifs sont protégés par le droit de la propriété intellectuelle. Le Client bénéficie d'une licence d'utilisation personnelle, non exclusive et non transférable, limitée à la durée de son abonnement.
      </p>

      <h2 style={h2}>13. Force majeure</h2>
      <p style={p}>
        Le Prestataire ne pourra être tenu responsable d'un manquement à ses obligations en cas d'événement de force majeure au sens de l'article 1218 du Code civil.
      </p>

      <h2 style={h2}>14. Droit applicable et litiges</h2>
      <p style={p}>
        Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français compétents seront saisis.
      </p>
      <p style={p}>
        Conformément aux articles L.612-1 et suivants du Code de la consommation, le Client peut recourir gratuitement à un médiateur de la consommation.
      </p>

      <h2 style={h2}>15. Contact</h2>
      <p style={muted}>
        Pour toute question relative aux présentes CGV : <strong>contact@prysme.fr</strong>
      </p>
    </>
  );
}
