import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArchiveDownloadButton from "./ArchiveDownloadButton";

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; year?: string; sort?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { search = '', year = '', sort = 'signed_desc' } = await searchParams;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  const searchFilter = search
    ? {
        OR: [
          { clientFirstName: { contains: search, mode: 'insensitive' as const } },
          { clientLastName: { contains: search, mode: 'insensitive' as const } },
          { clientEmail: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const orderBy =
    sort === 'checkin_asc' ? { checkIn: 'asc' as const }
    : sort === 'checkin_desc' ? { checkIn: 'desc' as const }
    : sort === 'name_asc' ? { clientLastName: 'asc' as const }
    : { checkIn: 'desc' as const };

  const allSigned = await prisma.reservation.findMany({
    where: {
      gite: { userId: dbUser.id },
      contract: { status: 'SIGNED', depositReceived: true },
      ...searchFilter,
    },
    include: { contract: true, gite: { select: { name: true } } },
    orderBy,
  });

  // Filtrer par année côté JS (évite une requête prisma complexe sur champ Date)
  const archives = year
    ? allSigned.filter(r => new Date(r.checkIn).getFullYear().toString() === year)
    : allSigned;

  // Années disponibles pour le filtre
  const years = [...new Set(allSigned.map(r => new Date(r.checkIn).getFullYear()))].sort((a, b) => b - a);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtShort = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtPrice = (n: number | null) => n != null ? `${n.toFixed(2).replace('.', ',')} €` : '—';

  const totalLoyer = archives.reduce((sum, r) => sum + (r.rent ?? 0), 0);
  const totalAcompte = archives.reduce((sum, r) => sum + (r.deposit ?? 0), 0);

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>— Archives</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '48px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>
          Contrats signés
        </h1>
        <p style={{ fontSize: '13px', color: '#7A7570', marginTop: '8px' }}>
          {archives.length} contrat{archives.length > 1 ? 's' : ''} archivé{archives.length > 1 ? 's' : ''}
          {year ? ` en ${year}` : ''}
        </p>
      </div>

      {/* Stats synthèse */}
      {archives.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Contrats archivés', value: archives.length.toString() },
            { label: 'Loyer total', value: fmtPrice(totalLoyer) },
            { label: 'Acomptes encaissés', value: fmtPrice(totalAcompte) },
          ].map(s => (
            <div key={s.label} style={{ padding: '24px 28px', backgroundColor: '#E5DED5', borderRadius: '12px', border: '1px solid #CEC8BF' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570', marginBottom: '10px' }}>{s.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '36px', fontWeight: 300, color: '#1C1C1A', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>

        {/* Recherche */}
        <form method="GET" style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '200px' }}>
          <input
            type="hidden" name="year" value={year}
          />
          <input
            type="hidden" name="sort" value={sort}
          />
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher un locataire..."
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid #CEC8BF',
              backgroundColor: '#F7F4F0', fontSize: '13px', color: '#1C1C1A',
              outline: 'none', borderRadius: '8px',
            }}
          />
          <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#1C1C1A', color: '#EDE8E1', border: 'none', borderRadius: '8px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Chercher
          </button>
          {search && (
            <Link href={`/dashboard/archives?year=${year}&sort=${sort}`} style={{ fontSize: '12px', color: '#7A7570', textDecoration: 'none' }}>
              ✕ Effacer
            </Link>
          )}
        </form>

        {/* Filtre année */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Link
            href={`/dashboard/archives?search=${search}&sort=${sort}`}
            style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: '20px', textDecoration: 'none', backgroundColor: !year ? '#1C1C1A' : '#E5DED5', color: !year ? '#EDE8E1' : '#7A7570', border: `1px solid ${!year ? '#1C1C1A' : '#CEC8BF'}` }}
          >
            Toutes
          </Link>
          {years.map(y => (
            <Link
              key={y}
              href={`/dashboard/archives?search=${search}&sort=${sort}&year=${y}`}
              style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: '20px', textDecoration: 'none', backgroundColor: year === y.toString() ? '#1C1C1A' : '#E5DED5', color: year === y.toString() ? '#EDE8E1' : '#7A7570', border: `1px solid ${year === y.toString() ? '#1C1C1A' : '#CEC8BF'}` }}
            >
              {y}
            </Link>
          ))}
        </div>

        {/* Tri */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'checkin_desc', label: 'Arrivée ↓' },
            { value: 'checkin_asc', label: 'Arrivée ↑' },
            { value: 'name_asc', label: 'Nom A→Z' },
          ].map(o => (
            <Link
              key={o.value}
              href={`/dashboard/archives?search=${search}&year=${year}&sort=${o.value}`}
              style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 12px', borderRadius: '20px', textDecoration: 'none', backgroundColor: sort === o.value ? '#E5DED5' : 'transparent', color: sort === o.value ? '#1C1C1A' : '#7A7570', border: '1px solid #CEC8BF' }}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #CEC8BF', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '12px 28px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
          {['Locataire', 'Arrivée', 'Départ', 'Loyer', ''].map(col => (
            <span key={col} style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A7570' }}>{col}</span>
          ))}
        </div>

        {archives.length === 0 ? (
          <div style={{ padding: '56px 28px', textAlign: 'center', backgroundColor: '#F7F4F0' }}>
            <p style={{ fontSize: '13px', color: '#7A7570', margin: 0 }}>
              {search ? `Aucun contrat trouvé pour "${search}"` : 'Aucun contrat archivé pour l\'instant.'}
            </p>
            {!search && (
              <p style={{ fontSize: '12px', color: '#CEC8BF', marginTop: '8px' }}>
                Les contrats apparaissent ici une fois signés et l'acompte confirmé.
              </p>
            )}
          </div>
        ) : (
          archives.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                padding: '18px 28px',
                borderBottom: i < archives.length - 1 ? '1px solid #CEC8BF' : 'none',
                backgroundColor: '#F7F4F0', alignItems: 'center',
              }}
            >
              <div>
                <Link href={`/dashboard/reservations/${r.id}`} style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: '14px', color: '#1C1C1A', margin: 0, fontWeight: 500 }}>
                    {r.clientLastName} {r.clientFirstName}
                  </p>
                </Link>
                <p style={{ fontSize: '11px', color: '#7A7570', margin: '3px 0 0' }}>
                  Signé le {r.contract?.signedAt ? fmtShort(r.contract.signedAt) : '—'}
                  {r.contract?.signedByName ? ` par ${r.contract.signedByName}` : ''}
                </p>
              </div>
              <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkIn)}</span>
              <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(r.checkOut)}</span>
              <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmtPrice(r.rent)}</span>
              <ArchiveDownloadButton
                reservationId={r.id}
                filename={`contrat-signe-${r.clientLastName}-${r.clientFirstName}.pdf`}
              />
            </div>
          ))
        )}
      </div>

      {/* Export CSV */}
      {archives.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <a
            href={`/api/archives/export-csv?year=${year}&search=${search}`}
            style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 20px', border: '1px solid #CEC8BF', backgroundColor: '#E5DED5', color: '#1C1C1A', textDecoration: 'none', borderRadius: '8px' }}
          >
            Exporter en CSV →
          </a>
        </div>
      )}

    </main>
  );
}
