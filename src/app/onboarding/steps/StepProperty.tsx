import type { StepFormProps } from "../types";

export default function StepProperty({ register, errors }: StepFormProps) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">Votre hébergement</p>

      <div className="ob-field">
        <label className="ob-label">Nom de l&apos;hébergement *</label>
        <input
          className={`ob-input${errors.giteName ? " ob-input--error" : ""}`}
          placeholder="Le Clos du Marida"
          autoFocus
          {...register("giteName", {
            required: "Le nom de l'hébergement est requis",
          })}
        />
        {errors.giteName && (
          <span className="ob-field-error">{errors.giteName.message}</span>
        )}
      </div>

      <div className="ob-field">
        <label className="ob-label">Adresse</label>
        <input
          className="ob-input"
          placeholder="12 chemin des Pins"
          {...register("address")}
        />
      </div>

      <div className="ob-row">
        <div className="ob-field">
          <label className="ob-label">Ville</label>
          <input
            className="ob-input"
            placeholder="Bordeaux"
            {...register("city")}
          />
        </div>
        <div className="ob-field">
          <label className="ob-label">Code postal</label>
          <input
            className="ob-input"
            placeholder="33000"
            {...register("zipCode")}
          />
        </div>
      </div>
    </div>
  );
}
