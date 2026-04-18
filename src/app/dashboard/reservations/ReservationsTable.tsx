"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  status: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  checkIn: string;
  checkOut: string;
  rent: number | null;
  contractStatus: string | null;
};

const AVATAR_COLORS = [
  { bg: 'var(--green-light)', color: 'var(--green-dark)' },
  { bg: 'var(--violet-light)', color: 'var(--violet-dark)' },
  { bg: 'var(--amber-light)', color: 'var(--amber-dark)' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getPill(r: Reservation) {
  if (r.status === 'PENDING_REVIEW') return { cls: 'pill-a', label: 'En attente' };
  if (r.contractStatus === 'SIGNED') return { cls: 'pill-g', label: 'Signé' };
  if (r.contractStatus === 'GENERATED') return { cls: 'pill-v', label: 'Envoyé' };
  return { cls: 'pill-a', label: 'En attente' };
}

const PER_PAGE = 10;

export default function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  function tabFilter(r: Reservation) {
    const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
    switch (activeTab) {
      case 'upcoming': return ci > today;
      case 'active': return ci <= today && co >= today;
      case 'past': return co < today;
      case 'pending': return r.status === 'PENDING_REVIEW';
      default: return true;
    }
  }

  function count(tab: string) {
    return reservations.filter(r => {
      const ci = new Date(r.checkIn); ci.setHours(0, 0, 0, 0);
      const co = new Date(r.checkOut); co.setHours(0, 0, 0, 0);
      switch (tab) {
        case 'upcoming': return ci > today;
        case 'active': return ci <= today && co >= today;
        case 'past': return co < today;
        case 'pending': return r.status === 'PENDING_REVIEW';
        default: return true;
      }
    }).length;
  }

  const filtered = reservations
    .filter(tabFilter)
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        `${r.clientFirstName} ${r.clientLastName}`.toLowerCase().includes(q) ||
        r.clientEmail.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette réservation ? Cette action est irréversible.')) return;
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const TABS = [
    { key: 'all', label: 'Toutes' },
    { key: 'upcoming', label: 'À venir' },
    { key: 'active', label: 'En cours' },
    { key: 'past', label: 'Passées' },
    { key: 'pending', label: 'En attente' },
  ];

  const start = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const end = Math.min(safePage * PER_PAGE, filtered.length);

  return (
    <>
      <div className="view-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`view-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label} <span className="count">{count(tab.key)}</span>
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="toolbar">
          <input
            className="t-search"
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          <div className="t-spacer" />
          <button className="t-sort">
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
              <path d="M2 3h8M3 6h6M4 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Trier par date
          </button>
          <div className="t-view">
            <button className="t-view-btn active" title="Liste">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="t-view-btn" title="Grille">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                <rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                <rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.1"/>
              </svg>
            </button>
          </div>
        </div>

        <table className="r-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Arrivée</th>
              <th>Départ</th>
              <th>Montant</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-lighter)', fontSize: '13px' }}>
                  Aucune réservation trouvée
                </td>
              </tr>
            ) : (
              paginated.map(r => {
                const initials = `${r.clientFirstName[0] ?? ''}${r.clientLastName[0] ?? ''}`.toUpperCase();
                const av = getAvatarColor(`${r.clientFirstName}${r.clientLastName}`);
                const pill = getPill(r);
                const detailHref = r.status === 'PENDING_REVIEW'
                  ? `/dashboard/reservations/${r.id}/complete`
                  : `/dashboard/reservations/${r.id}`;
                return (
                  <tr key={r.id} onClick={() => router.push(detailHref)}>
                    <td>
                      <div className="client-cell">
                        <div className="cl-av" style={{ background: av.bg, color: av.color }}>{initials}</div>
                        <div>
                          <div className="cl-name">{r.clientFirstName} {r.clientLastName}</div>
                          <div className="cl-email">{r.clientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="date">{fmt(r.checkIn)}</td>
                    <td className="date">{fmt(r.checkOut)}</td>
                    <td className="amount">{r.rent != null ? `${r.rent.toLocaleString('fr-FR')} €` : '—'}</td>
                    <td><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                    <td>
                      <div className="row-actions" onClick={e => e.stopPropagation()}>
                        <Link href={detailHref} className="row-btn" title="Voir">
                          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                            <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4S1 6 1 6z" stroke="currentColor" strokeWidth="1.1"/>
                            <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
                          </svg>
                        </Link>
                        <button className="row-btn del" title="Supprimer" onClick={e => handleDelete(e, r.id)}>
                          <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="table-footer">
            <div className="tf-info">
              Affichage {start}–{end} sur {filtered.length} réservation{filtered.length > 1 ? 's' : ''}
            </div>
            <div className="tf-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`tf-page${p === safePage ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
