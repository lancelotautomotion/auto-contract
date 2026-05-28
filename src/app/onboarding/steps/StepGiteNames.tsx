interface Props {
  count: number;
  names: string[];
  onChange: (index: number, value: string) => void;
  errors: string[];
}

const PLACEHOLDERS = [
  "Le Clos du Marida",
  "La Maison des Lavandes",
  "Le Chalet des Cimes",
  "La Bastide des Oliviers",
  "Le Refuge des Cimes",
];

export default function StepGiteNames({ count, names, onChange, errors }: Props) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">
        {count === 1 ? "Votre hébergement" : "Nommez vos hébergements"}
      </p>
      <p className="ob-step-intro">
        Donnez un nom à chaque hébergement. Vous pourrez configurer les adresses,
        tarifs et options depuis le tableau de bord.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="ob-field">
            <label className="ob-label">
              {count === 1 ? "Nom de l'hébergement" : `Hébergement ${i + 1}`}
              {" "}<span style={{ color: "#C0392B" }}>*</span>
            </label>
            <input
              className={`ob-input${errors[i] ? " ob-input--error" : ""}`}
              placeholder={PLACEHOLDERS[i]}
              value={names[i] ?? ""}
              onChange={(e) => onChange(i, e.target.value)}
              autoFocus={i === 0}
            />
            {errors[i] && (
              <span className="ob-field-error">{errors[i]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
