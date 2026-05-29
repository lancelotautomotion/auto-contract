import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { buildRoomAvailability } from "@/lib/availability";
import RoomCalendar from "../RoomCalendar";

export const dynamic = "force-dynamic";

export default async function GuesthouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouse = await prisma.guesthouse.findFirst({
    where: { id, userId: dbUser.id, deletedAt: null },
    include: {
      rooms: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      reservations: { include: { reservationRooms: true }, orderBy: { checkIn: "asc" } },
    },
  });
  if (!guesthouse) notFound();

  const availability = buildRoomAvailability(guesthouse.rooms, guesthouse.reservations);
  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const activeReservations = guesthouse.reservations.filter((r) => r.status !== "REFUSED" && r.status !== "CANCELLED");

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / Maisons d&apos;hôtes / <span>{guesthouse.name}</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <Link href="/dashboard/maisons-hotes" className="back-link">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour aux maisons d&apos;hôtes
        </Link>

        <div className="dash-header">
          <div>
            <div className="dash-greeting">{guesthouse.name}</div>
            <div className="dash-date">{guesthouse.rooms.length} chambre{guesthouse.rooms.length > 1 ? "s" : ""}</div>
          </div>
          <div className="header-actions">
            <Link href={`/dashboard/maisons-hotes/${id}/chambres`} className="btn btn-outline">Gérer les chambres</Link>
            <Link href={`/dashboard/maisons-hotes/${id}/reservations/new`} className="btn btn-violet">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Nouvelle réservation
            </Link>
          </div>
        </div>

        <div className="form-card" style={{ marginBottom: "20px" }}>
          <div className="form-card-title">Planning par chambre</div>
          <RoomCalendar availability={availability} />
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
                    <tr key={r.id} style={{ borderTop: "1px solid #EFEDE8", fontSize: "13px" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r.clientFirstName} {r.clientLastName}</td>
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
