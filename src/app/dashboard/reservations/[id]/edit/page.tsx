import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A3A3A0', fontWeight: 700, marginBottom: '10px' }}>Modifier la réservation</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, color: '#2C2C2A', margin: 0 }}>
            {reservation.clientFirstName} {reservation.clientLastName}
          </h1>
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
            rent: reservation.rent.toString(),
            deposit: reservation.deposit.toString(),
            cleaningFee: reservation.cleaningFee.toString(),
            touristTax: reservation.touristTax.toString(),
            notes: reservation.notes ?? '',
          }}
        />
    </main>
  );
}
