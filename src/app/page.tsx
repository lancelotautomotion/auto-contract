import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prysme — Contrats de location pour gîtes, automatisés",
  description: "Automatisez vos contrats de location saisonnière en quelques clics. Génération PDF, signature en ligne, envoi automatique. Essai gratuit, sans CB.",
};

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  prisme:      '#689D71',
  spectre:     '#7F77DD',
  clair:       '#FCFFF2',
  graphite:    '#2C2C2A',
  muted:       '#6B7A73',
  border:      '#C2D9C4',
  borderLight: '#E2EEE3',
  prismeBg:    '#EEF5EF',
  white:       '#FFFFFF',
};
const serif = 'Cormorant Garamond, Georgia, serif';
const sans  = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

// ─── Illustration prisme ─────────────────────────────────────────────────────
function PrismIllustration() {
  return (
    <svg
      viewBox="0 0 500 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: '480px', display: 'block' }}
    >
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="56%" r="46%">
          <stop offset="0%" stopColor="#EEF5EF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FCFFF2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo de fond */}
      <ellipse cx="250" cy="265" rx="228" ry="205" fill="url(#bg-glow)" />

      {/* Prisme principal */}
      <polygon points="250,58 78,392 422,392" stroke={C.border} strokeWidth="1.5" fill={C.prisme} fillOpacity="0.04" />

      {/* Couches internes */}
      <polygon points="250,58 164,225 336,225" fill={C.spectre} fillOpacity="0.05" />
      <polygon points="250,58 207,142 293,142" fill={C.prisme}  fillOpacity="0.09" />

      {/* Apex lumineux */}
      <circle cx="250" cy="58" r="4"  fill={C.prisme} opacity="0.7" />
      <circle cx="250" cy="58" r="11" fill={C.prisme} opacity="0.11" />

      {/* Faisceaux gauche */}
      <line x1="78" y1="392" x2="12"  y2="293" stroke={C.prisme}  strokeWidth="2.5" strokeLinecap="round" opacity="0.88" />
      <line x1="78" y1="392" x2="5"   y2="330" stroke={C.spectre} strokeWidth="2"   strokeLinecap="round" opacity="0.72" />
      <line x1="78" y1="392" x2="22"  y2="263" stroke={C.prisme}  strokeWidth="1.5" strokeLinecap="round" opacity="0.52" />
      <line x1="78" y1="392" x2="3"   y2="358" stroke={C.spectre} strokeWidth="1"   strokeLinecap="round" opacity="0.38" />

      {/* Faisceaux droite */}
      <line x1="422" y1="392" x2="488" y2="293" stroke={C.spectre} strokeWidth="2.5" strokeLinecap="round" opacity="0.88" />
      <line x1="422" y1="392" x2="495" y2="330" stroke={C.prisme}  strokeWidth="2"   strokeLinecap="round" opacity="0.72" />
      <line x1="422" y1="392" x2="478" y2="263" stroke={C.spectre} strokeWidth="1.5" strokeLinecap="round" opacity="0.52" />
      <line x1="422" y1="392" x2="497" y2="358" stroke={C.prisme}  strokeWidth="1"   strokeLinecap="round" opacity="0.38" />

      {/* Points gauche */}
      <circle cx="12"  cy="293" r="7"   fill={C.prisme}  opacity="0.85" />
      <circle cx="5"   cy="330" r="5.5" fill={C.spectre} opacity="0.78" />
      <circle cx="22"  cy="263" r="4"   fill={C.prisme}  opacity="0.58" />
      <circle cx="3"   cy="358" r="3"   fill={C.spectre} opacity="0.42" />

      {/* Points droite */}
      <circle cx="488" cy="293" r="7"   fill={C.spectre} opacity="0.85" />
      <circle cx="495" cy="330" r="5.5" fill={C.prisme}  opacity="0.78" />
      <circle cx="478" cy="263" r="4"   fill={C.spectre} opacity="0.58" />
      <circle cx="497" cy="358" r="3"   fill={C.prisme}  opacity="0.42" />

      {/* Éléments flottants */}
      <circle cx="390" cy="112" r="10" fill={C.spectre} opacity="0.1" />
      <circle cx="382" cy="96"  r="5"  fill={C.spectre} opacity="0.2" />
      <circle cx="118" cy="118" r="8"  fill={C.prisme}  opacity="0.1" />
      <circle cx="126" cy="103" r="4"  fill={C.prisme}  opacity="0.2" />

      {/* Lignes d'accent */}
      <line x1="340" y1="178" x2="392" y2="178" stroke={C.border} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="351" y1="188" x2="381" y2="188" stroke={C.border} strokeWidth="1"   strokeLinecap="round" />
      <line x1="108" y1="178" x2="160" y2="178" stroke={C.border} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="119" y1="188" x2="149" y2="188" stroke={C.border} strokeWidth="1"   strokeLinecap="round" />
    </svg>
  );
}

