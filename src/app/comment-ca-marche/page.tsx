import Link from "next/link";
import '@/styles/landing.css';
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import FaqAccordion from "./FaqAccordion";

const tk = {
  ink:      '#2C2C2A',
  inkSoft:  '#71716E',
  inkMuted: '#A3A3A0',
  white:    '#FFFFFF',
  surface:  '#F3F2EE',
  border:   '#E8E6E1',
  violet:   '#7F77DD',
  violetLight: '#EFEEF9',
  violetDark:  '#5B52B5',
  green:       '#689D71',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
};

const steps = [
  {
    n: '01', badge: '5 min · une seule fois',
    title: 'Configurez votre gîte',
    desc: 'Créez votre compte, renseignez les informations de votre établissement, importez votre logo et vos documents. Votre template de contrat est prêt à l\'emploi.',
    points: ['Nom, adresse et coordonnées du gîte', 'Logo sur le contrat et dans les emails', 'RIB et règlement intérieur joints automatiquement', 'Options à la carte (ménage, bain nordique…)'],
  },
  {
    n: '02', badge: '2 min · par réservation',
    title: 'Saisissez la réservation',
    desc: 'Pour chaque séjour, renseignez les coordonnées du locataire, les dates, le loyer et les options. Tout centralisé dans une seule fiche.',
    points: ['Prénom, nom, email, téléphone, adresse', 'Dates d\'arrivée et de départ', 'Loyer, acompte, frais de ménage, taxe de séjour', 'Options sélectionnables en un clic'],
  },
  {
    n: '03', badge: '1 clic · automatique',
    title: 'Envoyez le contrat',
    desc: 'Un clic génère le contrat PDF avec toutes les informations pré-remplies et envoie un email professionnel au locataire avec toutes les pièces jointes.',
    points: ['Contrat PDF généré instantanément', 'Email avec logo de votre gîte', 'RIB et règlement intérieur joints', 'Suivi du statut en temps réel'],
  },
  {
    n: '04', badge: 'Côté locataire · mobile',
    title: 'Le locataire signe en ligne',
    desc: 'Votre locataire reçoit l\'email, lit le contrat dans son navigateur et le signe électroniquement. Aucune impression, aucun scan.',
    points: ['Accessible depuis n\'importe quel appareil', 'Lecture du contrat complet avant signature', 'Signature horodatée pour valeur légale', 'IP enregistrée automatiquement'],
  },
  {
    n: '05', badge: 'Automatique · immédiat',
    title: 'Les deux parties reçoivent le PDF signé',
    desc: 'Dès la signature, Prysme envoie le contrat signé en PDF au locataire et à vous. Le statut passe à "Signé" dans votre dashboard.',
    points: ['PDF signé envoyé au locataire par email', 'Copie automatique envoyée au gérant', 'Statut mis à jour dans le dashboard', 'Archivé et consultable à tout moment'],
  },
];

