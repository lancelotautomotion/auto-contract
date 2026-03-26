import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EDE8E1', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570' }}>ContratGîte</span>
        <span style={{ fontSize: '12px', color: '#7A7570' }}>{user?.emailAddresses[0]?.emailAddress}</span>
      </header>

      <main style={{ padding: '48px 40px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>
            — Tableau de bord
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '48px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
            Bonjour{user?.firstName ? `, ${user.firstName}` : ''}.  
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid #CEC8BF', marginBottom: '32px', backgroundColor: '#CEC8BF', gap: '1px' }}>
          {[
            { label: 'Réservations', value: '0' },
            { label: 'Contrats générés', value: '0' },
            { label: 'Emails envoyés', value: '0' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '28px 32px', backgroundColor: '#E5DED5' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '12px' }}>{s.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '42px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Reservations table */}
        <div style={{ border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0' }}>
          <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Réservations</p>
            <Link href="/dashboard/reservations/new" style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 20px', backgroundColor: '#1C1C1A', color: '#EDE8E1', textDecoration: 'none' }}>
              + Nouvelle réservation
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>
            {['Client', 'Arrivée', 'Départ', 'Contrat', 'Email'].map((col) => (
              <span key={col} style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570' }}>{col}</span>
            ))}
          </div>
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>Aucune réservation pour l'instant.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
