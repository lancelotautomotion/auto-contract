import Link from 'next/link';

const CheckGreen = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#EEF5EF" />
    <path d="M5 8l2.5 2.5L11 6" stroke="#4A7353" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CheckViolet = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#EFEEF9" />
    <path d="M5 8l2.5 2.5L11 6" stroke="#5B52B5" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default function Pricing() {
  return (
    <section className="section" id="tarifs">
      <div className="container">

        <div className="reveal" style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
          <div className="stag v" style={{ justifyContent: 'center' }}>Tarifs</div>
          <h2 className="st">Simple, <span className="v">transparent</span>, sans surprise.</h2>
          <p className="sd" style={{ margin: '0 auto' }}>Essayez Prysme gratuitement pendant 1 mois. Sans carte bancaire.</p>
        </div>

        <div className="pricing-grid">

          {/* Découverte */}
          <div className="pc reveal reveal-d1">
            <div className="pc-icon g">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M9 2v14M5 6c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4H5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pc-plan">Découverte</div>
            <div className="pc-price"><sup>€</sup>0</div>
            <div className="pc-period">Gratuit pendant 1 mois</div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGreen />1 hébergement</li>
              <li><CheckGreen />Contrats illimités</li>
              <li><CheckGreen />Signature électronique</li>
              <li><CheckGreen />Calendrier &amp; archivage</li>
            </ul>
            <Link className="btn btn-outline" style={{ width: '100%' }} href="/sign-up">
              Commencer l&apos;essai
            </Link>
          </div>

          {/* Essentiel — featured */}
          <div className="pc feat reveal reveal-d2">
            <div className="pc-icon v">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M9 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="pc-plan">Essentiel</div>
            <div className="pc-price"><sup>€</sup>9,99</div>
            <div className="pc-period">par mois · 1 hébergement</div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckViolet />Contrats illimités</li>
              <li><CheckViolet />Signature conforme eIDAS</li>
              <li><CheckViolet />Relances automatiques</li>
              <li><CheckViolet />Personnalisation avancée</li>
              <li><CheckViolet />Export comptable</li>
            </ul>
            <Link className="btn btn-violet" style={{ width: '100%' }} href="/sign-up">
              Démarrer l&apos;essai gratuit
            </Link>
          </div>

          {/* Multi-gîtes */}
          <div className="pc reveal reveal-d3">
            <div className="pc-icon g">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="2" y="5" width="6" height="8" rx="1.5" stroke="#4A7353" strokeWidth="1.3" />
                <rect x="10" y="5" width="6" height="8" rx="1.5" stroke="#4A7353" strokeWidth="1.3" />
                <path d="M5 3v2M13 3v2" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pc-plan">Multi-gîtes</div>
            <div className="pc-price"><sup>€</sup>15</div>
            <div className="pc-period">par mois · jusqu&apos;à 3 hébergements</div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGreen />Tout le plan Essentiel</li>
              <li><CheckGreen />Jusqu&apos;à 3 hébergements</li>
              <li><CheckGreen />Tableau de bord consolidé</li>
              <li><CheckGreen />Support prioritaire</li>
            </ul>
            <Link className="btn btn-outline" style={{ width: '100%' }} href="/sign-up">
              Démarrer l&apos;essai gratuit
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
