const items = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M4 8h8M8 4v8" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Génération automatique',
    desc: 'Le contrat se remplit à partir de vos infos de réservation. Zéro saisie manuelle.',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M3 8l2 2 4-4" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4l2 2-5 5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: '100% personnalisable',
    desc: "Clauses, tarifs, caution, règlement intérieur — chaque contrat s'adapte.",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="#4A7353" strokeWidth="1.3" />
        <path d="M5 7l2 2 4-4" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Conforme à la loi',
    desc: 'Mentions ALUR, signature eIDAS, archivage PDF horodaté.',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M2 4l6 4 6-4" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="4" width="12" height="9" rx="2" stroke="#4A7353" strokeWidth="1.3" />
      </svg>
    ),
    title: 'Envoi automatique',
    desc: 'Le contrat part par email. Le client signe en 30 secondes.',
  },
];

export default function FeatureContracts() {
  return (
    <section className="section" id="fonctionnalites">
      <div className="container">
        <div className="feat-split">

          {/* Left — text */}
          <div className="feat-txt reveal">
            <div className="stag g">Contrats &amp; Juridique</div>
            <h2 className="st">Un contrat pro en <span className="g">3 minutes</span>, pas 30.</h2>
            <p className="sd">Finies les heures sur Word. Prysme génère le contrat, l&apos;envoie et le fait signer en ligne.</p>
            <div className="feat-list">
              {items.map((item, i) => (
                <div key={i} className="feat-item">
                  <div className="fi-icon g">{item.icon}</div>
                  <div>
                    <div className="fi-title">{item.title}</div>
                    <div className="fi-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — contract card */}
          <div className="feat-vis reveal reveal-d2">
            <div className="contract-card">
              <div className="cc-header">
                <div className="cc-header-lbl">Contrat de location saisonnière</div>
                <div className="cc-header-name">Gîte &quot;Les Lavandes&quot; — Été 2025</div>
              </div>
              <div className="cc-body">
                <div className="cc-row"><span>Locataire</span><strong>Martin Dupont</strong></div>
                <div className="cc-row"><span>Arrivée</span><strong>12 juillet 2025</strong></div>
                <div className="cc-row"><span>Départ</span><strong>19 juillet 2025</strong></div>
                <div className="cc-row"><span>Montant total</span><strong>1 400 €</strong></div>
                <div className="cc-row"><span>Caution</span><strong>400 €</strong></div>
                <div className="cc-sig">
                  <div className="cc-sig-lbl">Signature électronique · conforme eIDAS</div>
                  <div className="cc-sig-name">Martin Dupont</div>
                </div>
              </div>
              <div className="cc-footer">
                <span className="cc-status">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="5" fill="#689D71" />
                    <path d="M5 7l1.5 1.5L9 5.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Signé le 8 juin à 14:32
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-lighter)' }}>PDF archivé</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
