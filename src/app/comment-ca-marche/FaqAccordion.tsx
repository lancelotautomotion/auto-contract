"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Faut-il un logiciel spécial pour signer ?",
    a: "Non. Le locataire clique sur le lien reçu par email, lit le contrat directement dans son navigateur et tape son nom pour signer. Aucune installation requise, ça fonctionne sur mobile comme sur ordinateur, sans création de compte.",
  },
  {
    q: "La signature électronique est-elle légalement valable ?",
    a: "Oui. Prysme applique le règlement européen eIDAS (UE n°910/2014) : signature horodatée, adresse IP enregistrée, PDF inaltérable. Elle a la même valeur juridique qu'une signature manuscrite et est recevable devant les tribunaux français.",
  },
  {
    q: "Puis-je personnaliser mon contrat ?",
    a: "Oui. Vous partez d'un modèle conforme à la loi ALUR et vous l'adaptez : loyer, acompte, frais de ménage, taxe de séjour, options, règlement intérieur, clauses particulières. Les balises variables (nom, dates, montants…) sont remplacées automatiquement à chaque génération.",
  },
  {
    q: "Combien coûte l'abonnement ?",
    a: "L'offre Essentiel est à 9,99 € HT/mois pour un hébergement. L'offre Multi-hébergement (jusqu'à 3 gîtes) est à 15 € HT/mois. Tous les plans incluent contrats illimités, signature eIDAS, archivage et support. Essai gratuit 30 jours, sans carte bancaire, sans engagement.",
  },
  {
    q: "Est-ce que ça fonctionne pour les réservations directes ?",
    a: "C'est exactement pour ça que Prysme a été conçu : pour les gérants qui louent en direct, sans passer par Airbnb ou Booking. Vous gardez le lien direct avec vos locataires et économisez les 15-20 % de commission.",
  },
  {
    q: "Que se passe-t-il si je résilie ?",
    a: "Vous pouvez résilier à tout moment depuis Mon compte → Gérer mon abonnement (portail Stripe). La résiliation prend effet à la fin de la période mensuelle en cours. Vos contrats signés restent accessibles en lecture seule pendant 12 mois après la fin d'accès.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Oui. Vos données sont hébergées dans l'Union européenne (Supabase, région Francfort) et conformes au RGPD. Les contrats signés sont archivés en PDF horodaté. Nous utilisons Stripe pour les paiements et Resend pour les emails, tous deux certifiés.",
  },
  {
    q: "Combien de temps prend la configuration initiale ?",
    a: "Environ 5 minutes. Vous renseignez les informations de votre gîte, importez votre logo et vos documents (RIB, règlement intérieur), et vous êtes prêt à envoyer votre premier contrat.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="ccm-faq-list">
      {faqs.map((faq, i) => (
        <div key={i} className={`ccm-faq-item${open === i ? ' open' : ''}`}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="ccm-faq-q"
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span className="ccm-faq-icon" aria-hidden="true">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M4 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          {open === i && <div className="ccm-faq-a">{faq.a}</div>}
        </div>
      ))}

      <style>{`
        .ccm-faq-list { display: flex; flex-direction: column; border-top: 1px solid var(--line); }
        .ccm-faq-item { border-bottom: 1px solid var(--line); }
        .ccm-faq-q {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 0;
          background: transparent; border: none; cursor: pointer;
          text-align: left; gap: 24px;
          font-family: var(--ff);
          font-size: 15px; font-weight: 600; color: var(--ink); line-height: 1.4;
        }
        .ccm-faq-q:hover { color: var(--violet-dark); }
        .ccm-faq-icon {
          flex-shrink: 0;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--violet-light); color: var(--violet-dark);
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform .25s ease;
        }
        .ccm-faq-item.open .ccm-faq-icon { transform: rotate(180deg); }
        .ccm-faq-a {
          font-size: 14px; color: var(--ink-soft); line-height: 1.75;
          padding: 0 0 22px;
          max-width: 640px;
        }
      `}</style>
    </div>
  );
}
