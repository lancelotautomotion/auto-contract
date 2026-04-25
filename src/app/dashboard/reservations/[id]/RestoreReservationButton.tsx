"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreReservationButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    const res = await fetch(`/api/reservations/${reservationId}/restore`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la restauration.");
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-outline-green" onClick={handleRestore} disabled={loading}>
      <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
        <path d="M2 7a5 5 0 015-5 5 5 0 014.33 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M12 2.5V5.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7a5 5 0 01-5 5 5 5 0 01-4.33-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      {loading ? "Restauration..." : "Repasser en attente"}
    </button>
  );
}
