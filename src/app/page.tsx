import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <Link href="/sign-in" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C1C1A', textDecoration: 'none' }}>Se connecter</Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 40px 60px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '24px' }}>
          — Automatisation · Gîtes & Locations
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '60px', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.15, marginBottom: '28px' }}>
          Vos contrats de location,<br />
          <em>en un clic.</em>
        </h1>
        <p style={{ fontSize: '15px', color: '#7A7570', lineHeight: 1.8, maxWidth: '520px', marginBottom: '40px' }}>
          Fini les contrats remplis à la main. Générez et envoyez automatiquement
          vos contrats à vos locataires — avec toutes les pièces jointes.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/sign-up" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 28px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none' }}>
            Démarrer gratuitement →
          </Link>
          <span style={{ fontSize: '12px', color: '#7A7570' }}>15 € / mois · Sans engagement</span>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid #CEC8BF', backgroundColor: '#CEC8BF', gap: '1px' }}>
          {[
            { num: '01 / 03', title: 'Génération automatique', desc: 'Le contrat est rempli avec les données du locataire et exporté en PDF en quelques secondes.' },
            { num: '02 / 03', title: 'Envoi par email', desc: 'Email professionnel envoyé avec le contrat et les documents annexes en pièces jointes.' },
            { num: '03 / 03', title: 'Suivi en temps réel', desc: 'Statut de chaque réservation mis à jour automatiquement : généré, envoyé, signé.' },
          ].map((f) => (
            <div key={f.num} style={{ padding: '36px 32px', backgroundColor: '#E5DED5' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#7A7570', marginBottom: '20px' }}>{f.num}</p>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '24px', fontWeight: 400, color: '#1C1C1A', marginBottom: '14px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#7A7570', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
