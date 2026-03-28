import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompleteReservationForm from "./CompleteReservationForm";

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

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 40px' }}>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Nouvelle demande client</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            {reservation.clientFirstName} {reservation.clientLastName}
          </h1>
          <p style={{ fontSize: '13px', color: '#7A7570', marginTop: '6px' }}>{reservation.clientEmail} · {reservation.clientPhone}</p>
        </div>

        {/* Récap infos client */}
        <div style={{ backgroundColor: '#F7F4F0', borderRadius: '12px', border: '1px solid #CEC8BF', padding: '24px 28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>
            Informations transmises par le client
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', display: 'block', marginBottom: '4px' }}>Adresse</span>
              <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{reservation.clientAddress || '—'}, {reservation.clientZipCode} {reservation.clientCity}</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', display: 'block', marginBottom: '4px' }}>Dates souhaitées</span>
              <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmtDisplay(reservation.checkIn)} → {fmtDisplay(reservation.checkOut)}</span>
            </div>
            {reservation.reservationOptions.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', display: 'block', marginBottom: '8px' }}>Options demandées</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {reservation.reservationOptions.map(o => (
                    <span key={o.id} style={{ fontSize: '12px', padding: '4px 12px', backgroundColor: '#E5DED5', color: '#1C1C1A', borderRadius: '20px', border: '1px solid #CEC8BF' }}>
                      {o.label}{o.price > 0 ? ` — ${o.price} €` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {reservation.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', display: 'block', marginBottom: '4px' }}>Message du client</span>
                <span style={{ fontSize: '13px', color: '#1C1C1A', fontStyle: 'italic' }}>{reservation.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de complétion */}
        <div style={{ backgroundColor: '#E5DED5', borderRadius: '12px', border: '1px solid #CEC8BF', padding: '24px 28px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>
            Compléter et valider la réservation
          </p>
          <CompleteReservationForm
            id={id}
            defaultCheckIn={fmt(reservation.checkIn)}
            defaultCheckOut={fmt(reservation.checkOut)}
            defaultCleaningFee={reservation.gite.cleaningFee.toString()}
            defaultTouristTax={reservation.gite.touristTax.toString()}
          />
        </div>

    </main>
  );
}
