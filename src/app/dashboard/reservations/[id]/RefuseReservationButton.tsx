"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REASONS = [
  { value: "dates_taken",  label: "Dates déjà réservées" },
  { value: "rules_breach", label: "Non-respect du règlement (animaux, fêtes, etc.)" },
  { value: "duration",     label: "Durée de séjour incompatible" },
  { value: "unavailable",  label: "Établissement indisponible (travaux / fermeture)" },
  { value: "other",        label: "Autre (préciser)" },
];

export default function RefuseReservationButton({ reservationId, clientName, redirectAfter }: { reservationId: string; clientName: string; redirectAfter?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("dates_taken");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (reason === "other" && !note.trim()) {
      setError("Merci de préciser le motif.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/reservations/${reservationId}/refuse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, note }),
    });
    if (res.ok) {
      setOpen(false);
      if (redirectAfter) router.push(redirectAfter);
      else router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors du refus.");
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-danger-outline" onClick={() => setOpen(true)}>
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Refuser
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => !loading && setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Refuser la réservation</div>
              <button className="modal-close" onClick={() => !loading && setOpen(false)} aria-label="Fermer">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Un email de refus poli sera envoyé automatiquement à <strong>{clientName}</strong>. La réservation restera visible et pourra être restaurée.
              </p>

              <label className="form-label">Motif du refus</label>
              <select
                className="form-select"
                value={reason}
                onChange={e => { setReason(e.target.value); setError(""); }}
              >
                {REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              {reason === "other" && (
                <textarea
                  className="form-textarea"
                  placeholder="Précisez le motif (inclus dans l'email)..."
                  value={note}
                  onChange={e => { setNote(e.target.value); setError(""); }}
                  rows={3}
                />
              )}

              {error && <p className="modal-error">{error}</p>}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => !loading && setOpen(false)} disabled={loading}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
                {loading ? "Envoi en cours..." : "Confirmer le refus et envoyer l'email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
