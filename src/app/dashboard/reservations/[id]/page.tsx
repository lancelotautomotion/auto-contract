import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractActions from "./ContractActions";
import { ChevronLeft, X, AlertTriangle, CheckCircle, CalendarDays, User, Euro, List, FileText } from "lucide-react";

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
  try { if (reservation.giteId) icalFeeds = await prisma.icalFeed.findMany({ where: { giteId: reservation.giteId } }); } catch (e) { console.error('[reservation] icalFeed fetch error:', e); icalFeeds = []; }
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
          <ChevronLeft size={16} strokeWidth={1.5} />
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
              <X size={16} strokeWidth={1.4} />
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
                <AlertTriangle size={18} strokeWidth={1.4} style={{ flexShrink: 0, color: '#B7791F' }} />
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
                <CheckCircle size={18} strokeWidth={1.4} style={{ flexShrink: 0, color: '#16A34A' }} />
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
              <CalendarDays size={14} strokeWidth={1.4} />
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
              <User size={14} strokeWidth={1.4} />
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
              <Euro size={14} strokeWidth={1.4} />
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
              <List size={14} strokeWidth={1.4} />
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
          reminderCount={reservation.contract?.reminderCount ?? 0}
          lastReminderAt={reservation.contract?.lastReminderAt ?? null}
        />

        {/* Notes card */}
        <div className="notes-card">
          <div className="notes-title">
            <FileText size={16} strokeWidth={1.4} />
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
