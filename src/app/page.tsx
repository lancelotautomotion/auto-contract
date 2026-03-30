import Link from "next/link";

const S = {
  // Layout
  page: { minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  container: { maxWidth: '1080px', margin: '0 auto', padding: '0 32px' } as React.CSSProperties,

  // Nav
  nav: { padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  navLogo: { fontSize: '15px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 500, color: '#1C1C1A', textDecoration: 'none', letterSpacing: '0.02em' } as React.CSSProperties,
  navLinks: { display: 'flex', alignItems: 'center', gap: '32px' } as React.CSSProperties,
  navLink: { fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#7A7570', textDecoration: 'none' },
  navCta: { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '10px 22px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '100px' },

  // Hero
  heroSection: { padding: '72px 32px 80px', maxWidth: '1080px', margin: '0 auto' } as React.CSSProperties,
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#7A7570', backgroundColor: '#E5DED5', padding: '6px 14px', borderRadius: '100px', marginBottom: '32px', border: '1px solid #CEC8BF' },
  heroDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7A7570' } as React.CSSProperties,
  heroTitle: { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.1, marginBottom: '28px', letterSpacing: '-0.01em' } as React.CSSProperties,
  heroSub: { fontSize: '16px', color: '#7A7570', lineHeight: 1.8, maxWidth: '560px', marginBottom: '44px', fontWeight: 300 } as React.CSSProperties,
  heroCtas: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: '16px', marginBottom: '60px' } as React.CSSProperties,
  ctaPrimary: { fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '14px 28px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '100px' },
  ctaSecondary: { fontSize: '12px', color: '#7A7570', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties,
  heroStats: { display: 'flex', gap: '40px', flexWrap: 'wrap' as const } as React.CSSProperties,
  heroStat: { display: 'flex', flexDirection: 'column' as const, gap: '4px' } as React.CSSProperties,
  heroStatNum: { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#1C1C1A', lineHeight: 1 } as React.CSSProperties,
  heroStatLabel: { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#7A7570' },

  // Section générique
  section: { padding: '80px 32px', maxWidth: '1080px', margin: '0 auto' } as React.CSSProperties,
  sectionTag: { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '16px' },
  sectionTitle: { fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.2, marginBottom: '16px' } as React.CSSProperties,
  sectionSub: { fontSize: '15px', color: '#7A7570', lineHeight: 1.7, maxWidth: '520px', fontWeight: 300 } as React.CSSProperties,

  // Divider
  divider: { borderTop: '1px solid #CEC8BF', margin: '0 40px' } as React.CSSProperties,

  // Cards
  card: { backgroundColor: '#E5DED5', borderRadius: '20px', padding: '36px 32px', border: '1px solid #CEC8BF' } as React.CSSProperties,
  cardLight: { backgroundColor: '#F7F4F0', borderRadius: '20px', padding: '36px 32px', border: '1px solid #CEC8BF' } as React.CSSProperties,
  cardDark: { backgroundColor: '#1C1C1A', borderRadius: '20px', padding: '36px 32px' } as React.CSSProperties,
};

// ─── Données ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: '📄',
    title: 'Contrat généré en 1 clic',
    desc: 'Vos données client remplissent automatiquement votre template. Export PDF instantané, aucune saisie manuelle.',
  },
  {
    icon: '📧',
    title: 'Email pro envoyé automatiquement',
    desc: 'Email personnalisé avec contrat, CGV et visuels en pièces jointes — envoyé dès que vous validez.',
  },
  {
    icon: '📅',
    title: 'Réservations centralisées',
    desc: 'Toutes vos réservations dans un seul tableau de bord. Statuts, dates, montants, options — tout visible d\'un coup d\'œil.',
  },
  {
    icon: '⚙️',
    title: 'Adapté à votre gîte',
    desc: 'Configurez vos options (bain nordique, draps, serviettes), vos tarifs et vos templates une seule fois.',
  },
  {
    icon: '🗂️',
    title: 'Sauvegarde automatique',
    desc: 'Chaque contrat est sauvegardé dans votre Google Drive, organisé et retrouvable à tout moment.',
  },
  {
    icon: '🔔',
    title: 'Zéro oubli',
    desc: 'Plus besoin de vérifier si vous avez bien envoyé le contrat. Le statut de chaque réservation est mis à jour en temps réel.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Saisissez la réservation',
    desc: 'Renseignez les informations du locataire, les dates et les options choisies en moins de 2 minutes.',
  },
  {
    num: '02',
    title: 'Générez le contrat',
    desc: 'Un clic, et le contrat est rempli, exporté en PDF et sauvegardé dans votre Drive.',
  },
  {
    num: '03',
    title: 'Envoyez à votre locataire',
    desc: 'L\'email professionnel avec toutes les pièces jointes part automatiquement. C\'est tout.',
  },
];

const testimonials = [
  {
    quote: "Avant je passais 30 minutes par réservation entre le contrat Word, le PDF, et l'email. Maintenant c'est 2 minutes. Je ne reviendrais jamais en arrière.",
    name: 'Marie-Hélène',
    gite: 'Le Clos du Marida, Haute-Loire',
    initials: 'MH',
  },
  {
    quote: "Simple, rapide, et les contrats sont vraiment professionnels. Mes locataires m'ont fait des retours positifs sur l'email de confirmation.",
    name: 'Thierry',
    gite: 'Gîte La Forêt Bleue, Ardèche',
    initials: 'T',
  },
  {
    quote: "J'ai 3 gîtes et la gestion administrative me prenait des heures chaque semaine. Maintenant c'est réglé. L'outil est vraiment pensé pour nous.",
    name: 'Sophie',
    gite: 'Les Gîtes du Plateau, Aveyron',
    initials: 'S',
  },
];

const personas = [
  {
    emoji: '🏡',
    title: 'Gérant de gîte indépendant',
    desc: 'Vous louez votre gîte en direct, sans passer par Airbnb. Vous gérez vos contrats vous-même et perdez du temps à chaque réservation.',
  },
  {
    emoji: '📋',
    title: 'Loueur avec contrat légal',
    desc: 'Vous avez un template de contrat que vous remplissez à la main à chaque fois. Vous cherchez à automatiser sans tout réapprendre.',
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Petite structure familiale',
    desc: 'Vous avez 1 à 3 propriétés et pas besoin d\'un logiciel à 150 €/mois. Vous voulez un outil simple qui fait exactement ce qu\'il faut.',
  },
];

// ─── Composants ─────────────────────────────────────────────────────────────

function SectionHeader({ tag, title, sub, center = false }: { tag: string; title: React.ReactNode; sub?: string; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '48px' }}>
      <p style={S.sectionTag}>{tag}</p>
      <h2 style={S.sectionTitle}>{title}</h2>
      {sub && <p style={{ ...S.sectionSub, margin: center ? '0 auto' : undefined }}>{sub}</p>}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main style={S.page}>

      {/* ── Nav ── */}
      <nav style={S.nav}>
        <Link href="/" style={S.navLogo}>ContratGîte</Link>
        <div style={S.navLinks}>
          <Link href="/comment-ca-marche" style={S.navLink}>Comment ça marche</Link>
          <a href="#tarifs" style={S.navLink}>Tarifs</a>
          <Link href="/sign-in" style={S.navLink}>Se connecter</Link>
          <Link href="/sign-up" style={S.navCta}>Démarrer →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={S.heroSection}>
        <div style={S.heroBadge}>
          <span style={S.heroDot} />
          Automatisation · Gîtes &amp; Locations saisonnières
        </div>
        <h1 style={S.heroTitle}>
          Vos contrats de location,<br />
          <em>générés et envoyés</em><br />
          en un clic.
        </h1>
        <p style={S.heroSub}>
          Fini les contrats remplis à la main, les PDF oubliés, les emails mal construits.
          ContratGîte automatise toute la paperasse pour que vous vous concentriez sur vos locataires.
        </p>
        <div style={S.heroCtas}>
          <Link href="/sign-up" style={S.ctaPrimary}>Essayer gratuitement →</Link>
          <Link href="/comment-ca-marche" style={S.ctaSecondary}>
            Voir comment ça marche ↓
          </Link>
        </div>
        <div style={S.heroStats}>
          {[
            { num: '2 min', label: 'par réservation' },
            { num: '-95%', label: "d'administratif" },
            { num: '15 €', label: 'par mois' },
          ].map((s) => (
            <div key={s.label} style={S.heroStat}>
              <span style={S.heroStatNum}>{s.num}</span>
              <span style={S.heroStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* ── Pour qui ── */}
      <section style={S.section}>
        <SectionHeader
          tag="— Pour qui ?"
          title={<>Fait pour les gérants<br /><em>qui gèrent tout eux-mêmes.</em></>}
          sub="ContratGîte n'est pas un PMS à 150 €/mois avec 50 fonctions inutiles. C'est un outil simple, focalisé sur un seul problème : votre administratif de location."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {personas.map((p) => (
            <div key={p.title} style={S.card}>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>{p.emoji}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#1C1C1A', marginBottom: '12px' }}>{p.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A7570', lineHeight: 1.75, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" style={S.section}>
        <SectionHeader
          tag="— Comment ça marche"
          title={<>3 étapes,<br /><em>et c'est réglé.</em></>}
          sub="Pas besoin de formation. Vous saisissez, vous cliquez, le contrat part."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {steps.map((step) => (
            <div key={step.num} style={{ ...S.cardLight, position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '64px', fontWeight: 300, color: '#CEC8BF', lineHeight: 1, marginBottom: '16px', letterSpacing: '-0.02em' }}>{step.num}</p>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#1C1C1A', marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A7570', lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* ── Fonctionnalités ── */}
      <section style={S.section}>
        <SectionHeader
          tag="— Fonctionnalités"
          title={<>Tout ce qu'il faut,<br /><em>rien de superflu.</em></>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {features.map((f) => (
            <div key={f.title} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#1C1C1A', margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A7570', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* ── Témoignages ── */}
      <section style={S.section}>
        <SectionHeader
          tag="— Retours utilisateurs"
          title={<>Ce que disent<br /><em>les gérants.</em></>}
          center
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {testimonials.map((t) => (
            <div key={t.name} style={{ ...S.cardLight, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p style={{ fontSize: '14px', color: '#1C1C1A', lineHeight: 1.8, fontStyle: 'italic', margin: 0, flexGrow: 1 }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#CEC8BF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500, color: '#1C1C1A', flexShrink: 0 }}>
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1A', margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: '11px', color: '#7A7570', margin: 0 }}>{t.gite}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* ── Tarifs ── */}
      <section id="tarifs" style={{ ...S.section, textAlign: 'center' }}>
        <SectionHeader
          tag="— Tarifs"
          title={<>Un prix simple,<br /><em>sans surprise.</em></>}
          sub="Pas de forfait compliqué. Un abonnement mensuel, sans engagement, pour un gîte."
          center
        />
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ ...S.cardDark, textAlign: 'left' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '16px' }}>Abonnement mensuel</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '56px', fontWeight: 300, color: '#EDE8E1', lineHeight: 1 }}>15 €</span>
              <span style={{ fontSize: '13px', color: '#7A7570' }}>/mois</span>
            </div>
            <p style={{ fontSize: '13px', color: '#7A7570', marginBottom: '32px' }}>Sans engagement · Résiliable à tout moment</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
              {[
                'Réservations illimitées',
                'Génération de contrat PDF',
                'Envoi email automatique',
                'Sauvegarde Google Drive',
                'Dashboard de suivi',
                'Support par email',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#7A7570', fontSize: '14px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#CEC8BF' }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/sign-up" style={{ display: 'block', textAlign: 'center', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 28px', backgroundColor: '#EDE8E1', color: '#1C1C1A', textDecoration: 'none', borderRadius: '100px' }}>
              Démarrer gratuitement →
            </Link>
            <p style={{ fontSize: '11px', color: '#7A7570', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>Premier mois offert · Aucune carte requise</p>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ padding: '80px 32px', backgroundColor: '#E5DED5', borderTop: '1px solid #CEC8BF', borderBottom: '1px solid #CEC8BF' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <p style={S.sectionTag}>— Prêt à gagner du temps ?</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.2, marginBottom: '24px' }}>
            Arrêtez de perdre 30 minutes<br /><em>à chaque réservation.</em>
          </h2>
          <p style={{ fontSize: '15px', color: '#7A7570', lineHeight: 1.7, marginBottom: '36px' }}>
            Rejoignez les gérants qui ont automatisé leur administratif. Configuration en 5 minutes.
          </p>
          <Link href="/sign-up" style={S.ctaPrimary}>
            Créer mon compte gratuitement →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', color: '#1C1C1A' }}>ContratGîte</span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/sign-in" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Connexion</Link>
          <Link href="/sign-up" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>S&apos;inscrire</Link>
          <span style={{ fontSize: '11px', color: '#7A7570' }}>© 2025 ContratGîte</span>
        </div>
      </footer>

    </main>
  );
}
