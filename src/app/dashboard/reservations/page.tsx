import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ReservationsTable from "./ReservationsTable";
import CopyBookingUrlButton from "../CopyBookingUrlButton";

export default async function ReservationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id }, select: { slug: true } });
  const giteSlug = gite?.slug ?? null;

  const allReservations = await prisma.reservation.findMany({
    where: { gite: { userId: dbUser.id } },
    include: { contract: true },
    orderBy: { checkIn: 'desc' },
  });

  const pendingReservations = allReservations.filter(r => r.status === 'PENDING_REVIEW');
  const activeReservations = allReservations.filter(r => r.status !== 'PENDING_REVIEW');

  const contractsGenerated = activeReservations.filter(
    r => r.contract?.status === 'GENERATED' || r.contract?.status === 'SIGNED'
  ).length;
  const contractsSigned = activeReservations.filter(r => r.contract?.status === 'SIGNED').length;

  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const reservationsForClient = allReservations.map(r => ({
    id: r.id,
    status: r.status,
    clientFirstName: r.clientFirstName,
    clientLastName: r.clientLastName,
    clientEmail: r.clientEmail,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    rent: r.rent,
    contractStatus: r.contract?.status ?? null,
  }));

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Prysme / <span>Réservations</span></div>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn" title="Rechercher">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="topbar-btn" title="Notifications">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M4 6a4 4 0 018 0v3l1.5 2H2.5L4 9V6z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ maxWidth: '1200px', width: '100%' }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Réservations<span className="v">.</span></h1>
            <div className="sub">Gérez toutes vos réservations depuis un seul endroit</div>
          </div>
          <div className="header-actions">
            <CopyBookingUrlButton slug={giteSlug} />
            <Link href="/dashboard/reservations/new" className="btn btn-violet">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Nouvelle réservation
            </Link>
          </div>
        </div>

        {/* Pending banner */}
        {pendingReservations.length > 0 && (
          <div className="pending-banner">
            <div className="pb-header">
              <div className="pb-icon">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <circle cx="7" cy="7" r="5.5" stroke="#8C6A00" strokeWidth="1.2"/>
                  <path d="M7 4v3M7 9v.5" stroke="#8C6A00" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="pb-title">
                {pendingReservations.length} nouvelle{pendingReservations.length > 1 ? 's' : ''} demande{pendingReservations.length > 1 ? 's' : ''} à valider
              </div>
            </div>
            <div className="pb-desc">
              {pendingReservations.length > 1 ? 'Des clients ont soumis' : 'Un client a soumis'} une demande via votre formulaire de réservation.
            </div>
            {pendingReservations.map(r => (
              <div key={r.id} className="pb-item-card">
                <div className="pb-item-av">
                  {r.clientFirstName[0]}{r.clientLastName[0]}
                </div>
                <div className="pb-item-info">
                  <div className="pb-item-name">{r.clientFirstName} {r.clientLastName}</div>
                  <div className="pb-item-dates">{fmt(r.checkIn)} → {fmt(r.checkOut)}</div>
                </div>
                <Link href={`/dashboard/reservations/${r.id}/complete`} className="pb-item-action">
                  Compléter
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5h6m-2.5-2.5L8 5 5.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card green">
            <div className="sc-top">
              <div className="sc-label">Réservations</div>
              <div className="sc-icon g">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <rect x="1.5" y="3" width="11" height="9" rx="1.5" stroke="#4A7353" strokeWidth="1.2"/>
                  <path d="M1.5 6h11" stroke="#4A7353" strokeWidth="1.2"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{activeReservations.length}</div>
          </div>

          <div className="stat-card violet">
            <div className="sc-top">
              <div className="sc-label">Contrats générés</div>
              <div className="sc-icon v">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <rect x="2.5" y="1.5" width="9" height="11" rx="1.5" stroke="#5B52B5" strokeWidth="1.2"/>
                  <path d="M5 5h4M5 7.5h3" stroke="#5B52B5" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{contractsGenerated}</div>
          </div>

          <div className="stat-card green">
            <div className="sc-top">
              <div className="sc-label">Contrats signés</div>
              <div className="sc-icon g">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M3 7l3 3 5-5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{contractsSigned}</div>
          </div>

          <div className="stat-card amber">
            <div className="sc-top">
              <div className="sc-label">En attente</div>
              <div className="sc-icon a">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <circle cx="7" cy="7" r="5" stroke="#8C6A00" strokeWidth="1.2"/>
                  <path d="M7 4.5v2.5l2 1.5" stroke="#8C6A00" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{pendingReservations.length}</div>
          </div>
        </div>

        {/* Tabs + Table */}
        <ReservationsTable reservations={reservationsForClient} />

      </div>
    </>
  );
}
