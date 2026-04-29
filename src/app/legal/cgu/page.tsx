import type { Metadata } from "next";
import LegalSidebarClient from "../_components/LegalSidebarClient";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Kordia",
  description: "Conditions générales d'utilisation de la plateforme Kordia — génération et signature électronique de contrats de location.",
};

export default function CguPage() {
  return (
    <>
      <div className="ph-wrap">
        <div className="ph-inner">
          <div className="ph-tag violet">Juridique</div>
          <h1 className="ph-title">Conditions Générales <span className="v">d&apos;Utilisation</span></h1>
          <p className="ph-subtitle">Les présentes CGU régissent l&apos;utilisation de la plateforme Kordia. En créant un compte, vous acceptez ces conditions dans leur intégralité.</p>
          <div className="ph-meta">
            <span>Dernière mise à jour : 24 avril 2026</span>
            <span>Lecture : 8 min</span>
          </div>
        </div>
      </div>

      <div className="legal-layout">
        <LegalSidebarClient links={[
          { href: "#art1", label: "1. Objet" },
          { href: "#art2", label: "2. Définitions" },
          { href: "#art3", label: "3. Inscription" },
          { href: "#art4", label: "4. Services" },
          { href: "#art5", label: "5. Tarifs & Paiement" },
          { href: "#art6", label: "6. Obligations" },
          { href: "#art7", label: "7. Propriété intellectuelle" },
          { href: "#art8", label: "8. Données personnelles" },
          { href: "#art9", label: "9. Responsabilité" },
          { href: "#art10", label: "10. Résiliation" },
          { href: "#art11", label: "11. Droit applicable" },
          { href: "#art12", label: "12. Contact" },
        ]} />

        <div className="legal-content">
          <h2 id="art1"><span className="num">01.</span> Objet</h2>
          <p>Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d&apos;accès et d&apos;utilisation de la plateforme <strong>Kordia</strong>, accessible à l&apos;adresse <a href="https://kordia.fr">kordia.fr</a>.</p>
          <p>Kordia est un service en ligne destiné aux propriétaires de gîtes et hébergements saisonniers. Il permet la génération automatique de contrats de location saisonnière, leur envoi, leur signature électronique et le suivi centralisé des réservations.</p>

          <h2 id="art2"><span className="num">02.</span> Définitions</h2>
          <p><strong>« Plateforme »</strong> désigne le site web et l&apos;application Kordia, accessibles à l&apos;adresse kordia.fr.</p>
          <p><strong>« Éditeur »</strong> désigne la société ou personne physique exploitant la Plateforme, identifiée dans les mentions légales.</p>
          <p><strong>« Utilisateur »</strong> désigne toute personne physique ou morale inscrite sur la Plateforme et disposant d&apos;un compte actif.</p>
          <p><strong>« Locataire »</strong> désigne la personne recevant un contrat de location généré via la Plateforme et invitée à le signer électroniquement.</p>
          <p><strong>« Contrat de location »</strong> désigne le document généré automatiquement par la Plateforme à partir des informations de réservation saisies par l&apos;Utilisateur.</p>

          <h2 id="art3"><span className="num">03.</span> Inscription et compte utilisateur</h2>
          <p>L&apos;accès aux services de Kordia nécessite la création d&apos;un compte. L&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription.</p>
          <p>Chaque compte est strictement personnel. L&apos;Utilisateur est responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée depuis son compte.</p>
          <p>L&apos;Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, d&apos;utilisation frauduleuse ou de fourniture d&apos;informations inexactes.</p>

          <h2 id="art4"><span className="num">04.</span> Description des services</h2>
          <p>Kordia propose les services suivants :</p>
          <h3>Génération de contrats</h3>
          <p>L&apos;Utilisateur saisit les informations relatives à une réservation (dates, montant, identité du locataire, clauses particulières). La Plateforme génère automatiquement un contrat de location saisonnière personnalisé et conforme aux dispositions de la loi ALUR.</p>
          <h3>Signature électronique</h3>
          <p>Le contrat est envoyé par email au Locataire, qui peut le signer électroniquement depuis n&apos;importe quel appareil. La signature est réalisée conformément au règlement européen <strong>eIDAS (UE n°910/2014)</strong> et produit les mêmes effets juridiques qu&apos;une signature manuscrite.</p>
          <div className="legal-callout">
            Chaque signature est horodatée, associée à l&apos;adresse IP du signataire, et le document signé est archivé en PDF inaltérable constituant une preuve recevable devant les juridictions françaises.
          </div>
          <h3>Suivi et archivage</h3>
          <p>La Plateforme offre un tableau de bord centralisant l&apos;ensemble des contrats et leur statut (généré, envoyé, signé), un calendrier des réservations, ainsi qu&apos;un système d&apos;archivage automatique des contrats signés en format PDF horodaté.</p>

          <h2 id="art5"><span className="num">05.</span> Tarifs et paiement</h2>
          <p>Kordia propose plusieurs formules d&apos;abonnement dont les tarifs en vigueur sont disponibles sur la page <a href="/upgrade">Tarifs</a> de la Plateforme.</p>
          <p>Une période d&apos;essai gratuite de trente (30) jours est proposée à tout nouvel Utilisateur, sans engagement et sans nécessité de fournir un moyen de paiement.</p>
          <p>À l&apos;issue de la période d&apos;essai, l&apos;Utilisateur peut souscrire à un abonnement mensuel. Le paiement s&apos;effectue par carte bancaire via un prestataire de paiement sécurisé. L&apos;abonnement est renouvelé tacitement chaque mois, sauf résiliation par l&apos;Utilisateur.</p>
          <p>Les tarifs peuvent être modifiés à tout moment. L&apos;Utilisateur en sera informé par email au moins <strong>30 jours</strong> avant l&apos;entrée en vigueur des nouveaux tarifs.</p>

          <h2 id="art6"><span className="num">06.</span> Obligations de l&apos;Utilisateur</h2>
          <p>L&apos;Utilisateur s&apos;engage à utiliser la Plateforme conformément à sa destination et aux présentes CGU. Il s&apos;interdit notamment de :</p>
          <p>— Utiliser la Plateforme à des fins illicites ou contraires à l&apos;ordre public ;<br/>
          — Fournir des informations fausses ou trompeuses dans les contrats générés ;<br/>
          — Tenter d&apos;accéder aux systèmes informatiques de la Plateforme ou de porter atteinte à leur intégrité ;<br/>
          — Revendre, sous-licencier ou mettre à disposition de tiers l&apos;accès à son compte.</p>
          <p>L&apos;Utilisateur est seul responsable du contenu des contrats générés via la Plateforme, et notamment de l&apos;exactitude des informations qui y figurent.</p>

          <h2 id="art7"><span className="num">07.</span> Propriété intellectuelle</h2>
          <p>L&apos;ensemble des éléments composant la Plateforme (textes, graphismes, logiciels, base de données, marques, logos, design) est protégé par les lois relatives à la propriété intellectuelle et reste la propriété exclusive de l&apos;Éditeur.</p>
          <p>Toute reproduction, représentation, modification ou exploitation non autorisée, même partielle, est strictement interdite et pourra faire l&apos;objet de poursuites.</p>
          <p>L&apos;Utilisateur conserve l&apos;intégralité des droits sur les contenus qu&apos;il saisit sur la Plateforme (informations de réservation, clauses personnalisées).</p>

          <h2 id="art8"><span className="num">08.</span> Données personnelles</h2>
          <p>La collecte et le traitement des données personnelles des Utilisateurs et Locataires sont réalisés conformément au Règlement Général sur la Protection des Données (<strong>RGPD — UE 2016/679</strong>) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.</p>
          <p>Les modalités de collecte, de traitement, de conservation et les droits des personnes concernées sont détaillés dans la <a href="/legal/confidentialite">Politique de confidentialité</a> de Kordia.</p>

          <h2 id="art9"><span className="num">09.</span> Limitation de responsabilité</h2>
          <p>La Plateforme est mise à disposition « en l&apos;état ». L&apos;Éditeur met en œuvre tous les moyens raisonnables pour assurer la disponibilité et le bon fonctionnement du service, mais ne souscrit à cet égard qu&apos;à une <strong>obligation de moyens</strong>. Il ne saurait garantir un accès ininterrompu, ni l&apos;absence d&apos;erreur, ni la compatibilité avec un usage particulier, et ne pourra être tenu responsable des interruptions de service, lenteurs ou indisponibilités, quelles qu&apos;en soient les causes (maintenance, incident technique, défaillance d&apos;un prestataire tiers, force majeure, etc.).</p>
          <p>La Plateforme fournit un outil de génération documentaire. Elle <strong>ne se substitue en aucun cas aux conseils d&apos;un professionnel du droit</strong> (avocat, notaire, juriste). Les modèles et clauses proposés constituent une assistance à la rédaction ; ils n&apos;ont pas la valeur d&apos;un avis juridique personnalisé. Il appartient à l&apos;Utilisateur, en tant que professionnel, de vérifier la conformité des contrats qu&apos;il édite au regard de sa situation, de son activité et de la réglementation applicable.</p>
          <p>L&apos;Utilisateur est <strong>seul et entièrement responsable</strong> :</p>
          <p>— du contenu qu&apos;il saisit, des informations communiquées et de leur exactitude ;<br/>
          — des contrats qu&apos;il génère, de leur conformité légale, fiscale et réglementaire, ainsi que de leur exécution ;<br/>
          — des relations contractuelles qu&apos;il noue avec ses locataires, y compris en cas de litige ;<br/>
          — des obligations qui lui incombent en qualité de bailleur, d&apos;exploitant d&apos;hébergement touristique et d&apos;employeur éventuel ;<br/>
          — du respect de ses propres obligations RGPD vis-à-vis de ses locataires.</p>
          <p>Dans les limites autorisées par la loi, la responsabilité de l&apos;Éditeur, toutes causes confondues et tous préjudices cumulés, ne pourra excéder les <strong>sommes effectivement encaissées auprès de l&apos;Utilisateur au cours des trois (3) derniers mois</strong> précédant le fait générateur. L&apos;Éditeur ne saurait en aucun cas être tenu responsable de dommages indirects, et notamment : pertes d&apos;exploitation, pertes de chiffre d&apos;affaires, pertes de clientèle, pertes de chance, atteinte à l&apos;image, pertes de données, manque à gagner, ou de tout préjudice subi par des tiers (notamment par les locataires de l&apos;Utilisateur).</p>
          <p><strong>Garantie de l&apos;Utilisateur.</strong> L&apos;Utilisateur garantit l&apos;Éditeur contre tout recours, réclamation, action ou condamnation qui serait introduit contre lui par un tiers, et notamment par un locataire, en lien avec un contrat généré ou une réservation traitée via la Plateforme. L&apos;Utilisateur s&apos;engage à prendre en charge l&apos;intégralité des sommes, frais, honoraires d&apos;avocat et condamnations qui pourraient en résulter.</p>
          <p>Les présentes limitations ne s&apos;appliquent pas en cas de faute lourde ou dolosive dûment établie de l&apos;Éditeur, ni dans les cas où la loi l&apos;interdit. L&apos;acceptation des présentes CGU vaut reconnaissance et acceptation expresse, par l&apos;Utilisateur, de la présente clause de limitation de responsabilité.</p>

          <h2 id="art10"><span className="num">10.</span> Résiliation</h2>
          <p>L&apos;Utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte. La résiliation prend effet à la fin de la période d&apos;abonnement en cours. Aucun remboursement au prorata ne sera effectué.</p>
          <p>À la résiliation, l&apos;Utilisateur conserve l&apos;accès en lecture seule à ses contrats archivés pendant une durée de <strong>12 mois</strong>, après quoi les données pourront être supprimées conformément à la politique de conservation des données.</p>
          <p>L&apos;Éditeur se réserve le droit de résilier un compte en cas de violation grave des présentes CGU, avec notification préalable par email.</p>

          <h2 id="art11"><span className="num">11.</span> Droit applicable et juridiction</h2>
          <p>Les présentes CGU sont régies par le droit français. En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes, les parties s&apos;efforceront de trouver une solution amiable.</p>
          <p>À défaut d&apos;accord amiable, tout litige sera soumis à la compétence exclusive des tribunaux de <strong>Paris</strong>, sauf dispositions d&apos;ordre public contraires.</p>

          <h2 id="art12"><span className="num">12.</span> Contact</h2>
          <p>Pour toute question relative aux présentes CGU, vous pouvez contacter l&apos;Éditeur :</p>
          <p><strong>Email :</strong> <a href="mailto:contact@kordia.fr">contact@kordia.fr</a><br/>
          <strong>Adresse :</strong> Paris, France</p>
        </div>
      </div>
    </>
  );
}
