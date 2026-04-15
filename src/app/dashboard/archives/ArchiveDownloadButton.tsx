"use client";

import { useState } from "react";

export default function ArchiveDownloadButton({
  reservationId,
  filename,
}: {
  reservationId: string;
  filename: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/download-signed-contract`);
      if (!res.ok) {
        alert("Erreur lors de la génération du PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Télécharger le contrat signé"
      style={{
        padding: '8px 14px',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        backgroundColor: loading ? '#CEC8BF' : '#1C1C1A',
        color: '#EDE8E1',
        border: 'none',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '...' : 'PDF ↓'}
    </button>
  );
}
