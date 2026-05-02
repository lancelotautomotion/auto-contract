"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreReservationButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/reservations/${reservationId}/restore`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      setError("Erreur lors de la restauration.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && <p style={{ fontSize: 12, color: '#b91c1c', margin: '4px 0 0' }}>{error}</p>}
      <button className="btn btn-outline-green" onClick={handleRestore} disabled={loading}>
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path d="M2 7a5 5 0 015-5 5 5 0 014.33 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M12 2.5V5.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 7a5 5 0 01-5 5 5 5 0 01-4.33-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        {loading ? "Restauration..." : "Repasser en attente"}
      </button>
    </>
  );
}
