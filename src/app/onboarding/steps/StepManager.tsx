import type { StepFormProps } from "../types";

export default function StepManager({ register, errors }: StepFormProps) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">Vos coordonnées</p>

      <div className="ob-field">
        <label className="ob-label">Email de contact *</label>
        <input
          className={`ob-input${errors.email ? " ob-input--error" : ""}`}
          type="email"
          autoFocus
          {...register("email", {
            required: "L'email est requis",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Adresse email invalide",
            },
          })}
        />
        {errors.email && (
          <span className="ob-field-error">{errors.email.message}</span>
        )}
      </div>

      <div className="ob-field">
        <label className="ob-label">Téléphone</label>
        <input
          className="ob-input"
          type="tel"
          placeholder="06 12 34 56 78"
          {...register("phone")}
        />
      </div>

      <p className="ob-step-note">
        Ces informations apparaîtront sur vos contrats et dans les emails
        envoyés à vos locataires.
      </p>
    </div>
  );
}
