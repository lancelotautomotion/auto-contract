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
      style={{
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '8px 16px',
        border: '1px solid #CEC8BF',
        backgroundColor: 'transparent',
        color: loading ? '#CEC8BF' : '#B04040',
        borderColor: loading ? '#CEC8BF' : '#D4A0A0',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}
