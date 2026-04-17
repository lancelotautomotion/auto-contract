import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CalendarView from "./CalendarView";
import ReservationFilters from "./ReservationFilters";
import DashboardReservationRow from "./DashboardReservationRow";
import { Suspense } from "react";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string; search?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? 'vous';

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateLabel = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const { status: filterStatus = '', sort: filterSort = 'asc', search: filterSearch = '' } = await searchParams;

  let pendingReservations: Array<{
    id: string; clientFirstName: string; clientLastName: string;
    clientEmail: string; checkIn: Date; checkOut: Date;
    reservationOptions: { label: string; price: number }[];
  }> = [];

  let reservations: Array<{
    id: string; clientFirstName: string; clientLastName: string;
    clientEmail: string; checkIn: Date; checkOut: Date;
    contract: { status: string; emailStatus: string } | null;
  }> = [];

  let giteSlug: string | null = null;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
      if (!gite || gite.name === "Mon Gîte") redirect("/onboarding");

      giteSlug = gite.slug ?? null;

      pendingReservations = await prisma.reservation.findMany({
        where: { gite: { userId: dbUser.id }, status: 'PENDING_REVIEW' },
        include: { reservationOptions: true },
        orderBy: { createdAt: 'desc' },
      });

      const contractFilter = filterStatus === 'none'
        ? { contract: null }
        : filterStatus === 'GENERATED' || filterStatus === 'SIGNED'
          ? { contract: { status: filterStatus as 'GENERATED' | 'SIGNED' } }
          : {};

      const searchFilter = filterSearch
        ? {
            OR: [
              { clientFirstName: { contains: filterSearch, mode: 'insensitive' as const } },
              { clientLastName: { contains: filterSearch, mode: 'insensitive' as const } },
              { clientEmail: { contains: filterSearch, mode: 'insensitive' as const } },
            ]
          }
        : {};

      const orderBy = filterSort === 'desc'
        ? { checkIn: 'desc' as const }
        : filterSort === 'recent'
          ? { createdAt: 'desc' as const }
          : { checkIn: 'asc' as const };

      reservations = await prisma.reservation.findMany({
        where: { gite: { userId: dbUser.id }, status: { not: 'PENDING_REVIEW' }, ...contractFilter, ...searchFilter },
        include: { contract: true },
        orderBy,
      });
    } else {
      redirect("/onboarding");
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
  }

  const contractsGenerated = reservations.filter(r => r.contract?.status === 'GENERATED' || r.contract?.status === 'SIGNED').length;
  const contractsSigned = reservations.filter(r => r.contract?.status === 'SIGNED').length;

  const calendarReservations = reservations.map(r => ({
    id: r.id,
    clientFirstName: r.clientFirstName,
    clientLastName: r.clientLastName,
    checkIn: r.checkIn.toISOString(),
    checkOut: r.checkOut.toISOString(),
    contractStatus: r.contract?.status ?? null,
  }));

  const upcoming = reservations
    .filter(r => new Date(r.checkIn) >= today)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtShort = (d: Date) => `${new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}/${new Date(d).getFullYear()}`;

  void giteSlug;

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Prysme / <span>Tableau de bord</span></div>
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
        <div className="dash-header">
          <div>
            <div className="dash-greeting">
              Bonjour, {firstName}<span className="v">.</span>
            </div>
            <div className="dash-date">{dateLabel}</div>
          </div>
          <Link href="/dashboard/reservations/new" className="btn btn-violet">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nouvelle réservation
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card green">
            <div className="sc-top">
              <div className="sc-label">Réservations</div>
              <div className="sc-icon g">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4A7353" strokeWidth="1.2"/>
                  <path d="M2 6.5h12" stroke="#4A7353" strokeWidth="1.2"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{reservations.length}</div>
          </div>

          <div className="stat-card violet">
            <div className="sc-top">
              <div className="sc-label">Contrats générés</div>
              <div className="sc-icon v">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#5B52B5" strokeWidth="1.2"/>
                  <path d="M6 6h4M6 9h3" stroke="#5B52B5" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{contractsGenerated}</div>
          </div>

          <div className="stat-card green">
            <div className="sc-top">
              <div className="sc-label">Contrats signés</div>
              <div className="sc-icon g">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M4 8l3 3 5-5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{contractsSigned}</div>
          </div>

          <div className="stat-card amber">
            <div className="sc-top">
              <div className="sc-label">En attente</div>
              <div className="sc-icon a">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="5" stroke="#8C6A00" strokeWidth="1.2"/>
                  <path d="M8 5v3l2 1.5" stroke="#8C6A00" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="sc-num">{pendingReservations.length}</div>
            {pendingReservations.length === 0 && (
              <div className="sc-change up">Tout est à jour</div>
            )}
          </div>
        </div>

        {/* Grid: Planning + Upcoming */}
        <div className="grid-2">
          {/* Planning / Calendar */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#7F77DD" strokeWidth="1.2"/>
                  <path d="M2 6.5h12" stroke="#7F77DD" strokeWidth="1.2"/>
                  <path d="M5.5 1.5v3M10.5 1.5v3" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Planning
              </div>
              <div className="card-legend">
                <span><span className="legend-dot g"></span>Signé</span>
                <span><span className="legend-dot v"></span>Envoyé</span>
                <span><span className="legend-dot a"></span>En attente</span>
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <CalendarView reservations={calendarReservations} />
            </div>
          </div>

          {/* Upcoming arrivals */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="5.5" stroke="#7F77DD" strokeWidth="1.2"/>
                  <path d="M8 5v3l2 1.5" stroke="#7F77DD" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Prochaines arrivées
              </div>
            </div>
            <div className="upcoming-list">
              {upcoming.length === 0 ? (
                <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: '13px', color: 'var(--ink-lighter)' }}>
                  Aucune arrivée à venir
                </div>
              ) : (
                upcoming.map(r => {
                  const status = r.contract?.status ?? null;
                  const barClass = status === 'SIGNED' ? 'g' : status === 'GENERATED' ? 'v' : 'a';
                  const pillClass = status === 'SIGNED' ? 'pill-g' : status === 'GENERATED' ? 'pill-v' : 'pill-a';
                  const pillLabel = status === 'SIGNED' ? 'Signé' : status === 'GENERATED' ? 'Envoyé' : 'En attente';
                  return (
                    <Link key={r.id} href={`/dashboard/reservations/${r.id}`} style={{ textDecoration: 'none' }}>
                      <div className="upcoming-item">
                        <div className={`ui-bar ${barClass}`}></div>
                        <div className="ui-info">
                          <div className="ui-name">{r.clientFirstName} {r.clientLastName}</div>
                          <div className="ui-dates">{fmtShort(r.checkIn)} → {fmtShort(r.checkOut)}</div>
                        </div>
                        <span className={`pill ${pillClass}`}>{pillLabel}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Reservations table */}
        <div className="card resa-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#7F77DD" strokeWidth="1.2"/>
                <path d="M1.5 6.5h13" stroke="#7F77DD" strokeWidth="1.2"/>
              </svg>
              Réservations
            </div>
            <Link href="/dashboard/reservations/new" className="btn btn-violet" style={{ fontSize: '12px', padding: '7px 14px' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                <path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Nouvelle
            </Link>
          </div>

          <Suspense>
            <ReservationFilters currentStatus={filterStatus} currentSort={filterSort} currentSearch={filterSearch} />
          </Suspense>

          <table className="resa-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-lighter)' }}>
                    Aucune réservation pour l&apos;instant.
                  </td>
                </tr>
              ) : (
                reservations.map((r, i) => (
                  <DashboardReservationRow
                    key={r.id}
                    id={r.id}
                    clientFirstName={r.clientFirstName}
                    clientLastName={r.clientLastName}
                    clientEmail={r.clientEmail}
                    checkIn={r.checkIn.toISOString()}
                    checkOut={r.checkOut.toISOString()}
                    contractStatus={r.contract?.status ?? null}
                    isLast={i === reservations.length - 1}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Pending reservations section */}
          {pendingReservations.length > 0 && (
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 20px', background: 'var(--amber-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--amber-dark)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Nouvelles demandes — {pendingReservations.length} à valider
              </div>
              {pendingReservations.map(r => (
                <Link
                  key={r.id}
                  href={`/dashboard/reservations/${r.id}/complete`}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,189,46,.2)' }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                      {r.clientFirstName} {r.clientLastName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)', marginLeft: '8px' }}>
                      {fmt(r.checkIn)} → {fmt(r.checkOut)}
                    </span>
                  </div>
                  <span className="pill pill-a">À compléter →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
