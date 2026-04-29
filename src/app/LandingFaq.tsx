"use client";
import { useState } from "react";

const pine = '#4A7353';
const ink  = '#2C2C2A';
const muted = '#71716E';
const border = '#E8E6E1';

const faqs = [
  { q: "La signature électronique est-elle légalement valable ?", a: "Oui. La signature est horodatée et l'adresse IP est enregistrée, ce qui constitue une preuve de consentement conforme au droit français pour les locations saisonnières." },
  { q: "Puis-je utiliser mon propre contrat ?", a: "Absolument. Vous collez votre template existant dans l'éditeur et placez les balises aux bons endroits (ex : {{nom_client}}). Kordia les remplace automatiquement à chaque génération." },
  { q: "Faut-il un logiciel pour signer ?", a: "Non. Le locataire clique sur le lien dans l'email, lit le contrat dans son navigateur et tape son nom pour signer. Aucune installation requise, ça marche sur mobile comme ordinateur." },
  { q: "Combien de réservations puis-je gérer ?", a: "Illimitées. L'abonnement couvre un gîte avec autant de réservations que vous voulez, sans surcoût." },
  { q: "Est-ce que ça fonctionne sans Airbnb ?", a: "C'est exactement pour ça que Kordia a été conçu : pour les gérants qui louent en direct, sans intermédiaire. Vous gardez le lien direct avec vos locataires." },
  { q: "Que se passe-t-il si je résilie ?", a: "Vous pouvez résilier à tout moment depuis vos paramètres. Vos données et contrats signés restent accessibles 30 jours après résiliation." },
  { q: "Combien de temps prend la configuration ?", a: "Environ 5 minutes. Vous renseignez les informations de votre gîte, importez votre logo et c'est prêt." },
];

export default function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderTop: `1px solid ${border}` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '24px' }}
          >
            <span style={{ fontSize: '16px', fontWeight: 400, color: ink, lineHeight: 1.4 }}>{faq.q}</span>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: open === i ? pine : muted, fontSize: '16px', fontWeight: 300, lineHeight: 1 }}>
              {open === i ? '×' : '+'}
            </span>
          </button>
          {open === i && (
            <p style={{ fontSize: '14px', color: muted, lineHeight: 1.8, margin: '0 0 22px', maxWidth: '580px', fontWeight: 400 }}>
              {faq.a}
            </p>
          )}
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${border}` }} />
    </div>
  );
}
