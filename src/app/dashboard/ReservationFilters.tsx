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
  { value: 'asc', label: 'Arrivée la plus proche en premier' },
  { value: 'desc', label: 'Arrivée la plus lointaine en premier' },
  { value: 'recent', label: 'Dernière réservation créée' },
];

const SIGNED_BG = '#D1EDD4';
const SIGNED_TEXT = '#2D6A31';
const PENDING_BG = '#FDECD0';
const PENDING_TEXT = '#C47822';

function getBadgeStyle(value: string, active: boolean) {
  if (!active) return { backgroundColor: '#EDE8E1', color: '#7A7570', border: '1px solid #CEC8BF' };
  if (value === 'SIGNED') return { backgroundColor: SIGNED_BG, color: SIGNED_TEXT, border: `1px solid ${SIGNED_TEXT}` };
  if (value === 'GENERATED') return { backgroundColor: PENDING_BG, color: PENDING_TEXT, border: `1px solid ${PENDING_TEXT}` };
  if (value === 'none') return { backgroundColor: '#EDE8E1', color: '#1C1C1A', border: '1px solid #1C1C1A' };
  return { backgroundColor: '#1C1C1A', color: '#EDE8E1', border: '1px solid #1C1C1A' };
}

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
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher..."
        defaultValue={currentSearch}
        onChange={e => handleSearch(e.target.value)}
        style={{
          padding: '6px 12px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0',
          fontSize: '13px', color: '#1C1C1A', outline: 'none', borderRadius: '8px', width: '150px', flexShrink: 0,
        }}
      />

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
        {STATUTS.map(s => {
          const active = currentStatus === s.value;
          return (
            <button
              key={s.value}
              onClick={() => updateParam('status', s.value)}
              style={{
                fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                ...getBadgeStyle(s.value, active),
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Tri — icône + dropdown custom */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setSortOpen(o => !o)}
          title={currentSortLabel}
          style={{
            padding: '6px 10px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#1C1C1A',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          ↕ <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7570' }}>
            {currentSort === 'asc' ? 'Proche' : currentSort === 'desc' ? 'Lointain' : 'Récent'}
          </span>
        </button>

        {sortOpen && (
          <>
            <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20,
              backgroundColor: '#F7F4F0', border: '1px solid #CEC8BF', borderRadius: '10px',
              overflow: 'hidden', minWidth: '240px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => { updateParam('sort', o.value); setSortOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '12px', cursor: 'pointer', border: 'none',
                    backgroundColor: currentSort === o.value ? '#E5DED5' : 'transparent',
                    color: currentSort === o.value ? '#1C1C1A' : '#7A7570',
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
