import { auth } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditReservationForm from "./EditReservationForm";
import { ChevronLeft } from "lucide-react";

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
    where: { userId: dbUser.id, deletedAt: null },
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
          <TopbarSignOut />
        </div>
      </div>

      <div className="content" style={{ maxWidth: '1100px', width: '100%' }}>

        <Link href={`/dashboard/reservations/${id}`} className="back-link">
          <ChevronLeft size={14} strokeWidth={1.4} />
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
