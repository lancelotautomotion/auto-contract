"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

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
        <RefreshCw size={14} strokeWidth={1.4} />
        {loading ? "Restauration..." : "Repasser en attente"}
      </button>
    </>
  );
}
