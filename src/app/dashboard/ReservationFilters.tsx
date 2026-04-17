"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'none', label: 'En attente' },
  { value: 'GENERATED', label: 'À signer' },
  { value: 'SIGNED', label: 'Signé' },
];

const SORT_OPTIONS = [
  { value: 'asc', label: 'Arrivée la plus proche' },
  { value: 'desc', label: 'Arrivée la plus lointaine' },
  { value: 'recent', label: 'Dernière réservation' },
];

export default function ReservationFilters({ currentStatus, currentSort, currentSearch }: {
  currentStatus: string;
  currentSort: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam('search', value), 300);
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? SORT_OPTIONS[0].label;

  return (
    <div className="resa-toolbar">
      <input
        type="text"
        placeholder="Rechercher un client..."
        defaultValue={currentSearch}
        onChange={e => handleSearch(e.target.value)}
        className="resa-search"
      />

      <div className="filter-pills">
        {STATUTS.map(s => (
          <button
            key={s.value}
            onClick={() => updateParam('status', s.value)}
            className={`filter-pill${currentStatus === s.value ? ' active' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="resa-spacer" />

      <div style={{ position: 'relative' }}>
        <button className="resa-sort" onClick={() => setSortOpen(o => !o)} title={currentSortLabel}>
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <path d="M2 3h8M3 6h6M4 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {currentSort === 'asc' ? 'Proche' : currentSort === 'desc' ? 'Lointain' : 'Récent'}
        </button>

        {sortOpen && (
          <>
            <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20,
              background: 'var(--dash-white)', border: '1px solid var(--line)', borderRadius: '10px',
              overflow: 'hidden', minWidth: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => { updateParam('sort', o.value); setSortOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '12px', cursor: 'pointer', border: 'none',
                    fontFamily: 'var(--ff)',
                    backgroundColor: currentSort === o.value ? 'var(--violet-light)' : 'transparent',
                    color: currentSort === o.value ? 'var(--violet-dark)' : 'var(--ink-soft)',
                    fontWeight: currentSort === o.value ? 600 : 400,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
