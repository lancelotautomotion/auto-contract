import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { OnboardingValues } from "../types";

export type GiteConfig = { capacity: string; cleaningFee: string; touristTax: string };
export type GiteConfigErrors = { capacity?: string; cleaningFee?: string; touristTax?: string };

interface Props {
  register: UseFormRegister<OnboardingValues>;
  errors: FieldErrors<OnboardingValues>;
  isGuesthouse?: boolean;
  isMulti?: boolean;
  giteNames?: string[];
  giteCount?: number;
  giteConfigs?: GiteConfig[];
  configErrors?: GiteConfigErrors[];
  onConfigChange?: (index: number, field: keyof GiteConfig, value: string) => void;
}

function GiteConfigBlock({
  label,
  config,
  errors,
  onChange,
}: {
  label: string;
  config: GiteConfig;
  errors: GiteConfigErrors;
  onChange: (field: keyof GiteConfig, value: string) => void;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        fontSize: "12px", fontWeight: 700, color: "#689D71", textTransform: "uppercase",
        letterSpacing: ".06em", marginBottom: "10px",
      }}>
        {label}
      </div>
      <div className="ob-row-3">
        <div className="ob-field">
          <label className="ob-label">Capacité (pers.)</label>
          <input
            className={`ob-input${errors.capacity ? " ob-input--error" : ""}`}
            type="number"
            min="1"
            max="100"
            placeholder="12"
            value={config.capacity}
            onChange={(e) => onChange("capacity", e.target.value)}
          />
          {errors.capacity && <span className="ob-field-error">{errors.capacity}</span>}
        </div>
        <div className="ob-field">
          <label className="ob-label">Frais ménage (€)</label>
          <input
            className={`ob-input${errors.cleaningFee ? " ob-input--error" : ""}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="90"
            value={config.cleaningFee}
            onChange={(e) => onChange("cleaningFee", e.target.value)}
          />
          {errors.cleaningFee && <span className="ob-field-error">{errors.cleaningFee}</span>}
        </div>
        <div className="ob-field">
          <label className="ob-label">Taxe séjour (€/nuit/pers.)</label>
          <input
            className={`ob-input${errors.touristTax ? " ob-input--error" : ""}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="1,32"
            value={config.touristTax}
            onChange={(e) => onChange("touristTax", e.target.value)}
          />
          {errors.touristTax && <span className="ob-field-error">{errors.touristTax}</span>}
        </div>
      </div>
    </div>
  );
}

export default function StepConfig({
  register, errors,
  isGuesthouse, isMulti, giteNames, giteCount, giteConfigs, configErrors, onConfigChange,
}: Props) {
  return (
    <div className="ob-step">
      <p className="ob-section-title">Configuration de base</p>
      <p className="ob-step-intro">
        {isGuesthouse
          ? "Définissez la taxe de séjour appliquée par adulte et par nuit. Vous configurerez vos chambres ensuite depuis le tableau de bord."
          : isMulti
          ? "Configurez chaque hébergement indépendamment. Vous pourrez ajuster ces valeurs sur chaque séjour."
          : "Ces valeurs s'appliquent par défaut à toutes vos réservations. Vous pourrez les ajuster sur chaque séjour."}
      </p>

      {isGuesthouse ? (
        <div className="ob-field">
          <label className="ob-label">Taxe de séjour (€/adulte/nuit)</label>
          <input
            className={`ob-input${errors.touristTax ? " ob-input--error" : ""}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="1,00"
            {...register("touristTax", {
              valueAsNumber: true,
              required: true,
              min: { value: 0, message: "Valeur invalide" },
            })}
          />
          {errors.touristTax && <span className="ob-field-error">{errors.touristTax.message}</span>}
        </div>
      ) : isMulti && giteConfigs && onConfigChange ? (
        Array.from({ length: giteCount ?? 1 }).map((_, i) => (
          <GiteConfigBlock
            key={i}
            label={giteNames?.[i] || `Hébergement ${i + 1}`}
            config={giteConfigs[i] ?? { capacity: "", cleaningFee: "", touristTax: "" }}
            errors={configErrors?.[i] ?? {}}
            onChange={(field, value) => onConfigChange(i, field, value)}
          />
        ))
      ) : (
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
            {errors.capacity && <span className="ob-field-error">{errors.capacity.message}</span>}
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
            {errors.cleaningFee && <span className="ob-field-error">{errors.cleaningFee.message}</span>}
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
            {errors.touristTax && <span className="ob-field-error">{errors.touristTax.message}</span>}
          </div>
        </div>
      )}

      <label className="ob-cgu" style={{ marginTop: isMulti ? "4px" : undefined }}>
        <input
          type="checkbox"
          {...register("cguAccepted", {
            required: "Vous devez accepter les CGU pour continuer",
          })}
        />
        <span className="ob-cgu-text">
          J&apos;accepte les{" "}
          <a href="/legal/cgu" target="_blank" rel="noreferrer">CGU</a>{" "}
          et la{" "}
          <a href="/legal/confidentialite" target="_blank" rel="noreferrer">Politique de confidentialité</a>{" "}
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
