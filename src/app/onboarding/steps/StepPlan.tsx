type Plan = "essential";

interface Props {
  selected: Plan | null;
  onSelect: (plan: Plan | "maison" | "etape") => void;
}

const plans: {
  id: Plan | "maison" | "etape";
  name: string;
  price: string;
  period: string;
  features: string[];
  color: string;
  available: boolean;
}[] = [
  {
    id: "essential",
    name: "Essentiel",
    price: "dès 9,99 €",
    period: "/ mois · jusqu'à 5 hébergements",
    features: ["Contrats automatiques illimités", "Signature conforme eIDAS", "Relances automatiques"],
    color: "#7F77DD",
    available: true,
  },
  {
    id: "maison",
    name: "Maison d'Hôtes",
    price: "19,99 €",
    period: "/ mois · jusqu'à 5 chambres (1 même site)",
    features: ["Tout le plan Essentiel", "Réservation par chambre", "Gestion de la demi-pension"],
    color: "#689D71",
    available: false,
  },
  {
    id: "etape",
    name: "Kordia Étape",
    price: "24,99 €",
    period: "/ mois · hébergements multi-espaces",
    features: ["Tout le plan Maison d'Hôtes", "Réservation par lit / dortoir", "Planification multi-espaces"],
    color: "#A3A3A0",
    available: false,
  },
];

export default function StepPlan({ selected, onSelect }: Props) {
  return (
    <div className="ob-plan">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#2C2C2A", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          Quelle offre vous intéresse ?
        </h2>
        <p style={{ fontSize: "13px", color: "#71716E", margin: 0, lineHeight: 1.5 }}>
          Vous bénéficiez de 30 jours d&apos;essai gratuit. Aucun prélèvement avant la fin.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              disabled={!plan.available}
              onClick={() => plan.available && onSelect(plan.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: isSelected
                  ? `2px solid ${plan.color}`
                  : "1.5px solid #E8E6E1",
                background: isSelected
                  ? plan.id === "essential"
                    ? "rgba(127,119,221,.06)"
                    : "rgba(104,157,113,.06)"
                  : "#fff",
                cursor: plan.available ? "pointer" : "not-allowed",
                opacity: plan.available ? 1 : 0.55,
                textAlign: "left",
                transition: "all .15s",
                fontFamily: "inherit",
              }}
            >
              {/* Radio dot */}
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                border: isSelected ? `5px solid ${plan.color}` : "2px solid #D9D7D0",
                background: "#fff",
                transition: "all .15s",
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: plan.available ? "#2C2C2A" : "#A3A3A0" }}>
                    {plan.name}
                  </span>
                  {!plan.available && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em",
                      color: "#fff", background: "#A3A3A0", padding: "2px 7px", borderRadius: "20px",
                    }}>
                      En développement
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#71716E" }}>
                  <strong style={{ color: plan.available ? "#2C2C2A" : "#A3A3A0" }}>{plan.price}</strong>
                  {" HT "}{plan.period}
                </div>
              </div>

              {/* Check */}
              {isSelected && (
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="9" fill={plan.color} />
                  <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{
          marginTop: "14px", padding: "10px 14px", borderRadius: "10px",
          background: "rgba(127,119,221,.07)", border: "1px solid rgba(127,119,221,.2)",
          fontSize: "12px", color: "#5B52B5", lineHeight: 1.5,
        }}>
          {selected === "essential" && "Jusqu'à 5 hébergements entiers · 9,99 €/mois pour 1, puis 19,99 €/mois de 2 à 5. Contrats illimités, toutes les fonctionnalités incluses."}
        </div>
      )}
    </div>
  );
}
