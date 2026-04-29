import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';

import '@/styles/pages.css';

import NavPages from '@/components/landing/NavPages';
import Footer from '@/components/landing/Footer';
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
            <Image src="/logotype_kordia.png" alt="Logo Kordia" width={240} height={60} style={{ width: '240px', height: 'auto' }} />
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
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <rect x="3" y="2" width="14" height="16" rx="2" stroke="#689D71" strokeWidth="1.4"/>
                  <path d="M7 7h6M7 10h4M7 13h5" stroke="#689D71" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="mc-title">Contrats auto-générés</div>
              <div className="mc-desc">À partir de vos infos de réservation, le contrat se crée tout seul. Personnalisable clause par clause, conforme à la loi ALUR.</div>
            </div>
            <div className="mission-card reveal reveal-d2">
              <div className="mc-icon v">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M4 16V8l6-5 6 5v8" stroke="#7F77DD" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 16v-4h4v4" stroke="#7F77DD" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="mc-title">Signature en ligne</div>
              <div className="mc-desc">Votre locataire signe en 30 secondes depuis son téléphone. Conforme eIDAS, horodatée, juridiquement valable.</div>
            </div>
            <div className="mission-card reveal reveal-d3">
              <div className="mc-icon g">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <rect x="2" y="4" width="16" height="13" rx="2" stroke="#689D71" strokeWidth="1.4"/>
                  <path d="M2 8h16" stroke="#689D71" strokeWidth="1.4"/>
                  <path d="M7 2v4M13 2v4" stroke="#689D71" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
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
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <circle cx="11" cy="11" r="8" stroke="#4A7353" strokeWidth="1.4"/>
                  <path d="M11 7v4l3 2" stroke="#4A7353" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="val-title">Simplicité</div>
              <div className="val-desc">Pas de formation, pas de complexité. Si c&apos;est pas simple, c&apos;est pas Kordia.</div>
            </div>
            <div className="val-card reveal reveal-d2">
              <div className="val-icon v">
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <rect x="3" y="5" width="16" height="12" rx="2" stroke="#5B52B5" strokeWidth="1.4"/>
                  <path d="M8 10l2 2 4-4" stroke="#5B52B5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="val-title">Transparence</div>
              <div className="val-desc">Tarifs clairs, pas de frais cachés. Vous savez exactement ce que vous payez et pourquoi.</div>
            </div>
            <div className="val-card reveal reveal-d3">
              <div className="val-icon g">
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <path d="M11 3l3 6h6l-5 4 2 6-6-3.5L5 19l2-6-5-4h6z" stroke="#4A7353" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="val-title">Indépendance</div>
              <div className="val-desc">On aide les propriétaires à se libérer des plateformes. Votre gîte, vos règles, vos revenus.</div>
            </div>
            <div className="val-card reveal reveal-d4">
              <div className="val-icon v">
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <path d="M4 17V9l7-6 7 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" stroke="#5B52B5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="#7F77DD" strokeWidth="1.1"/>
                <path d="M2 4l5 3.5L12 4" stroke="#7F77DD" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
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
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ verticalAlign: 'middle', marginLeft: '4px' }}>
              <path d="M3 8h10m-4-4l4 4-4 4" stroke="#5B52B5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
      <ScrollReveal />
    </div>
  );
}
