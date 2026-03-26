import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const stats = [
    { label: 'Réservations', value: '0' },
    { label: 'Contrats générés', value: '0' },
    { label: 'Emails envoyés', value: '0' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
          ContratGîte
        </span>
        <div className="flex items-center gap-6">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {user?.emailAddresses[0]?.emailAddress}
          </span>
        </div>
      </header>

      <main className="px-8 py-12 max-w-5xl">
        {/* Title */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
            — Tableau de bord
          </p>
          <h1
            className="text-5xl"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}
          >
            Bonjour{user?.firstName ? `, ${user.firstName}` : ''}.  
          </h1>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 mb-12"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--border)', gap: '1px' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-4xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Reservations */}
        <div style={{ border: '1px solid var(--border)' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Réservations
            </p>
            <Link
              href="/dashboard/reservations/new"
              className="text-xs tracking-[0.15em] uppercase px-5 py-2 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              + Nouvelle réservation
            </Link>
          </div>
          <div className="px-6 py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucune réservation pour l'instant.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
