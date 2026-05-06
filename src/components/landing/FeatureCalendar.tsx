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
        <div className="phone-screen">
          {/* Status bar — dark comme le vrai topbar */}
          <div className="phone-statusbar">
            <span className="phone-time">9:41</span>
            <div className="phone-icons">
              <svg width="14" height="10" fill="none" viewBox="0 0 14 10">
                <path d="M7 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/>
                <path d="M3.8 5.8C4.9 4.7 5.9 4.2 7 4.2s2.1.5 3.2 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1.2 3.2C3 1.5 5 .5 7 .5s4 1 5.8 2.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <svg width="13" height="10" fill="none" viewBox="0 0 13 10">
                <rect x="0" y="6" width="2.2" height="4" rx="0.5" fill="currentColor"/>
                <rect x="3.5" y="4" width="2.2" height="6" rx="0.5" fill="currentColor"/>
                <rect x="7" y="2" width="2.2" height="8" rx="0.5" fill="currentColor"/>
                <rect x="10.5" y="0" width="2.2" height="10" rx="0.5" fill="currentColor"/>
              </svg>
              <svg width="22" height="11" fill="none" viewBox="0 0 22 11">
                <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" strokeOpacity=".4"/>
                <rect x="19.5" y="3" width="2" height="5" rx="1" fill="currentColor" fillOpacity=".4"/>
                <rect x="2" y="2" width="13" height="7" rx="1.5" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {/* Topbar — identique au vrai dashboard */}
          <div className="dpm-topbar">
            <div className="dpm-hamburger">
              <svg width="13" height="9" fill="none" viewBox="0 0 13 9">
                <path d="M0 1h13M0 4.5h13M0 8h13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="dpm-logo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#689D71"/>
              </svg>
              KORDIA
            </div>
            <div className="dpm-topbar-icon">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="dpm-breadcrumb">
            Kordia / <strong>Tableau de bord</strong>
          </div>

          {/* Corps */}
          <div className="dpm-body">
            <div className="dpm-greeting">Bonjour, Guillaume<span className="dpm-dot">.</span></div>
            <div className="dpm-date">Mercredi 6 mai 2026</div>

            <div className="dpm-ctas">
              <div className="dpm-cta dpm-cta-g">Lien de réservation</div>
              <div className="dpm-cta dpm-cta-v">+ Nouvelle réservation</div>
            </div>

            <div className="dpm-grid">
              <div className="dpm-card dpm-card-g">
                <div className="dpm-card-lbl">Réservations</div>
                <div className="dpm-card-num">24</div>
              </div>
              <div className="dpm-card dpm-card-v">
                <div className="dpm-card-lbl">Contrats générés</div>
                <div className="dpm-card-num">18</div>
              </div>
              <div className="dpm-card dpm-card-g">
                <div className="dpm-card-lbl">Contrats signés</div>
                <div className="dpm-card-num">18</div>
              </div>
              <div className="dpm-card dpm-card-o">
                <div className="dpm-card-lbl">En attente</div>
                <div className="dpm-card-num">6</div>
                <div className="dpm-card-sub">Tout est à jour</div>
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
