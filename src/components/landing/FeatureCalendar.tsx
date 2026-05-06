const items = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="11" rx="2" stroke="#5B52B5" strokeWidth="1.3" />
        <path d="M2 7h12" stroke="#5B52B5" strokeWidth="1.3" />
        <path d="M6 1v4M10 1v4" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Calendrier avec statuts',
    desc: 'Chaque réservation affiche son statut : signé, envoyé, en attente.',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M8 3v5l3 2" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8" cy="8" r="6" stroke="#5B52B5" strokeWidth="1.3" />
      </svg>
    ),
    title: 'Relances automatiques',
    desc: 'Contrat non signé à J+2 ? Kordia relance automatiquement.',
  },
];

function PhoneMockup() {
  return (
    <div className="phone-wrap">
      <div className="phone-frame">
        {/* Dynamic island */}
        <div className="phone-island" />

        {/* Screen */}
        <div className="phone-screen">
          {/* Status bar */}
          <div className="phone-statusbar">
            <span className="phone-time">9:41</span>
            <div className="phone-icons">
              {/* WiFi */}
              <svg width="14" height="10" fill="none" viewBox="0 0 14 10">
                <path d="M7 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/>
                <path d="M3.8 5.8C4.9 4.7 5.9 4.2 7 4.2s2.1.5 3.2 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1.2 3.2C3 1.5 5 .5 7 .5s4 1 5.8 2.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {/* Signal */}
              <svg width="13" height="10" fill="none" viewBox="0 0 13 10">
                <rect x="0" y="6" width="2.2" height="4" rx="0.5" fill="currentColor"/>
                <rect x="3.5" y="4" width="2.2" height="6" rx="0.5" fill="currentColor"/>
                <rect x="7" y="2" width="2.2" height="8" rx="0.5" fill="currentColor"/>
                <rect x="10.5" y="0" width="2.2" height="10" rx="0.5" fill="currentColor"/>
              </svg>
              {/* Battery */}
              <svg width="22" height="11" fill="none" viewBox="0 0 22 11">
                <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" strokeOpacity=".4"/>
                <rect x="19.5" y="3" width="2" height="5" rx="1" fill="currentColor" fillOpacity=".4"/>
                <rect x="2" y="2" width="13" height="7" rx="1.5" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {/* App header */}
          <div className="dm-header">
            <div>
              <div className="dm-greeting">Bonjour, Guillaume</div>
              <div className="dm-title">Tableau de bord</div>
            </div>
            <div className="dm-avatar">G</div>
          </div>

          {/* Stats */}
          <div className="dm-stats">
            <div className="dm-stat">
              <div className="dm-stat-val">24</div>
              <div className="dm-stat-lbl">Réservations</div>
            </div>
            <div className="dm-stat-div" />
            <div className="dm-stat">
              <div className="dm-stat-val">18</div>
              <div className="dm-stat-lbl">Signés</div>
            </div>
            <div className="dm-stat-div" />
            <div className="dm-stat">
              <div className="dm-stat-val">6</div>
              <div className="dm-stat-lbl">En attente</div>
            </div>
          </div>

          {/* À venir */}
          <div className="dm-section">
            <div className="dm-section-title">À venir</div>
            <div className="dm-rows">
              <div className="dm-row">
                <div className="dm-dot dm-dot-g" />
                <div className="dm-row-info">
                  <div className="dm-row-name">Martin D.</div>
                  <div className="dm-row-date">12 – 19 juil.</div>
                </div>
                <div className="dm-pill dm-pill-g">Signé</div>
              </div>
              <div className="dm-row">
                <div className="dm-dot dm-dot-v" />
                <div className="dm-row-info">
                  <div className="dm-row-name">Charles B.</div>
                  <div className="dm-row-date">26 – 31 juil.</div>
                </div>
                <div className="dm-pill dm-pill-v">Envoyé</div>
              </div>
              <div className="dm-row">
                <div className="dm-dot dm-dot-o" />
                <div className="dm-row-info">
                  <div className="dm-row-name">Sophie M.</div>
                  <div className="dm-row-date">2 – 9 août</div>
                </div>
                <div className="dm-pill dm-pill-o">En attente</div>
              </div>
              <div className="dm-row">
                <div className="dm-dot dm-dot-g" />
                <div className="dm-row-info">
                  <div className="dm-row-name">Léa R.</div>
                  <div className="dm-row-date">15 – 22 août</div>
                </div>
                <div className="dm-pill dm-pill-g">Signé</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureCalendar() {
  return (
    <section className="section" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div className="feat-split">

          {/* Left — text */}
          <div className="feat-txt reveal">
            <div className="stag v">Suivi &amp; Visibilité</div>
            <h2 className="st">Tout voir,<br /><span className="v">tout comprendre.</span></h2>
            <p className="sd">Calendriers, contrats, statuts — tout est centralisé. Sachez où en est chaque réservation.</p>
            <div className="feat-list">
              {items.map((item, i) => (
                <div key={i} className="feat-item">
                  <div className="fi-icon v">{item.icon}</div>
                  <div>
                    <div className="fi-title">{item.title}</div>
                    <div className="fi-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="feat-vis reveal reveal-d2">
            <PhoneMockup />
          </div>

        </div>
      </div>
    </section>
  );
}
