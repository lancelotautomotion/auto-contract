import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuesthouseRoomBookingForm from "./GuesthouseRoomBookingForm";

export const dynamic = "force-dynamic";

// Réservation publique d'UNE chambre entière d'une maison d'hôtes.
// URL : /book/<guesthouseSlug>/<roomSlug>
export default async function GuesthouseRoomBookingPage({ params }: { params: Promise<{ slug: string; roomSlug: string }> }) {
  const { slug, roomSlug } = await params;

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { slug, deletedAt: null },
    include: {
      rooms: { where: { slug: roomSlug } },
      meals: { where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!guesthouse) notFound();

  const room = guesthouse.rooms[0];
  if (!room || !room.active) notFound();

  const feeds = await prisma.guesthouseIcalFeed.findMany({ where: { roomId: room.id } });
  const icalBlocked = feeds.flatMap((feed) =>
    ((feed.blockedDates as Array<{ start: string; end: string }>) ?? []).map((e) => ({
      start: e.start, end: e.end, platform: feed.platform, label: feed.label,
    }))
  );

  return (
    <>
      <div className="book-hero">
        <div className="book-hero-inner">
          <h1>Réservez la chambre <span className="g">{room.name}</span></h1>
          <p>{guesthouse.name} — renseignez vos informations ci-dessous. Le gérant vous contactera pour confirmer votre séjour et vous transmettre le contrat.</p>
        </div>
      </div>

      <div className="book-main">
        <GuesthouseRoomBookingForm
          guesthouseSlug={guesthouse.slug ?? ""}
          roomSlug={room.slug ?? ""}
          guesthouseName={guesthouse.name}
          guesthouseCity={guesthouse.city}
          guesthouseLogoUrl={guesthouse.logoUrl}
          roomName={room.name}
          roomCapacity={room.capacity}
          roomPrice={room.basePrice}
          meals={guesthouse.meals.map((m) => ({ id: m.id, name: m.name, description: m.description, price: m.price, service: m.service }))}
          icalBlocked={icalBlocked}
        />
      </div>

      <footer className="pub-footer">
        Propulsé par <a href="https://kordia.fr">Kordia</a>
      </footer>
    </>
  );
}
