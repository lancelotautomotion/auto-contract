const StarPath = 'M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.3 3.3 12.3l.7-4.1-3-2.9 4.2-.7z';

function Stars({ color }: { color: string }) {
  return (
    <div className="tc-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" fill={color} viewBox="0 0 14 14">
          <path d={StarPath} />
        </svg>
      ))}
    </div>
  );
}

const testimonials = [
  {
    delay: 'reveal-d1',
    starColor: '#689D71',
    quote: "Avant, je passais une heure par contrat sur Word. Maintenant, c'est fait en 3 minutes. Et mes locataires signent le jour même.",
    initials: 'MV',
    avatarClass: 'ta-g',
    name: 'Marie-Claire V.',
    role: 'Gîte dans le Luberon',
  },
  {
    delay: 'reveal-d2',
    starColor: '#7F77DD',
    quote: "La signature électronique change tout. Mes clients signent depuis l'étranger, en 30 secondes. Plus besoin de relancer 3 fois.",
    initials: 'FB',
    avatarClass: 'ta-v',
    name: 'François B.',
    role: '3 gîtes en Bretagne',
  },
  {
    delay: 'reveal-d3',
    starColor: '#689D71',
    quote: "Le calendrier avec les statuts, c'est exactement ce qu'il me manquait. Je vois tout d'un coup d'œil. Fini le flou.",
    initials: 'SL',
    avatarClass: 'ta-g',
    name: 'Sophie L.',
    role: "Chambre d'hôtes en Alsace",
  },
];

export default function Testimonials() {
  return (
    <section className="section" style={{ background: 'var(--cream)' }} id="temoignages">
      <div className="container">

        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="stag g" style={{ justifyContent: 'center' }}>Avis</div>
          <h2 className="st">Ce qu&apos;en disent <span className="g">nos premiers utilisateurs.</span></h2>
        </div>

        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className={`tc reveal ${t.delay}`}>
              <Stars color={t.starColor} />
              <p className="tc-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="tc-author">
                <div className={`ta-av ${t.avatarClass}`}>{t.initials}</div>
                <div>
                  <div className="ta-name">{t.name}</div>
                  <div className="ta-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
