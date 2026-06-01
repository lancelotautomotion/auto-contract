import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/styles/landing.css';
import './contact.css';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/landing/ScrollToTop';
import ContactForm from './ContactForm';
import { Mail, Clock, ArrowRight, FileText } from 'lucide-react';

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
                  <Mail size={20} strokeWidth={1.4} />
                </div>
                <div className="ct-card-title">Email</div>
                <div className="ct-card-desc">Le canal préféré. On lit chaque message et on répond personnellement.</div>
                <a className="ct-card-link" href="mailto:contact@kordia.fr">
                  contact@kordia.fr
                  <ArrowRight size={14} strokeWidth={1.5} />
                </a>
              </div>

              <div className="ct-card">
                <div className="ct-ico green">
                  <Clock size={20} strokeWidth={1.4} />
                </div>
                <div className="ct-card-title">Réponse rapide</div>
                <div className="ct-card-desc">En moyenne moins de 4h sur les jours ouvrés. Pas de chatbot, un humain.</div>
              </div>

              <div className="ct-card">
                <div className="ct-ico violet">
                  <FileText size={20} strokeWidth={1.4} />
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
                  <ArrowRight size={14} strokeWidth={1.5} />
                </a>
              </div>

              <div className="ct-hours">
                <div className="ct-hours-title">
                  <Clock size={16} strokeWidth={1.3} />
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
