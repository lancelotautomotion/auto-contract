import { auth, currentUser } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { type GiteCalendarData } from "@/app/dashboard/CalendarView";
import CopyBookingUrlButton from "@/app/dashboard/CopyBookingUrlButton";
import DashboardMain from "@/app/dashboard/DashboardMain";

const GITE_COLORS = ['#7F77DD', '#689D71', '#E08B4A'];

export default async function DashboardPage({ params }: { params: Promise<{ giteId: string }> }) {
  const { giteId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let firstName = 'vous';
  try {
    const user = await currentUser();
    firstName = user?.firstName ?? 'vous';
  } catch { /* Clerk API error on fresh session */ }

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateLabel = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null);
  if (!dbUser) redirect("/onboarding");

  const gite = await prisma.gite.findFirst({ where: { id: giteId, userId: dbUser.id } }).catch(() => null);
  if (!gite) redirect("/dashboard");

  const isMultiPlan = dbUser.planTier === 'multi';

  let pendingReservations: Array<{ id: string; clientFirstName: string; clientLastName: string; checkIn: Date; checkOut: Date }> = [];
  let reservations: Array<{ id: string; clientFirstName: string; clientLastName: string; checkIn: Date; checkOut: Date; status: string; contract: { status: string; emailStatus: string } | null }> = [];
  let multiGites: GiteCalendarData[] | undefined;

  try {
    // Fetch gîte list: all for multi plan, just current for essential
    const allUserGites = isMultiPlan
      ? await prisma.gite.findMany({ where: { userId: dbUser.id }, orderBy: { createdAt: 'asc' } })
      : [gite];

    const allGiteIds = allUserGites.map(g => g.id);

    const [res1, allRes, allIcalFeeds] = await Promise.all([
      prisma.reservation.findMany({ where: { giteId, status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'desc' } }),
      prisma.reservation.findMany({ where: { giteId: { in: allGiteIds } }, include: { contract: true }, orderBy: { checkIn: 'asc' } }),
      prisma.icalFeed.findMany({ where: { giteId: { in: allGiteIds } } }),
    ]);

    pendingReservations = res1;
    reservations = allRes.filter(r => r.giteId === giteId);

    // Build per-gîte data for unified calendar
    const gitesData: GiteCalendarData[] = allUserGites.map((g, i) => ({
      id: g.id,
      name: g.name,
      color: GITE_COLORS[i] ?? '#7F77DD',
      reservations: allRes
        .filter(r => r.giteId === g.id && r.status !== 'REFUSED')
        .map(r => ({
          id: r.id, clientFirstName: r.clientFirstName, clientLastName: r.clientLastName,
          checkIn: r.checkIn.toISOString(), checkOut: r.checkOut.toISOString(),
          status: r.status, contractStatus: r.contract?.status ?? null, rent: null,
        })),
      icalBlocked: allIcalFeeds
        .filter(f => f.giteId === g.id)
        .flatMap(feed => ((feed.blockedDates as Array<{ start: string; end: string }>) ?? []).map(e => ({
          start: e.start, end: e.end, platform: feed.platform, label: feed.label,
        }))),
    }));

    multiGites = gitesData;
  } catch { /* render with empty state */ }

  const contractsGenerated = reservations.filter(r => r.contract?.status === 'GENERATED' || r.contract?.status === 'SIGNED').length;
  const contractsSigned = reservations.filter(r => r.contract?.status === 'SIGNED').length;

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / <span>Tableau de bord</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="dash-header">
          <div>
            <div className="dash-greeting">Bonjour, {firstName}<span className="v">.</span></div>
            <div className="dash-date">{dateLabel}</div>
          </div>
          <div className="header-actions">
            <CopyBookingUrlButton slug={gite.slug ?? null} />
            <Link href={`/dashboard/${giteId}/reservations/new`} className="btn btn-violet">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Nouvelle réservation
            </Link>
          </div>
        </div>

        {pendingReservations.length > 0 && (
          <div className="pending-banner">
            <div className="pb-header">
              <div className="pb-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9 6v4M9 12v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
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
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Réservations</div><div className="sc-icon g"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4A7353" strokeWidth="1.2"/><path d="M2 6.5h12" stroke="#4A7353" strokeWidth="1.2"/></svg></div></div><div className="sc-num">{reservations.length}</div></div>
          <div className="stat-card violet"><div className="sc-top"><div className="sc-label">Contrats générés</div><div className="sc-icon v"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#5B52B5" strokeWidth="1.2"/><path d="M6 6h4M6 9h3" stroke="#5B52B5" strokeWidth="1.2" strokeLinecap="round"/></svg></div></div><div className="sc-num">{contractsGenerated}</div></div>
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Contrats signés</div><div className="sc-icon g"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 8l3 3 5-5" stroke="#4A7353" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div><div className="sc-num">{contractsSigned}</div></div>
          <div className="stat-card amber"><div className="sc-top"><div className="sc-label">En attente</div><div className="sc-icon a"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" stroke="#8C6A00" strokeWidth="1.2"/><path d="M8 5v3l2 1.5" stroke="#8C6A00" strokeWidth="1.2" strokeLinecap="round"/></svg></div></div><div className="sc-num">{pendingReservations.length}</div>{pendingReservations.length === 0 && <div className="sc-change up">Tout est à jour</div>}</div>
        </div>

        <DashboardMain multiGites={multiGites ?? []} currentGiteId={giteId} />
      </div>
    </>
  );
}
