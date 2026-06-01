import { auth } from "@clerk/nextjs/server";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArchiveDownloadButton from "@/app/dashboard/archives/ArchiveDownloadButton";
import { buildSignedContractFilename } from "@/lib/contractPdf";
import { Archive, Euro, TrendingUp, Download } from "lucide-react";

export default async function ArchivesPage({
  params,
  searchParams,
}: {
  params: Promise<{ giteId: string }>;
  searchParams: Promise<{ search?: string; year?: string; sort?: string }>;
}) {
  const { giteId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { search = '', year = '', sort = 'signed_desc' } = await searchParams;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/dashboard");

  // Verify ownership
  const gite = await prisma.gite.findFirst({ where: { id: giteId, userId: dbUser.id, deletedAt: null }, select: { id: true } });
  if (!gite) redirect("/dashboard");

  const searchFilter = search
    ? { OR: [{ clientFirstName: { contains: search, mode: 'insensitive' as const } }, { clientLastName: { contains: search, mode: 'insensitive' as const } }, { clientEmail: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const orderBy = sort === 'checkin_asc' ? { checkIn: 'asc' as const } : sort === 'checkin_desc' ? { checkIn: 'desc' as const } : sort === 'name_asc' ? { clientLastName: 'asc' as const } : { checkIn: 'desc' as const };

  const allSigned = await prisma.reservation.findMany({
    where: { giteId, contract: { is: { status: 'SIGNED', depositReceived: true } }, ...searchFilter },
    include: { contract: true, gite: { select: { name: true } } },
    orderBy,
  });

  const archives = year ? allSigned.filter(r => new Date(r.checkIn).getFullYear().toString() === year) : allSigned;
  const years = [...new Set(allSigned.map(r => new Date(r.checkIn).getFullYear()))].sort((a, b) => b - a);

  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtShort = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtPrice = (n: number | null) => n != null ? `${n.toFixed(2).replace('.', ',')} €` : '—';

  const totalLoyer = archives.reduce((sum, r) => sum + (r.rent ?? 0), 0);
  const totalAcompte = archives.reduce((sum, r) => sum + (r.deposit ?? 0), 0);
  const avColors = ['g', 'v'];

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><div className="topbar-breadcrumb">Kordia / <span>Archives</span></div></div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="page-title">
          <h1>Contrats <span className="v">signés</span></h1>
          <div className="sub">{archives.length} contrat{archives.length > 1 ? 's' : ''} archivé{archives.length > 1 ? 's' : ''}{year ? ` en ${year}` : ''}</div>
        </div>

        <div className="stats-row-3">
          <div className="stat-card green"><div className="sc-top"><div className="sc-label">Contrats archivés</div><div className="sc-icon g"><Archive size={16} strokeWidth={1.4} color="#4A7353" /></div></div><div className="sc-num">{archives.length}</div></div>
          <div className="stat-card violet"><div className="sc-top"><div className="sc-label">Loyer total</div><div className="sc-icon v"><Euro size={16} strokeWidth={1.4} color="#5B52B5" /></div></div><div className="sc-num">{fmtPrice(totalLoyer)}</div></div>
          <div className="stat-card amber"><div className="sc-top"><div className="sc-label">Acomptes encaissés</div><div className="sc-icon a"><TrendingUp size={16} strokeWidth={1.4} color="#8C6A00" /></div></div><div className="sc-num">{fmtPrice(totalAcompte)}</div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Archive size={16} strokeWidth={1.4} color="#7F77DD" /> Archives</div>
          </div>

          <div className="toolbar">
            <form method="GET" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="sort" value={sort} />
              <input name="search" defaultValue={search} placeholder="Rechercher un locataire..." className="t-search" />
              <button type="submit" className="btn btn-violet" style={{ padding: '7px 14px', fontSize: '12px' }}>Chercher</button>
              {search && <Link href={`/dashboard/${giteId}/archives?year=${year}&sort=${sort}`} style={{ fontSize: '12px', color: 'var(--ink-lighter)', textDecoration: 'none' }}>✕</Link>}
            </form>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Link href={`/dashboard/${giteId}/archives?search=${search}&sort=${sort}`} className={`fpill${!year ? ' active' : ''}`}>Toutes</Link>
              {years.map(y => <Link key={y} href={`/dashboard/${giteId}/archives?search=${search}&sort=${sort}&year=${y}`} className={`fpill${year === y.toString() ? ' active' : ''}`}>{y}</Link>)}
            </div>
            <div className="t-spacer" />
            <div style={{ display: 'flex', gap: '4px' }}>
              {[{ value: 'checkin_desc', label: 'Arrivée ↓' }, { value: 'checkin_asc', label: 'Arrivée ↑' }, { value: 'name_asc', label: 'Nom A-Z' }].map(o => <Link key={o.value} href={`/dashboard/${giteId}/archives?search=${search}&year=${year}&sort=${o.value}`} className={`fpill${sort === o.value ? ' active' : ''}`}>{o.label}</Link>)}
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="a-table">
              <thead><tr><th>Locataire</th><th>Arrivée</th><th>Départ</th><th>Loyer</th><th></th></tr></thead>
              <tbody>
                {archives.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--ink-lighter)' }}>{search ? `Aucun contrat trouvé pour "${search}"` : "Aucun contrat archivé pour l'instant."}</td></tr>
                ) : archives.map((r, i) => {
                  const avClass = avColors[i % 2] as 'g' | 'v';
                  const initials = `${r.clientLastName[0] ?? ''}${r.clientFirstName[0] ?? ''}`.toUpperCase();
                  return (
                    <tr key={r.id}>
                      <td><div className="loc-cell"><div className={`loc-av ${avClass}`}>{initials}</div><div><div className="loc-name">{r.clientLastName} {r.clientFirstName}</div><div className="loc-signed">Signé le {r.contract?.signedAt ? fmtShort(r.contract.signedAt) : '—'}{r.contract?.signedByName ? ` par ${r.contract.signedByName}` : ''}</div></div></div></td>
                      <td>{fmt(r.checkIn)}</td>
                      <td>{fmt(r.checkOut)}</td>
                      <td><span className="loyer">{fmtPrice(r.rent)}</span></td>
                      <td><ArchiveDownloadButton reservationId={r.id} filename={buildSignedContractFilename({ clientLastName: r.clientLastName, clientFirstName: r.clientFirstName, checkIn: r.checkIn, checkOut: r.checkOut })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="table-footer-info">{archives.length} contrat{archives.length > 1 ? 's' : ''} sur {allSigned.length}</div>
            {archives.length > 0 && (
              <a href={`/api/archives/export-csv?giteId=${giteId}&year=${year}&search=${search}`} className="export-btn">
                <Download size={14} strokeWidth={1.4} />
                Exporter en CSV
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
