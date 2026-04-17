const beforeItems = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" />
        <path d="M6 6h4M6 9h2" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Contrat sur Word',
    desc: '30 à 60 min de copier-coller par réservation',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M4 12l3-3 2 2 3-4" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Signature papier',
    desc: 'Impression, scan, renvoi… le client oublie',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="5" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" />
        <path d="M8 5v3" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="11" r=".8" fill="rgba(255,120,100,.5)" />
      </svg>
    ),
    title: 'Aucune visibilité',
    desc: "Relances à l'aveugle, statut inconnu",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="4" width="5" height="4" rx="1" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" />
        <rect x="9" y="8" width="5" height="4" rx="1" stroke="rgba(255,120,100,.5)" strokeWidth="1.2" />
      </svg>
    ),
    title: 'Infos éparpillées',
    desc: 'Gmail, dossiers locaux, calendrier papier',
  },
];

const afterItems = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M4 8h8M8 4v8" stroke="#689D71" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Contrat auto-généré',
    desc: '3 minutes pour créer, envoyer et faire signer',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#689D71" strokeWidth="1.2" />
        <path d="M6 7l1.5 1.5L11 5" stroke="#689D71" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Signature en 30 secondes',
    desc: 'Depuis le téléphone, sans compte ni app',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="5" stroke="#689D71" strokeWidth="1.2" />
        <path d="M8 5v3l2 1.5" stroke="#689D71" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Suivi temps réel',
    desc: 'Généré, envoyé, ouvert, signé — chaque étape',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="#689D71" strokeWidth="1.2" />
        <path d="M2 7h12" stroke="#689D71" strokeWidth="1.2" />
      </svg>
    ),
    title: 'Tout centralisé',
    desc: 'Calendrier, contrats, statuts, archives',
  },
];

const stats = [
  { val: '3', unit: 'min', lbl: 'Pour créer, envoyer et faire signer un contrat complet' },
  { val: '30', unit: 'min', lbl: 'Économisées par réservation vs Word + email + scan' },
  { val: '0', unit: 'erreur', lbl: 'De clause oubliée, de mention légale manquante, de mauvaise date' },
];

export default function Compare() {
  return (
    <section className="section compare">
      <div className="container compare-inner">

        <div className="compare-header reveal">
          <h2>Avant Prysme vs. <span style={{ color: 'var(--green)' }}>Après.</span></h2>
          <p>Votre temps est trop précieux pour de la paperasse.</p>
        </div>

        <div className="compare-grid reveal reveal-d1">

          {/* Colonne avant */}
          <div className="compare-col before">
            <div className="col-label red">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="5" stroke="rgba(255,120,100,.6)" strokeWidth="1.2" />
                <path d="M5 5l4 4M9 5l-4 4" stroke="rgba(255,120,100,.6)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Sans Prysme
            </div>
            {beforeItems.map((item, i) => (
              <div key={i} className="compare-item">
                <div className="ci-icon old">{item.icon}</div>
                <div>
                  <div className="ci-title">{item.title}</div>
                  <div className="ci-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Séparateur VS */}
          <div className="compare-divider">
            <div className="compare-vs">VS</div>
          </div>

          {/* Colonne après */}
          <div className="compare-col after">
            <div className="col-label grn">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="5" stroke="#689D71" strokeWidth="1.2" />
                <path d="M5 7l1.5 1.5L9 5.5" stroke="#689D71" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Avec Prysme
            </div>
            {afterItems.map((item, i) => (
              <div key={i} className="compare-item">
                <div className="ci-icon new">{item.icon}</div>
                <div>
                  <div className="ci-title">{item.title}</div>
                  <div className="ci-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Stats */}
        <div className="compare-bottom reveal reveal-d2">
          {stats.map((s, i) => (
            <div key={i} className="cb-cell">
              <div className="cb-num">
                <span className="val">{s.val}</span>
                <span className="unit">{s.unit}</span>
              </div>
              <div className="cb-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
