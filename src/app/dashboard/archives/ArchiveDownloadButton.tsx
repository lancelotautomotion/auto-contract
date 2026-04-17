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
      className="pdf-btn"
      style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
        <path d="M6 2v6m0 0L3.5 5.5M6 8l2.5-2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 9v1.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5V9" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      {loading ? '...' : 'PDF'}
    </button>
  );
}
