const OPTIONS = [
  { value: 1, label: "1 hébergement", sub: "Pour commencer, je peux en ajouter d'autres plus tard" },
  { value: 2, label: "2 hébergements", sub: "Je gère deux biens distincts" },
  { value: 3, label: "3 hébergements", sub: "Je gère trois biens distincts" },
  { value: 4, label: "4 hébergements", sub: "Je gère quatre biens distincts" },
  { value: 5, label: "5 hébergements", sub: "Je gère cinq biens distincts" },
];

interface Props {
  selected: number | null;
  onSelect: (n: number) => void;
}

export default function StepGiteCount({ selected, onSelect }: Props) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">Combien d&apos;hébergements gérez-vous ?</p>
      <p className="ob-step-intro">
        Vous pourrez en ajouter ou en modifier depuis le tableau de bord à tout moment.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #689D71" : "1.5px solid #E8E6E1",
                background: isSelected ? "rgba(104,157,113,.06)" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all .15s",
                fontFamily: "inherit",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                border: isSelected ? "5px solid #689D71" : "2px solid #D9D7D0",
                background: "#fff", transition: "all .15s",
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#2C2C2A", marginBottom: "2px" }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: "12px", color: "#71716E" }}>{opt.sub}</div>
              </div>
              {isSelected && (
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="9" fill="#689D71" />
                  <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
