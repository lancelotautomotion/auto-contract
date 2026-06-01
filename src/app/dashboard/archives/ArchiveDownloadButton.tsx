"use client";

import { useState } from "react";
import { Download } from "lucide-react";

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
      <Download size={12} strokeWidth={1.4} color="#fff" />
      {loading ? '...' : 'PDF'}
    </button>
  );
}
