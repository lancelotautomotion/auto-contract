import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';

import '@/styles/pages.css';

import NavPages from '@/components/landing/NavPages';
import ScrollToTop from '@/components/landing/ScrollToTop';
import Footer from '@/components/landing/Footer';
import { IcoFileText, IcoFileCheck, IcoCalendarDays, IcoClock, IcoCheckSquare, IcoStar, IcoHome, IcoArrowRight } from '@/components/icons';
import ScrollReveal from '@/app/ScrollReveal';

export const metadata: Metadata = {
  title: 'À propos — Kordia',
  description: "L'histoire derrière Kordia : un outil né d'un gîte familial, pour libérer les propriétaires indépendants de la paperasse.",
};

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export default function AProposPage() {
  return (
    <div className={font.className}>
      <NavPages />

      {/* Hero & Storytelling */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <div className="about-text reveal">
            <div className="ph-tag">Notre histoire</div>
            <h1>L&apos;histoire derrière<br /><span className="g">Kordia.</span></h1>
            <p className="lead">Mes parents tiennent un gîte depuis que je suis gamin. Et depuis tout petit, je leur file un coup de main, surtout sur la paperasse.</p>
            <p className="lead">Les contrats de location, c&apos;était toujours la même galère : <strong>une heure sur Word</strong>, des relances pour récupérer la signature, le doute de savoir si tout était bien en règle, et un suivi au cas par cas.</p>
            <p className="lead">Alors j&apos;ai fini par leur construire <strong>un outil sur mesure.</strong></p>
          </div>

          <figure className="about-quote reveal reveal-d2">
            <div className="aq-mark">&ldquo;</div>
            <blockquote>
              On méritait tous un outil aussi pro que les grandes plateformes — sans la complexité, ni les commissions.
            </blockquote>
            <figcaption className="aq-author">
              <span className="aq-avatar">LL</span>
              <span className="aq-meta">
                <span className="aq-name">Lancelot Loubier</span>
                <span className="aq-role">Fondateur de Kordia</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* La Solution */}
      <section className="mission">
        <div className="mission-inner">
          <div className="mission-header reveal">
            <h2>Ce que Kordia rend <span style={{ color: 'var(--green)' }}>possible.</span></h2>
            <p>En le faisant pour mes parents, je me suis dit que d&apos;autres gérants vivaient sûrement la même chose. Voici le résultat :</p>
          </div>
          <div className="mission-grid">
            <div className="mission-card reveal reveal-d1">
              <div className="mc-icon g">
                <IcoFileText size={20} strokeWidth={1.4} color="#689D71" />
              </div>
              <div className="mc-title">Contrats auto-générés</div>
              <div className="mc-desc">Le gérant envoie un formulaire en ligne, le contrat se crée en 1 clic et part par email. Personnalisable et conforme loi ALUR.</div>
            </div>
            <div className="mission-card reveal reveal-d2">
              <div className="mc-icon v">
                <IcoFileCheck size={20} strokeWidth={1.4} color="#7F77DD" />
              </div>
              <div className="mc-title">Signature en 30 secondes</div>
              <div className="mc-desc">Le locataire signe depuis son mobile. Sans imprimer, sans scanner, sans compte. 100% légal (eIDAS).</div>
            </div>
            <div className="mission-card reveal reveal-d3">
              <div className="mc-icon g">
                <IcoCalendarDays size={20} strokeWidth={1.4} color="#689D71" />
              </div>
              <div className="mc-title">Suivi centralisé</div>
              <div className="mc-desc">Calendrier des réservations avec le statut de chaque contrat en temps réel. Fini le flou.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="values">
        <div className="values-inner">
          <div className="values-header reveal">
            <h2>Nos <span className="v">valeurs.</span></h2>
            <p>Ce qui guide chaque décision produit chez Kordia.</p>
          </div>
          <div className="values-grid">
            <div className="val-card reveal reveal-d1">
              <div className="val-icon v">
                <IcoClock size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Simplicité</div>
              <div className="val-desc">Pas de formation, pas de complexité. Si c&apos;est pas simple, c&apos;est pas Kordia.</div>
            </div>
            <div className="val-card reveal reveal-d2">
              <div className="val-icon v">
                <IcoCheckSquare size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Transparence</div>
              <div className="val-desc">Tarifs clairs, pas de frais cachés. Vous savez ce que vous payez.</div>
            </div>
            <div className="val-card reveal reveal-d3">
              <div className="val-icon v">
                <IcoStar size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Indépendance</div>
              <div className="val-desc">On aide les propriétaires à se libérer des plateformes. Vos règles, vos revenus.</div>
            </div>
            <div className="val-card reveal reveal-d4">
              <div className="val-icon v">
                <IcoHome size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Proximité</div>
              <div className="val-desc">Un humain derrière chaque réponse. Pas de ticket perdu. On est là.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-inner reveal">
          <h2>Prêt à simplifier votre gestion ?</h2>
          <p>Essayez Kordia gratuitement pendant 1 mois. Sans carte bancaire.</p>
          <Link className="btn-white" href="/sign-up">
            Commencer l&apos;essai gratuit
            <IcoArrowRight size={16} strokeWidth={1.5} color="#5B52B5" style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
          </Link>
        </div>
      </section>

      <Footer />
      <ScrollReveal />
      <ScrollToTop />
    </div>
  );
}
