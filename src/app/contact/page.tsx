import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import '@/styles/pages.css';

import NavPages from '@/components/landing/NavPages';
import Footer from '@/components/landing/Footer';
import ScrollReveal from '@/app/ScrollReveal';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Prysme',
  description: 'Une question ? On est là. Contactez l\'équipe Prysme — réponse sous 24h.',
};

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export default function ContactPage() {
  return (
    <div className={font.className}>
      <NavPages />

      <div className="page-header">
        <div className="page-header-inner reveal">
          <div className="ph-tag">Contact</div>
          <h1>Une question<span className="v"> ?</span><br />On est là.</h1>
          <p>Besoin d&apos;aide, question sur les tarifs ou envie de nous dire bonjour — écrivez-nous, on répond sous 24h.</p>
        </div>
      </div>

      <section className="contact-section">
        <div className="contact-inner">

          {/* Info cards */}
          <div className="contact-info">
            <div className="ci-card reveal">
              <div className="ci-card-icon v">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M2 5l7 5 7-5" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="14" height="10" rx="2" stroke="#5B52B5" strokeWidth="1.3"/>
                </svg>
              </div>
              <div className="ci-card-title">Email</div>
              <div className="ci-card-desc">Pour toute question commerciale ou support technique.</div>
              <a className="ci-card-link" href="mailto:contact@prysme.app">
                contact@prysme.app
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7h8m-3-3l3 3-3 3" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="ci-card reveal reveal-d1">
              <div className="ci-card-icon g">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <circle cx="9" cy="9" r="7" stroke="#4A7353" strokeWidth="1.3"/>
                  <path d="M9 5v4l2.5 1.5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="ci-card-title">Réponse rapide</div>
              <div className="ci-card-desc">On répond en moyenne en moins de 4 heures sur les jours ouvrés. Pas de chatbot, un humain.</div>
            </div>

            <div className="ci-card reveal reveal-d2">
              <div className="ci-card-icon v">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M9 2C5.7 2 3 4.2 3 7c0 1.7 1 3.2 2.5 4.1L5 15l2.5-1.5c.5.1 1 .2 1.5.2 3.3 0 6-2.2 6-5s-2.7-5-6-5z" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="ci-card-title">Démo personnalisée</div>
              <div className="ci-card-desc">Envie de voir Prysme en action ? Demandez une démo de 15 min et on vous montre tout.</div>
              <a className="ci-card-link" href="mailto:contact@prysme.app?subject=Demande%20de%20démo">
                Réserver un créneau
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7h8m-3-3l3 3-3 3" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="ci-hours reveal reveal-d3">
              <div className="ci-hours-title">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.2"/>
                  <path d="M8 5v3l2 1.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Horaires de support
              </div>
              <div className="ci-hours-row"><span>Lundi – Vendredi</span><strong>9h – 18h</strong></div>
              <div className="ci-hours-row"><span>Samedi</span><strong>10h – 14h</strong></div>
              <div className="ci-hours-row"><span>Dimanche</span><strong>Fermé</strong></div>
              <div className="ci-hours-badge">En ligne maintenant</div>
            </div>
          </div>

          <ContactForm />

        </div>
      </section>

      <Footer />
      <ScrollReveal />
    </div>
  );
}
