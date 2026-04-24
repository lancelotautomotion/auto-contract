const transformations = [
  {
    delay: 'reveal-d1',
    before: {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M6 2.5h7l4 4v12a1.5 1.5 0 01-1.5 1.5h-9.5A1.5 1.5 0 014.5 18.5v-14a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M13 2.5v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 11.5h6M8 14h6M8 16.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: 'Contrat sur Word',
      desc: '30 à 60 min de copier-coller par réservation',
    },
    after: {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M14.5 4l2.5 2.5-8 8-3 .5.5-3 8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M3 18.5c2-.8 4-1 6-1s4 .2 6 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M3 14c1.5-3 3-5 4.5-5s1.8 3 3.5 3 3-4 5-4 3 2 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Signature papier',
      desc: 'Impression, scan, renvoi… le client oublie',
    },
    after: {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <rect x="6" y="2" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 16.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 6l2 1.5L15 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M3 11s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 19L19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: 'Aucune visibilité',
      desc: 'Relances à l\'aveugle, statut inconnu',
    },
    after: {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M3 11s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="1" fill="currentColor" />
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
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <rect x="2.5" y="2.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12.5" y="2.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2.5" y="12.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12.5" y="12.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      title: 'Infos éparpillées',
      desc: 'Word, Gmail, calendrier papier, post-it',
    },
    after: {
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
          <path d="M3 9l8-6 8 6v10.5A1 1 0 0118 20.5H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 14h6M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: 'Tout centralisé',
      desc: 'Un seul tableau de bord, toutes les infos',
    },
  },
];

const stats = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 8v6l4 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    color: 'violet',
    val: '3',
    unit: 'min',
    lbl: 'Pour créer, envoyer et faire signer un contrat complet',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path d="M14 4c5 3 8 7 8 12s-4 8-8 8-8-3-8-8c0-2 1-4 2.5-6C11 6 14 4 14 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 10c0 3-1.5 6-4 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    color: 'green',
    val: '30',
    unit: 'min',
    lbl: 'Économisées par réservation vs Word + email + scan',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <path d="M14 3l9 4v7c0 5-4 9-9 10-5-1-9-5-9-10V7l9-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M10 14l2.5 2.5L18 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: 'violet',
    val: '0',
    unit: 'erreur',
    lbl: 'De clause oubliée, de mention légale manquante, de mauvaise date',
  },
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
          <div className="tr-panel-head">
            <span className="tr-pill violet">Avant</span>
            <span className="tr-pill green">Après</span>
          </div>

          {transformations.map((t, i) => (
            <div key={i} className={`tr-row reveal ${t.delay}`}>
              <div className="tr-cell before">
                <div className="tr-icon violet">{t.before.icon}</div>
                <div className="tr-text">
                  <div className="tr-title">{t.before.title}</div>
                  <div className="tr-desc">{t.before.desc}</div>
                </div>
              </div>

              <div className="tr-arrow">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M4 8h8m-3-3l3 3-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="tr-cell after">
                <div className="tr-icon green">{t.after.icon}</div>
                <div className="tr-text">
                  <div className="tr-title">{t.after.title}</div>
                  <div className="tr-desc">{t.after.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-panel reveal reveal-d2">
          {stats.map((s, i) => (
            <div key={i} className={`sp-cell${i > 0 ? ' has-div' : ''}`}>
              <div className={`sp-icon ${s.color}`}>{s.icon}</div>
              <div className="sp-right">
                <div className="sp-num">
                  <span className={`sp-val ${s.color}`}>{s.val}</span>
                  <span className="sp-unit">{s.unit}</span>
                </div>
                <div className="sp-lbl">{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
