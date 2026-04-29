import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditReservationForm from "./EditReservationForm";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const reservation = await prisma.reservation.findFirst({
    where: { id, gite: { userId: dbUser.id } },
    include: { reservationOptions: true },
  });
  if (!reservation) notFound();

  const gite = await prisma.gite.findFirst({
    where: { userId: dbUser.id },
    include: { options: { orderBy: { position: 'asc' } } },
  });

  const fmt = (d: Date) => new Date(d).toISOString().split('T')[0];

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / Réservations / <span>Modifier</span></div>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="content" style={{ maxWidth: '1100px', width: '100%' }}>

        <Link href={`/dashboard/reservations/${id}`} className="back-link">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour à la réservation
        </Link>

        <div className="page-title">
          <h1>Modifier <span className="v">{reservation.clientFirstName} {reservation.clientLastName}</span></h1>
          <div className="sub">Mettez à jour les informations du séjour, les tarifs ou les options</div>
        </div>

        <EditReservationForm
          id={id}
          availableOptions={gite?.options.map(o => ({ id: o.id, label: o.label, price: o.price })) ?? []}
          selectedOptionIds={reservation.reservationOptions.map(o => o.giteOptionId).filter(Boolean) as string[]}
          initial={{
            clientFirstName: reservation.clientFirstName,
            clientLastName: reservation.clientLastName,
            clientEmail: reservation.clientEmail,
            clientPhone: reservation.clientPhone,
            clientAddress: reservation.clientAddress ?? '',
            clientCity: reservation.clientCity ?? '',
            clientZipCode: reservation.clientZipCode ?? '',
            checkIn: fmt(reservation.checkIn),
            checkOut: fmt(reservation.checkOut),
            rent: (reservation.rent ?? 0).toString(),
            deposit: (reservation.deposit ?? 0).toString(),
            cleaningFee: (reservation.cleaningFee ?? 0).toString(),
            touristTax: (reservation.touristTax ?? 0).toString(),
            notes: reservation.notes ?? '',
          }}
        />
      </div>
    </>
  );
}
