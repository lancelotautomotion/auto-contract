import Link from 'next/link';

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-top">

        {/* Left — copy */}
        <div>

          <h1>
            Vos contrats de location,<br />
            <span className="green">générés et signés</span><br />
            <span className="violet">en 3 minutes.</span>
          </h1>

          <p className="hero-sub">
            Fini le copier-coller sur Word. Kordia génère le contrat, l&apos;envoie par email et le fait signer en ligne — le locataire signe en 30 secondes depuis son téléphone, sans créer de compte.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-violet btn-xl" href="/sign-up">
              Essayer gratuitement 1 mois
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a className="btn btn-green btn-lg" href="#fonctionnalites">Voir comment ça marche</a>
          </div>

          {/* Trust signals */}
          <div className="hero-trust">
            <span className="hero-trust-item">
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
                <path d="M6.5 1v8M4 6.5l2.5 2.5 2.5-2.5" stroke="#A3A3A0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sans carte bancaire
            </span>
            <span className="hero-trust-sep">·</span>
            <span className="hero-trust-item">
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
                <circle cx="6.5" cy="6.5" r="5" stroke="#A3A3A0" strokeWidth="1.1"/>
                <path d="M6.5 4v2.5l1.5 1" stroke="#A3A3A0" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Configuré en 5 minutes
            </span>
            <span className="hero-trust-sep">·</span>
            <span className="hero-trust-item">
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
                <path d="M3 6.5l2.5 2.5L10 4.5" stroke="#A3A3A0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Résiliable à tout moment
            </span>
          </div>

        </div>

        {/* Right — mockup */}
        <div className="hero-visual">
          <div className="mockup">
            <div className="mockup-bar">
              <div className="m-d m-r" />
              <div className="m-d m-y" />
              <div className="m-d m-g" />
              <div className="mockup-url">kordia.fr</div>
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
