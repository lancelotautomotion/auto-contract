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
    desc: 'Chaque réservation affiche son état : signé, envoyé, en attente.',
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
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M4 13V7l4-4 4 4v6" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6" y="10" width="4" height="3" stroke="#5B52B5" strokeWidth="1.3" rx="0.5" />
      </svg>
    ),
    title: 'Archivage automatique',
    desc: 'PDF horodaté, accessible à tout moment.',
  },
];

export default function FeatureCalendar() {
  return (
    <section className="section" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div className="feat-split rev">

          {/* Left — calendar card */}
          <div className="feat-vis reveal">
            <div className="cal-card">
              <div className="cal-head">
                <span className="cal-month">Juillet 2025</span>
                <div className="cal-arrows">
                  <button type="button" className="cal-arr">‹</button>
                  <button type="button" className="cal-arr">›</button>
                </div>
              </div>
              <div className="cal-grid">
                <div className="cal-dn">L</div>
                <div className="cal-dn">M</div>
                <div className="cal-dn">M</div>
                <div className="cal-dn">J</div>
                <div className="cal-dn">V</div>
                <div className="cal-dn">S</div>
                <div className="cal-dn">D</div>

                <div className="cd e" />
                <div className="cd">1</div>
                <div className="cd">2</div>
                <div className="cd">3</div>
                <div className="cd">4</div>
                <div className="cd">5</div>
                <div className="cd">6</div>

                <div className="cd">7</div>
                <div className="cd">8</div>
                <div className="cd">9</div>
                <div className="cd">10</div>
                <div className="cd">11</div>
                <div className="cd bg">12</div>
                <div className="cd bg">13</div>

                <div className="cd bg">14</div>
                <div className="cd bg">15</div>
                <div className="cd bg">16</div>
                <div className="cd today">17</div>
                <div className="cd bg">18</div>
                <div className="cd bv">19</div>
                <div className="cd bv">20</div>

                <div className="cd bv">21</div>
                <div className="cd bv">22</div>
                <div className="cd bv">23</div>
                <div className="cd bv">24</div>
                <div className="cd bv">25</div>
                <div className="cd">26</div>
                <div className="cd">27</div>

                <div className="cd">28</div>
                <div className="cd">29</div>
                <div className="cd">30</div>
                <div className="cd">31</div>
              </div>
              <div className="cal-bks">
                <div className="cal-bk">
                  <div className="bk-bar bk-g" />
                  <div>
                    <div className="bk-name">Martin D.</div>
                    <div className="bk-date">12 – 19 juil. · Signé</div>
                  </div>
                </div>
                <div className="cal-bk">
                  <div className="bk-bar bk-v" />
                  <div>
                    <div className="bk-name">Charline L.</div>
                    <div className="bk-date">19 – 26 juil. · Envoyé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — text */}
          <div className="feat-txt reveal reveal-d2">
            <div className="stag v">Suivi &amp; Visibilité</div>
            <h2 className="st">Tout voir,<br /><span className="v">tout comprendre.</span></h2>
            <p className="sd">Calendrier, contrats, statuts — tout est centralisé. Sachez où en est chaque réservation.</p>
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

        </div>
      </div>
    </section>
  );
}
