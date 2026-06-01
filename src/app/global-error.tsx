"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#F3F2EE", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "16px", padding: "40px 48px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertCircle size={22} strokeWidth={1.5} color="#EF4444" />
          </div>
          <div style={{ fontSize: "17px", fontWeight: "700", color: "#2C2C2A", marginBottom: "8px" }}>
            Une erreur est survenue
          </div>
          <div style={{ fontSize: "13px", color: "#71716E", lineHeight: 1.6, marginBottom: "24px" }}>
            L&apos;incident a été signalé automatiquement. Vous pouvez essayer de recharger la page.
          </div>
          <button
            onClick={reset}
            style={{ background: "#7F77DD", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer", width: "100%" }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
