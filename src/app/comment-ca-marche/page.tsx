import Link from "next/link";
import FaqAccordion from "./FaqAccordion";

const tk = {
  ink:      '#0A0A0B',
  inkSoft:  '#4B5563',
  inkMuted: '#9CA3AF',
  white:    '#FFFFFF',
  surface:  '#F9FAFB',
  border:   '#E5E7EB',
  blue:     '#2563EB',
  font:     'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
        * { box-sizing: border-box; }
        .ccm-nav-links { display: flex; align-items: center; gap: 28px; }
        .ccm-nav-cta-mobile { display: none !important; }
        .ccm-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .ccm-step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .ccm-faq-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 80px; align-items: start; }

        @media (max-width: 900px) {
          .ccm-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .ccm-step-grid { grid-template-columns: 1fr; gap: 32px; }
          .ccm-faq-grid { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 768px) {
          .ccm-nav-links { display: none !important; }
          .ccm-nav-cta-mobile { display: block !important; }
          .ccm-pad { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', backgroundColor: tk.white, fontFamily: tk.font, color: tk.ink }}>

        {/* ── Nav ── */}
        <nav style={{ background: tk.ink, padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1F1F23' }} className="ccm-pad">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logotype_prysme.png" alt="Prysme" height={26} style={{ display: 'block', filter: 'brightness(0) invert(1)' }} />
          </Link>
          <div className="ccm-nav-links">
            <Link href="/" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 400 }}>Accueil</Link>
            <a href="/#tarifs" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 400 }}>Tarifs</a>
            <Link href="/sign-in" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 400 }}>Connexion</Link>
            <Link href="/sign-up" style={{ fontSize: '13px', fontWeight: 600, padding: '8px 18px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px' }}>
              Démarrer gratuitement
            </Link>
          </div>
          <Link href="/sign-up" className="ccm-nav-cta-mobile" style={{ display: 'none', fontSize: '13px', fontWeight: 600, padding: '8px 16px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px' }}>
            Démarrer
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section style={{ background: tk.ink, padding: '72px 40px 80px', borderBottom: `1px solid #1F1F23` }} className="ccm-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="ccm-hero-grid">
              {/* Texte */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Comment ça marche</p>
                <h1 style={{ fontFamily: tk.font, fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: tk.white, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                  De la réservation<br />au contrat signé,<br />en 3 minutes.
                </h1>
                <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '40px', fontWeight: 400, maxWidth: '420px' }}>
                  Prysme automatise tout ce qui suit une réservation. Voici exactement comment ça se passe, étape par étape.
                </p>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
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
                          ? <span style={{ fontSize: '14px', color: tk.ink }}>✓</span>
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
          <section key={step.n} style={{ background: i % 2 === 0 ? tk.white : tk.surface, borderBottom: `1px solid ${tk.border}`, padding: '80px 40px' }} className="ccm-pad">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="ccm-step-grid">
                {/* Texte (alterne gauche/droite) */}
                <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '48px', fontWeight: 800, color: tk.border, letterSpacing: '-0.04em', lineHeight: 1, fontFamily: tk.font }}>{step.n}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: tk.blue, background: '#EFF6FF', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.04em' }}>{step.badge}</span>
                  </div>
                  <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: tk.ink, marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{step.title}</h2>
                  <p style={{ fontSize: '15px', color: tk.inkSoft, lineHeight: 1.7, marginBottom: '28px', fontWeight: 400 }}>{step.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {step.points.map(pt => (
                      <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}><circle cx="8" cy="8" r="8" fill="#EFF6FF"/><path d="M5 8l2.5 2.5 3.5-3.5" stroke={tk.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: '14px', color: tk.ink, lineHeight: 1.5, fontWeight: 400 }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Visuel placeholder card */}
                <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                  <div style={{ background: tk.surface, borderRadius: '12px', border: `1px solid ${tk.border}`, padding: '32px', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                    {/* Simulated UI elements */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ height: '10px', background: tk.border, borderRadius: '4px', width: '40%' }} />
                      <div style={{ height: '28px', background: tk.ink, borderRadius: '6px', width: '80px' }} />
                    </div>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ height: '8px', background: tk.border, borderRadius: '3px', width: `${55 + j * 10}%` }} />
                      </div>
                    ))}
                    <div style={{ marginTop: '8px', padding: '12px', background: tk.white, borderRadius: '8px', border: `1px solid ${tk.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ height: '9px', background: tk.ink, borderRadius: '3px', width: '120px', marginBottom: '6px' }} />
                        <div style={{ height: '7px', background: tk.border, borderRadius: '3px', width: '80px' }} />
                      </div>
                      <div style={{ height: '22px', background: '#EFF6FF', borderRadius: '100px', width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '10px', color: tk.blue, fontWeight: 600 }}>Étape {step.n}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* ── FAQ ── */}
        <section style={{ background: tk.white, padding: '96px 40px', borderBottom: `1px solid ${tk.border}` }} className="ccm-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="ccm-faq-grid">
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>FAQ</p>
                <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '16px' }}>
                  Vos questions,<br />nos réponses.
                </h2>
                <p style={{ fontSize: '14px', color: tk.inkSoft, lineHeight: 1.6, fontWeight: 400 }}>
                  Une question absente ? Écrivez-nous à<br />
                  <a href="mailto:contact@prysme.fr" style={{ color: tk.blue, textDecoration: 'none' }}>contact@prysme.fr</a>
                </p>
              </div>
              <FaqAccordion />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: tk.ink, padding: '96px 40px' }} className="ccm-pad">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.white, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
              Prêt à gagner<br />30 min par réservation ?
            </h2>
            <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '36px', fontWeight: 400 }}>
              Configuration en 5 minutes. 30 jours gratuits. Aucune CB requise.
            </p>
            <Link href="/sign-up" style={{ display: 'inline-block', fontSize: '15px', fontWeight: 600, padding: '14px 32px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px' }}>
              Créer mon compte gratuitement →
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: tk.white, borderTop: `1px solid ${tk.border}`, padding: '24px 40px' }} className="ccm-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logotype_prysme.png" alt="Prysme" height={22} style={{ display: 'block' }} />
            </Link>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Accueil</Link>
              <Link href="/legal/mentions-legales" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Mentions légales</Link>
              <Link href="/legal/confidentialite" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>Confidentialité</Link>
              <Link href="/legal/cgv" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none' }}>CGV</Link>
              <span style={{ fontSize: '12px', color: tk.inkMuted }}>© 2026 Prysme</span>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
