import Link from "next/link";
import FaqAccordion from "./FaqAccordion";

const nav = { padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties;
const navLogo = { fontSize: '15px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 500, color: '#1C1C1A', textDecoration: 'none', letterSpacing: '0.02em' } as React.CSSProperties;
const navLink = { fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#7A7570', textDecoration: 'none' };
const navCta = { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '10px 22px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '100px' };
const wrap = { maxWidth: '1200px', margin: '0 auto', padding: '0 48px' } as React.CSSProperties;
const tag = { fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: '#7A7570' };

const steps = [
  {
    num: '01',
    badge: '5 min · une seule fois',
    title: 'Configurez votre gîte',
    desc: 'Créez votre compte, renseignez les informations de votre établissement et importez votre logo. Votre template de contrat est déjà prêt — personnalisable avec vos propres clauses en quelques clics.',
    points: ['Nom, adresse et coordonnées du gîte', 'Logo sur le contrat PDF et dans les emails', 'Options à la carte (ménage, bain nordique…)', 'Template de contrat entièrement modifiable'],
    visual: (
      <div style={{ background: '#F7F4F0', borderRadius: '24px', border: '1px solid #CEC8BF', padding: '40px', height: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#EDE8E1', borderRadius: '12px', border: '1px solid #CEC8BF' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#CEC8BF', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '10px', background: '#1C1C1A', borderRadius: '4px', width: '60%', marginBottom: '8px' }} />
            <div style={{ height: '8px', background: '#CEC8BF', borderRadius: '4px', width: '40%' }} />
          </div>
        </div>
        {['Nom du gîte', 'Email', 'Adresse', 'Téléphone'].map((l) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#7A7570', width: '70px', flexShrink: 0 }}>{l}</span>
            <div style={{ flex: 1, height: '32px', background: '#EDE8E1', borderRadius: '6px', border: '1px solid #CEC8BF' }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '02',
    badge: '2 min · par réservation',
    title: 'Saisissez la réservation',
    desc: 'Pour chaque séjour, renseignez les coordonnées du locataire, les dates, le loyer et les options choisies. Tout est centralisé dans une seule fiche — rien ne s\'oublie.',
    points: ['Prénom, nom, email, téléphone, adresse', 'Dates d\'arrivée et de départ', 'Loyer, acompte, frais de ménage, taxe de séjour', 'Options à la carte sélectionnables en un clic'],
    visual: (
      <div style={{ background: '#F7F4F0', borderRadius: '24px', border: '1px solid #CEC8BF', padding: '40px', height: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
        {[
          { label: 'Locataire', w: '75%' },
          { label: 'Arrivée', w: '45%' },
          { label: 'Départ', w: '45%' },
          { label: 'Loyer', w: '35%' },
          { label: 'Options', w: '60%' },
        ].map(({ label, w }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#7A7570', width: '60px', flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: '32px', background: '#EDE8E1', borderRadius: '6px', border: '1px solid #CEC8BF', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <div style={{ height: '8px', background: '#CEC8BF', borderRadius: '3px', width: w }} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <div style={{ background: '#1C1C1A', borderRadius: '8px', padding: '10px 24px' }}>
            <span style={{ fontSize: '11px', color: '#EDE8E1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enregistrer</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: '03',
    badge: '1 clic · automatique',
    title: 'Envoyez le contrat à signer',
    desc: 'Un seul clic génère le contrat PDF avec toutes les informations pré-remplies et envoie un email professionnel au locataire avec un lien de signature sécurisé.',
    points: ['Contrat PDF généré instantanément', 'Email avec logo et nom de votre gîte', 'Lien de signature personnel et sécurisé', 'Suivi du statut en temps réel'],
    visual: (
      <div style={{ background: '#F7F4F0', borderRadius: '24px', border: '1px solid #CEC8BF', padding: '40px', height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #CEC8BF', padding: '20px 24px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #EDE8E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', background: '#EDE8E1', borderRadius: '4px' }} />
              <div style={{ height: '8px', background: '#CEC8BF', borderRadius: '3px', width: '80px' }} />
            </div>
            <div style={{ height: '8px', background: '#CEC8BF', borderRadius: '3px', width: '60px' }} />
          </div>
          <div style={{ height: '7px', background: '#EDE8E1', borderRadius: '3px', marginBottom: '6px', width: '90%' }} />
          <div style={{ height: '7px', background: '#EDE8E1', borderRadius: '3px', marginBottom: '6px', width: '75%' }} />
          <div style={{ height: '7px', background: '#EDE8E1', borderRadius: '3px', width: '85%' }} />
        </div>
        <div style={{ background: '#1C1C1A', borderRadius: '10px', padding: '14px 32px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#EDE8E1', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Envoyer à signer →</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7A7570' }} />
          <span style={{ fontSize: '12px', color: '#7A7570' }}>Email envoyé · En attente de signature</span>
        </div>
      </div>
    ),
  },
  {
    num: '04',
    badge: 'Côté locataire · mobile friendly',
    title: 'Le locataire signe en ligne',
    desc: 'Votre locataire reçoit l\'email, lit le contrat dans son navigateur (sur mobile ou ordinateur) et le signe électroniquement. Aucune impression, aucun scan. La signature est horodatée pour valeur légale.',
    points: ['Accessible depuis n\'importe quel appareil', 'Lecture du contrat complet avant signature', 'Signature en tapant son nom complet', 'Horodatage et IP enregistrés automatiquement'],
    visual: (
      <div style={{ background: '#F7F4F0', borderRadius: '24px', border: '1px solid #CEC8BF', padding: '40px', height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #CEC8BF', padding: '20px', width: '180px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ height: '6px', background: '#EDE8E1', borderRadius: '3px', marginBottom: '6px', width: '100%' }} />
          <div style={{ height: '6px', background: '#EDE8E1', borderRadius: '3px', marginBottom: '6px', width: '80%' }} />
          <div style={{ height: '6px', background: '#EDE8E1', borderRadius: '3px', marginBottom: '16px', width: '90%' }} />
          <div style={{ borderTop: '1px solid #EDE8E1', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', color: '#7A7570', marginBottom: '6px' }}>Signature</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1C1C1A', fontStyle: 'italic', borderBottom: '1px solid #1C1C1A', paddingBottom: '4px' }}>Marie D.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1C1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', color: 'white' }}>✓</span>
          </div>
          <span style={{ fontSize: '12px', color: '#7A7570' }}>Signé électroniquement</span>
        </div>
      </div>
    ),
  },
  {
    num: '05',
    badge: 'Automatique · immédiat',
    title: 'Les deux parties reçoivent le PDF signé',
    desc: 'Dès la signature, ContratGîte envoie le contrat signé en PDF à votre locataire et à vous. Le statut passe automatiquement à "Signé" dans votre tableau de bord.',
    points: ['PDF signé envoyé au locataire par email', 'Copie automatique envoyée au gérant', 'Statut mis à jour dans le dashboard', 'Archivé et consultable à tout moment'],
    visual: (
      <div style={{ background: '#F7F4F0', borderRadius: '24px', border: '1px solid #CEC8BF', padding: '40px', height: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[{ emoji: '🏡', label: 'Gérant' }, { emoji: '👤', label: 'Locataire' }].map(({ emoji, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #CEC8BF', padding: '20px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{emoji}</div>
                <div style={{ fontSize: '11px', color: '#7A7570' }}>{label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#1C1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: 'white' }}>✓</span>
                </div>
                <span style={{ fontSize: '11px', color: '#7A7570' }}>PDF reçu</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#E5DED5', borderRadius: '10px', padding: '12px 20px', border: '1px solid #CEC8BF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#1C1C1A' }}>Statut :</span>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1C1C1A', fontWeight: 500 }}>✓ Signé</span>
        </div>
      </div>
    ),
  },
];

export default function CommentCaMarche() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={nav}>
        <Link href="/" style={navLogo}>ContratGîte</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/comment-ca-marche" style={{ ...navLink, color: '#1C1C1A' }}>Comment ça marche</Link>
          <a href="/#tarifs" style={navLink}>Tarifs</a>
          <Link href="/sign-in" style={navLink}>Se connecter</Link>
          <Link href="/sign-up" style={navCta}>Démarrer →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ borderBottom: '1px solid #CEC8BF' }}>
        <div style={{ ...wrap, padding: '80px 48px 100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

            {/* Texte */}
            <div>
              <p style={{ ...tag, marginBottom: '20px' }}>— Comment ça marche</p>
              <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.05, marginBottom: '28px', letterSpacing: '-0.01em' }}>
                De la réservation<br />au contrat signé,<br /><em>en moins de 3 minutes.</em>
              </h1>
              <p style={{ fontSize: '16px', color: '#7A7570', lineHeight: 1.8, fontWeight: 300, marginBottom: '48px' }}>
                ContratGîte automatise tout ce qui suit une réservation. Voici exactement comment ça se passe, étape par étape.
              </p>
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {[{ num: '5 min', label: 'de configuration initiale' }, { num: '2 min', label: 'par réservation' }, { num: '1 clic', label: 'pour envoyer le contrat' }].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '36px', fontWeight: 300, color: '#1C1C1A', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: '12px', color: '#7A7570', marginTop: '4px', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visuel — mini flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '01', label: 'Réservation enregistrée', sub: 'Marie Dupont · 3 nuits · 14 juillet', status: null },
                { step: '02', label: 'Contrat généré & envoyé', sub: 'PDF · lien de signature sécurisé', status: null },
                { step: '03', label: 'Contrat signé', sub: 'Les deux parties reçoivent le PDF', status: 'Signé' },
              ].map(({ step, label, sub, status }, i) => (
                <div key={step} style={{ position: 'relative' }}>
                  {i < 2 && (
                    <div style={{ position: 'absolute', left: '19px', top: '48px', width: '1px', height: '28px', background: '#CEC8BF' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: i === 2 ? '#E5DED5' : 'white', borderRadius: '14px', border: '1px solid #CEC8BF', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: i === 2 ? '#1C1C1A' : '#EDE8E1', border: '1px solid #CEC8BF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '13px', color: i === 2 ? '#EDE8E1' : '#7A7570' }}>{step}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#1C1C1A', fontWeight: 500 }}>{label}</span>
                        {status && (
                          <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1C1C1A', background: '#CEC8BF', padding: '3px 10px', borderRadius: '100px' }}>{status}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7A7570', marginTop: '4px' }}>{sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Étapes */}
      {steps.map((step, i) => (
        <section
          key={step.num}
          style={{ backgroundColor: i % 2 === 0 ? '#EDE8E1' : '#E5DED5', borderBottom: '1px solid #CEC8BF' }}
        >
          <div style={{ ...wrap, padding: '80px 48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

              {/* Texte — alterne gauche/droite */}
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '72px', fontWeight: 300, color: '#CEC8BF', lineHeight: 1 }}>{step.num}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', backgroundColor: i % 2 === 0 ? '#E5DED5' : '#EDE8E1', padding: '5px 14px', borderRadius: '100px', border: '1px solid #CEC8BF' }}>{step.badge}</span>
                </div>
                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 400, color: '#1C1C1A', marginBottom: '20px', lineHeight: 1.2 }}>{step.title}</h2>
                <p style={{ fontSize: '15px', color: '#7A7570', lineHeight: 1.8, marginBottom: '32px', fontWeight: 300 }}>{step.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {step.points.map((pt) => (
                    <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#CEC8BF', marginTop: '2px', flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: '14px', color: '#1C1C1A', lineHeight: 1.6 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                {step.visual}
              </div>

            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section style={{ borderBottom: '1px solid #CEC8BF' }}>
        <div style={{ ...wrap, padding: '96px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <p style={{ ...tag, marginBottom: '16px' }}>— Questions fréquentes</p>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(32px, 3vw, 44px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.2, marginBottom: '20px' }}>
                Tout ce que<br />vous voulez<br /><em>savoir.</em>
              </h2>
              <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.7, fontWeight: 300 }}>
                Une question qui ne figure pas ici ? Écrivez-nous.
              </p>
            </div>
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#1C1C1A', padding: '100px 48px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...tag, color: '#7A7570', marginBottom: '20px' }}>— Prêt à démarrer ?</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 300, color: '#EDE8E1', lineHeight: 1.1, marginBottom: '24px' }}>
            Arrêtez de perdre du temps<br /><em>sur chaque réservation.</em>
          </h2>
          <p style={{ fontSize: '15px', color: '#7A7570', lineHeight: 1.7, marginBottom: '40px', fontWeight: 300 }}>
            Configuration en 5 minutes. Aucune carte bancaire requise pour commencer.
          </p>
          <Link href="/sign-up" style={{ display: 'inline-block', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 36px', backgroundColor: '#EDE8E1', color: '#1C1C1A', textDecoration: 'none', borderRadius: '100px' }}>
            Créer mon compte gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid #CEC8BF' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', color: '#1C1C1A' }}>ContratGîte</span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/comment-ca-marche" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Comment ça marche</Link>
          <Link href="/faq" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FAQ</Link>
          <Link href="/sign-in" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Connexion</Link>
          <span style={{ fontSize: '11px', color: '#7A7570' }}>© 2025 ContratGîte</span>
        </div>
      </footer>

    </main>
  );
}
