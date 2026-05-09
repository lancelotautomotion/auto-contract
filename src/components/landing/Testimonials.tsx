const StarPath = 'M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.3 3.3 12.3l.7-4.1-3-2.9 4.2-.7z';

function Stars() {
  return (
    <div className="tb-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 14 14" fill="#F59E0B">
          <path d={StarPath} />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <div className="tb-av">{initials}</div>;
}

function Card({
  variant, quote, name, role, initials, delay = '',
}: {
  variant: 'v' | 'g' | 'd';
  quote: string;
  name: string;
  role: string;
  initials: string;
  delay?: string;
}) {
  return (
    <div className={`tb-card tb-${variant} reveal${delay ? ' ' + delay : ''}`}>
      <Stars />
      <p className="tb-quote">&ldquo;{quote}&rdquo;</p>
      <div className="tb-author">
        <Avatar initials={initials} />
        <div>
          <div className="tb-name">{name}</div>
          <div className="tb-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="section" style={{ background: 'var(--cream)' }} id="temoignages">
      <div className="container">

        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="stag g" style={{ justifyContent: 'center' }}>Témoignages</div>
          <h2 className="st">Ce qu&apos;en disent <span className="g">nos gérants.</span></h2>
          <p className="st-sub">Des propriétaires de gîtes partout en France qui ont repris le contrôle de leurs locations.</p>
        </div>

        <div className="tb-grid">

          {/* Colonne 1 — grand violet en haut, vert court en bas */}
          <div className="tb-col">
            <Card
              variant="v"
              initials="HL"
              name="Hervé Loubier"
              role="2 gîtes en Dordogne"
              quote="J'avais tout en papier, tout sur Word. Kordia m'a permis de professionnaliser en quelques jours. Mes locataires sont bluffés par la signature électronique — ils n'avaient jamais fait ça pour une location de vacances."
              delay="reveal-d1"
            />
            <Card
              variant="g"
              initials="MV"
              name="Marie-Claire V."
              role="Gîte dans le Luberon"
              quote="Avant je passais une heure par contrat. Maintenant c'est 3 minutes. Mes locataires signent le jour même."
              delay="reveal-d2"
            />
          </div>

          {/* Colonne 2 — trois cartes sombres empilées */}
          <div className="tb-col">
            <Card
              variant="d"
              initials="FB"
              name="François B."
              role="3 gîtes en Bretagne"
              quote="La signature électronique change tout. Mes clients signent depuis l'étranger en 30 secondes. Plus besoin de relancer trois fois."
              delay="reveal-d2"
            />
            <Card
              variant="d"
              initials="SL"
              name="Sophie L."
              role="Chambre d'hôtes en Alsace"
              quote="Le calendrier avec les statuts m'a changé la vie. Je vois tout d'un coup d'œil, plus aucun flou sur mes réservations."
              delay="reveal-d3"
            />
            <Card
              variant="d"
              initials="JM"
              name="Jean-Luc M."
              role="Gîte dans les Vosges"
              quote="Les relances automatiques quand un locataire n'a pas signé, c'est un vrai gain de temps. Je n'ai plus à courir après personne."
              delay="reveal-d4"
            />
          </div>

          {/* Colonne 3 — vert court en haut, grand violet en bas */}
          <div className="tb-col">
            <Card
              variant="g"
              initials="CD"
              name="Caroline D."
              role="2 chalets en Savoie"
              quote="L'archivage est parfait. Tous mes contrats en un seul endroit, téléchargeables à tout moment. Mon comptable adore."
              delay="reveal-d3"
            />
            <Card
              variant="v"
              initials="PR"
              name="Pierre-Antoine R."
              role="Gîte rural en Normandie"
              quote="J'ai testé pendant les 30 jours gratuits et j'ai tout de suite vu la différence. Le passage à l'abonnement était une évidence. Kordia me fait gagner des heures chaque semaine et mes contrats ont enfin un aspect professionnel."
              delay="reveal-d4"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