// ─── Données ─────────────────────────────────────────────────────────────────
const features = [
  {
    num: '01',
    title: 'Génération instantanée',
    desc: 'Un contrat PDF professionnel, personnalisé à votre établissement, prêt en moins de 30 secondes.',
  },
  {
    num: '02',
    title: 'Signature en ligne',
    desc: 'Vos locataires signent depuis leur téléphone ou ordinateur. Aucune impression, aucun délai.',
  },
  {
    num: '03',
    title: 'Envoi automatique',
    desc: 'Le contrat part par email dès la génération, avec vos documents joints. Zéro oubli possible.',
  },
  {
    num: '04',
    title: 'Archivage sécurisé',
    desc: 'Tous vos contrats centralisés, consultables et téléchargeables à tout moment.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Configurez votre gîte',
    desc: 'Renseignez vos informations une seule fois : tarifs, logo, documents. Cinq minutes, pas plus.',
  },
  {
    n: '02',
    title: 'Ajoutez une réservation',
    desc: 'Dates, coordonnées client, options. Une fiche complète en moins de deux minutes.',
  },
  {
    n: '03',
    title: 'Générez et envoyez',
    desc: 'Votre contrat est créé et envoyé automatiquement. Votre client signe en ligne.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .lp-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 26px; background-color: ${C.prisme}; color: #FCFFF2;
          border-radius: 10px; font-size: 14px; font-weight: 500; font-family: ${sans};
          letter-spacing: 0.01em; text-decoration: none;
          transition: background-color 0.2s, transform 0.15s; border: none; cursor: pointer;
        }
        .lp-btn-primary:hover { background-color: #5A8B62; transform: translateY(-1px); }

        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 22px; background: transparent; color: ${C.graphite};
          border-radius: 10px; font-size: 14px; font-weight: 400; font-family: ${sans};
          letter-spacing: 0.01em; text-decoration: none;
          transition: background-color 0.15s; border: 1px solid ${C.border}; cursor: pointer;
        }
        .lp-btn-ghost:hover { background-color: ${C.prismeBg}; }

        .lp-nav-link {
          font-size: 14px; color: ${C.muted}; text-decoration: none;
          padding: 4px 0; transition: color 0.15s; font-family: ${sans};
        }
        .lp-nav-link:hover { color: ${C.graphite}; }

        .lp-nav-signin {
          font-size: 13px; color: ${C.muted}; text-decoration: none;
          padding: 8px 14px; border-radius: 8px; font-family: ${sans};
          transition: background-color 0.15s, color 0.15s;
        }
        .lp-nav-signin:hover { color: ${C.graphite}; background-color: ${C.prismeBg}; }

        .lp-feature-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .lp-feature-card:hover {
          border-color: ${C.prisme} !important;
          box-shadow: 0 4px 28px rgba(104,157,113,0.1);
        }

        .lp-cta-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 16px 34px; background-color: ${C.white}; color: ${C.prisme};
          border-radius: 10px; font-size: 15px; font-weight: 500; font-family: ${sans};
          text-decoration: none; transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(44,44,42,0.1);
        }
        .lp-cta-link:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(44,44,42,0.16); }

        .lp-footer-link {
          font-size: 12px; color: rgba(252,255,242,0.42); text-decoration: none;
          font-weight: 300; transition: color 0.15s;
        }
        .lp-footer-link:hover { color: rgba(252,255,242,0.75); }

        /* Layout helpers */
        .nav-links-desktop { display: flex; }
        .nav-cta-mobile    { display: none !important; }
        .hero-grid         { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .features-grid     { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .steps-grid        { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .footer-inner      { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-links      { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }

        @media (max-width: 768px) {
          .nav-links-desktop   { display: none !important; }
          .nav-cta-mobile      { display: inline-flex !important; }
          .hero-grid           { grid-template-columns: 1fr; gap: 40px; }
          .hero-illustration   { display: none !important; }
          .features-grid       { grid-template-columns: 1fr; }
          .steps-grid          { grid-template-columns: 1fr; gap: 20px; }
          .lp-section-pad      { padding: 64px 24px !important; }
          .lp-hero-pad         { padding: 52px 24px 56px !important; }
          h1.lp-headline       { font-size: 46px !important; }
          h2.lp-section-title  { font-size: 34px !important; }
          .footer-inner        { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div style={{ fontFamily: sans, backgroundColor: C.clair, color: C.graphite }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          backgroundColor: 'rgba(252,255,242,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logotype_prysme.png" alt="Prysme" height={28} style={{ display: 'block' }} />
            </Link>

            <div className="nav-links-desktop" style={{ alignItems: 'center', gap: '32px' }}>
              <a href="#fonctionnalites" className="lp-nav-link">Fonctionnalités</a>
              <a href="#tarifs"          className="lp-nav-link">Tarifs</a>
            </div>

            <div className="nav-links-desktop" style={{ alignItems: 'center', gap: '8px' }}>
              <Link href="/sign-in"  className="lp-nav-signin">Connexion</Link>
              <Link href="/sign-up"  className="lp-btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
                Démarrer gratuitement
              </Link>
            </div>

            <Link href="/sign-up" className="nav-cta-mobile lp-btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
              Démarrer
            </Link>

          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="lp-hero-pad" style={{ maxWidth: '1080px', margin: '0 auto', padding: '88px 40px 80px' }}>
          <div className="hero-grid">

            {/* Texte */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: C.prismeBg, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '5px 14px 5px 8px', marginBottom: '32px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.prisme, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: C.prisme, letterSpacing: '0.04em', fontWeight: 500 }}>Essai gratuit · Sans carte bancaire</span>
              </div>

              <h1 className="lp-headline" style={{ fontFamily: serif, fontSize: '62px', fontWeight: 300, lineHeight: 1.07, color: C.graphite, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
                Vos contrats<br />de location,<br />
                <em style={{ fontStyle: 'italic', color: C.prisme }}>en 30 secondes.</em>
              </h1>

              <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.78, margin: '0 0 40px', maxWidth: '430px', fontWeight: 300 }}>
                Prysme génère, envoie et archive vos contrats de location saisonnière automatiquement. Gagnez des heures chaque semaine — concentrez-vous sur l&apos;accueil.
              </p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/sign-up" className="lp-btn-primary">
                  Démarrer gratuitement →
                </Link>
                <a href="#fonctionnalites" className="lp-btn-ghost">
                  Découvrir les fonctionnalités
                </a>
              </div>
            </div>

            {/* Illustration */}
            <div className="hero-illustration" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PrismIllustration />
            </div>

          </div>
        </section>

        {/* ── FONCTIONNALITÉS ──────────────────────────────────────────────── */}
        <section
          id="fonctionnalites"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}` }}
        >
          <div className="lp-section-pad" style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 40px' }}>

            <div style={{ marginBottom: '52px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: C.prisme, marginBottom: '14px', fontWeight: 500 }}>Fonctionnalités</p>
              <h2 className="lp-section-title" style={{ fontFamily: serif, fontSize: '42px', fontWeight: 300, color: C.graphite, margin: '0 0 16px', lineHeight: 1.1 }}>
                Tout ce dont vous avez besoin
              </h2>
              <p style={{ fontSize: '15px', color: C.muted, maxWidth: '460px', lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                Une plateforme pensée pour les propriétaires de gîtes qui veulent gagner du temps sans sacrifier le professionnalisme.
              </p>
            </div>

            <div className="features-grid">
              {features.map(f => (
                <div
                  key={f.title}
                  className="lp-feature-card"
                  style={{ padding: '32px', backgroundColor: C.clair, border: `1px solid ${C.borderLight}`, borderRadius: '14px' }}
                >
                  <span style={{ fontFamily: serif, fontSize: '13px', fontWeight: 400, color: C.prisme, letterSpacing: '0.12em', display: 'block', marginBottom: '18px' }}>
                    {f.num}
                  </span>
                  <h3 style={{ fontFamily: serif, fontSize: '26px', fontWeight: 400, color: C.graphite, margin: '0 0 12px', lineHeight: 1.15 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.72, margin: 0, fontWeight: 300 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────────── */}
        <section style={{ backgroundColor: C.clair }}>
          <div className="lp-section-pad" style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 40px' }}>

            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: C.prisme, marginBottom: '14px', fontWeight: 500 }}>Comment ça marche</p>
              <h2 className="lp-section-title" style={{ fontFamily: serif, fontSize: '42px', fontWeight: 300, color: C.graphite, margin: 0, lineHeight: 1.1 }}>
                Simple comme bonjour
              </h2>
            </div>

            <div className="steps-grid" style={{ position: 'relative' }}>
              {/* Ligne de connexion */}
              <div style={{ position: 'absolute', top: '31px', left: 'calc(16.67% + 16px)', right: 'calc(16.67% + 16px)', height: '1px', backgroundColor: C.border, zIndex: 0, pointerEvents: 'none' }} />

              {steps.map(s => (
                <div key={s.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '62px', height: '62px', borderRadius: '50%', backgroundColor: C.white, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 2px 14px rgba(44,44,42,0.05)' }}>
                    <span style={{ fontFamily: serif, fontSize: '20px', fontWeight: 400, color: C.prisme }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontFamily: serif, fontSize: '24px', fontWeight: 400, color: C.graphite, margin: '0 0 12px' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.72, margin: '0 auto', maxWidth: '240px', fontWeight: 300 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── TARIFS ───────────────────────────────────────────────────────── */}
        <section
          id="tarifs"
          style={{ backgroundColor: C.white, borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}` }}
        >
          <div className="lp-section-pad" style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>

            <p style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: C.prisme, marginBottom: '14px', fontWeight: 500 }}>Tarifs</p>
            <h2 className="lp-section-title" style={{ fontFamily: serif, fontSize: '42px', fontWeight: 300, color: C.graphite, margin: '0 0 14px' }}>
              Un tarif. Tout inclus.
            </h2>
            <p style={{ fontSize: '15px', color: C.muted, marginBottom: '52px', lineHeight: 1.6, fontWeight: 300 }}>
              Aucun frais caché. Sans engagement. Résiliez à tout moment.
            </p>

            <div style={{ maxWidth: '380px', margin: '0 auto', backgroundColor: C.clair, border: `1.5px solid ${C.prisme}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 48px rgba(104,157,113,0.12)' }}>

              <div style={{ padding: '36px 40px', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.prisme, marginBottom: '10px', fontWeight: 500 }}>
                  Tout inclus
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontFamily: serif, fontSize: '58px', fontWeight: 300, color: C.graphite, lineHeight: 1 }}>9,99€</span>
                  <span style={{ fontSize: '14px', color: C.muted, fontWeight: 300 }}>HT/mois</span>
                </div>
              </div>

              <div style={{ padding: '32px 40px' }}>
                {[
                  'Contrats illimités',
                  'Signature électronique incluse',
                  'Envoi automatique par email',
                  'Documents joints (RIB, règlement…)',
                  'Archivage sécurisé',
                  'Logo et personnalisation',
                  'Suivi des acomptes',
                  'Support par email',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '13px' }}>
                    <span style={{ color: C.prisme, fontSize: '14px', fontWeight: 600, lineHeight: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '14px', color: C.graphite, fontWeight: 300, textAlign: 'left' }}>{item}</span>
                  </div>
                ))}

                <Link href="/sign-up" className="lp-btn-primary" style={{ width: '100%', marginTop: '28px' }}>
                  Démarrer gratuitement →
                </Link>
                <p style={{ fontSize: '12px', color: C.muted, textAlign: 'center', marginTop: '12px', marginBottom: 0, fontWeight: 300 }}>
                  Sans carte bancaire · Sans engagement
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section style={{ backgroundColor: C.prisme }}>
          <div className="lp-section-pad" style={{ maxWidth: '1080px', margin: '0 auto', padding: '88px 40px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: serif, fontSize: '48px', fontWeight: 300, color: C.clair, margin: '0 0 18px', lineHeight: 1.1 }}>
              Prêt à gagner du temps ?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(252,255,242,0.72)', margin: '0 auto 40px', lineHeight: 1.75, maxWidth: '420px', fontWeight: 300 }}>
              Rejoignez Prysme et automatisez la gestion de vos contrats de location dès aujourd&apos;hui.
            </p>
            <Link href="/sign-up" className="lp-cta-link">
              Démarrer gratuitement →
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ backgroundColor: C.graphite }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 40px' }}>
            <div className="footer-inner">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img
                  src="/logotype_prysme.png"
                  alt="Prysme"
                  height={24}
                  style={{ display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.6 }}
                />
              </Link>
              <div className="footer-links">
                <Link href="/legal/mentions-legales" className="lp-footer-link">Mentions légales</Link>
                <Link href="/legal/confidentialite"  className="lp-footer-link">Confidentialité</Link>
                <Link href="/legal/cgv"              className="lp-footer-link">CGV</Link>
                <Link href="/sign-in"                className="lp-footer-link">Connexion</Link>
                <span style={{ fontSize: '12px', color: 'rgba(252,255,242,0.28)', fontWeight: 300 }}>© 2026 Prysme</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
