import Link from 'next/link';

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-top">

        {/* Left — copy */}
        <div>
          <div className="hero-badge">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="5" fill="#7F77DD" />
              <path d="M5 7l1.5 1.5L9 5.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Signature électronique conforme eIDAS
          </div>

          <h1>
            Vos réservations,<br />
            <span className="green">structurées.</span><br />
            Vos contrats,<br />
            <span className="violet">signés.</span>
          </h1>

          <p className="hero-sub">
            Prysme centralise vos réservations, génère vos contrats et les fait signer en ligne. En 3 minutes, pas 30.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-violet btn-xl" href="/sign-up">
              Démarrer l&apos;essai gratuit
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a className="btn btn-outline btn-lg" href="#fonctionnalites">Voir comment ça marche</a>
          </div>

          <p className="hero-note">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M7 1v6l3 3" stroke="#A3A3A0" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="7" r="5.5" stroke="#A3A3A0" strokeWidth="1" />
            </svg>
            Essai gratuit 1 mois · Sans carte bancaire
          </p>
        </div>

        {/* Right — mockup */}
        <div className="hero-visual">
          <div className="mockup">
            <div className="mockup-bar">
              <div className="m-d m-r" />
              <div className="m-d m-y" />
              <div className="m-d m-g" />
              <div className="mockup-url">app.prysme.fr</div>
            </div>
            <div className="mockup-body">
              <div className="db-top">
                <span className="db-title">Tableau de bord</span>
                <span className="db-chip">Juillet 2025</span>
              </div>
              <div className="db-stats">
                <div className="db-stat">
                  <div className="db-stat-lbl">Contrats actifs</div>
                  <div className="db-stat-num">7</div>
                  <div className="db-stat-chg">+3 ce mois</div>
                </div>
                <div className="db-stat">
                  <div className="db-stat-lbl">Taux de signature</div>
                  <div className="db-stat-num">100%</div>
                  <div className="db-stat-chg">sans relance</div>
                </div>
                <div className="db-stat">
                  <div className="db-stat-lbl">Temps moyen</div>
                  <div className="db-stat-num">3 min</div>
                  <div className="db-stat-chg">par contrat</div>
                </div>
              </div>
              <table className="db-tbl">
                <thead>
                  <tr>
                    <th>Locataire</th>
                    <th>Entrée</th>
                    <th>Sortie</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="db-av av-g">MD</span>Martin D.</td>
                    <td>12 juil.</td>
                    <td>19 juil.</td>
                    <td><span className="pill pill-g">Signé</span></td>
                  </tr>
                  <tr>
                    <td><span className="db-av av-v">CL</span>Charline L.</td>
                    <td>19 juil.</td>
                    <td>26 juil.</td>
                    <td><span className="pill pill-v">Envoyé</span></td>
                  </tr>
                  <tr>
                    <td><span className="db-av av-a">PA</span>Pierre A.</td>
                    <td>26 juil.</td>
                    <td>2 août</td>
                    <td><span className="pill pill-a">En attente</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating notification */}
          <div className="float-notif">
            <div className="fn-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8l3.5 3.5L13 5" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="fn-name">Martin D.</div>
              <div className="fn-text">Contrat signé il y a 2 min</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
