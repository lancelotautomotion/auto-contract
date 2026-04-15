import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prysme — Contrats de location pour gîtes, automatisés",
  description: "Automatisez vos contrats de location saisonnière en 2 minutes. Génération PDF, envoi email, suivi acompte. 30 jours gratuits, sans CB.",
};

// ─── Design tokens ───────────────────────────────────────────────────────────
const tk = {
  ink:       '#0A0A0B',
  inkSoft:   '#4B5563',
  inkMuted:  '#9CA3AF',
  white:     '#FFFFFF',
  surface:   '#F9FAFB',
  surfaceAlt:'#F3F4F6',
  border:    '#E5E7EB',
  green:     '#16A34A',
  greenBg:   '#F0FDF4',
  blue:      '#2563EB',
  blueBg:    '#EFF6FF',
  font:      'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
};

// ─── App preview mockup ──────────────────────────────────────────────────────
function AppPreview() {
  const rows = [
    { name: 'Marie Dupont',  dates: '14–17 juil.', amount: '720 €',   signed: true },
    { name: 'Pierre Martin', dates: '20–25 juil.', amount: '1 080 €', signed: false },
    { name: 'Julie Blanc',   dates: '1–8 août',    amount: '960 €',   signed: true },
  ];
  return (
    <div style={{ background: '#111113', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1F1F23', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', fontFamily: tk.font }}>
      {/* Browser chrome */}
      <div style={{ background: '#18181B', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #27272A' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#EF4444','#F59E0B','#22C55E'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ background: '#27272A', borderRadius: '5px', padding: '3px 12px', marginLeft: '8px', flex: 1, maxWidth: '180px' }}>
          <span style={{ fontSize: '10px', color: '#52525B' }}>prysme.fr/dashboard</span>
        </div>
      </div>
      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
        {/* Sidebar */}
        <div style={{ background: '#09090B', borderRight: '1px solid #1F1F23', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', padding: '4px 8px', marginBottom: '12px', letterSpacing: '-0.01em' }}>Prysme</div>
          {[
            { label: 'Tableau de bord', active: true },
            { label: 'Réservations',    active: false },
            { label: 'Établissement',   active: false },
            { label: 'Paramètres',      active: false },
          ].map(item => (
            <div key={item.label} style={{ padding: '6px 8px', borderRadius: '6px', background: item.active ? '#18181B' : 'transparent', cursor: 'default' }}>
              <span style={{ fontSize: '11px', color: item.active ? '#FAFAFA' : '#52525B', fontWeight: item.active ? 500 : 400 }}>{item.label}</span>
            </div>
          ))}
        </div>
        {/* Content */}
        <div style={{ padding: '16px', background: '#09090B', minHeight: '240px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAFAFA', marginBottom: '14px', letterSpacing: '-0.01em' }}>Tableau de bord</div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
            {[{ v: '12', l: 'Réservations' }, { v: '3', l: 'En attente' }, { v: '2 260 €', l: 'Ce mois' }].map(s => (
              <div key={s.l} style={{ background: '#111113', borderRadius: '7px', padding: '8px 10px', border: '1px solid #1F1F23' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#FAFAFA', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: '9px', color: '#52525B', marginTop: '3px', fontWeight: 400 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid #18181B' : 'none' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#E4E4E7', fontWeight: 500 }}>{row.name}</div>
                <div style={{ fontSize: '9px', color: '#52525B', marginTop: '2px' }}>{row.dates}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#71717A' }}>{row.amount}</span>
                <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '100px', background: row.signed ? '#14532D' : '#1C1917', color: row.signed ? '#86EFAC' : '#78716C', fontWeight: 500 }}>
                  {row.signed ? 'Signé' : 'Attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Nav ──────────────────────────────────────────────────────────────
function Nav({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const bg = theme === 'dark' ? tk.ink : tk.white;
  const logo = theme === 'dark' ? tk.white : tk.ink;
  const link = theme === 'dark' ? '#6B7280' : tk.inkSoft;
  const ctaBg = theme === 'dark' ? tk.white : tk.ink;
  const ctaColor = theme === 'dark' ? tk.ink : tk.white;
  return (
    <nav style={{ background: bg, padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme === 'dark' ? '#1F1F23' : tk.border}` }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/logotype_prysme.png" alt="Prysme" height={26} style={{ display: 'block', filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none' }} />
      </Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <a href="#fonctionnalites" style={{ fontSize: '13px', color: link, textDecoration: 'none', fontFamily: tk.font, fontWeight: 400 }}>Fonctionnalités</a>
        <a href="#tarifs" style={{ fontSize: '13px', color: link, textDecoration: 'none', fontFamily: tk.font, fontWeight: 400 }}>Tarifs</a>
        <Link href="/sign-in" style={{ fontSize: '13px', color: link, textDecoration: 'none', fontFamily: tk.font, fontWeight: 400 }}>Connexion</Link>
        <Link href="/sign-up" style={{ fontSize: '13px', fontWeight: 500, padding: '8px 18px', background: ctaBg, color: ctaColor, textDecoration: 'none', borderRadius: '8px', fontFamily: tk.font }}>
          Démarrer gratuitement
        </Link>
      </div>
      <Link href="/sign-up" className="nav-cta-mobile" style={{ display: 'none', fontSize: '13px', fontWeight: 500, padding: '8px 16px', background: ctaBg, color: ctaColor, textDecoration: 'none', borderRadius: '8px', fontFamily: tk.font }}>
        Démarrer
      </Link>
    </nav>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const features = [
  { icon: '⚡', title: 'Contrat en 1 clic', desc: 'Saisie une fois, contrat PDF généré instantanément avec toutes les données pré-remplies.' },
  { icon: '📬', title: 'Email automatique', desc: 'Contrat, RIB et règlement intérieur envoyés au locataire dès validation. Zéro oubli.' },
  { icon: '✍️', title: 'Signature en ligne', desc: 'Le locataire signe depuis son téléphone. Horodaté, légalement valide, sans impression.' },
  { icon: '📊', title: 'Suivi en temps réel', desc: 'Statuts, acomptes, dates — tout est visible d\'un coup d\'œil dans votre dashboard.' },
  { icon: '🗂️', title: 'Documents centralisés', desc: 'RIB, règlement intérieur et logos stockés une fois, joints automatiquement à chaque email.' },
  { icon: '🔔', title: 'Rappels acompte', desc: 'Relancez vos locataires pour l\'acompte en un clic. Le mail part avec le contrat joint.' },
];

const steps = [
  { n: '01', title: 'Configurez votre gîte', desc: 'Renseignez votre établissement, importez votre logo et vos documents. 5 minutes, une seule fois.' },
  { n: '02', title: 'Saisissez la réservation', desc: 'Nom, dates, loyer, options. Tout centralisé dans une fiche en moins de 2 minutes.' },
  { n: '03', title: 'Le contrat part tout seul', desc: 'Cliquez "Envoyer". Le PDF est généré et l\'email professionnel part automatiquement.' },
];

const testimonials = [
  { quote: "Avant je passais 30 minutes par réservation. Maintenant c'est 2 minutes. Je ne reviendrais jamais en arrière.", name: 'Marie-Hélène', role: 'Le Clos du Marida, Haute-Loire' },
  { quote: "Les contrats sont vraiment professionnels. Mes locataires m'ont fait des retours positifs sur l'email de confirmation.", name: 'Thierry', role: 'Gîte La Forêt Bleue, Ardèche' },
  { quote: "J'ai 3 gîtes et la gestion administrative me prenait des heures. Maintenant c'est réglé en quelques clics.", name: 'Sophie', role: 'Les Gîtes du Plateau, Aveyron' },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .nav-links { display: flex; }
        .nav-cta-mobile { display: none !important; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .trust-grid { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }

        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-grid { gap: 40px; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta-mobile { display: block !important; }
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr; gap: 16px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .trust-grid { gap: 16px; }
          .lp-section-pad { padding: 64px 24px !important; }
          .lp-hero-pad { padding: 56px 24px 64px !important; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
          .footer-links { gap: 16px; }
        }
      `}</style>

      <main style={{ fontFamily: tk.font, backgroundColor: tk.white, color: tk.ink }}>

        {/* ── Nav ── */}
        <Nav theme="dark" />

        {/* ── Hero ── */}
        <section style={{ background: tk.ink, padding: '72px 40px 80px' }} className="lp-hero-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="hero-grid">

              {/* Text */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#18181B', border: '1px solid #27272A', borderRadius: '100px', padding: '5px 12px 5px 6px', marginBottom: '32px' }}>
                  <span style={{ background: tk.blue, color: tk.white, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.04em' }}>NOUVEAU</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Essai 30 jours · Aucune CB requise</span>
                </div>
                <h1 style={{ fontFamily: tk.font, fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800, color: tk.white, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                  Vos contrats de<br />location, générés<br />en 2&nbsp;minutes.
                </h1>
                <p style={{ fontSize: '17px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '40px', maxWidth: '440px', fontWeight: 400 }}>
                  Fini les contrats Word, les PDF oubliés, les emails bancals.
                  Prysme automatise toute la paperasse administrative de votre gîte.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '48px' }}>
                  <Link href="/sign-up" style={{ fontSize: '14px', fontWeight: 600, padding: '12px 24px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px', letterSpacing: '-0.01em' }}>
                    Démarrer gratuitement →
                  </Link>
                  <a href="#comment-ca-marche" style={{ fontSize: '14px', fontWeight: 400, padding: '12px 24px', background: 'transparent', color: '#9CA3AF', textDecoration: 'none', borderRadius: '8px', border: '1px solid #27272A' }}>
                    Voir comment ça marche
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
                  {[{ v: '2 min', l: 'par réservation' }, { v: '−95%', l: "d'administratif" }, { v: '30 j', l: 'gratuits, sans CB' }].map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: '26px', fontWeight: 700, color: tk.white, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', fontWeight: 400 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product preview */}
              <div>
                <AppPreview />
              </div>

            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section style={{ background: tk.surface, borderBottom: `1px solid ${tk.border}` }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 40px' }}>
            <div className="trust-grid">
              {[
                { icon: '🔒', label: 'Données hébergées en Europe' },
                { icon: '🇫🇷', label: 'Conforme RGPD' },
                { icon: '🚫', label: 'Sans engagement' },
                { icon: '💳', label: 'Sans CB pour l\'essai' },
                { icon: '⚡', label: 'Configuration en 5 min' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', color: tk.inkSoft, fontWeight: 400 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section id="fonctionnalites" style={{ background: tk.white, padding: '96px 40px' }} className="lp-section-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Fonctionnalités</p>
              <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px', maxWidth: '520px' }}>
                Tout ce qu&apos;il faut.<br />Rien de plus.
              </h2>
              <p style={{ fontSize: '16px', color: tk.inkSoft, fontWeight: 400, maxWidth: '480px', lineHeight: 1.6 }}>
                Un outil focalisé sur un seul problème : l&apos;administratif de votre location saisonnière.
              </p>
            </div>
            <div className="features-grid" style={{ border: `1px solid ${tk.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              {features.map((f, i) => (
                <div key={f.title} style={{ padding: '32px', borderRight: i % 3 !== 2 ? `1px solid ${tk.border}` : 'none', borderBottom: i < 3 ? `1px solid ${tk.border}` : 'none', background: tk.white }}>
                  <div style={{ fontSize: '22px', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontFamily: tk.font, fontSize: '15px', fontWeight: 600, color: tk.ink, marginBottom: '8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: tk.inkSoft, lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comment ça marche ── */}
        <section id="comment-ca-marche" style={{ background: tk.surface, padding: '96px 40px', borderTop: `1px solid ${tk.border}` }} className="lp-section-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Comment ça marche</p>
              <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: '480px' }}>
                3 étapes,<br />et c&apos;est réglé.
              </h2>
            </div>
            <div className="steps-grid">
              {steps.map((s) => (
                <div key={s.n} style={{ background: tk.white, borderRadius: '12px', padding: '32px', border: `1px solid ${tk.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: tk.inkMuted, letterSpacing: '0.06em' }}>{s.n}</span>
                  <h3 style={{ fontFamily: tk.font, fontSize: '17px', fontWeight: 700, color: tk.ink, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: tk.inkSoft, lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Témoignages ── */}
        <section style={{ background: tk.white, padding: '96px 40px', borderTop: `1px solid ${tk.border}` }} className="lp-section-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Retours</p>
              <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Ce que disent<br />les gérants.
              </h2>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((t) => (
                <div key={t.name} style={{ background: tk.surface, borderRadius: '12px', padding: '28px', border: `1px solid ${tk.border}`, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <p style={{ fontSize: '14px', color: tk.ink, lineHeight: 1.7, margin: 0, flexGrow: 1, fontStyle: 'italic', fontWeight: 400 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: tk.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: tk.white }}>{t.name[0]}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: tk.ink, margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: tk.inkMuted, margin: 0, fontWeight: 400 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tarifs ── */}
        <section id="tarifs" style={{ background: tk.surface, padding: '96px 40px', borderTop: `1px solid ${tk.border}` }} className="lp-section-pad">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: tk.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Tarifs</p>
              <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: tk.ink, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '12px' }}>
                Un prix. Simple.
              </h2>
              <p style={{ fontSize: '16px', color: tk.inkSoft, fontWeight: 400 }}>Sans engagement. Résiliable à tout moment.</p>
            </div>
            <div style={{ maxWidth: '440px', margin: '0 auto' }}>
              <div style={{ background: tk.ink, borderRadius: '16px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle gradient overlay */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>Abonnement mensuel</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: tk.font, fontSize: '52px', fontWeight: 800, color: tk.white, letterSpacing: '-0.04em', lineHeight: 1 }}>9,99 €</span>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 400 }}>HT / mois</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '32px', fontWeight: 400 }}>Sans engagement · Résiliez quand vous voulez</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {[
                      'Réservations illimitées',
                      'Génération de contrat PDF',
                      'Envoi email automatique',
                      'Signature électronique',
                      'Documents centralisés (RIB, règlement…)',
                      'Suivi des acomptes',
                      'Support par email',
                    ].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" opacity="0.2"/><path d="M4.5 7l2 2 3-3" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: '13px', color: '#D1D5DB', fontWeight: 400 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', fontSize: '14px', fontWeight: 600, padding: '14px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px', letterSpacing: '-0.01em' }}>
                    Démarrer l&apos;essai gratuit →
                  </Link>
                  <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '12px', marginBottom: 0, fontWeight: 400 }}>
                    30 jours gratuits · Aucune carte bancaire requise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section style={{ background: tk.ink, padding: '96px 40px', borderTop: `1px solid #1F1F23` }} className="lp-section-pad">
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: tk.font, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: tk.white, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
              Arrêtez de perdre<br />30 min par réservation.
            </h2>
            <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '36px', fontWeight: 400 }}>
              Configuration en 5 minutes. 30 jours gratuits. Aucune CB requise.
            </p>
            <Link href="/sign-up" style={{ display: 'inline-block', fontSize: '15px', fontWeight: 600, padding: '14px 32px', background: tk.white, color: tk.ink, textDecoration: 'none', borderRadius: '8px', letterSpacing: '-0.01em' }}>
              Créer mon compte gratuitement →
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: tk.white, borderTop: `1px solid ${tk.border}`, padding: '24px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="footer-inner">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logotype_prysme.png" alt="Prysme" height={22} style={{ display: 'block' }} />
              </Link>
              <div className="footer-links">
                <Link href="/legal/mentions-legales" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none', fontWeight: 400 }}>Mentions légales</Link>
                <Link href="/legal/confidentialite" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none', fontWeight: 400 }}>Confidentialité</Link>
                <Link href="/legal/cgv" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none', fontWeight: 400 }}>CGV</Link>
                <Link href="/sign-in" style={{ fontSize: '12px', color: tk.inkMuted, textDecoration: 'none', fontWeight: 400 }}>Connexion</Link>
                <span style={{ fontSize: '12px', color: tk.inkMuted, fontWeight: 400 }}>© 2026 Prysme</span>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
