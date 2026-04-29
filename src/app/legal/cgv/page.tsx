import type { Metadata } from "next";
import LegalSidebarClient from "../_components/LegalSidebarClient";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Kordia",
  description: "CGV Kordia : abonnement 9,99 € HT/mois, essai 30 jours sans CB, résiliation à tout moment.",
};

export default function CGVPage() {
  return (
    <>
      <div className="ph-wrap">
        <div className="ph-inner">
          <div className="ph-tag violet">Juridique</div>
          <h1 className="ph-title">Conditions Générales <span className="v">de Vente</span></h1>
          <p className="ph-subtitle">Conditions applicables à l&apos;abonnement Kordia. Essai gratuit 30 jours, sans engagement, sans carte bancaire.</p>
          <div className="ph-meta">
            <span>Version en vigueur : 24 avril 2026</span>
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
          <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations contractuelles entre <strong>Kordia</strong> et tout utilisateur souscrivant à un abonnement payant. Kordia est un logiciel SaaS permettant aux gérants de gîtes et hébergements saisonniers d&apos;automatiser la génération, l&apos;envoi et la signature électronique de leurs contrats de location.</p>

          <h2 id="art2"><span className="num">02.</span> Prestataire</h2>
          <p><strong>Lancelot Loubier</strong><br/>
          Entrepreneur individuel<br/>
          Paris, France<br/>
          Email : <a href="mailto:contact@kordia.fr">contact@kordia.fr</a></p>

          <h2 id="art3"><span className="num">03.</span> Essai gratuit (30 jours)</h2>
          <p>— Tout nouveau compte bénéficie de <strong>30 jours d&apos;essai gratuit</strong> à compter de l&apos;inscription.<br/>
          — Aucune carte bancaire n&apos;est requise pour accéder à l&apos;essai.<br/>
          — Toutes les fonctionnalités sont accessibles pendant la période d&apos;essai.<br/>
          — À l&apos;issue de l&apos;essai, l&apos;accès est suspendu jusqu&apos;à souscription d&apos;un abonnement.<br/>
          — Les données sont conservées 30 jours après expiration de l&apos;essai sans souscription.</p>

          <h2 id="art4"><span className="num">04.</span> Tarif</h2>
          <p>L&apos;abonnement Kordia est proposé au tarif de <strong>9,99 € HT / mois</strong> par compte.</p>
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
          <p>Kordia étant un service dédié aux <strong>professionnels</strong> (propriétaires et gérants d&apos;hébergement dans le cadre de leur activité), le droit de rétractation prévu par le Code de la consommation ne s&apos;applique pas.</p>
          <p>Dans un esprit de satisfaction client, Kordia étudie néanmoins toute demande de remboursement formulée dans les <strong>7 jours</strong> suivant la première souscription, à adresser à <a href="mailto:contact@kordia.fr">contact@kordia.fr</a>. Ces gestes commerciaux relèvent de la seule appréciation de Kordia et ne constituent pas un droit au remboursement.</p>

          <h2 id="art8"><span className="num">08.</span> Obligations et responsabilités</h2>
          <p><strong>Qualité de professionnel.</strong> Le Client déclare souscrire à l&apos;abonnement dans le cadre de son activité professionnelle. Il reconnaît avoir négocié les présentes CGV en qualité de professionnel et accepter expressément l&apos;ensemble des clauses, y compris celles de limitation de responsabilité.</p>
          <p><strong>Obligations du Client :</strong> utiliser le service conformément à la loi et aux <a href="/legal/cgu">CGU</a>, ne pas partager ses identifiants, vérifier la conformité légale, fiscale et réglementaire des contrats qu&apos;il émet, répondre de ses relations avec ses locataires. Kordia est un outil de génération documentaire et ne fournit <strong>aucun conseil juridique</strong>.</p>
          <p><strong>Obligations de Kordia :</strong> mettre en œuvre les moyens raisonnables pour maintenir le service disponible et assurer la sécurité des données, répondre aux demandes de support sous 48 heures ouvrées. Kordia n&apos;est tenu qu&apos;à une <strong>obligation de moyens</strong>.</p>
          <p><strong>Plafond de responsabilité.</strong> Dans les limites autorisées par la loi, la responsabilité de Kordia envers le Client, toutes causes confondues et tous préjudices cumulés, est strictement plafonnée aux <strong>sommes effectivement encaissées auprès du Client au cours des trois (3) derniers mois</strong> précédant le fait générateur. Sont expressément exclus les dommages indirects, pertes d&apos;exploitation, pertes de chiffre d&apos;affaires, de clientèle, de chance, de données, manque à gagner, atteinte à l&apos;image, ainsi que les préjudices subis par des tiers, notamment les locataires du Client.</p>
          <p><strong>Garantie du Client.</strong> Le Client garantit Kordia contre tout recours, réclamation, action ou condamnation qui pourrait être introduit à son encontre par un tiers — et notamment par un locataire — en lien avec l&apos;utilisation du service, avec un contrat généré, avec une réservation traitée ou avec une information saisie par le Client. Le Client s&apos;engage à prendre en charge l&apos;intégralité des sommes, frais de procédure, honoraires d&apos;avocat et condamnations qui en résulteraient.</p>
          <p>Les présentes limitations ne s&apos;appliquent pas en cas de faute lourde ou dolosive dûment établie de Kordia, ni dans les cas où la loi l&apos;interdit.</p>

          <h2 id="art9"><span className="num">09.</span> Propriété intellectuelle</h2>
          <p>Le logiciel Kordia et l&apos;ensemble de ses composants sont protégés par les lois relatives à la propriété intellectuelle. Le Client bénéficie d&apos;une licence d&apos;utilisation personnelle, non exclusive, non transférable, limitée à la durée de son abonnement.</p>

          <h2 id="art10"><span className="num">10.</span> Droit applicable</h2>
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut d&apos;accord, les tribunaux de <strong>Paris</strong> seront seuls compétents.</p>

          <h2 id="art11"><span className="num">11.</span> Contact</h2>
          <p>Pour toute question relative aux présentes CGV :<br/>
          <strong>Email :</strong> <a href="mailto:contact@kordia.fr">contact@kordia.fr</a></p>
        </div>
      </div>
    </>
  );
}
