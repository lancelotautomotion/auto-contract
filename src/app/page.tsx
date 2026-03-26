import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
          ContratGîte
        </span>
        <Link
          href="/sign-in"
          className="text-xs tracking-[0.15em] uppercase hover:opacity-60 transition-opacity"
          style={{ color: 'var(--text)' }}
        >
          Se connecter
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-24 pb-32 max-w-4xl">
        <p className="text-xs tracking-[0.25em] uppercase mb-8" style={{ color: 'var(--text-muted)' }}>
          — Automatisation · Gîtes & Locations
        </p>
        <h1
          className="text-6xl leading-tight mb-8"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}
        >
          Vos contrats de location,<br />
          <em style={{ fontStyle: 'italic' }}>en un clic.</em>
        </h1>
        <p className="text-base mb-12 max-w-lg" style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
          Fini les contrats remplis à la main. Générez et envoyez automatiquement
          vos contrats à vos locataires — avec toutes les pièces jointes.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/sign-up"
            className="px-8 py-3 text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            Démarrer gratuitement →
          </Link>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            15 € / mois · Sans engagement
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--border)' }}>
          {[
            { num: '01 / 03', title: 'Génération automatique', desc: 'Le contrat est rempli avec les données du locataire et exporté en PDF en quelques secondes.' },
            { num: '02 / 03', title: 'Envoi par email', desc: 'Email professionnel envoyé automatiquement avec le contrat et les documents annexes en pièces jointes.' },
            { num: '03 / 03', title: 'Suivi en temps réel', desc: 'Statut de chaque réservation mis à jour automatiquement : généré, envoyé, signé.' },
          ].map((f) => (
            <div key={f.num} className="p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-xs tracking-[0.2em] mb-6" style={{ color: 'var(--text-muted)' }}>{f.num}</p>
              <h3 className="text-2xl mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
