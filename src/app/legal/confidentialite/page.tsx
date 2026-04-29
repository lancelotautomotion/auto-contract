import type { Metadata } from "next";
import LegalSidebarClient from "../_components/LegalSidebarClient";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Kordia",
  description: "Comment Kordia collecte, utilise et protège vos données personnelles. Conformité RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <div className="ph-wrap">
        <div className="ph-inner">
          <div className="ph-tag green">Protection des données</div>
          <h1 className="ph-title">Politique de <span className="g">Confidentialité</span></h1>
          <p className="ph-subtitle">Kordia s&apos;engage à protéger vos données personnelles. Cette page détaille ce que nous collectons, pourquoi, et comment vous gardez le contrôle.</p>
          <div className="ph-meta">
            <span>Dernière mise à jour : 17 avril 2026</span>
            <span>Lecture : 10 min</span>
          </div>
        </div>
      </div>

      <div className="legal-layout">
        <LegalSidebarClient links={[
          { href: "#art1", label: "1. Responsable" },
          { href: "#art2", label: "2. Données collectées" },
          { href: "#art3", label: "3. Finalités" },
          { href: "#art4", label: "4. Base juridique" },
          { href: "#art5", label: "5. Durée de conservation" },
          { href: "#art6", label: "6. Destinataires" },
          { href: "#art7", label: "7. Transferts hors UE" },
          { href: "#art8", label: "8. Sécurité" },
          { href: "#art9", label: "9. Vos droits" },
          { href: "#art10", label: "10. Cookies" },
          { href: "#art11", label: "11. Modifications" },
          { href: "#art12", label: "12. Contact" },
        ]} />

        <div className="legal-content">
          <h2 id="art1"><span className="num-g">01.</span> Responsable du traitement</h2>
          <p>Le responsable du traitement des données personnelles collectées via la plateforme Kordia est :</p>
          <p><strong>Lancelot Loubier</strong><br/>Entrepreneur individuel<br/>Paris, France<br/>Email : <a href="mailto:contact@kordia.fr">contact@kordia.fr</a></p>

          <h2 id="art2"><span className="num-g">02.</span> Données personnelles collectées</h2>
          <p>Kordia collecte différentes catégories de données selon votre interaction avec la plateforme :</p>

          <h3>Données des Utilisateurs (propriétaires de gîtes)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Donnée</th><th>Exemple</th><th>Obligatoire</th></tr></thead>
              <tbody>
                <tr><td><strong>Identité</strong></td><td>Nom, prénom</td><td>Oui</td></tr>
                <tr><td><strong>Coordonnées</strong></td><td>Email, téléphone</td><td>Oui</td></tr>
                <tr><td><strong>Adresse</strong></td><td>Adresse de l&apos;hébergement</td><td>Oui</td></tr>
                <tr><td><strong>Données de facturation</strong></td><td>Moyen de paiement (traité par Stripe)</td><td>Pour abonnement payant</td></tr>
                <tr><td><strong>Données d&apos;usage</strong></td><td>Connexions, actions sur la plateforme</td><td>Automatique</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Données des Locataires (signataires des contrats)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Donnée</th><th>Exemple</th><th>Source</th></tr></thead>
              <tbody>
                <tr><td><strong>Identité</strong></td><td>Nom, prénom</td><td>Saisie par l&apos;Utilisateur</td></tr>
                <tr><td><strong>Coordonnées</strong></td><td>Email</td><td>Saisie par l&apos;Utilisateur</td></tr>
                <tr><td><strong>Données de signature</strong></td><td>Horodatage, adresse IP</td><td>Collecte automatique lors de la signature</td></tr>
              </tbody>
            </table>
          </div>

          <div className="legal-callout green">
            Kordia ne collecte aucune donnée bancaire des Locataires. Les informations de paiement des Utilisateurs sont traitées exclusivement par <strong>Stripe</strong>, notre prestataire de paiement sécurisé.
          </div>

          <h2 id="art3"><span className="num-g">03.</span> Finalités du traitement</h2>
          <p><strong>— Fourniture du service :</strong> création de compte, génération de contrats, envoi aux locataires, signature électronique, archivage, suivi des réservations.</p>
          <p><strong>— Gestion de la relation client :</strong> support technique, réponse aux demandes, communication relative au service.</p>
          <p><strong>— Facturation :</strong> gestion des abonnements, émission des factures.</p>
          <p><strong>— Preuve juridique :</strong> conservation des éléments de signature (horodatage, IP) à des fins de preuve de la validité des contrats signés électroniquement.</p>
          <p><strong>— Amélioration du service :</strong> analyse anonymisée de l&apos;utilisation pour améliorer les fonctionnalités.</p>

          <h2 id="art4"><span className="num-g">04.</span> Base juridique du traitement</h2>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Finalité</th><th>Base juridique (RGPD)</th></tr></thead>
              <tbody>
                <tr><td>Fourniture du service</td><td>Exécution du contrat (art. 6.1.b)</td></tr>
                <tr><td>Signature électronique</td><td>Exécution du contrat (art. 6.1.b)</td></tr>
                <tr><td>Facturation</td><td>Obligation légale (art. 6.1.c)</td></tr>
                <tr><td>Conservation des preuves de signature</td><td>Intérêt légitime (art. 6.1.f)</td></tr>
                <tr><td>Amélioration du service</td><td>Intérêt légitime (art. 6.1.f)</td></tr>
                <tr><td>Communication commerciale</td><td>Consentement (art. 6.1.a)</td></tr>
              </tbody>
            </table>
          </div>

          <h2 id="art5"><span className="num-g">05.</span> Durée de conservation</h2>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Données</th><th>Durée</th></tr></thead>
              <tbody>
                <tr><td>Données de compte Utilisateur</td><td>Durée de l&apos;abonnement + 12 mois après résiliation</td></tr>
                <tr><td>Contrats signés et preuves de signature</td><td>5 ans à compter de la date de signature</td></tr>
                <tr><td>Données de facturation</td><td>10 ans (obligation comptable)</td></tr>
                <tr><td>Données de connexion (logs)</td><td>12 mois</td></tr>
                <tr><td>Données des Locataires</td><td>Durée de conservation du contrat associé</td></tr>
              </tbody>
            </table>
          </div>
          <p>À l&apos;expiration de ces durées, les données sont supprimées ou anonymisées de manière irréversible.</p>

          <h2 id="art6"><span className="num-g">06.</span> Destinataires des données</h2>
          <p><strong>— L&apos;éditeur :</strong> Lancelot Loubier, dans le cadre de l&apos;exploitation et du support de la plateforme.</p>
          <p><strong>— Sous-traitants techniques :</strong></p>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Prestataire</th><th>Rôle</th><th>Localisation</th></tr></thead>
              <tbody>
                <tr><td><strong>Clerk</strong></td><td>Authentification</td><td>États-Unis (SCC)</td></tr>
                <tr><td><strong>Neon</strong></td><td>Base de données PostgreSQL</td><td>Europe (eu-west)</td></tr>
                <tr><td><strong>Vercel</strong></td><td>Hébergement &amp; fichiers</td><td>Europe / USA</td></tr>
                <tr><td><strong>Resend</strong></td><td>Emails transactionnels</td><td>États-Unis (SCC)</td></tr>
                <tr><td><strong>Stripe</strong></td><td>Paiement &amp; facturation</td><td>États-Unis (SCC)</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: '#A3A3A0' }}>SCC = Clauses contractuelles types approuvées par la Commission européenne.</p>

          <div className="legal-callout green">
            Kordia ne vend, ne loue et ne cède jamais vos données personnelles à des tiers à des fins commerciales ou publicitaires.
          </div>

          <h2 id="art7"><span className="num-g">07.</span> Transferts hors Union Européenne</h2>
          <p>Kordia privilégie des prestataires situés au sein de l&apos;Union Européenne. Dans le cas où un transfert de données hors UE serait nécessaire, ce transfert est encadré par les garanties appropriées prévues par le RGPD : clauses contractuelles types de la Commission Européenne ou décision d&apos;adéquation.</p>

          <h2 id="art8"><span className="num-g">08.</span> Sécurité des données</h2>
          <p><strong>— Chiffrement :</strong> communications sécurisées par HTTPS/TLS. Données sensibles chiffrées au repos.</p>
          <p><strong>— Authentification :</strong> accès par mot de passe sécurisé. Sessions limitées dans le temps.</p>
          <p><strong>— Sauvegardes :</strong> sauvegardes régulières et automatisées des données.</p>
          <p><strong>— Accès restreint :</strong> accès aux données limité aux personnes strictement habilitées.</p>

          <h2 id="art9"><span className="num-g">09.</span> Vos droits</h2>
          <p>Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants :</p>
          <p><strong>— Droit d&apos;accès :</strong> obtenir la confirmation du traitement de vos données et en recevoir une copie.</p>
          <p><strong>— Droit de rectification :</strong> demander la correction de données inexactes ou incomplètes.</p>
          <p><strong>— Droit à l&apos;effacement :</strong> demander la suppression de vos données, sous réserve des obligations légales de conservation.</p>
          <p><strong>— Droit à la limitation :</strong> demander la suspension du traitement dans certains cas.</p>
          <p><strong>— Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine.</p>
          <p><strong>— Droit d&apos;opposition :</strong> vous opposer au traitement fondé sur l&apos;intérêt légitime.</p>
          <p>Pour exercer ces droits, adressez votre demande par email à <a href="mailto:contact@kordia.fr">contact@kordia.fr</a>. Nous y répondrons dans un délai maximum de <strong>30 jours</strong>.</p>

          <div className="legal-callout">
            En cas de différend non résolu, vous avez le droit d&apos;introduire une réclamation auprès de la <strong>CNIL</strong> — <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>.
          </div>

          <h2 id="art10"><span className="num-g">10.</span> Cookies</h2>
          <p>Kordia utilise uniquement des <strong>cookies strictement nécessaires</strong> au fonctionnement de la plateforme (authentification, session utilisateur, préférences d&apos;affichage). Ces cookies sont exemptés de consentement conformément aux recommandations de la CNIL.</p>
          <p>Kordia n&apos;utilise aucun cookie de suivi publicitaire, de mesure d&apos;audience tierce ni de traçage inter-sites.</p>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table className="data-table">
              <thead><tr><th>Cookie</th><th>Finalité</th><th>Durée</th></tr></thead>
              <tbody>
                <tr><td><strong>session_id</strong></td><td>Authentification et maintien de session</td><td>Durée de la session</td></tr>
                <tr><td><strong>preferences</strong></td><td>Préférences d&apos;affichage de l&apos;utilisateur</td><td>12 mois</td></tr>
              </tbody>
            </table>
          </div>

          <h2 id="art11"><span className="num-g">11.</span> Modifications de la politique</h2>
          <p>Kordia se réserve le droit de modifier la présente politique de confidentialité à tout moment. En cas de modification substantielle, les Utilisateurs seront informés par email au moins <strong>15 jours</strong> avant l&apos;entrée en vigueur des modifications.</p>
          <p>La date de dernière mise à jour est indiquée en haut de cette page. Nous vous invitons à la consulter régulièrement.</p>

          <h2 id="art12"><span className="num-g">12.</span> Contact</h2>
          <p><strong>Email :</strong> <a href="mailto:contact@kordia.fr">contact@kordia.fr</a><br/>
          <strong>Adresse :</strong> Paris, France</p>
        </div>
      </div>
    </>
  );
}
