const CheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path d="M3 8l3.5 3.5L13 5" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const cards = [
  {
    delay: 'reveal-d1',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect x="3" y="2" width="12" height="14" rx="2" stroke="#7F77DD" strokeWidth="1.3" />
        <path d="M6 6h6M6 9h4" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    problem: '"Je fais mes contrats sur Word, un par un."',
    before: 'Copier-coller les infos, modifier les dates et les montants, relire, vérifier les clauses. 30 à 60 min par réservation.',
    after: 'Le contrat se génère automatiquement. Validez et envoyez en 1 clic.',
  },
  {
    delay: 'reveal-d2',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M9 2v5l3 2" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="9" cy="9" r="7" stroke="#7F77DD" strokeWidth="1.3" />
      </svg>
    ),
    problem: '"Mon locataire ne renvoie jamais le contrat signé."',
    before: 'Impression, signature papier, scan, renvoi… Le client oublie, vous relancez. La réservation reste floue.',
    after: 'Le client signe en 30 secondes depuis son téléphone, sans compte.',
  },
  {
    delay: 'reveal-d3',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path d="M2 14l4-4 3 3 5-6" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    problem: '"Je ne sais pas où en est mon contrat."',
    before: "Contrat envoyé par email. Pas de retour. Impossible de savoir si le client l'a ouvert, signé, ou ignoré.",
    after: 'Suivi en temps réel : généré, envoyé, ouvert, signé.',
  },
  {
    delay: 'reveal-d1',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect x="3" y="5" width="12" height="8" rx="2" stroke="#7F77DD" strokeWidth="1.3" />
        <path d="M7 9l1.5 1.5L12 7" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    problem: '"La signature électronique, c\'est vraiment légal ?"',
    before: "Beaucoup de gérants pensent que seule la signature manuscrite est valide. Ils hésitent à passer le cap.",
    after: 'Conforme eIDAS (UE n°910/2014). Horodatée, IP tracée, PDF inaltérable.',
  },
  {
    delay: 'reveal-d2',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="7" stroke="#7F77DD" strokeWidth="1.3" />
        <path d="M6 9h6M9 6v6" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    problem: '"Airbnb prend 15 à 20% sur mes réservations."',
    before: "Sans outil professionnel, pas moyen de gérer les réservations directes avec le même sérieux qu'une plateforme.",
    after: "1 réservation directe en plus = 1 an d'abonnement remboursé.",
  },
  {
    delay: 'reveal-d3',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect x="2" y="4" width="6" height="5" rx="1" stroke="#7F77DD" strokeWidth="1.3" />
        <rect x="10" y="9" width="6" height="5" rx="1" stroke="#7F77DD" strokeWidth="1.3" />
        <path d="M8 7h2M8 11h2" stroke="#7F77DD" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    problem: '"Mes infos sont éparpillées partout."',
    before: 'Contrats dans un dossier, mails dans Gmail, calendrier sur papier. Zéro vue d\'ensemble.',
    after: 'Tout au même endroit. Calendrier, contrats, statuts, archives.',
  },
];

export default function Frictions() {
  return (
    <section className="section frictions" id="problemes">
      <div className="container">
        <div className="friction-header reveal">
          <div className="stag v">Problèmes résolus</div>
          <h2 className="st">Vous vous reconnaissez<span className="v"> ?</span></h2>
          <p className="sd">Chaque propriétaire de gîte fait face aux mêmes galères administratives. Prysme les résout une par une.</p>
        </div>
        <div className="friction-grid">
          {cards.map((card, i) => (
            <div key={i} className={`fc reveal ${card.delay}`}>
              <div className="fc-icon">{card.icon}</div>
              <div className="fc-problem">{card.problem}</div>
              <div className="fc-before">{card.before}</div>
              <div className="fc-after">
                <CheckIcon />
                {card.after}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
