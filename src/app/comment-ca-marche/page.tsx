import Link from "next/link";

const S = {
  page: { minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  nav: { padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  navLogo: { fontSize: '15px', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 500, color: '#1C1C1A', textDecoration: 'none', letterSpacing: '0.02em' } as React.CSSProperties,
  navLinks: { display: 'flex', alignItems: 'center', gap: '32px' } as React.CSSProperties,
  navLink: { fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#7A7570', textDecoration: 'none' },
  navCta: { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '10px 22px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '100px' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '0 32px' } as React.CSSProperties,
  divider: { borderTop: '1px solid #CEC8BF', margin: '0 40px' } as React.CSSProperties,
};

const steps = [
  {
    num: '01',
    tag: 'Configuration · 5 minutes',
    title: 'Configurez votre gîte une seule fois',
    desc: 'Créez votre compte, renseignez les informations de votre établissement (nom, adresse, email, téléphone), importez votre logo et configurez vos options habituelles (ménage, bain nordique, linge…). Votre template de contrat est déjà prêt — vous pouvez le personnaliser à votre image.',
    details: [
      'Nom, adresse et coordonnées de votre gîte',
      'Logo affiché sur le contrat PDF et dans les emails',
      'Options proposées à vos clients (avec tarifs)',
      'Template de contrat personnalisable avec vos propres clauses',
    ],
  },
  {
    num: '02',
    tag: 'Par réservation · 2 minutes',
    title: 'Saisissez la réservation',
    desc: 'Pour chaque nouveau séjour, renseignez les coordonnées du locataire, les dates d\'arrivée et de départ, le montant du loyer, l\'acompte et les options choisies. Tout est centralisé, rien ne s\'oublie.',
    details: [
      'Prénom, nom, email, téléphone, adresse du locataire',
      'Dates de séjour et durée calculée automatiquement',
      'Loyer, acompte, frais de ménage, taxe de séjour',
      'Options à la carte sélectionnables en un clic',
    ],
  },
  {
    num: '03',
    tag: 'Automatique · 1 clic',
    title: 'Envoyez le contrat à signer',
    desc: 'En un clic, ContratGîte génère le contrat PDF avec toutes les informations pré-remplies et envoie un email professionnel au locataire avec un lien de signature sécurisé. Votre locataire n\'a besoin d\'aucun logiciel.',
    details: [
      'Contrat PDF généré instantanément avec votre template',
      'Email personnalisé avec le logo et le nom de votre gîte',
      'Lien de signature sécurisé, valable 7 jours',
      'Suivi du statut en temps réel dans votre tableau de bord',
    ],
  },
  {
    num: '04',
    tag: 'Côté locataire · 1 minute',
    title: 'Le locataire signe en ligne',
    desc: 'Votre locataire reçoit l\'email, lit le contrat directement dans son navigateur et le signe électroniquement. Aucune impression, aucun scan. La signature est horodatée et associée à l\'adresse IP pour valeur légale.',
    details: [
      'Page de signature accessible depuis n\'importe quel appareil',
      'Lecture du contrat complet avant signature',
      'Signature en tapant son nom complet',
      'Horodatage et adresse IP enregistrés automatiquement',
    ],
  },
  {
    num: '05',
    tag: 'Après signature · automatique',
    title: 'Les deux parties reçoivent le PDF signé',
    desc: 'Dès la signature, ContratGîte envoie automatiquement le contrat signé en PDF à votre locataire (pour ses archives) et à vous (pour les vôtres). Le statut de la réservation passe à "Signé" dans votre tableau de bord.',
    details: [
      'PDF signé envoyé au locataire par email',
      'Copie envoyée au gérant du gîte',
      'Statut mis à jour automatiquement dans le dashboard',
      'Contrat signé consultable à tout moment',
    ],
  },
];

const faqs = [
  {
    q: 'Faut-il un logiciel spécial pour signer ?',
    a: 'Non. Le locataire clique sur le lien dans l\'email, lit le contrat dans son navigateur et tape son nom pour signer. Aucune installation requise.',
  },
  {
    q: 'La signature électronique est-elle légalement valable ?',
    a: 'Oui. La signature est horodatée et l\'adresse IP est enregistrée, ce qui constitue une preuve de consentement conforme au droit français pour les locations saisonnières.',
  },
  {
    q: 'Puis-je utiliser mon propre contrat ?',
    a: 'Absolument. Vous pouvez coller votre template existant dans l\'éditeur et placer les balises variables aux bons endroits. ContratGîte les remplace automatiquement à chaque génération.',
  },
  {
    q: 'Combien de réservations puis-je gérer ?',
    a: 'Illimitées. L\'abonnement à 12,99 €/mois couvre un gîte avec autant de réservations que vous le souhaitez.',
  },
  {
    q: 'Que se passe-t-il si je résilie ?',
    a: 'Vous pouvez résilier à tout moment. Vos données et vos contrats signés restent accessibles pendant 30 jours après résiliation.',
  },
];

export default function CommentCaMarche() {
  return (
    <main style={S.page}>

      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/" style={S.navLogo}>ContratGîte</Link>
        <div style={S.navLinks}>
          <Link href="/comment-ca-marche" style={{ ...S.navLink, color: '#1C1C1A' }}>Comment ça marche</Link>
          <a href="/#tarifs" style={S.navLink}>Tarifs</a>
          <Link href="/sign-in" style={S.navLink}>Se connecter</Link>
          <Link href="/sign-up" style={S.navCta}>Démarrer →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ ...S.container, padding: '64px 32px 80px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '16px' }}>— Comment ça marche</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.01em' }}>
          De la réservation<br />
          <em>au contrat signé.</em>
        </h1>
        <p style={{ fontSize: '16px', color: '#7A7570', lineHeight: 1.8, maxWidth: '560px', fontWeight: 300, marginBottom: 0 }}>
          ContratGîte automatise tout ce qui suit une réservation : génération du contrat, envoi par email, signature électronique et archivage. En 5 étapes simples.
        </p>
      </section>

      <hr style={S.divider} />

      {/* Étapes */}
      <section style={{ ...S.container, padding: '80px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((step, i) => (
            <div key={step.num}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start', padding: '56px 0' }}>
                {/* Texte */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '56px', fontWeight: 300, color: '#CEC8BF', lineHeight: 1 }}>{step.num}</span>
                    <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', backgroundColor: '#E5DED5', padding: '4px 12px', borderRadius: '100px', border: '1px solid #CEC8BF' }}>{step.tag}</span>
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#1C1C1A', marginBottom: '16px', lineHeight: 1.3 }}>{step.title}</h2>
                  <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.8, marginBottom: '28px', fontWeight: 300 }}>{step.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {step.details.map((d) => (
                      <div key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#CEC8BF', marginTop: '2px', flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '13px', color: '#1C1C1A', lineHeight: 1.6 }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Illustration */}
                <div style={{ backgroundColor: '#F7F4F0', borderRadius: '20px', border: '1px solid #CEC8BF', padding: '32px', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StepIllustration num={step.num} />
                </div>
              </div>
              {i < steps.length - 1 && <div style={{ borderTop: '1px solid #CEC8BF' }} />}
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      {/* FAQ */}
      <section style={{ ...S.container, padding: '80px 32px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '16px' }}>— Questions fréquentes</p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 300, color: '#1C1C1A', marginBottom: '48px', lineHeight: 1.2 }}>
          Tout ce que vous<br /><em>voulez savoir.</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: '28px 0', borderTop: '1px solid #CEC8BF' }}>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#1C1C1A', marginBottom: '10px' }}>{faq.q}</p>
              <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.75, margin: 0, maxWidth: '620px' }}>{faq.a}</p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #CEC8BF' }} />
        </div>
        <div style={{ marginTop: '24px' }}>
          <Link href="/faq" style={{ fontSize: '12px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em' }}>
            Voir toutes les questions →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', backgroundColor: '#E5DED5', borderTop: '1px solid #CEC8BF', borderBottom: '1px solid #CEC8BF' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '16px' }}>— Prêt à démarrer ?</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, color: '#1C1C1A', lineHeight: 1.2, marginBottom: '20px' }}>
            Essayez ContratGîte<br /><em>gratuitement.</em>
          </h2>
          <p style={{ fontSize: '14px', color: '#7A7570', lineHeight: 1.7, marginBottom: '32px' }}>
            Configuration en 5 minutes. Aucune carte bancaire requise pour commencer.
          </p>
          <Link href="/sign-up" style={{ display: 'inline-block', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 32px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '100px' }}>
            Créer mon compte →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '15px', color: '#1C1C1A' }}>ContratGîte</span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/comment-ca-marche" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Comment ça marche</Link>
          <Link href="/faq" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FAQ</Link>
          <Link href="/sign-in" style={{ fontSize: '11px', color: '#7A7570', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Connexion</Link>
          <span style={{ fontSize: '11px', color: '#7A7570' }}>© 2025 ContratGîte</span>
        </div>
      </footer>

    </main>
  );
}

function StepIllustration({ num }: { num: string }) {
  if (num === '01') return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#CEC8BF' }} />
        <div>
          <div style={{ width: '120px', height: '10px', backgroundColor: '#1C1C1A', borderRadius: '4px', marginBottom: '6px' }} />
          <div style={{ width: '80px', height: '8px', backgroundColor: '#CEC8BF', borderRadius: '4px' }} />
        </div>
      </div>
      {['Nom du gîte', 'Email de contact', 'Logo', 'Template contrat'].map((l) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#CEC8BF', flexShrink: 0 }} />
          <div style={{ height: '8px', backgroundColor: '#E5DED5', borderRadius: '4px', flex: 1 }} />
          <span style={{ fontSize: '10px', color: '#7A7570' }}>{l}</span>
        </div>
      ))}
    </div>
  );

  if (num === '02') return (
    <div style={{ width: '100%' }}>
      {['Locataire', 'Arrivée', 'Départ', 'Loyer', 'Options'].map((l, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', color: '#7A7570', width: '50px', flexShrink: 0 }}>{l}</span>
          <div style={{ height: '28px', backgroundColor: '#E5DED5', borderRadius: '6px', flex: 1, border: '1px solid #CEC8BF', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
            <div style={{ width: `${[70, 50, 50, 40, 60][i]}%`, height: '8px', backgroundColor: '#CEC8BF', borderRadius: '3px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (num === '03') return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ width: '60px', height: '80px', backgroundColor: '#E5DED5', border: '1px solid #CEC8BF', borderRadius: '6px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '20px' }}>📄</span>
      </div>
      <div style={{ backgroundColor: '#1C1C1A', borderRadius: '8px', padding: '10px 20px', display: 'inline-block' }}>
        <span style={{ fontSize: '11px', color: '#EDE8E1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Envoyer →</span>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CEC8BF' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CEC8BF' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CEC8BF' }} />
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: '#7A7570' }}>Email envoyé</div>
    </div>
  );

  if (num === '04') return (
    <div style={{ width: '100%' }}>
      <div style={{ backgroundColor: '#E5DED5', borderRadius: '10px', padding: '16px', border: '1px solid #CEC8BF', marginBottom: '12px' }}>
        <div style={{ width: '80%', height: '8px', backgroundColor: '#CEC8BF', borderRadius: '3px', marginBottom: '6px' }} />
        <div style={{ width: '60%', height: '8px', backgroundColor: '#CEC8BF', borderRadius: '3px', marginBottom: '6px' }} />
        <div style={{ width: '70%', height: '8px', backgroundColor: '#CEC8BF', borderRadius: '3px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <div style={{ fontSize: '11px', color: '#7A7570' }}>Signature :</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1C1C1A', fontStyle: 'italic', borderBottom: '1px solid #1C1C1A', paddingBottom: '2px' }}>Jean Dupont</div>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
        {['Gérant', 'Locataire'].map((r) => (
          <div key={r} style={{ backgroundColor: '#E5DED5', borderRadius: '10px', padding: '12px 20px', border: '1px solid #CEC8BF' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{r === 'Gérant' ? '🏡' : '👤'}</div>
            <div style={{ fontSize: '10px', color: '#7A7570' }}>{r}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1C1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>✓</span>
        </div>
        <span style={{ fontSize: '11px', color: '#7A7570' }}>PDF signé reçu</span>
      </div>
    </div>
  );
}
