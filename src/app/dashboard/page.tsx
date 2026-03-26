import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  // Récupère les réservations
  let reservations: Array<{
    id: string;
    clientFirstName: string;
    clientLastName: string;
    clientEmail: string;
    checkIn: Date;
    checkOut: Date;
    contract: { status: string } | null;
  }> = [];

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (dbUser) {
      reservations = await prisma.reservation.findMany({
        where: { gite: { userId: dbUser.id } },
        include: { contract: true },
        orderBy: { checkIn: 'asc' },
      });
    }
  } catch {
    // DB pas encore connectée, on affiche le dashboard vide
  }

  const contractsGenerated = reservations.filter(r => r.contract?.status === 'GENERATED').length;

  const formatDate = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <span style={{ fontSize: '12px', color: '#7A7570' }}>{user?.emailAddresses[0]?.emailAddress}</span>
      </header>

      <main style={{ padding: '48px 40px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Tableau de bord</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '48px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            Bonjour{user?.firstName ? `, ${user.firstName}` : ''}.
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid #CEC8BF', marginBottom: '32px', backgroundColor: '#CEC8BF', gap: '1px' }}>
          {[
            { label: 'Réservations', value: reservations.length.toString() },
            { label: 'Contrats générés', value: contractsGenerated.toString() },
            { label: 'Emails envoyés', value: '0' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '28px 32px', backgroundColor: '#E5DED5' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>{s.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '42px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #CEC8BF' }}>
          <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Réservations</p>
            <Link href="/dashboard/reservations/new" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 20px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none' }}>
              + Nouvelle réservation
            </Link>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
            {['Client', 'Arrivée', 'Départ', 'Statut'].map(col => (
              <span key={col} style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570' }}>{col}</span>
            ))}
          </div>

          {reservations.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center', backgroundColor: '#F7F4F0' }}>
              <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>Aucune réservation pour l'instant.</p>
            </div>
          ) : (
            reservations.map((r, i) => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '16px 32px', borderBottom: i < reservations.length - 1 ? '1px solid #CEC8BF' : 'none', backgroundColor: '#F7F4F0', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#1C1C1A', margin: 0 }}>{r.clientFirstName} {r.clientLastName}</p>
                  <p style={{ fontSize: '12px', color: '#7A7570', margin: '2px 0 0' }}>{r.clientEmail}</p>
                </div>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{formatDate(r.checkIn)}</span>
                <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{formatDate(r.checkOut)}</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', backgroundColor: r.contract?.status === 'GENERATED' ? '#1C1C1A' : '#E5DED5', color: r.contract?.status === 'GENERATED' ? '#EDE8E1' : '#7A7570', display: 'inline-block' }}>
                  {r.contract?.status === 'GENERATED' ? 'Généré' : 'En attente'}
                </span>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
