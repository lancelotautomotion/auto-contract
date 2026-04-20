"use client";

import { useState } from "react";

export default function SubscribeButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? "Impossible de démarrer le paiement.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "15px",
          fontWeight: 700,
          backgroundColor: disabled ? "#C9D4CC" : loading ? "#9A94E0" : "#7F77DD",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "11px",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          transition: "background-color .15s",
        }}
      >
        {loading ? "Redirection vers le paiement…" : "Souscrire — 9,99 € HT / mois"}
      </button>
      {error && (
        <p style={{ fontSize: "12px", color: "#B23A3A", textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
