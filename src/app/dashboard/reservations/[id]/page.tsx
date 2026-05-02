import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractActions from "./ContractActions";

const REFUSAL_LABELS: Record<string, string> = {
  dates_taken:    "Dates déjà réservées",
  rules_breach:   "Non-respect du règlement",
  duration:       "Durée incompatible",
  unavailable:    "Établissement indisponible",
  other:          "Autre",
};
import DeleteReservationButton from "./DeleteReservationButton";
import RefuseReservationButton from "./RefuseReservationButton";
import RestoreReservationButton from "./RestoreReservationButton";
import Link from "next/link";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { contract: true, gite: true, reservationOptions: { orderBy: { label: 'asc' } } },
  });
  if (!reservation) notFound();

  // Détection de conflits iCal
  let icalFeeds: Array<{ platform: string; label: string; blockedDates: unknown }> = [];
  try { icalFeeds = await prisma.icalFeed.findMany({ where: { giteId: reservation.giteId } }); } catch (e) { console.error('[reservation] icalFeed fetch error:', e); icalFeeds = []; }
  const checkInStr  = reservation.checkIn.toISOString().slice(0, 10);
  const checkOutStr = reservation.checkOut.toISOString().slice(0, 10);
  const icalConflicts = icalFeeds.flatMap(feed => {
    const events = (feed.blockedDates as Array<{ start: string; end: string }>) ?? [];
    return events
      .filter(e => e.start < checkOutStr && e.end > checkInStr)
      .map(e => ({ platform: feed.platform, label: feed.label, start: e.start, end: e.end }));
  });

  const PLATFORM_LABELS: Record<string, string> = {
    airbnb: "Airbnb", abritel: "Abritel / VRBO", booking: "Booking.com",
    leboncoin: "Leboncoin", gites_de_france: "Gîtes de France",
  };

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';

  const isRefused = reservation.status === 'REFUSED';
  const contractStatus = reservation.contract?.status ?? null;
  const pillClass =
    isRefused ? 'pill pill-refused pill-lg' :
    reservation.status === 'PENDING_REVIEW' ? 'pill pill-a pill-lg' :
    contractStatus === 'GENERATED' ? 'pill pill-v pill-lg' :
    contractStatus === 'SIGNED' ? 'pill pill-g pill-lg' :
    'pill pill-a pill-lg';
  const pillLabel =
    isRefused ? 'Refusée' :
    reservation.status === 'PENDING_REVIEW' ? 'En attente' :
    contractStatus === null ? 'En attente' :
    contractStatus === 'GENERATING' ? 'En cours...' :
    contractStatus === 'GENERATED' ? 'Contrat généré' :
    contractStatus === 'SIGNED' ? 'Signé' : 'En attente';

  const clientName = `${reservation.clientFirstName} ${reservation.clientLastName}`;


  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">
            Réservations &rsaquo; <span>{reservation.clientFirstName} {reservation.clientLastName}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ maxWidth: '900px' }}>

        {/* Back link */}
        <Link href="/dashboard/reservations" className="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour aux réservations
        </Link>

        {/* Detail header */}
        <div className="detail-header">
          <div className="dh-left">
            <h1>
              {reservation.clientFirstName} <span className="v">{reservation.clientLastName}</span>
            </h1>
            <div className="dh-contact">
              <a href={`mailto:${reservation.clientEmail}`}>{reservation.clientEmail}</a>
              <span>·</span>
              <span>{reservation.clientPhone}</span>
            </div>
          </div>
          <div className="dh-right">
            <span className={pillClass}>{pillLabel}</span>
          </div>
        </div>

        {/* Refused banner + actions inline */}
        {isRefused ? (
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', marginBottom: '20px' }}>
            <div className="refused-banner" style={{ flex: 1, margin: 0 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>
                Cette réservation a été refusée.
                {reservation.refusalReason && (
                  <> Motif : <strong>{REFUSAL_LABELS[reservation.refusalReason] ?? reservation.refusalReason}</strong>.</>
                )}
                {reservation.refusalNote && <> &mdash; {reservation.refusalNote}</>}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <RestoreReservationButton reservationId={id} />
              <DeleteReservationButton reservationId={id} clientName={clientName} />
            </div>
          </div>
        ) : (contractStatus !== 'SIGNED' || reservation.status === 'PENDING_REVIEW') ? (
          /* Bandeau iCal + boutons Modifier/Refuser inline */
          <div className="ical-status-row">
            {reservation.status === 'PENDING_REVIEW' && icalConflicts.length > 0 ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                background: '#FEF3CD', border: '1px solid #F5C842',
                borderRadius: '10px', padding: '14px 16px',
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
                    {icalConflicts.map((c, i) => {
                      const name = PLATFORM_LABELS[c.platform] ?? c.label;
                      const fmtD = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
                      return (
                        <span key={i}>
                          {i > 0 && ' · '}
                          <strong>{name}</strong> : du {fmtD(c.start)} au {fmtD(c.end)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : reservation.status === 'PENDING_REVIEW' ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                background: '#F0FDF4', border: '1px solid #86EFAC',
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0, color: '#16A34A' }}>
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                  {icalFeeds.length > 0
                    ? 'Dates disponibles — aucun conflit détecté sur vos calendriers connectés'
                    : 'Dates disponibles'}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}
            <div className="ical-status-actions">
              <Link href={`/dashboard/reservations/${id}/edit`} className="btn btn-outline">
                Modifier
              </Link>
              <RefuseReservationButton reservationId={id} clientName={clientName} />
            </div>
          </div>
        ) : null}

        {/* Detail grid */}
        <div className="detail-grid">
          {/* Séjour */}
          <div className="detail-block">
            <div className="db-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Séjour
            </div>
            <div className="db-row">
              <div className="db-item">
                <div className="db-label">Arrivée</div>
                <div className="db-value">{fmt(reservation.checkIn)}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Départ</div>
                <div className="db-value">{fmt(reservation.checkOut)}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Personnes</div>
                <div className="db-value">{reservation.guestCount ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="detail-block">
            <div className="db-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1.5 12.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Client
            </div>
            <div className="db-row">
              <div className="db-item">
                <div className="db-label">Adresse</div>
                <div className="db-value">{reservation.clientAddress || '—'}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Ville</div>
                <div className="db-value">
                  {reservation.clientCity ? `${reservation.clientCity} ${reservation.clientZipCode ?? ''}`.trim() : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Tarifs */}
          <div className="detail-block">
            <div className="db-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4v6M5 8.5c0 .83.672 1.5 2 1.5s2-.67 2-1.5S8.328 7 7 7s-2-.67-2-1.5S5.672 4 7 4s2 .67 2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Tarifs
            </div>
            <div className="db-row">
              <div className="db-item">
                <div className="db-label">Loyer</div>
                <div className="db-value big">{reservation.rent != null ? fmtMoney(reservation.rent) : '—'}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Acompte</div>
                <div className="db-value big">{reservation.deposit != null ? fmtMoney(reservation.deposit) : '—'}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Ménage</div>
                <div className="db-value">{reservation.cleaningFee != null ? fmtMoney(reservation.cleaningFee) : '—'}</div>
              </div>
              <div className="db-item">
                <div className="db-label">Taxe de séjour</div>
                <div className="db-value">{reservation.touristTax != null ? `${fmtMoney(reservation.touristTax)}/nuit` : '—'}</div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="detail-block">
            <div className="db-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Options
            </div>
            {reservation.reservationOptions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--ink-lighter)', fontStyle: 'italic' }}>Aucune option sélectionnée</p>
            ) : (
              <div className="opt-list">
                {reservation.reservationOptions.map(opt => (
                  <div key={opt.id} className="opt-item">
                    <div className="opt-name">
                      <span className="opt-dot" />
                      {opt.label}
                    </div>
                    {opt.price > 0 && <span className="opt-price">{fmtMoney(opt.price)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contract Actions (Timeline + Contract card) */}
        <ContractActions
          reservationId={reservation.id}
          contractStatus={reservation.contract?.status ?? null}
          emailStatus={reservation.contract?.emailStatus ?? null}
          driveFileUrl={reservation.contract?.driveFileUrl ?? null}
          signedAt={reservation.contract?.signedAt ?? null}
          signedByName={reservation.contract?.signedByName ?? null}
          depositReceived={reservation.contract?.depositReceived ?? false}
          createdAt={reservation.createdAt.toISOString()}
        />

        {/* Notes card */}
        <div className="notes-card">
          <div className="notes-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Notes
          </div>
          {reservation.notes
            ? <div className="notes-text">{reservation.notes}</div>
            : <div className="notes-empty">Aucune note pour cette réservation.</div>
          }
        </div>

      </div>
    </>
  );
}
