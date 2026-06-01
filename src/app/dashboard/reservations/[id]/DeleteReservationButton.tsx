'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from "lucide-react";

export default function DeleteReservationButton({ reservationId, clientName, redirectAfter }: { reservationId: string; clientName: string; redirectAfter?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer la réservation de ${clientName} ?\n\nCette action est irréversible. Le contrat associé sera également supprimé.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    const res = await fetch(`/api/reservations/${reservationId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push(redirectAfter ?? '/dashboard/reservations');
    } else {
      setError('Erreur lors de la suppression.');
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ fontSize: 12, color: '#b91c1c', margin: '4px 0 0' }}>{error}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="btn btn-danger-outline"
      >
        <Trash2 size={14} strokeWidth={1.4} />
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>
    </>
  );
}
