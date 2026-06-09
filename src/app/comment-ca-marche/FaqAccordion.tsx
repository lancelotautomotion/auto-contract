"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ink = '#1A1A18';
const inkSoft = '#71716E';
const line = '#E8E6E1';
const violetLight = '#EEEDFA';
const violetDark = '#5B52B5';

const faqs = [
  {
    q: "Faut-il un logiciel spécial pour signer ?",
    a: "Non. Le locataire clique sur le lien reçu par email, lit le contrat directement dans son navigateur et tape son nom pour signer. Aucune installation requise, ça fonctionne sur mobile comme sur ordinateur, sans création de compte.",
  },
  {
    q: "La signature électronique est-elle légalement valable ?",
    a: "Oui. Kordia applique le règlement européen eIDAS (UE n°910/2014) : signature horodatée, adresse IP enregistrée, PDF inaltérable. Elle a la même valeur juridique qu'une signature manuscrite et est recevable devant les tribunaux français.",
  },
  {
    q: "Puis-je personnaliser mon contrat ?",
    a: "Oui. Vous partez d'un modèle conforme à la loi ALUR et vous l'adaptez : loyer, acompte, frais de ménage, taxe de séjour, options, règlement intérieur, clauses particulières. Les balises variables (nom, dates, montants…) sont remplacées automatiquement à chaque génération.",
  },
  {
    q: "Combien coûte l'abonnement ?",
    a: "L'offre Essentiel est à 10 € HT/mois pour un hébergement, puis 20 € HT/mois pour gérer jusqu'à 5 hébergements entiers. Elle inclut contrats illimités, signature eIDAS, relances automatiques, archivage et support. Les offres Maison d'Hôtes (20 € HT/mois, chambres d'hôtes) et Kordia Étape (25 € HT/mois, gîtes d'étape et dortoirs) arrivent prochainement. Essai gratuit 30 jours, sans carte bancaire, sans engagement.",
  },
  {
    q: "Est-ce que ça fonctionne pour les réservations directes ?",
    a: "C'est exactement pour ça que Kordia a été conçu : pour les gérants qui louent en direct, sans passer par Airbnb ou Booking. Vous gardez le lien direct avec vos locataires et économisez les 15-20 % de commission.",
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
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${line}` }}>
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${line}` }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '22px 0', background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left', gap: '24px',
                fontFamily: 'inherit', fontSize: '15px', fontWeight: 600, color: ink, lineHeight: 1.4,
              }}
            >
              <span>{faq.q}</span>
              <span style={{
                flexShrink: 0, width: '30px', height: '30px', borderRadius: '50%',
                background: violetLight, color: violetDark,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.3s ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                <ChevronDown size={14} strokeWidth={1.6} />
              </span>
            </button>

            <div style={{
              display: 'grid',
              gridTemplateRows: isOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.35s ease',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontSize: '14px', color: inkSoft, lineHeight: 1.75,
                  margin: '0 0 22px', maxWidth: '640px', fontWeight: 400,
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
