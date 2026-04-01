"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Faut-il un logiciel spécial pour signer ?",
    a: "Non. Le locataire clique sur le lien dans l'email, lit le contrat dans son navigateur et tape son nom pour signer. Aucune installation requise, ça fonctionne sur mobile comme sur ordinateur.",
  },
  {
    q: "La signature électronique est-elle légalement valable ?",
    a: "Oui. La signature est horodatée et l'adresse IP est enregistrée, ce qui constitue une preuve de consentement conforme au droit français pour les locations saisonnières.",
  },
  {
    q: "Puis-je utiliser mon propre contrat ?",
    a: "Absolument. Vous collez votre template existant dans l'éditeur et placez les balises variables aux bons endroits (ex : {{nom_client}}). Prysme les remplace automatiquement à chaque génération.",
  },
  {
    q: "Combien de réservations puis-je gérer ?",
    a: "Illimitées. L'abonnement à 12,99 €/mois couvre un gîte avec autant de réservations que vous le souhaitez, sans surcoût.",
  },
  {
    q: "Est-ce que ça fonctionne sans passer par Airbnb ?",
    a: "C'est exactement pour ça que Prysme a été conçu : pour les gérants qui louent en direct, sans intermédiaire. Vous gardez le lien direct avec vos locataires.",
  },
  {
    q: "Que se passe-t-il si je résilie ?",
    a: "Vous pouvez résilier à tout moment. Vos données et vos contrats signés restent accessibles pendant 30 jours après résiliation.",
  },
  {
    q: "Combien de temps prend la configuration initiale ?",
    a: "Environ 5 minutes. Vous renseignez les informations de votre gîte, importez votre logo et c'est prêt. Le template de contrat par défaut est déjà inclus.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          style={{ borderTop: '1px solid #CEC8BF' }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', gap: '24px',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#1C1C1A', lineHeight: 1.4 }}>
              {faq.q}
            </span>
            <span style={{
              fontSize: '18px', color: '#7A7570', flexShrink: 0,
              transition: 'transform 0.25s ease',
              transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}>
              ↓
            </span>
          </button>
          {open === i && (
            <p style={{
              fontSize: '14px', color: '#7A7570', lineHeight: 1.8,
              margin: '0 0 24px', maxWidth: '640px', fontWeight: 300,
            }}>
              {faq.a}
            </p>
          )}
        </div>
      ))}
      <div style={{ borderTop: '1px solid #CEC8BF' }} />
    </div>
  );
}
