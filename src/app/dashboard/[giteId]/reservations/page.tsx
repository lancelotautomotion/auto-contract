import { auth } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReservationsTable from "@/app/dashboard/reservations/ReservationsTable";
import CopyBookingUrlButton from "@/app/dashboard/CopyBookingUrlButton";
import { Plus, Info, CalendarDays, FileText, Check, Clock } from "lucide-react";

export default async function ReservationsPage({ params }: { params: Promise<{ giteId: string }> }) {
  const { giteId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const gite = await prisma.gite.findFirst({ where: { id: giteId, userId: dbUser.id, deletedAt: null }, select: { slug: true } });
  if (!gite) redirect("/dashboard");

  const allReservations = await prisma.reservation.findMany({
    where: { giteId },
    include: { contract: true },
    orderBy: { checkIn: 'desc' },
  });

  const pendingReservations = allReservations.filter(r => r.status === 'PENDING_REVIEW');
  const activeReservations = allReservations.filter(r => r.status !== 'PENDING_REVIEW');

  const contractsGenerated = activeReservations.filter(r => r.contract?.status === 'GENERATED' || r.contract?.status === 'SIGNED').length;
  const contractsSigned = activeReservations.filter(r => r.contract?.status === 'SIGNED').length;

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const reservationsForClient = allReservations.map(r => ({
    id: r.id, status: r.status, clientFirstName: r.clientFirstName, clientLastName: r.clientLastName,
    clientEmail: r.clientEmail, checkIn: r.checkIn.toISOString(), checkOut: r.checkOut.toISOString(),
    rent: r.rent, contractStatus: r.contract?.status ?? null, emailStatus: r.contract?.emailStatus ?? null,
  }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><div className="topbar-breadcrumb">Kordia / <span>Réservations</span></div></div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="page-header">
          <div>
            <h1>Réservations<span className="v">.</span></h1>
            <div className="sub">Gérez toutes vos réservations depuis un seul endroit</div>
          </div>
          <div className="header-actions">
            <CopyBookingUrlButton slug={gite.slug ?? null} />
            <Link href={`/dashboard/${giteId}/reservations/new`} className="btn btn-violet">
              <Plus size={14} strokeWidth={1.5} color="#fff" />
              Nouvelle réservation
            </Link>
          </div>
        </div>

        {pendingReservations.length > 0 && (
          <div className="pending-banner">
            <div className="pb-header">
              <div className="pb-icon">
                <Info size={18} strokeWidth={1.4} />
              </div>
              <div>
                <div className="pb-title">{pendingReservations.length} nouvelle{pendingReservations.length > 1 ? 's' : ''} demande{pendingReservations.length > 1 ? 's' : ''} à valider</div>
                <div className="pb-sub">Des clients ont soumis une demande via votre formulaire de réservation.</div>
              </div>
            </div>
            <div className="pb-items">
              {pendingReservations.map(r => (
                <Link key={r.id} href={`/dashboard/${giteId}/reservations/${r.id}/complete`} className="pb-item">
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
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Réservations</div><div className="sc-icon g"><CalendarDays size={14} strokeWidth={1.4} color="#4A7353" /></div></div><div className="sc-num">{activeReservations.length}</div></div>
          <div className="stat-card violet"><div className="sc-top"><div className="sc-label">Contrats générés</div><div className="sc-icon v"><FileText size={14} strokeWidth={1.4} color="#5B52B5" /></div></div><div className="sc-num">{contractsGenerated}</div></div>
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Contrats signés</div><div className="sc-icon g"><Check size={14} strokeWidth={1.4} color="#4A7353" /></div></div><div className="sc-num">{contractsSigned}</div></div>
          <div className="stat-card amber"><div className="sc-top"><div className="sc-label">En attente</div><div className="sc-icon a"><Clock size={14} strokeWidth={1.4} color="#8C6A00" /></div></div><div className="sc-num">{pendingReservations.length}</div></div>
        </div>

        <ReservationsTable reservations={reservationsForClient} giteId={giteId} />
      </div>
    </>
  );
}
