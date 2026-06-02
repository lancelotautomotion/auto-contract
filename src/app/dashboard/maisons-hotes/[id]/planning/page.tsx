import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import CalendarView from "@/app/dashboard/CalendarView";
import { buildGuesthouseCalendarData } from "@/lib/guesthouseCalendarData";
import RoomBookingLinksBanner from "../reservations/RoomBookingLinksBanner";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuesthousePlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      rooms: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      reservations: {
        include: { reservationRooms: true },
        orderBy: { checkIn: "desc" },
      },
    },
  });
  if (!guesthouse) notFound();

  const icalFeeds = await prisma.guesthouseIcalFeed.findMany({
    where: { room: { guesthouseId: guesthouse.id } },
    select: { platform: true, label: true, blockedDates: true, roomId: true },
  });

  const hasRooms = guesthouse.rooms.length > 0;
  const multiRooms = buildGuesthouseCalendarData(guesthouse.rooms, guesthouse.reservations, icalFeeds);
  const colorByRoomId = new Map(multiRooms.map((m) => [m.id, m.color]));
  const bannerRooms = guesthouse.rooms
    .filter((r) => r.active)
    .map((r) => ({
      id: r.id, name: r.name, slug: r.slug ?? null, capacity: r.capacity,
      basePrice: r.basePrice, color: colorByRoomId.get(r.id) ?? "#7F77DD",
    }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Planning</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="page-header">
          <div>
            <h1>Planning<span className="v">.</span></h1>
            <div className="sub">Vue d&apos;ensemble des disponibilités de vos chambres</div>
          </div>
        </div>

        {hasRooms && (
          <RoomBookingLinksBanner
            guesthouseId={id}
            guesthouseSlug={guesthouse.slug ?? null}
            rooms={bannerRooms}
          />
        )}

        <div className="form-card">
          <div className="form-card-title">
            <CalendarDays size={14} strokeWidth={1.4} />
            Calendrier des chambres
          </div>
          {hasRooms ? (
            <CalendarView
              reservations={[]}
              multiGites={multiRooms}
              allLabel="Toute la maison"
              reservationHrefBase={`/dashboard/maisons-hotes/${id}/reservations`}
            />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>
              Aucune chambre configurée — ajoutez vos chambres depuis « Mon hébergement ».
            </p>
          )}
        </div>
      </div>
    </>
  );
}
