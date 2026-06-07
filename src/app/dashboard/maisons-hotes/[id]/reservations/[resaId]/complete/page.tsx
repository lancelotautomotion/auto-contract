import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CompleteGuesthouseReservationForm from "./CompleteGuesthouseReservationForm";
import RefuseReservationButton from "@/app/dashboard/reservations/[id]/RefuseReservationButton";
import { ChevronLeft, Clock, User, Home } from "lucide-react";

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
      guesthouse: { select: { id: true, touristTax: true, defaultDepositPercentage: true } },
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

  // Nuitées : nombre de nuits entre check-in et check-out (>= 1 par sécurité).
  const msPerDay = 24 * 60 * 60 * 1000;
  const nights = Math.max(
    1,
    Math.round((reservation.checkOut.getTime() - reservation.checkIn.getTime()) / msPerDay),
  );

  // Hébergement = somme des prix nuitée des chambres × nombre de nuits.
  const roomsNightly = reservation.reservationRooms.reduce((sum, r) => sum + (r.price || 0), 0);
  const lodgingAmount = roomsNightly * nights;

  // Restauration = somme (prix unitaire × quantité) sur tous les repas demandés.
  const mealsAmount = reservation.meals.reduce((sum, m) => sum + (m.unitPrice || 0) * (m.quantity || 0), 0);

  const depositPct = reservation.guesthouse?.defaultDepositPercentage ?? 30;
  const depositAmount = Math.round(lodgingAmount * depositPct) / 100;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Réservations / <span>Nouvelle demande</span></div>
        </div>
      </div>

      <div className="content" style={{ maxWidth: "820px" }}>

        <Link href={`/dashboard/maisons-hotes/${id}/reservations`} className="back-link">
          <ChevronLeft size={14} strokeWidth={1.4} />
          Retour aux réservations
        </Link>

        {/* Header */}
        <div className="req-header">
          <div className="rh-left">
            <div className="rh-tag">
              <Clock size={12} strokeWidth={1.4} />
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
              <User size={14} strokeWidth={1.4} />
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
                      <Home size={12} strokeWidth={1.4} />
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
          defaultNights={nights}
          defaultLodging={lodgingAmount}
          mealsAmount={mealsAmount}
          defaultDeposit={depositAmount}
          defaultDepositPercentage={depositPct}
        />

      </div>
    </>
  );
}
