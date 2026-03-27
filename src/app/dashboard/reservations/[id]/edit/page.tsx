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
  });
  if (!reservation) notFound();

  const fmt = (d: Date) => new Date(d).toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <a href={`/dashboard/reservations/${id}`} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>← Retour</a>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Modifier la réservation</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            {reservation.clientFirstName} {reservation.clientLastName}
          </h1>
        </div>
        <EditReservationForm
          id={id}
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
            nordicBath: reservation.nordicBath,
            sheet160: reservation.sheet160,
            sheet90: reservation.sheet90,
            towels: reservation.towels,
            notes: reservation.notes ?? '',
          }}
        />
      </main>
    </div>
  );
}
