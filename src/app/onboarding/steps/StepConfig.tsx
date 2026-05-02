import type { StepFormProps } from "../types";

export default function StepConfig({ register, errors }: StepFormProps) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">Configuration de base</p>
      <p className="ob-step-intro">
        Ces valeurs s&apos;appliquent par défaut à toutes vos réservations.
        Vous pourrez les ajuster sur chaque séjour.
      </p>

      <div className="ob-row-3">
        <div className="ob-field">
          <label className="ob-label">Capacité (pers.)</label>
          <input
            className={`ob-input${errors.capacity ? " ob-input--error" : ""}`}
            type="number"
            min="1"
            max="100"
            {...register("capacity", {
              valueAsNumber: true,
              required: true,
              min: { value: 1, message: "Minimum 1 personne" },
            })}
          />
          {errors.capacity && (
            <span className="ob-field-error">{errors.capacity.message}</span>
          )}
        </div>

        <div className="ob-field">
          <label className="ob-label">Frais ménage (€)</label>
          <input
            className={`ob-input${errors.cleaningFee ? " ob-input--error" : ""}`}
            type="number"
            min="0"
            step="0.01"
            {...register("cleaningFee", {
              valueAsNumber: true,
              required: true,
              min: { value: 0, message: "Valeur invalide" },
            })}
          />
          {errors.cleaningFee && (
            <span className="ob-field-error">{errors.cleaningFee.message}</span>
          )}
        </div>

        <div className="ob-field">
          <label className="ob-label">Taxe séjour (€/nuit/pers.)</label>
          <input
            className={`ob-input${errors.touristTax ? " ob-input--error" : ""}`}
            type="number"
            min="0"
            step="0.01"
            {...register("touristTax", {
              valueAsNumber: true,
              required: true,
              min: { value: 0, message: "Valeur invalide" },
            })}
          />
          {errors.touristTax && (
            <span className="ob-field-error">{errors.touristTax.message}</span>
          )}
        </div>
      </div>

      <label className="ob-cgu">
        <input
          type="checkbox"
          {...register("cguAccepted", {
            required: "Vous devez accepter les CGU pour continuer",
          })}
        />
        <span className="ob-cgu-text">
          J&apos;accepte les{" "}
          <a href="/legal/cgu" target="_blank" rel="noreferrer">
            CGU
          </a>{" "}
          et la{" "}
          <a href="/legal/confidentialite" target="_blank" rel="noreferrer">
            Politique de confidentialité
          </a>{" "}
          de Kordia.
        </span>
      </label>
      {errors.cguAccepted && (
        <span className="ob-field-error" style={{ marginTop: 4, display: "block" }}>
          {String(errors.cguAccepted.message)}
        </span>
      )}
    </div>
  );
}
