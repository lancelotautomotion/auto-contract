import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';

import '@/styles/pages.css';

import NavPages from '@/components/landing/NavPages';
import ScrollToTop from '@/components/landing/ScrollToTop';
import Footer from '@/components/landing/Footer';
import { IcoFileText, IcoHome, IcoCalendarDays, IcoClock, IcoCheckSquare, IcoStar, IcoMail, IcoArrowRight } from '@/components/icons';
import ScrollReveal from '@/app/ScrollReveal';

export const metadata: Metadata = {
  title: 'À propos — Kordia',
  description: 'Derrière Kordia : une équipe qui croit que les propriétaires de gîtes méritent des outils aussi bons que les pros.',
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

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-inner">
          <div className="about-text reveal">
            <div className="ph-tag">À propos</div>
            <h1>Derrière<br /><span className="g">Kordia.</span></h1>
            <p className="lead">Kordia est né d&apos;un constat simple : les propriétaires de gîtes méritent des outils <strong>aussi professionnels</strong> que ceux des grandes plateformes — sans la complexité ni les commissions.</p>
            <p className="lead">Un outil unique qui centralise vos réservations, génère vos contrats et les fait signer en ligne. <strong>Tout le cycle administratif d&apos;une réservation</strong>, depuis un seul endroit.</p>
          </div>
          <div className="logo-showcase reveal reveal-d2">
            <Image src="/logotype_KORDIA.svg" alt="Logo Kordia" width={240} height={60} style={{ width: '300px', height: 'auto' }} />
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="mission">
        <div className="mission-inner">
          <div className="mission-header reveal">
            <h2>Ce que Kordia rend <span style={{ color: 'var(--green)' }}>possible.</span></h2>
            <p>Un seul outil pour tout le cycle administratif de vos réservations.</p>
          </div>
          <div className="mission-grid">
            <div className="mission-card reveal reveal-d1">
              <div className="mc-icon g">
                <IcoFileText size={20} strokeWidth={1.4} color="#689D71" />
              </div>
              <div className="mc-title">Contrats auto-générés</div>
              <div className="mc-desc">À partir de vos infos de réservation, le contrat se crée tout seul. Personnalisable clause par clause, conforme à la loi ALUR.</div>
            </div>
            <div className="mission-card reveal reveal-d2">
              <div className="mc-icon v">
                <IcoHome size={20} strokeWidth={1.4} color="#7F77DD" />
              </div>
              <div className="mc-title">Signature en ligne</div>
              <div className="mc-desc">Votre locataire signe en 30 secondes depuis son téléphone. Conforme eIDAS, horodatée, juridiquement valable.</div>
            </div>
            <div className="mission-card reveal reveal-d3">
              <div className="mc-icon g">
                <IcoCalendarDays size={20} strokeWidth={1.4} color="#689D71" />
              </div>
              <div className="mc-title">Suivi centralisé</div>
              <div className="mc-desc">Calendrier des réservations avec le statut de chaque contrat en temps réel. Plus jamais de flou sur l&apos;état d&apos;une réservation.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values">
        <div className="values-inner">
          <div className="values-header reveal">
            <h2>Nos <span className="v">valeurs.</span></h2>
            <p>Ce qui guide chaque décision produit chez Kordia.</p>
          </div>
          <div className="values-grid">
            <div className="val-card reveal reveal-d1">
              <div className="val-icon g">
                <IcoClock size={22} strokeWidth={1.4} color="#4A7353" />
              </div>
              <div className="val-title">Simplicité</div>
              <div className="val-desc">Pas de formation, pas de complexité. Si c&apos;est pas simple, c&apos;est pas Kordia.</div>
            </div>
            <div className="val-card reveal reveal-d2">
              <div className="val-icon v">
                <IcoCheckSquare size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Transparence</div>
              <div className="val-desc">Tarifs clairs, pas de frais cachés. Vous savez exactement ce que vous payez et pourquoi.</div>
            </div>
            <div className="val-card reveal reveal-d3">
              <div className="val-icon g">
                <IcoStar size={22} strokeWidth={1.4} color="#4A7353" />
              </div>
              <div className="val-title">Indépendance</div>
              <div className="val-desc">On aide les propriétaires à se libérer des plateformes. Votre gîte, vos règles, vos revenus.</div>
            </div>
            <div className="val-card reveal reveal-d4">
              <div className="val-icon v">
                <IcoHome size={22} strokeWidth={1.4} color="#5B52B5" />
              </div>
              <div className="val-title">Proximité</div>
              <div className="val-desc">Un humain derrière chaque réponse. Pas de chatbot, pas de ticket perdu. On est là.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="founder">
        <div className="founder-inner reveal">
          <div className="founder-avatar">LL</div>
          <div className="founder-info">
            <h3>Lancelot Loubier</h3>
            <div className="role">Fondateur de Kordia</div>
            <p>Passionné d&apos;automatisation et de produits bien pensés, j&apos;ai créé Kordia après avoir constaté que des milliers de propriétaires de gîtes gèrent encore leurs contrats à la main — sur Word, par email, sans suivi.</p>
            <p>Mon objectif : donner à chaque propriétaire indépendant les mêmes outils qu&apos;un professionnel, en gardant la simplicité au centre de tout.</p>
            <a className="founder-link" href="mailto:contact@kordia.fr">
              <IcoMail size={14} strokeWidth={1.4} color="#7F77DD" />
              contact@kordia.fr
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-inner reveal">
          <h2>Prêt à simplifier votre gestion ?</h2>
          <p>Essayez Kordia gratuitement pendant 1 mois. Sans carte bancaire.</p>
          <Link className="btn-white" href="/sign-up">
            Démarrer l&apos;essai gratuit
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
