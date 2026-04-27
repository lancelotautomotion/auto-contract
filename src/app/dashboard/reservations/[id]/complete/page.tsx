import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CompleteReservationForm from "./CompleteReservationForm";
import RefuseReservationButton from "../RefuseReservationButton";

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

  const fmt = (d: Date) => new Date(d).toISOString().split('T')[0];
  const fmtDisplay = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const address = [reservation.clientAddress, reservation.clientZipCode, reservation.clientCity]
    .filter(Boolean).join(', ') || '—';

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">
            Réservations / <span>Nouvelle demande</span>
          </div>
        </div>
      </div>

      {/* Content */}
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
          defaultCleaningFee={reservation.gite.cleaningFee.toString()}
          defaultTouristTax={reservation.gite.touristTax.toString()}
        />

      </div>
    </>
  );
}
