import { ArrowRight } from "lucide-react";

export default function StepWelcome({
  firstName,
  onStart,
}: {
  firstName: string;
  onStart: () => void;
}) {
  return (
    <div className="ob-welcome">
      <div className="ob-greeting">
        <h1>
          Bienvenue{firstName ? `, ${firstName}` : ""}<span className="v">.</span>
        </h1>
        <p>
          Configurez votre hébergement en 2 minutes. Vous pourrez modifier ces
          informations à tout moment dans vos paramètres.
        </p>
      </div>

      <div className="ob-trial">
        <span className="ob-trial-emoji">🎉</span>
        <p>
          Votre période d&apos;essai de <strong>30 jours</strong> commence
          maintenant — accès complet, sans engagement.
        </p>
      </div>

      <button type="button" className="ob-submit" onClick={onStart}>
        C&apos;est parti !
        <ArrowRight size={16} strokeWidth={1.5} color="#fff" />
      </button>
    </div>
  );
}
