"use client";

import { OnboardingData, OfferType } from "../types";

interface StepProps {
  data: OnboardingData;
  onUpdate: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OFFERS: { id: OfferType; name: string; description: string; features: string[] }[] = [
  {
    id: "gite",
    name: "Gîte",
    description: "Location entière d'un logement",
    features: ["Logement loué en entier", "Contrats & signature électronique", "Suivi des acomptes", "Jusqu'à 5 hébergements"],
  },
  {
    id: "guesthouse",
    name: "Maison d'hôtes",
    description: "Location par chambre sur un même site",
    features: ["Jusqu'à 5 chambres", "Gestion des repas (demi-pension…)", "Taxe de séjour au réel", "Planning par chambre"],
  },
];

export default function StepOffer({ data, onUpdate, onNext, onBack }: StepProps) {
  return (
    <div className="ob-step">
      <div className="ob-card">
        <button className="ob-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>

        <div className="ob-progress">
          <div className="ob-progress-bar" style={{ width: "20%" }} />
        </div>

        <h1 className="ob-title">Quel est votre type d&apos;hébergement&nbsp;?</h1>
        <p className="ob-subtitle">Votre compte sera dédié à cette offre</p>

        <div className="ob-plans">
          {OFFERS.map((offer) => (
            <button
              key={offer.id}
              className={`ob-plan ${data.offerType === offer.id ? "selected" : ""}`}
              onClick={() => onUpdate({ offerType: offer.id })}
            >
              <div className="ob-plan-header">
                <span className="ob-plan-name">{offer.name}</span>
              </div>
              <p className="ob-plan-desc">{offer.description}</p>
              <ul className="ob-plan-features">
                {offer.features.map((feature, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M16.67 5L7.5 14.17 3.33 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <button className="ob-cta" onClick={onNext}>
          Continuer
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
