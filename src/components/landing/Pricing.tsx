import Link from 'next/link';
import { Check, HelpCircle, Zap, LayoutGrid, Flag } from 'lucide-react';

const CheckViolet = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: '#EFEEF9', flexShrink: 0 }}>
    <Check size={10} strokeWidth={1.6} color="#5B52B5" />
  </span>
);

const CheckGray = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: '#F0F0EE', flexShrink: 0 }}>
    <Check size={10} strokeWidth={1.6} color="#A3A3A0" />
  </span>
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

          {/* Essentiel — featured */}
          <div className="pc feat reveal reveal-d1">
            <div className="pc-badge">Le plus choisi</div>
            <div className="pc-header">
              <div className="pc-icon v">
                <Zap size={20} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="pc-plan">Essentiel</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71716E', marginBottom: '6px' }}>Propriétaires de gîtes &amp; meublés</div>
              <div className="pc-price"><span style={{ fontSize: '15px', fontWeight: 600, color: '#71716E', marginRight: '6px' }}>dès</span>10 €</div>
              <div className="pc-period">par mois · 1 hébergement</div>
              <div style={{ fontSize: '12px', color: '#71716E', marginTop: '6px', lineHeight: 1.4 }}>puis 20 €/mois de 2 à 5 hébergements entiers</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckViolet />Contrats automatiques illimités</li>
              <li><CheckViolet />Signature conforme eIDAS</li>
              <li><CheckViolet />Relances automatiques</li>
            </ul>
            <Link className="btn btn-violet" style={{ width: '100%' }} href="/sign-up">
              Essayer gratuitement 30 jours
            </Link>
          </div>

          {/* Maison d'Hôtes — en développement */}
          <div className="pc reveal reveal-d2" style={{ opacity: 0.85 }}>
            <div className="pc-badge-dev">Bientôt disponible</div>
            <div className="pc-header">
              <div className="pc-icon g">
                <LayoutGrid size={20} strokeWidth={1.4} color="#4A7353" />
              </div>
              <div className="pc-plan">Maison d&apos;Hôtes</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71716E', marginBottom: '6px' }}>Propriétaires de chambres d&apos;hôtes</div>
              <div className="pc-price">20 €</div>
              <div className="pc-period">par mois · jusqu&apos;à 5 chambres (1 même site)</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGray />Tout le plan Essentiel</li>
              <li><CheckGray />Réservation par chambre</li>
              <li><CheckGray />Gestion de la demi-pension</li>
            </ul>
            <span className="pc-dev-cta">Bientôt disponible</span>
          </div>

          {/* Kordia Étape — en développement */}
          <div className="pc reveal reveal-d3" style={{ opacity: 0.85 }}>
            <div className="pc-badge-dev">Bientôt disponible</div>
            <div className="pc-header">
              <div className="pc-icon g">
                <Flag size={20} strokeWidth={1.4} color="#4A7353" />
              </div>
              <div className="pc-plan">Kordia Étape</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71716E', marginBottom: '6px' }}>Gîtes d&apos;étape, auberges, dortoirs</div>
              <div className="pc-price">25 €</div>
              <div className="pc-period">par mois · hébergements multi-espaces</div>
            </div>
            <hr className="pc-div" />
            <ul className="pc-feat">
              <li><CheckGray />Tout le plan Maison d&apos;Hôtes</li>
              <li><CheckGray />Réservation par lit / dortoir</li>
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
                  <HelpCircle size={14} strokeWidth={1.4} color="#7F77DD" style={{ flexShrink: 0, marginTop: '2px' }} />
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
