import type { Metadata } from "next";
import LegalSidebarClient from "../_components/LegalSidebarClient";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Prysme",
  description: "CGV Prysme : abonnement 9,99 € HT/mois, essai 30 jours sans CB, résiliation à tout moment.",
};

export default function CGVPage() {
  return (
    <>
      <div className="ph-wrap">
        <div className="ph-inner">
          <div className="ph-tag violet">Juridique</div>
          <h1 className="ph-title">Conditions Générales <span className="v">de Vente</span></h1>
          <p className="ph-subtitle">Conditions applicables à l&apos;abonnement Prysme. Essai gratuit 30 jours, sans engagement, sans carte bancaire.</p>
          <div className="ph-meta">
            <span>Version en vigueur : avril 2026</span>
          </div>
        </div>
      </div>

      <div className="legal-layout">
        <LegalSidebarClient links={[
          { href: "#art1", label: "1. Objet" },
          { href: "#art2", label: "2. Prestataire" },
          { href: "#art3", label: "3. Essai gratuit" },
          { href: "#art4", label: "4. Tarif" },
          { href: "#art5", label: "5. Paiement" },
          { href: "#art6", label: "6. Résiliation" },
          { href: "#art7", label: "7. Droit de rétractation" },
          { href: "#art8", label: "8. Obligations" },
          { href: "#art9", label: "9. Propriété intellectuelle" },
          { href: "#art10", label: "10. Droit applicable" },
          { href: "#art11", label: "11. Contact" },
        ]} />

        <div className="legal-content">

          <div className="legal-callout green" style={{ marginTop: 0 }}>
            <strong>En résumé :</strong> abonnement mensuel à <strong>9,99 € HT/mois</strong>, avec <strong>30 jours d&apos;essai gratuit</strong> sans carte bancaire. Sans engagement, résiliable à tout moment.
          </div>

          <h2 id="art1"><span className="num">01.</span> Objet</h2>
          <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations contractuelles entre <strong>Prysme</strong> et tout utilisateur souscrivant à un abonnement payant. Prysme est un logiciel SaaS permettant aux gérants de gîtes et hébergements saisonniers d&apos;automatiser la génération, l&apos;envoi et la signature électronique de leurs contrats de location.</p>

          <h2 id="art2"><span className="num">02.</span> Prestataire</h2>
          <p><strong>Lancelot Loubier</strong><br/>
          Entrepreneur individuel<br/>
          Paris, France<br/>
          Email : <a href="mailto:contact@prysme.app">contact@prysme.app</a></p>

          <h2 id="art3"><span className="num">03.</span> Essai gratuit (30 jours)</h2>
          <p>— Tout nouveau compte bénéficie de <strong>30 jours d&apos;essai gratuit</strong> à compter de l&apos;inscription.<br/>
          — Aucune carte bancaire n&apos;est requise pour accéder à l&apos;essai.<br/>
          — Toutes les fonctionnalités sont accessibles pendant la période d&apos;essai.<br/>
          — À l&apos;issue de l&apos;essai, l&apos;accès est suspendu jusqu&apos;à souscription d&apos;un abonnement.<br/>
          — Les données sont conservées 30 jours après expiration de l&apos;essai sans souscription.</p>

          <h2 id="art4"><span className="num">04.</span> Tarif</h2>
          <p>L&apos;abonnement Prysme est proposé au tarif de <strong>9,99 € HT / mois</strong> par compte.</p>
          <p>— Prix hors taxes. La TVA en vigueur est applicable à la facturation.<br/>
          — Facturation mensuelle à date anniversaire de souscription.<br/>
          — Sans engagement de durée minimale.<br/>
          — Toute modification tarifaire sera notifiée par email au moins <strong>30 jours</strong> avant son entrée en vigueur.</p>

          <h2 id="art5"><span className="num">05.</span> Paiement</h2>
          <p>Les paiements sont sécurisés via <strong>Stripe</strong>. Moyens de paiement acceptés : Visa, Mastercard, American Express.</p>
          <p>En cas d&apos;échec de paiement, l&apos;accès au service peut être suspendu après 7 jours sans régularisation. Un email de relance est envoyé à chaque tentative infructueuse.</p>

          <h2 id="art6"><span className="num">06.</span> Résiliation</h2>
          <p>— Résiliable à tout moment depuis <strong>Paramètres → Gérer mon abonnement</strong>.<br/>
          — La résiliation prend effet à la fin de la période mensuelle en cours.<br/>
          — Aucun remboursement au prorata pour la période restante.<br/>
          — Les données sont conservées en lecture seule pendant 12 mois après la fin d&apos;accès.</p>

          <h2 id="art7"><span className="num">07.</span> Droit de rétractation</h2>
          <p>Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux services entièrement exécutés avec l&apos;accord préalable du consommateur.</p>
          <p>Dans un esprit de satisfaction client, Prysme étudie toute demande de remboursement formulée dans les <strong>7 jours</strong> suivant la première souscription, à adresser à <a href="mailto:contact@prysme.app">contact@prysme.app</a>.</p>

          <h2 id="art8"><span className="num">08.</span> Obligations et responsabilités</h2>
          <p><strong>Client :</strong> utiliser le service conformément à la loi et aux <a href="/legal/cgu">CGU</a>, ne pas partager ses identifiants, vérifier la conformité légale de ses contrats. Prysme est un outil de génération documentaire et ne fournit pas de conseil juridique.</p>
          <p><strong>Prysme :</strong> maintenir le service disponible, assurer la sécurité des données, fournir un support sous 48h ouvrées. La responsabilité de Prysme est limitée aux sommes versées par le client au cours des 3 derniers mois.</p>

          <h2 id="art9"><span className="num">09.</span> Propriété intellectuelle</h2>
          <p>Le logiciel Prysme et l&apos;ensemble de ses composants sont protégés par les lois relatives à la propriété intellectuelle. Le Client bénéficie d&apos;une licence d&apos;utilisation personnelle, non exclusive, non transférable, limitée à la durée de son abonnement.</p>

          <h2 id="art10"><span className="num">10.</span> Droit applicable</h2>
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut d&apos;accord, les tribunaux de <strong>Paris</strong> seront seuls compétents.</p>

          <h2 id="art11"><span className="num">11.</span> Contact</h2>
          <p>Pour toute question relative aux présentes CGV :<br/>
          <strong>Email :</strong> <a href="mailto:contact@prysme.app">contact@prysme.app</a></p>
        </div>
      </div>
    </>
  );
}
