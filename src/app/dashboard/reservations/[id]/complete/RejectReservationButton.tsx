"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RejectReservationButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!confirm("Refuser cette demande ? La réservation sera supprimée.")) return;
    setLoading(true);
    try {
      await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      router.push('/dashboard/reservations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-danger-outline" onClick={handleReject} disabled={loading}>
      <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
        <path d="M1.5 3h9M4.5 3V2a1 1 0 011-1h1a1 1 0 011 1v1M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      {loading ? 'Refus...' : 'Refuser'}
    </button>
  );
}
