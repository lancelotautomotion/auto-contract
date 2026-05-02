export default function StepSuccess({
  giteName,
  onDashboard,
}: {
  giteName: string;
  onDashboard: () => void;
}) {
  return (
    <div className="ob-success">
      <div className="ob-success-icon">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M6 14l6 6L22 8"
            stroke="#689D71"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="ob-success-title">Votre espace est prêt&nbsp;!</h2>

      <p className="ob-success-text">
        <strong>{giteName}</strong> est configuré. Pour finaliser votre profil
        et envoyer vos premiers contrats, n&apos;oubliez pas d&apos;ajouter
        votre logo et vos documents dans les paramètres.
      </p>

      <button type="button" className="ob-submit" onClick={onDashboard}>
        Accéder au tableau de bord
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10m-4-4l4 4-4 4"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
