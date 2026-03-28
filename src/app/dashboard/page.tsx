import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CalendarView from "./CalendarView";
import ReservationFilters from "./ReservationFilters";
import { Suspense } from "react";

const SIGNED_BG = '#D1EDD4';
const SIGNED_TEXT = '#2D6A31';
const PENDING_BG = '#FDECD0';
const PENDING_TEXT = '#C47822';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string; sort?: string; search?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status: filterStatus = '', sort: filterSort = 'asc', search: filterSearch = '' } = await searchParams;

  const user = await currentUser();

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
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {giteSlug && (
            <a href={`/book/${giteSlug}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>
              ↗ Page client
            </a>
          )}
          <Link href="/dashboard/settings" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>Paramètres</Link>
          <span style={{ fontSize: '12px', color: '#7A7570' }}>{user?.emailAddresses[0]?.emailAddress}</span>
        </div>
      </header>

      <main style={{ padding: '48px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Tableau de bord</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '48px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            Bonjour{user?.firstName ? `, ${user.firstName}` : ''}.
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px', gap: '16px' }}>
          {[
            { label: 'Réservations', value: reservations.length.toString() },
            { label: 'Contrats générés', value: contractsGenerated.toString() },
            { label: 'Contrats signés', value: contractsSigned.toString() },
          ].map((s) => (
            <div key={s.label} style={{ padding: '28px 32px', backgroundColor: '#E5DED5', borderRadius: '12px', border: '1px solid #CEC8BF' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>{s.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '42px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Calendrier */}
        <div style={{ border: '1px solid #CEC8BF', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '16px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Planning</p>
          </div>
          <div style={{ padding: '24px 32px', backgroundColor: '#F7F4F0' }}>
            <CalendarView reservations={calendarReservations} />
          </div>
        </div>

        {/* Demandes en attente */}
        {pendingReservations.length > 0 && (
          <div style={{ marginBottom: '32px', border: '1px solid #CEC8BF', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#1C1C1A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EDE8E1', margin: 0 }}>Nouvelles demandes</p>
                <span style={{ fontSize: '11px', padding: '2px 10px', backgroundColor: '#EDE8E1', color: '#1C1C1A', borderRadius: '20px', fontWeight: 500 }}>
                  {pendingReservations.length}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#7A7570', margin: 0 }}>À compléter et valider</p>
            </div>
            {pendingReservations.map((r, i) => (
              <Link
                key={r.id}
                href={`/dashboard/reservations/${r.id}/complete`}
                className="reservation-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 180px', padding: '16px 32px', borderBottom: i < pendingReservations.length - 1 ? '1px solid #CEC8BF' : 'none', backgroundColor: '#F7F4F0', alignItems: 'center', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <p className="client-name" style={{ fontSize: '14px', color: '#1C1C1A', margin: 0 }}>{r.clientFirstName} {r.clientLastName}</p>
                    <p style={{ fontSize: '12px', color: '#7A7570', margin: '2px 0 0' }}>{r.clientEmail}</p>
                  </div>
                  <span className="row-arrow">→</span>
                </div>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkIn)}</span>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkOut)}</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', backgroundColor: '#EDE8E1', color: '#7A7570', borderRadius: '20px', border: '1px solid #CEC8BF' }}>
                  À compléter
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Réservations confirmées */}
        <div style={{ border: '1px solid #CEC8BF', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Réservations</p>
            <Link href="/dashboard/reservations/new" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 20px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none', borderRadius: '8px' }}>
              + Nouvelle réservation
            </Link>
          </div>
          <Suspense>
            <ReservationFilters currentStatus={filterStatus} currentSort={filterSort} currentSearch={filterSearch} />
          </Suspense>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 180px', padding: '12px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
            {['Client', 'Arrivée', 'Départ', 'Statut'].map(col => (
              <span key={col} style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570' }}>{col}</span>
            ))}
          </div>
          {reservations.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center', backgroundColor: '#F7F4F0' }}>
              <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>Aucune réservation pour l'instant.</p>
            </div>
          ) : (
            reservations.map((r, i) => (
              <Link
                key={r.id}
                href={`/dashboard/reservations/${r.id}`}
                className="reservation-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 180px', padding: '16px 32px', borderBottom: i < reservations.length - 1 ? '1px solid #CEC8BF' : 'none', backgroundColor: '#F7F4F0', alignItems: 'center', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <p className="client-name" style={{ fontSize: '14px', color: '#1C1C1A', margin: 0 }}>{r.clientFirstName} {r.clientLastName}</p>
                    <p style={{ fontSize: '12px', color: '#7A7570', margin: '2px 0 0' }}>{r.clientEmail}</p>
                  </div>
                  <span className="row-arrow">→</span>
                </div>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkIn)}</span>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkOut)}</span>
                <span style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '4px 10px', whiteSpace: 'nowrap', borderRadius: '20px',
                  textAlign: 'center', display: 'inline-block',
                  backgroundColor: r.contract?.status === 'SIGNED' ? SIGNED_BG : r.contract?.status === 'GENERATED' ? PENDING_BG : '#EDE8E1',
                  color: r.contract?.status === 'SIGNED' ? SIGNED_TEXT : r.contract?.status === 'GENERATED' ? PENDING_TEXT : '#7A7570',
                  border: `1px solid ${r.contract?.status === 'SIGNED' ? SIGNED_TEXT : r.contract?.status === 'GENERATED' ? PENDING_TEXT : '#CEC8BF'}`,
                }}>
                  {r.contract?.status === 'SIGNED' ? 'Signé ✓' : r.contract?.status === 'GENERATED' ? 'En attente de signature' : 'En attente'}
                </span>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
