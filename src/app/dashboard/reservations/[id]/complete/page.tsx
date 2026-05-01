import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CompleteReservationForm from "./CompleteReservationForm";
import RefuseReservationButton from "../RefuseReservationButton";

const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
  gites_de_france: "Gîtes de France", autre: "Autre",
};

export default async function CompleteReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id }, status: 'PENDING_REVIEW' },
    include: { reservationOptions: true, gite: true },
  });
  if (!reservation) notFound();

  // iCal conflict detection — fully guarded
  type IcalConflict = { platform: string; label: string; start: string; end: string };
  let icalConflicts: IcalConflict[] = [];
  let icalFeedsCount = 0;
  try {
    const feeds = await prisma.icalFeed.findMany({ where: { giteId: reservation.giteId } });
    icalFeedsCount = feeds.length;
    const checkInStr  = reservation.checkIn.toISOString().slice(0, 10);
    const checkOutStr = reservation.checkOut.toISOString().slice(0, 10);
    icalConflicts = feeds.flatMap(feed => {
      const raw = feed.blockedDates;
      if (!Array.isArray(raw)) return [];
      return (raw as Array<{ start: string; end: string }>)
        .filter(e => e && typeof e.start === 'string' && typeof e.end === 'string'
          && e.start < checkOutStr && e.end > checkInStr)
        .map(e => ({ platform: feed.platform, label: feed.label, start: e.start, end: e.end }));
    });
  } catch { /* icalFeed table not ready or other error — silently ignore */ }

  const fmt = (d: Date) => new Date(d).toISOString().split('T')[0];
  const fmtDisplay = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtD = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });

  const address = [reservation.clientAddress, reservation.clientZipCode, reservation.clientCity]
    .filter(Boolean).join(', ') || '—';

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Réservations / <span>Nouvelle demande</span></div>
        </div>
      </div>

      <div className="content" style={{ maxWidth: '820px' }}>

        <Link href="/dashboard/reservations" className="back-link">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour aux réservations
        </Link>

        {/* Header */}
        <div className="req-header">
          <div className="rh-left">
            <div className="rh-tag">
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 4v2l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Nouvelle demande client
            </div>
            <h1>{reservation.clientFirstName} <span className="v">{reservation.clientLastName}</span></h1>
            <div className="rh-contact">
              <a href={`mailto:${reservation.clientEmail}`}>{reservation.clientEmail}</a>
              {' · '}{reservation.clientPhone}
            </div>
          </div>
          <div className="rh-right">
            <RefuseReservationButton
              reservationId={id}
              clientName={`${reservation.clientFirstName} ${reservation.clientLastName}`}
              redirectAfter="/dashboard/reservations"
            />
          </div>
        </div>

        {/* Bandeau iCal */}
        {icalConflicts.length > 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#FEF3CD', border: '1px solid #F5C842',
            borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0, color: '#B7791F' }}>
              <path d="M9 2L1.5 15h15L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M9 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="9" cy="12.5" r="0.8" fill="currentColor"/>
            </svg>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#7B4F0A', marginBottom: '4px' }}>
                Conflit détecté sur une autre plateforme
              </div>
              <div style={{ fontSize: '12px', color: '#92610E', lineHeight: 1.5 }}>
                {icalConflicts.map((c, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    <strong>{PLATFORM_LABELS[c.platform] ?? c.label}</strong> : du {fmtD(c.start)} au {fmtD(c.end)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : icalFeedsCount > 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#F0FDF4', border: '1px solid #86EFAC',
            borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0, color: '#16A34A' }}>
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
              Dates disponibles — aucun conflit détecté sur vos calendriers connectés
            </div>
          </div>
        ) : null}

        {/* Client info card */}
        <div className="req-info-card">
          <div className="cc-header">
            <span className="req-info-title">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Informations transmises par le client
            </span>
          </div>
          <div className="req-info-body">
            <div className="req-info-grid">
              <div>
                <div className="req-field-label">Adresse</div>
                <div className="req-field-value">{address}</div>
              </div>
              <div>
                <div className="req-field-label">Dates souhaitées</div>
                <div className="req-field-value">{fmtDisplay(reservation.checkIn)} → {fmtDisplay(reservation.checkOut)}</div>
              </div>
              <div>
                <div className="req-field-label">Nombre de personnes</div>
                <div className="req-field-value">{reservation.guestCount ?? '—'}</div>
              </div>
            </div>

            {reservation.reservationOptions.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div className="req-field-label">Options demandées</div>
                <div className="req-opt-pills">
                  {reservation.reservationOptions.map(o => (
                    <span key={o.id} className="req-opt-pill">
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                        <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {o.label}{o.price > 0 ? ` — ${o.price} €` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reservation.notes && (
              <div>
                <div className="req-message-label">Message du client</div>
                <div className="req-message">{reservation.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Validate form */}
        <CompleteReservationForm
          id={id}
          defaultCheckIn={fmt(reservation.checkIn)}
          defaultCheckOut={fmt(reservation.checkOut)}
          defaultCleaningFee={String(reservation.gite.cleaningFee ?? 0)}
          defaultTouristTax={String(reservation.gite.touristTax ?? 0)}
        />

      </div>
    </>
  );
}
