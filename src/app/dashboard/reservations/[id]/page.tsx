import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContractActions from "./ContractActions";
import Link from "next/link";

const labelStyle = { fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#7A7570', marginBottom: '4px', display: 'block' };
const valueStyle = { fontSize: '14px', color: '#1C1C1A' };

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

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtPrice = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <a href="/dashboard" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7570', textDecoration: 'none' }}>← Tableau de bord</a>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 40px' }}>

        {/* Title + statut + bouton modifier */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Détail réservation</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '44px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
              {reservation.clientFirstName} {reservation.clientLastName}
            </h1>
            <p style={{ fontSize: '13px', color: '#7A7570', marginTop: '6px' }}>{reservation.clientEmail} · {reservation.clientPhone}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '6px 14px', backgroundColor: reservation.contract?.status === 'GENERATED' ? '#1C1C1A' : '#E5DED5', color: reservation.contract?.status === 'GENERATED' ? '#EDE8E1' : '#7A7570', display: 'inline-block', borderRadius: '20px' }}>
              {reservation.contract?.status === 'GENERATED' ? 'Contrat généré' :
               reservation.contract?.status === 'GENERATING' ? 'En cours...' : 'En attente'}
            </span>
            <Link href={`/dashboard/reservations/${id}/edit`} style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid #CEC8BF', backgroundColor: '#E5DED5', color: '#1C1C1A', textDecoration: 'none', borderRadius: '8px' }}>
              Modifier →
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', border: '1px solid #CEC8BF', backgroundColor: '#CEC8BF', marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#F7F4F0', padding: '28px 32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>Séjour</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><span style={labelStyle}>Arrivée</span><span style={valueStyle}>{fmt(reservation.checkIn)}</span></div>
              <div><span style={labelStyle}>Départ</span><span style={valueStyle}>{fmt(reservation.checkOut)}</span></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#F7F4F0', padding: '28px 32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>Client</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><span style={labelStyle}>Adresse</span><span style={valueStyle}>{reservation.clientAddress || '—'}</span></div>
              <div><span style={labelStyle}>Ville</span><span style={valueStyle}>{reservation.clientCity ? `${reservation.clientCity} ${reservation.clientZipCode}` : '—'}</span></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#E5DED5', padding: '28px 32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>Tarifs</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><span style={labelStyle}>Loyer</span><span style={valueStyle}>{reservation.rent != null ? fmtPrice(reservation.rent) : '—'}</span></div>
              <div><span style={labelStyle}>Acompte</span><span style={valueStyle}>{reservation.deposit != null ? fmtPrice(reservation.deposit) : '—'}</span></div>
              <div><span style={labelStyle}>Ménage</span><span style={valueStyle}>{reservation.cleaningFee != null ? fmtPrice(reservation.cleaningFee) : '—'}</span></div>
              <div><span style={labelStyle}>Taxe de séjour</span><span style={valueStyle}>{reservation.touristTax != null ? `${fmtPrice(reservation.touristTax)}/nuit` : '—'}</span></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#E5DED5', padding: '28px 32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #CEC8BF' }}>Options</p>
            {reservation.reservationOptions.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#7A7570', fontStyle: 'italic' }}>Aucune option sélectionnée</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reservation.reservationOptions.map(opt => (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1C1C1A', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{opt.label}</span>
                    </div>
                    {opt.price > 0 && <span style={{ fontSize: '12px', color: '#7A7570' }}>{fmtPrice(opt.price)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ContractActions
          reservationId={reservation.id}
          contractStatus={reservation.contract?.status ?? null}
          emailStatus={reservation.contract?.emailStatus ?? null}
          driveFileUrl={reservation.contract?.driveFileUrl ?? null}
        />
      </main>
    </div>
  );
}
