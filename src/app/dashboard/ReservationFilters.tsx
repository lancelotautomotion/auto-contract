"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";

const STATUTS = [
  { value: '', label: 'Tous' },
  { value: 'none', label: 'En attente' },
  { value: 'GENERATED', label: 'En attente de signature' },
  { value: 'SIGNED', label: 'Signé' },
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

  const updateParam = useCallback((key: string, value: string, scroll = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll });
  }, [router, pathname, searchParams]);

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam('search', value, false), 300);
  };

  const inputStyle = {
    padding: '7px 12px', border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0',
    fontSize: '13px', color: '#1C1C1A', outline: 'none', borderRadius: '8px',
  };

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#EDE8E1' }}>

      {/* Recherche client */}
      <input
        type="text"
        placeholder="Rechercher un client..."
        defaultValue={currentSearch}
        onChange={e => handleSearch(e.target.value)}
        style={{ ...inputStyle, minWidth: '180px' }}
      />

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
        {STATUTS.map(s => {
          const active = currentStatus === s.value;
          return (
            <button
              key={s.value}
              onClick={() => updateParam('status', s.value, false)}
              style={{
                fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                fontWeight: active ? 600 : 400,
                ...getBadgeStyle(s.value, active),
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Tri par date */}
      <select
        value={currentSort}
        onChange={e => updateParam('sort', e.target.value, false)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        <option value="asc">Arrivée la plus proche en premier</option>
        <option value="desc">Arrivée la plus lointaine en premier</option>
        <option value="recent">Dernière réservation créée</option>
      </select>
    </div>
  );
}
