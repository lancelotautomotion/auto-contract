import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/styles/landing.css';
import './contact.css';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/landing/ScrollToTop';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Kordia',
  description: "Une question ? Écrivez-nous, réponse sous 24h ouvrées — contact@kordia.fr.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />

      <main className="ct-main">

        {/* ── Hero ── */}
        <section className="ct-hero">
          <div className="ct-hero-inner">
            <p className="ct-eyebrow">Contact</p>
            <h1>
              Une question&nbsp;?<br />
              <span className="v">On est là.</span>
            </h1>
            <p className="ct-hero-sub">
              Support, commercial, démo ou simple bonjour — écrivez-nous.
              Réponse sous <strong>24h ouvrées</strong>, par un humain.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="ct-section">
          <div className="ct-inner">

            {/* ── Info cards (left) ── */}
            <aside className="ct-info">
              <div className="ct-card">
                <div className="ct-ico violet">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <rect x="2.5" y="4.5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2.5 5.5l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ct-card-title">Email</div>
                <div className="ct-card-desc">Le canal préféré. On lit chaque message et on répond personnellement.</div>
                <a className="ct-card-link" href="mailto:contact@kordia.fr">
                  contact@kordia.fr
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M3 7h8m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <div className="ct-card">
                <div className="ct-ico green">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 5.5v4.5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="ct-card-title">Réponse rapide</div>
                <div className="ct-card-desc">En moyenne moins de 4h sur les jours ouvrés. Pas de chatbot, un humain.</div>
              </div>

              <div className="ct-card">
                <div className="ct-ico violet">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M13 15l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ct-card-title">Démo personnalisée</div>
                <div className="ct-card-desc">Envie de voir Kordia en action&nbsp;? Réservez 15 min en visio, on vous montre tout.</div>
                <a
                  className="ct-card-link"
                  href="https://calendar.app.google/ugX8Vy3h8zeyNPhe8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Réserver un créneau
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path d="M3 7h8m-3-3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              <div className="ct-hours">
                <div className="ct-hours-title">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Horaires de support
                </div>
                <div className="ct-hours-row"><span>Lundi – Vendredi</span><strong>9h – 18h</strong></div>
                <div className="ct-hours-row"><span>Samedi</span><strong>10h – 14h</strong></div>
                <div className="ct-hours-row"><span>Dimanche</span><strong>Fermé</strong></div>
                <div className="ct-hours-badge"><span className="dot" /> En ligne maintenant</div>
              </div>
            </aside>

            {/* ── Form (right) ── */}
            <Suspense fallback={<div className="ct-form-wrap" />}>
              <ContactForm />
            </Suspense>

          </div>
        </section>

      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
