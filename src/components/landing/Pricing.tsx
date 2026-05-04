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

const CheckGray = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#F0F0EE" />
    <path d="M5 8l2.5 2.5L11 6" stroke="#A3A3A0" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const faq = [
  {
    q: "Que se passe-t-il après le mois gratuit ?",
    a: "Vous choisissez le plan qui vous convient et renseignez votre carte bancaire. Si vous ne faites rien, votre compte passe en lecture seule — vos données restent accessibles.",
  },
  {
    q: "La signature électronique est-elle légalement valide ?",
    a: "Oui. Kordia utilise la signature eIDAS (règlement européen n°910/2014), légalement valide en France pour les contrats de location saisonnière. Chaque signature est horodatée, l'IP est tracée, le PDF est inaltérable.",
  },
  {
    q: "Mes locataires doivent-ils créer un compte pour signer ?",
    a: "Non. Ils reçoivent un lien par email, cliquent, et signent en 30 secondes depuis leur mobile ou PC. Aucune installation, aucun compte.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui, sans engagement et sans frais. Vous gérez votre abonnement directement depuis votre espace, rubrique Compte & Facturation.",
  },
];

export default function Pricing() {
  return (
    <section className="section" id="tarifs">
      <div className="container">

        <div className="reveal" style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
          <div className="stag v" style={{ justifyContent: 'center' }}>Tarifs</div>
          <h2 className="st">Simple, <span className="v">transparent</span>, sans surprise.</h2>
          <p className="sd" style={{ margin: '0 auto' }}>1 mois gratuit pour tester à votre rythme. Sans carte bancaire.</p>
        </div>

        <div className="pricing-grid">

          {/* Découverte */}
          <div className="pc reveal reveal-d1">
            <div className="pc-header">
              <div className="pc-icon g">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M10 2l2.2 5h5.3l-4.3 3.1 1.6 5.2L10 12l-4.8 3.3 1.6-5.2L2.5 7h5.3z" stroke="#4A7353" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pc-plan">Découverte</div>
              <div className="pc-price">0<sup>€</sup></div>
              <div className="pc-period">Gratuit · 1 mois pour tester</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGreen />1 hébergement</li>
              <li><CheckGreen />Contrats illimités</li>
              <li><CheckGreen />Signature électronique</li>
              <li><CheckGreen />Calendrier &amp; archivage</li>
            </ul>
            <Link className="btn btn-outline" style={{ width: '100%' }} href="/sign-up">
              Démarrer l&apos;essai gratuit
            </Link>
          </div>

          {/* Essentiel — featured */}
          <div className="pc feat reveal reveal-d2">
            <div className="pc-badge">Le plus choisi</div>
            <div className="pc-header">
              <div className="pc-icon v">
                {/* Éclair — productivité, puissance */}
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M11.5 3L5 11h6l-2.5 6L17 9h-6l.5-6z" stroke="#5B52B5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pc-plan">Essentiel</div>
              <div className="pc-price">9<span style={{ fontSize: '22px' }}>,99</span><sup>€</sup></div>
              <div className="pc-period">par mois · 1 hébergement</div>
            </div>
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

          {/* Multi-gîtes — en développement */}
          <div className="pc reveal reveal-d3" style={{ opacity: 0.85 }}>
            <div className="pc-badge-dev">Bientôt disponible</div>
            <div className="pc-header">
              <div className="pc-icon g">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="#4A7353" strokeWidth="1.4"/>
                  <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="#4A7353" strokeWidth="1.4"/>
                  <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="#4A7353" strokeWidth="1.4"/>
                  <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="#4A7353" strokeWidth="1.4"/>
                </svg>
              </div>
              <div className="pc-plan">Multi-gîtes</div>
              <div className="pc-price">14<span style={{ fontSize: '22px' }}>,99</span><sup>€</sup></div>
              <div className="pc-period">par mois · jusqu&apos;à 3 hébergements</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGray />Tout le plan Essentiel</li>
              <li><CheckGray />Jusqu&apos;à 3 hébergements</li>
              <li><CheckGray />Tableau de bord consolidé</li>
              <li><CheckGray />Support prioritaire</li>
            </ul>
            <span className="pc-dev-cta">Bientôt disponible</span>
          </div>

          {/* Kordia Étape — en développement */}
          <div className="pc reveal reveal-d4" style={{ opacity: 0.85 }}>
            <div className="pc-badge-dev">Bientôt disponible</div>
            <div className="pc-header">
              <div className="pc-icon g">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M4 17V5" stroke="#4A7353" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M4 6l8-3v5l-8 3V6z" stroke="#4A7353" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pc-plan">Kordia Étape</div>
              <div className="pc-price">24<span style={{ fontSize: '22px' }}>,99</span><sup>€</sup></div>
              <div className="pc-period">par mois · hébergement multi-espaces</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGray />Chambres &amp; dortoirs simultanés</li>
              <li><CheckGray />Réservation par lit ou par chambre</li>
              <li><CheckGray />Gestion demi-pension</li>
              <li><CheckGray />Planification multi-espaces</li>
            </ul>
            <span className="pc-dev-cta">Bientôt disponible</span>
          </div>

        </div>

        {/* FAQ — objections handled at the decision point */}
        <div className="pricing-faq reveal">
          <h3 className="pfaq-title">Questions fréquentes</h3>
          <div className="pfaq-grid">
            {faq.map((item, i) => (
              <div key={i} className="pfaq-item">
                <div className="pfaq-q">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="7" cy="7" r="5.5" stroke="#7F77DD" strokeWidth="1.2"/>
                    <path d="M5.5 5.5c0-1 .7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.2-1.5 1.5v.5" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r=".6" fill="#7F77DD"/>
                  </svg>
                  {item.q}
                </div>
                <div className="pfaq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
