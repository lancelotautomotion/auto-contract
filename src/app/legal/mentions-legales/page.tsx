import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Prysme",
  description: "Mentions légales de Prysme, logiciel de gestion de contrats de location pour gîtes.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <div className="ph-wrap">
        <div className="ph-inner">
          <div className="ph-tag violet">Juridique</div>
          <h1 className="ph-title">Mentions <span className="v">Légales</span></h1>
          <p className="ph-subtitle">Conformément aux dispositions des articles 6-III et 19 de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).</p>
          <div className="ph-meta">
            <span>Dernière mise à jour : 17 avril 2026</span>
          </div>
        </div>
      </div>

      <div className="legal-layout">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-title">Sommaire</div>
          <ul>
            <li><a href="#art1">1. Éditeur du site</a></li>
            <li><a href="#art2">2. Hébergement</a></li>
            <li><a href="#art3">3. Propriété intellectuelle</a></li>
            <li><a href="#art4">4. Données personnelles</a></li>
            <li><a href="#art5">5. Cookies</a></li>
            <li><a href="#art6">6. Responsabilité</a></li>
            <li><a href="#art7">7. Liens hypertextes</a></li>
            <li><a href="#art8">8. Droit applicable</a></li>
            <li><a href="#art9">9. Contact</a></li>
          </ul>
        </aside>

        <div className="legal-content">
          <h2 id="art1"><span className="num">01.</span> Éditeur du site</h2>
          <p>Le site <strong>prysme.fr</strong> et l&apos;application <strong>app.prysme.fr</strong> sont édités par :</p>
          <table className="info-table">
            <tbody>
              <tr><td>Nom</td><td>Lancelot Loubier</td></tr>
              <tr><td>Statut</td><td>Entrepreneur individuel</td></tr>
              <tr><td>Siège social</td><td>Paris, France</td></tr>
              <tr><td>Email</td><td><a href="mailto:contact@prysme.fr">contact@prysme.fr</a></td></tr>
              <tr><td>Directeur de la publication</td><td>Lancelot Loubier</td></tr>
            </tbody>
          </table>
          <p>Conformément à l&apos;article 6 de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique, les informations d&apos;identification de l&apos;éditeur sont mises à la disposition du public.</p>

          <h2 id="art2"><span className="num">02.</span> Hébergement</h2>
          <p>Le site et l&apos;application Prysme sont hébergés par :</p>
          <table className="info-table">
            <tbody>
              <tr><td>Hébergeur</td><td>Hostinger International Ltd.</td></tr>
              <tr><td>Adresse</td><td>61 Lordou Vironos Street, 6023 Larnaca, Chypre</td></tr>
              <tr><td>Site web</td><td><a href="https://www.hostinger.fr" target="_blank" rel="noreferrer">www.hostinger.fr</a></td></tr>
            </tbody>
          </table>

          <h2 id="art3"><span className="num">03.</span> Propriété intellectuelle</h2>
          <p>L&apos;ensemble du contenu du site prysme.fr et de l&apos;application app.prysme.fr — incluant, sans s&apos;y limiter, les textes, graphismes, images, logos, icônes, logiciels, base de données et la structure générale — est protégé par le droit d&apos;auteur et les lois relatives à la propriété intellectuelle.</p>
          <p>La marque <strong>Prysme</strong>, son logo et ses déclinaisons graphiques sont la propriété exclusive de l&apos;éditeur. Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, de ces éléments, par quelque moyen ou procédé que ce soit, est interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.</p>
          <p>Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>

          <h2 id="art4"><span className="num">04.</span> Données personnelles</h2>
          <p>Les données personnelles collectées sur le site sont traitées conformément au Règlement Général sur la Protection des Données (<strong>RGPD — Règlement UE 2016/679</strong>) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.</p>
          <p>Le responsable du traitement des données est Lancelot Loubier, joignable à l&apos;adresse <a href="mailto:contact@prysme.fr">contact@prysme.fr</a>.</p>
          <p>Les données collectées sont nécessaires au bon fonctionnement du service et ne sont jamais cédées à des tiers à des fins commerciales. L&apos;ensemble des modalités de traitement, de conservation et d&apos;exercice des droits est détaillé dans la <a href="/legal/confidentialite">Politique de confidentialité</a>.</p>
          <p>Conformément aux articles 15 à 22 du RGPD, tout utilisateur dispose des droits d&apos;accès, rectification, effacement, limitation du traitement, portabilité et opposition. Ces droits peuvent être exercés par email à <a href="mailto:contact@prysme.fr">contact@prysme.fr</a>.</p>

          <h2 id="art5"><span className="num">05.</span> Cookies</h2>
          <p>Le site prysme.fr utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de session). Ces cookies ne nécessitent pas de consentement préalable conformément aux recommandations de la CNIL.</p>
          <p>Aucun cookie de suivi publicitaire ou de mesure d&apos;audience tiers n&apos;est déposé sur le site.</p>

          <h2 id="art6"><span className="num">06.</span> Limitation de responsabilité</h2>
          <p>L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que possible sur le site. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes ou des carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.</p>
          <p>L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;accès au site ou de l&apos;impossibilité d&apos;y accéder, ni de l&apos;utilisation du site et/ou du crédit accordé à une quelconque information provenant directement ou indirectement de ce dernier.</p>

          <h2 id="art7"><span className="num">07.</span> Liens hypertextes</h2>
          <p>Le site prysme.fr peut contenir des liens hypertextes vers d&apos;autres sites internet. L&apos;éditeur ne dispose d&apos;aucun moyen de contrôle sur le contenu de ces sites tiers et n&apos;assume aucune responsabilité quant à leur contenu, leurs pratiques en matière de confidentialité ou leur fonctionnement.</p>
          <p>La mise en place de liens hypertextes vers le site prysme.fr est autorisée sans accord préalable, à condition que ce lien ne porte pas atteinte à l&apos;image de l&apos;éditeur.</p>

          <h2 id="art8"><span className="num">08.</span> Droit applicable</h2>
          <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.</p>

          <h2 id="art9"><span className="num">09.</span> Contact</h2>
          <p>Pour toute question relative aux présentes mentions légales :</p>
          <table className="info-table">
            <tbody>
              <tr><td>Email</td><td><a href="mailto:contact@prysme.fr">contact@prysme.fr</a></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
