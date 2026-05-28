"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface Props {
  giteId: string;
  giteName: string;
  isLastGite: boolean;
  upcomingReservations: number;
}

export default function DeleteGiteButton({ giteId, giteName, isLastGite, upcomingReservations }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/gite/${giteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "La suppression a échoué.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        marginTop: '32px', padding: '20px 22px', borderRadius: '14px',
        border: '1.5px solid rgba(178,58,58,.25)', background: 'rgba(178,58,58,.04)',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#B23A3A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Zone sensible
        </div>
        <p style={{ fontSize: '13px', color: '#71716E', lineHeight: 1.6, margin: '0 0 16px', maxWidth: '520px' }}>
          La suppression retire cet hébergement de votre tableau de bord et de votre facturation.
          Vos contrats et archives sont conservés. Cette action est définitive.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
            border: '1.5px solid rgba(178,58,58,.4)', background: '#fff', color: '#B23A3A',
          }}
        >
          Supprimer cet hébergement
        </button>
      </div>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          onClick={e => { if (e.target === e.currentTarget && !loading) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>
            {isLastGite ? (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                  Suppression impossible
                </h2>
                <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.7, marginBottom: '24px' }}>
                  Il s&apos;agit de votre dernier hébergement. Vous ne pouvez pas le supprimer —
                  votre compte doit conserver au moins un hébergement actif.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    width: '100%', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    border: 'none', background: '#7F77DD', color: '#fff',
                  }}
                >
                  J&apos;ai compris
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#2C2C2A', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                  Supprimer « {giteName} » ?
                </h2>
                <p style={{ fontSize: '14px', color: '#71716E', lineHeight: 1.7, marginBottom: upcomingReservations > 0 ? '14px' : '24px' }}>
                  Cet hébergement disparaîtra de votre tableau de bord et ne sera plus facturé.
                  Vos contrats signés et archives restent conservés.
                </p>
                {upcomingReservations > 0 && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px', marginBottom: '24px',
                    background: '#FEF3C7', border: '1px solid rgba(217,119,6,.3)',
                  }}>
                    <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                      Attention : {upcomingReservations} réservation{upcomingReservations > 1 ? 's' : ''} à venir
                      {upcomingReservations > 1 ? ' sont' : ' est'} associée{upcomingReservations > 1 ? 's' : ''} à cet hébergement.
                      {upcomingReservations > 1 ? ' Elles' : ' Elle'} ne {upcomingReservations > 1 ? 'seront' : 'sera'} plus suivie{upcomingReservations > 1 ? 's' : ''} dans le tableau de bord.
                    </p>
                  </div>
                )}
                {error && (
                  <p style={{ fontSize: '12px', color: '#B23A3A', marginBottom: '14px' }}>{error}</p>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    style={{
                      flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                      padding: '12px', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
                      border: '1.5px solid #E8E6E1', background: '#fff', color: '#2C2C2A',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    style={{
                      flex: 1, fontFamily: 'inherit', fontSize: '14px', fontWeight: 700,
                      padding: '12px', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer',
                      border: 'none', background: '#B23A3A', color: '#fff',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
