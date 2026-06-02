import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import CalendarView from "@/app/dashboard/CalendarView";
import { buildGuesthouseCalendarData } from "@/lib/guesthouseCalendarData";
import RoomBookingLinksBanner from "../reservations/RoomBookingLinksBanner";
import { CalendarDays, Users, ArrowRight } from "lucide-react";
import { nightsBetween } from "@/lib/billing";

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in45days = new Date(today.getTime() + 45 * 86_400_000);

  const upcoming = guesthouse.reservations
    .filter((r) => {
      const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
      return ci >= today && ci <= in45days && r.status !== "REFUSED" && r.status !== "CANCELLED";
    })
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 8);

  const fmtDay = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  const fmtWeekday = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { weekday: "long" });

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

        {/* Two-column widget row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", alignItems: "start" }}>

          {/* Left: Liens de réservation */}
          {hasRooms ? (
            <RoomBookingLinksBanner
              guesthouseId={id}
              guesthouseSlug={guesthouse.slug ?? null}
              rooms={bannerRooms}
              noMargin
            />
          ) : (
            <div className="form-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>
                Aucune chambre active.
              </div>
            </div>
          )}

          {/* Right: Prochaines arrivées */}
          <div className="form-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid var(--line)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "#EBF5EF", color: "#4A7353", flexShrink: 0,
                }}>
                  <CalendarDays size={14} strokeWidth={1.4} />
                </span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>Prochaines arrivées</div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink-lighter)", marginTop: "1px" }}>45 prochains jours</div>
                </div>
              </div>
              <Link
                href={`/dashboard/maisons-hotes/${id}/reservations`}
                style={{ fontSize: "12px", color: "var(--ink-lighter)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
              >
                Tout voir <ArrowRight size={12} strokeWidth={1.4} />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>
                  Aucune arrivée prévue dans les 45 prochains jours
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {upcoming.map((r, i) => {
                  const nights = nightsBetween(r.checkIn, r.checkOut);
                  const roomNames = r.reservationRooms.map((rr) => rr.roomName).join(", ");
                  const roomColor = r.reservationRooms[0]?.roomId
                    ? (colorByRoomId.get(r.reservationRooms[0].roomId!) ?? "#7F77DD")
                    : "#7F77DD";
                  const ci = new Date(r.checkIn);
                  const isToday = ci.toDateString() === today.toDateString();
                  const isTomorrow = ci.toDateString() === new Date(today.getTime() + 86_400_000).toDateString();

                  return (
                    <Link
                      key={r.id}
                      href={`/dashboard/maisons-hotes/${id}/reservations/${r.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "12px 18px",
                        borderBottom: i < upcoming.length - 1 ? "1px solid var(--line)" : "none",
                        textDecoration: "none",
                        transition: "background .12s",
                      }}
                      className="upcoming-row"
                    >
                      {/* Date badge */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        minWidth: "44px", height: "44px", borderRadius: "10px",
                        background: isToday ? "#5B52B5" : isTomorrow ? "#EBF5EF" : "#F4F3F0",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: "16px", fontWeight: 700, lineHeight: 1,
                          color: isToday ? "#fff" : "var(--ink)",
                        }}>
                          {ci.getDate()}
                        </span>
                        <span style={{
                          fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.03em",
                          color: isToday ? "rgba(255,255,255,.75)" : "var(--ink-lighter)",
                          marginTop: "2px",
                        }}>
                          {ci.toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: roomColor, flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.clientFirstName} {r.clientLastName}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#5B52B5", background: "#EFEDFC", borderRadius: "20px", padding: "1px 7px", flexShrink: 0 }}>
                              Aujourd&apos;hui
                            </span>
                          )}
                          {isTomorrow && (
                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#4A7353", background: "#EBF5EF", borderRadius: "20px", padding: "1px 7px", flexShrink: 0 }}>
                              Demain
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--ink-lighter)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {roomNames || "—"}
                          <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
                          {nights} nuit{nights > 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Guests */}
                      {(r.adultsCount ?? 0) > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--ink-lighter)", flexShrink: 0 }}>
                          <Users size={12} strokeWidth={1.4} />
                          {r.adultsCount}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
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
