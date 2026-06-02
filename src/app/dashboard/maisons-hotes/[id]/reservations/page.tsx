import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import ReservationsTable from "@/app/dashboard/reservations/ReservationsTable";
import { Plus, Info, CalendarDays, FileText, Check, Clock } from "lucide-react";

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
      rooms: { select: { id: true }, where: { active: true } },
      reservations: {
        include: { contract: { select: { status: true, emailStatus: true } } },
        orderBy: { checkIn: "desc" },
      },
    },
  });
  if (!guesthouse) notFound();

  const hasRooms = guesthouse.rooms.length > 0;
  const allReservations = guesthouse.reservations;
  const pendingReservations = allReservations.filter((r) => r.status === "PENDING_REVIEW");
  const activeCount = allReservations.filter(
    (r) => r.status !== "REFUSED" && r.status !== "CANCELLED" && r.status !== "PENDING_REVIEW"
  ).length;
  const contractsGenerated = allReservations.filter(
    (r) => r.contract?.status === "GENERATED" || r.contract?.status === "SIGNED"
  ).length;
  const contractsSigned = allReservations.filter((r) => r.contract?.status === "SIGNED").length;

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const reservationsForClient = allReservations.map((r) => ({
    id: r.id,
    status: r.status,
    clientFirstName: r.clientFirstName,
    clientLastName: r.clientLastName,
    clientEmail: r.clientEmail,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    rent: r.rent,
    contractStatus: r.contract?.status ?? null,
    emailStatus: r.contract?.emailStatus ?? null,
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / {guesthouse.name} / <span>Réservations</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1200px", width: "100%" }}>
        <div className="page-header">
          <div>
            <h1>Réservations<span className="v">.</span></h1>
            <div className="sub">Gérez toutes vos réservations depuis un seul endroit</div>
          </div>
          <div className="header-actions">
            {hasRooms ? (
              <Link href={`/dashboard/maisons-hotes/${id}/reservations/new`} className="btn btn-violet">
                <Plus size={14} strokeWidth={1.5} color="#fff" />
                Nouvelle réservation
              </Link>
            ) : (
              <Link href={`/dashboard/maisons-hotes/${id}/hebergement`} className="btn btn-outline">
                Configurer les chambres
              </Link>
            )}
          </div>
        </div>

        {pendingReservations.length > 0 && (
          <div className="pending-banner">
            <div className="pb-header">
              <div className="pb-icon">
                <Info size={18} strokeWidth={1.4} />
              </div>
              <div>
                <div className="pb-title">
                  {pendingReservations.length} nouvelle{pendingReservations.length > 1 ? "s" : ""} demande{pendingReservations.length > 1 ? "s" : ""} à valider
                </div>
                <div className="pb-sub">Des clients ont soumis une demande via votre formulaire de réservation.</div>
              </div>
            </div>
            <div className="pb-items">
              {pendingReservations.map((r) => (
                <Link key={r.id} href={`/dashboard/maisons-hotes/${id}/reservations/${r.id}/complete`} className="pb-item">
                  <div className="pb-item-left">
                    <span className="pb-item-name">{r.clientFirstName} {r.clientLastName}</span>
                    <span className="pb-item-dates">{fmt(r.checkIn)} → {fmt(r.checkOut)}</span>
                  </div>
                  <span className="pb-item-cta">Compléter →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="stats-row">
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Réservations</div><div className="sc-icon g"><CalendarDays size={14} strokeWidth={1.4} color="#4A7353" /></div></div><div className="sc-num">{activeCount}</div></div>
          <div className="stat-card violet"><div className="sc-top"><div className="sc-label">Contrats générés</div><div className="sc-icon v"><FileText size={14} strokeWidth={1.4} color="#5B52B5" /></div></div><div className="sc-num">{contractsGenerated}</div></div>
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Contrats signés</div><div className="sc-icon g"><Check size={14} strokeWidth={1.4} color="#4A7353" /></div></div><div className="sc-num">{contractsSigned}</div></div>
          <div className="stat-card amber"><div className="sc-top"><div className="sc-label">En attente</div><div className="sc-icon a"><Clock size={14} strokeWidth={1.4} color="#8C6A00" /></div></div><div className="sc-num">{pendingReservations.length}</div></div>
        </div>

        <ReservationsTable
          reservations={reservationsForClient}
          hrefBase={`/dashboard/maisons-hotes/${id}/reservations`}
        />
      </div>
    </>
  );
}
