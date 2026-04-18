'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteReservationButton({ reservationId, clientName }: { reservationId: string; clientName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer la réservation de ${clientName} ?\n\nCette action est irréversible. Le contrat associé sera également supprimé.`
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch(`/api/reservations/${reservationId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      alert('Erreur lors de la suppression.');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-danger-outline"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4M3 3.5l.5 7.5a1 1 0 001 1h5a1 1 0 001-1l.5-7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}
