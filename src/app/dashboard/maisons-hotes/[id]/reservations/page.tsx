import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import CalendarView from "@/app/dashboard/CalendarView";
import { buildGuesthouseCalendarData } from "@/lib/guesthouseCalendarData";

export const dynamic = "force-dynamic";

export default async function GuesthouseReservationsPage({ params }: { params: Promise<{ id: string }> }) {
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
        include: { reservationRooms: true, contract: { select: { status: true } } },
        orderBy: { checkIn: "asc" },
      },
    },
  });
  if (!guesthouse) notFound();

  const icalFeeds = await prisma.guesthouseIcalFeed.findMany({
    where: { room: { guesthouseId: guesthouse.id } },
    select: { platform: true, label: true, blockedDates: true, roomId: true },
  });

  const activeReservations = guesthouse.reservations.filter((r) => r.status !== "REFUSED" && r.status !== "CANCELLED");
  const hasRooms = guesthouse.rooms.length > 0;

  const multiRooms = buildGuesthouseCalendarData(guesthouse.rooms, guesthouse.reservations, icalFeeds);

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Planning & Réservations</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="dash-header">
          <div>
            <div className="dash-greeting">Planning & Réservations</div>
            <div className="dash-date">
              {activeReservations.length} réservation{activeReservations.length > 1 ? "s" : ""} active{activeReservations.length > 1 ? "s" : ""}
            </div>
          </div>
          <div className="header-actions">
            {hasRooms ? (
              <Link href={`/dashboard/maisons-hotes/${id}/reservations/new`} className="btn btn-violet">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Nouvelle réservation
              </Link>
            ) : (
              <Link href={`/dashboard/maisons-hotes/${id}/hebergement`} className="btn btn-outline">
                Configurer les chambres
              </Link>
            )}
          </div>
        </div>

        <div className="form-card" style={{ marginBottom: "20px" }}>
          <div className="form-card-title">Planning</div>
          {hasRooms ? (
            <CalendarView
              reservations={[]}
              multiGites={multiRooms}
              allLabel="Toute la maison"
              reservationHref={(resaId) => `/dashboard/maisons-hotes/${id}/reservations/${resaId}`}
            />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>
              Aucune chambre configurée — ajoutez vos chambres depuis « Mon hébergement ».
            </p>
          )}
        </div>

        <div className="form-card">
          <div className="form-card-title">Réservations ({activeReservations.length})</div>
          {activeReservations.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--ink-lighter)", fontStyle: "italic" }}>Aucune réservation.</p>
          ) : (
            <div className="table-card" style={{ overflowX: "auto" }}>
              <table className="resa-table" style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: "11px", color: "#A3A3A0", textTransform: "uppercase" }}>
                    <th style={{ padding: "8px" }}>Client</th>
                    <th style={{ padding: "8px" }}>Séjour</th>
                    <th style={{ padding: "8px" }}>Chambre(s)</th>
                    <th style={{ padding: "8px" }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReservations.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid #EFEDE8", fontSize: "13px", cursor: "pointer" }}>
                      <td style={{ padding: 0, fontWeight: 600 }}>
                        <Link href={`/dashboard/maisons-hotes/${id}/reservations/${r.id}`} style={{ display: "block", padding: "10px 8px", color: "#2C2C2A", textDecoration: "none" }}>
                          {r.clientFirstName} {r.clientLastName}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 8px", color: "#71716E" }}>{fmt(r.checkIn)} → {fmt(r.checkOut)}</td>
                      <td style={{ padding: "10px 8px", color: "#71716E" }}>{r.reservationRooms.map((rr) => rr.roomName).join(", ") || "—"}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r.rent != null ? `${r.rent.toLocaleString("fr-FR")} €` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
