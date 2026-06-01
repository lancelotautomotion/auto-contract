import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CompleteGuesthouseReservationForm from "./CompleteGuesthouseReservationForm";
import RefuseReservationButton from "@/app/dashboard/reservations/[id]/RefuseReservationButton";

export const dynamic = "force-dynamic";

export default async function CompleteGuesthouseReservationPage({
  params,
}: {
  params: Promise<{ id: string; resaId: string }>;
}) {
  const { id, resaId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const reservation = await prisma.reservation.findFirst({
    where: {
      id: resaId,
      guesthouseId: id,
      guesthouse: { userId: dbUser.id },
      status: "PENDING_REVIEW",
    },
    include: {
      reservationRooms: true,
      meals: true,
      guesthouse: { select: { id: true, touristTax: true } },
    },
  });
  if (!reservation) notFound();

  const fmt = (d: Date) => new Date(d).toISOString().split("T")[0];
  const fmtDisplay = (d: Date) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const address = [reservation.clientAddress, reservation.clientZipCode, reservation.clientCity]
    .filter(Boolean)
    .join(", ") || "—";

  // Pre-fill cleaningFee from the first room's cleaningFee if available
  const firstRoomCleaningFee = reservation.reservationRooms[0]
    ? await prisma.room.findUnique({
        where: { id: reservation.reservationRooms[0].roomId ?? "" },
        select: { cleaningFee: true },
      })
    : null;
  const defaultCleaningFee = String(firstRoomCleaningFee?.cleaningFee ?? 0);
  const defaultTouristTax = String(reservation.guesthouse?.touristTax ?? 1.0);

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Réservations / <span>Nouvelle demande</span></div>
        </div>
      </div>

      <div className="content" style={{ maxWidth: "820px" }}>

        <Link href={`/dashboard/maisons-hotes/${id}/reservations`} className="back-link">
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
              {" · "}{reservation.clientPhone}
            </div>
          </div>
          <div className="rh-right">
            <RefuseReservationButton
              reservationId={resaId}
              clientName={`${reservation.clientFirstName} ${reservation.clientLastName}`}
              redirectAfter={`/dashboard/maisons-hotes/${id}/reservations`}
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
                <div className="req-field-value">{reservation.guestCount ?? "—"}</div>
              </div>
            </div>

            {reservation.reservationRooms.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div className="req-field-label">Chambre(s) demandée(s)</div>
                <div className="req-opt-pills">
                  {reservation.reservationRooms.map((r) => (
                    <span key={r.id} className="req-opt-pill">
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                        <path d="M1.5 9V5.5L6 2l4.5 3.5V9a1 1 0 01-1 1H2.5a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                      </svg>
                      {r.roomName}{r.price > 0 ? ` — ${r.price} €/nuit` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reservation.meals.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div className="req-field-label">Restauration demandée</div>
                <div className="req-opt-pills">
                  {reservation.meals.map((m) => (
                    <span key={m.id} className="req-opt-pill">
                      {m.label}{m.quantity > 1 ? ` (x${m.quantity})` : ""}
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
        <CompleteGuesthouseReservationForm
          id={resaId}
          guesthouseId={id}
          defaultCheckIn={fmt(reservation.checkIn)}
          defaultCheckOut={fmt(reservation.checkOut)}
          defaultCleaningFee={defaultCleaningFee}
          defaultTouristTax={defaultTouristTax}
        />

      </div>
    </>
  );
}