export default function CommentCaMarche() {
  return (
    <>
      <style>{`
        .ccm-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .ccm-step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .ccm-faq-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 80px; align-items: start; }
        .ccm-section { padding: 80px 40px; }
        .ccm-hero-sec { padding: 72px 40px 80px; }
        .ccm-cta-sec { padding: 96px 40px; }

        @media (max-width: 900px) {
          .ccm-hero-grid { grid-template-columns: 1fr; gap: 32px; }
          .ccm-step-grid { grid-template-columns: 1fr; gap: 28px; }
          .ccm-faq-grid { grid-template-columns: 1fr; gap: 28px; }
          .ccm-section { padding: 56px 24px; }
          .ccm-hero-sec { padding: 48px 24px 56px; }
          .ccm-cta-sec { padding: 64px 24px; }
        }
        @media (max-width: 640px) {
          .ccm-section { padding: 48px 20px; }
          .ccm-hero-sec { padding: 36px 20px 48px; }
          .ccm-cta-sec { padding: 56px 20px; }
          .ccm-step-visual { min-height: 220px !important; padding: 24px !important; }
          .ccm-step-text { order: 0 !important; }
          .ccm-step-vis  { order: 1 !important; }
        }
      `}</style>

      <Nav />

      <main style={{ fontFamily: tk.font, color: tk.ink, backgroundColor: tk.white }}>

        {/* ── Hero ── */}
        <section className="ccm-hero-sec" style={{ background: tk.ink, borderBottom: '1px solid #1F1F23' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="ccm-hero-grid">
              {/* Texte */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: tk.violet, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Comment ça marche</p>
                <h1 style={{ fontFamily: tk.font, fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: tk.white, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                  De la réservation<br />au contrat signé,<br />en 3 minutes.
                </h1>
                <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '32px', fontWeight: 400, maxWidth: '460px' }}>
                  Prysme automatise tout ce qui suit une réservation. Voici exactement comment ça se passe, étape par étape.
                </p>
                <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                  {[{ v: '5 min', l: 'config initiale' }, { v: '2 min', l: 'par réservation' }, { v: '1 clic', l: 'pour envoyer' }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: tk.white, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Visuel flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { n: '01', label: 'Réservation enregistrée', sub: 'Marie Dupont · 3 nuits · 14 juillet', done: false },
                  { n: '02', label: 'Contrat généré & envoyé', sub: 'PDF + email professionnel avec pièces jointes', done: false },
                  { n: '03', label: 'Contrat signé', sub: 'Les deux parties reçoivent le PDF signé', done: true },
                ].map(({ n, label, sub, done }, i) => (
                  <div key={n} style={{ position: 'relative' }}>
                    {i < 2 && <div style={{ position: 'absolute', left: '17px', top: '44px', width: '1px', height: '20px', background: '#27272A' }} />}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: done ? '#18181B' : '#111113', borderRadius: '10px', border: `1px solid ${done ? '#27272A' : '#1F1F23'}`, padding: '16px 20px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: done ? tk.white : '#18181B', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke={tk.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <span style={{ fontSize: '11px', fontWeight: 600, color: '#52525B' }}>{n}</span>
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: done ? tk.white : '#E4E4E7', marginBottom: '3px' }}>{label}</div>
                        <div style={{ fontSize: '11px', color: '#52525B' }}>{sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Étapes détaillées ── */}
        {steps.map((step, i) => (
          <section key={step.n} className="ccm-section" style={{ background: i % 2 === 0 ? tk.white : tk.surface, borderBottom: `1px solid ${tk.border}` }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="ccm-step-grid">
                {/* Texte (alterne gauche/droite sur desktop) */}
                <div className="ccm-step-text" style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '44px', fontWeight: 800, color: tk.border, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: tk.font }}>{step.n}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: tk.violetDark, background: tk.violetLight, padding: '5px 12px', borderRadius: '100px', letterSpacing: '0.04em' }}>{step.badge}</span>
                  </div>
                  <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: tk.ink, marginBottom: '14px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{step.title}</h2>
                  <p style={{ fontSize: '15px', color: tk.inkSoft, lineHeight: 1.7, marginBottom: '24px', fontWeight: 400 }}>{step.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {step.points.map(pt => (
                      <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}><circle cx="8" cy="8" r="8" fill={tk.violetLight} /><path d="M5 8l2.5 2.5 3.5-3.5" stroke={tk.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: '14px', color: tk.ink, lineHeight: 1.5, fontWeight: 400 }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Visuel placeholder card */}
                <div className="ccm-step-vis" style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <div className="ccm-step-visual" style={{ background: i % 2 === 0 ? tk.surface : tk.white, borderRadius: '14px', border: `1px solid ${tk.border}`, padding: '32px', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ height: '10px', background: tk.border, borderRadius: '4px', width: '40%' }} />
                      <div style={{ height: '28px', background: tk.ink, borderRadius: '6px', width: '80px' }} />
                    </div>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ height: '8px', background: tk.border, borderRadius: '3px', width: `${55 + j * 10}%` }} />
                      </div>
                    ))}
                    <div style={{ marginTop: '8px', padding: '12px', background: i % 2 === 0 ? tk.white : tk.surface, borderRadius: '8px', border: `1px solid ${tk.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ height: '9px', background: tk.ink, borderRadius: '3px', width: '120px', marginBottom: '6px' }} />
                        <div style={{ height: '7px', background: tk.border, borderRadius: '3px', width: '80px' }} />
                      </div>
                      <div style={{ padding: '4px 12px', background: tk.violetLight, borderRadius: '100px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: tk.violetDark, fontWeight: 600 }}>Étape {step.n}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── FAQ ── */}
        <section className="ccm-section" style={{ background: tk.white, borderBottom: `1px solid ${tk.border}` }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="ccm-faq-grid">
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: tk.violet, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>FAQ</p>
                <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '16px' }}>
                  Vos questions,<br />nos réponses.
                </h2>
                <p style={{ fontSize: '14px', color: tk.inkSoft, lineHeight: 1.6, fontWeight: 400 }}>
                  Une question absente ? Écrivez-nous à<br />
                  <a href="mailto:contact@prysme.app" style={{ color: tk.violet, textDecoration: 'none' }}>contact@prysme.app</a>
                </p>
              </div>
              <FaqAccordion />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ccm-cta-sec" style={{ background: tk.ink }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.white, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
              Prêt à gagner<br />30 min par réservation&nbsp;?
            </h2>
            <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '32px', fontWeight: 400 }}>
              Configuration en 5 minutes. 30 jours gratuits. Aucune carte bancaire requise.
            </p>
            <Link href="/sign-up" className="btn btn-violet btn-lg" style={{ padding: '14px 30px' }}>
              Créer mon compte gratuitement
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M3 8h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
