const transformations = [
  {
    delay: 'reveal-d1',
    before: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <rect x="3" y="2" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 6h6M6 9h4M6 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      title: 'Contrat sur Word',
      desc: '30 à 60 min de copier-coller par réservation',
    },
    after: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <rect x="3" y="2" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Contrat auto-généré',
      desc: '3 minutes pour créer, envoyer et faire signer',
    },
  },
  {
    delay: 'reveal-d2',
    before: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <path d="M3 14l5-5 3 3 4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Signature papier',
      desc: 'Impression, scan, renvoi… le client oublie',
    },
    after: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <rect x="5" y="2" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 10l1.5 1.5L11 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Signature en 30 secondes',
      desc: 'Depuis le mobile du client, sans compte',
    },
  },
  {
    delay: 'reveal-d3',
    before: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="0.9" fill="currentColor" />
        </svg>
      ),
      title: 'Aucune visibilité',
      desc: 'Relances à l\'aveugle, statut inconnu',
    },
    after: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      title: 'Suivi temps réel',
      desc: 'Généré, envoyé, ouvert, signé — chaque étape',
    },
  },
  {
    delay: 'reveal-d4',
    before: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <rect x="2" y="4" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="11" y="4" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="6.5" y="10" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
      title: 'Infos éparpillées',
      desc: 'Word, Gmail, calendrier papier, post-it',
    },
    after: {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 7h14" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 10h3M5 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      title: 'Tout centralisé',
      desc: 'Un seul tableau de bord, toutes les infos',
    },
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
          <h2>De la paperasse à la <span style={{ color: 'var(--green)' }}>productivité.</span></h2>
          <p>Votre temps est trop précieux pour de la saisie manuelle.</p>
        </div>

        <div className="tr-panel reveal">
          {transformations.map((t, i) => (
            <div key={i} className={`tr-row reveal ${t.delay}`}>
              <div className="tr-before">
                <div className="tr-head">
                  <div className="tr-icon old">{t.before.icon}</div>
                  <span className="tr-tag red">Avant</span>
                </div>
                <div className="tr-title dim">{t.before.title}</div>
                <div className="tr-desc dim">{t.before.desc}</div>
              </div>

              <div className="tr-arrow">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M4 9h10m-3-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="tr-after">
                <div className="tr-head">
                  <div className="tr-icon new">{t.after.icon}</div>
                  <span className="tr-tag grn">Après</span>
                </div>
                <div className="tr-title">{t.after.title}</div>
                <div className="tr-desc">{t.after.desc}</div>
              </div>
            </div>
          ))}
        </div>

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
