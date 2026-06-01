import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingForm from "../BookingForm";

function slugToDisplayName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default async function RoomBookingPage({
  params,
}: {
  params: Promise<{ slug: string; roomSlug: string }>;
}) {
  const { slug, roomSlug } = await params;
  const fullSlug = `${slug}/${roomSlug}`;

  const gite = await prisma.gite.findFirst({
    where: { slug: fullSlug, deletedAt: null },
    include: {
      options: { orderBy: { position: 'asc' } },
      icalFeeds: true,
    },
  });

  if (!gite) notFound();

  const icalBlocked = gite.icalFeeds.flatMap(feed =>
    ((feed.blockedDates as Array<{ start: string; end: string }>) ?? []).map(e => ({
      start: e.start, end: e.end, platform: feed.platform, label: feed.label,
    }))
  );

  // Cherche le gîte parent (propriété) par le slug de premier niveau
  const parentGite = await prisma.gite.findFirst({
    where: { slug, deletedAt: null },
    select: { name: true },
  });
  const propertyName = parentGite?.name ?? slugToDisplayName(slug);

  return (
    <>
      <div className="book-hero">
        <div className="book-hero-inner">
          <h1>Réservez la chambre <span className="g">{gite.name}</span></h1>
          <p>
            <strong>{propertyName}</strong> — renseignez vos informations ci-dessous.
            Le gérant vous contactera pour confirmer votre séjour et vous transmettre le contrat.
          </p>
        </div>
      </div>

      <div className="book-main">
        <BookingForm
          giteSlug={fullSlug}
          giteName={gite.name}
          giteCity={gite.city}
          giteLogoUrl={gite.logoUrl}
          giteCapacity={gite.capacity}
          propertyName={propertyName}
          options={gite.options.map(o => ({ id: o.id, label: o.label, price: o.price }))}
          icalBlocked={icalBlocked}
        />
      </div>

      <footer className="pub-footer">
        Propulsé par <a href="https://kordia.fr">Kordia</a>
      </footer>
    </>
  );
}
