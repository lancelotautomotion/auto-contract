import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CalendarView from "./CalendarView";
import ReservationFilters from "./ReservationFilters";
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";

const SIGNED_BG = '#D4EDD4';
const SIGNED_TEXT = '#2A6A2A';
const PENDING_SIG_BG = '#FDE8C0';
const PENDING_SIG_TEXT = '#C06820';
const PENDING_BG = '#EBEBEB';
const PENDING_TEXT = '#6A6A6A';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string; search?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? 'vous';

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

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      const gite = await prisma.gite.findFirst({ where: { userId: dbUser.id } });
      if (!gite || gite.name === "Mon Gîte") redirect("/onboarding");

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

  const fmtShort = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtLong = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '40px 40px 64px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A14', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
            Bonjour, {firstName}
          </h1>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8A49C', margin: '6px 0 0', fontFamily: 'Inter, sans-serif' }}>
            Voici l'état de votre conciergerie aujourd'hui
          </p>
        </div>
        <div style={{ marginTop: '4px' }}>
          <UserButton />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Réservations', value: reservations.length },
          { label: 'Contrats générés', value: contractsGenerated },
          { label: 'Contrats signés', value: contractsSigned },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E0D8', padding: '24px 28px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B7A38', margin: '0 0 12px', fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: '40px', fontWeight: 700, color: '#1A1A14', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendrier + Demandes en attente */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: pendingReservations.length > 0 ? '1fr 340px' : '1fr',
        gap: '16px',
        marginBottom: '28px',
        alignItems: 'start',
      }}>

        {/* Calendrier */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E0D8', padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A14', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            Calendrier des réservations
          </h2>
          <CalendarView reservations={calendarReservations} compact={pendingReservations.length > 0} />
        </div>

        {/* Demandes en attente */}
        {pendingReservations.length > 0 && (
          <div style={{ backgroundColor: '#1B2C1A', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 20px', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
              Demandes en attente
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingReservations.slice(0, 4).map((r) => (
                <div key={r.id} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{r.clientFirstName} {r.clientLastName}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '3px 0 0' }}>
                      {fmtShort(r.checkIn)} — {fmtShort(r.checkOut)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/reservations/${r.id}/complete`}
                    style={{
                      fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
                      padding: '8px 12px', backgroundColor: '#6B7A38', color: '#FFFFFF',
                      textDecoration: 'none', borderRadius: '100px', whiteSpace: 'nowrap',
                      fontWeight: 600, fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    À compléter
                  </Link>
                </div>
              ))}
            </div>
            {pendingReservations.length > 4 && (
              <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '16px 0 0', textAlign: 'center' }}>
                +{pendingReservations.length - 4} autre{pendingReservations.length - 4 > 1 ? 's' : ''}
              </p>
            )}
            <Link
              href="/dashboard?status=none"
              style={{ display: 'block', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', textAlign: 'center', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}
            >
              Voir toutes les demandes
            </Link>
          </div>
        )}
      </div>

      {/* Réservations */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E5E0D8', overflow: 'hidden' }}>

        {/* Header table */}
        <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E0D8' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A14', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            Toutes les réservations
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Suspense>
              <ReservationFilters currentStatus={filterStatus} currentSort={filterSort} currentSearch={filterSearch} />
            </Suspense>
            <Link
              href="/dashboard/reservations/new"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
                padding: '10px 18px', backgroundColor: '#6B7A38', color: '#FFFFFF',
                textDecoration: 'none', borderRadius: '100px', whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              + Nouvelle réservation
            </Link>
          </div>
        </div>

        {/* Colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 160px 48px', padding: '10px 28px', borderBottom: '1px solid #E5E0D8', backgroundColor: '#FAFAF8' }}>
          {['Client', 'Arrivée', 'Départ', 'Statut', ''].map((col) => (
            <span key={col} style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8A49C', fontWeight: 600 }}>{col}</span>
          ))}
        </div>

        {reservations.length === 0 ? (
          <div style={{ padding: '56px 28px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#A8A49C', margin: 0 }}>Aucune réservation pour l'instant.</p>
          </div>
        ) : (
          reservations.map((r, i) => {
            const status = r.contract?.status;
            const badgeBg = status === 'SIGNED' ? SIGNED_BG : status === 'GENERATED' ? PENDING_SIG_BG : PENDING_BG;
            const badgeText = status === 'SIGNED' ? SIGNED_TEXT : status === 'GENERATED' ? PENDING_SIG_TEXT : PENDING_TEXT;
            const badgeLabel = status === 'SIGNED' ? 'Signé' : status === 'GENERATED' ? 'En attente de signature' : 'En attente';

            return (
              <div
                key={r.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 160px 48px',
                  padding: '16px 28px',
                  borderBottom: i < reservations.length - 1 ? '1px solid #F0EDE8' : 'none',
                  alignItems: 'center',
                }}
              >
                <Link href={`/dashboard/reservations/${r.id}`} style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A14', margin: 0 }}>
                    {r.clientFirstName} {r.clientLastName}
                  </p>
                  <p style={{ fontSize: '11px', color: '#A8A49C', margin: '2px 0 0' }}>{r.clientEmail}</p>
                </Link>
                <span style={{ fontSize: '13px', color: '#1A1A14' }}>{fmtLong(r.checkIn)}</span>
                <span style={{ fontSize: '13px', color: '#1A1A14' }}>{fmtLong(r.checkOut)}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                  padding: '5px 10px', borderRadius: '100px',
                  backgroundColor: badgeBg, color: badgeText,
                  whiteSpace: 'nowrap',
                }}>
                  {badgeLabel}
                </span>
                <Link
                  href={`/dashboard/reservations/${r.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E0D8', color: '#A8A49C', textDecoration: 'none', fontSize: '16px', lineHeight: 1 }}
                  title="Voir"
                >
                  ⋯
                </Link>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
