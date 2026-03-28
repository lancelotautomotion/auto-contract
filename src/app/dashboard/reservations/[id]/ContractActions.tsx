"use client";

import { useState } from "react";

interface Props {
  reservationId: string;
  contractStatus: string | null;
  emailStatus: string | null;
  driveFileUrl: string | null;
}

const btnPrimary = {
  fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
  padding: '14px 28px', backgroundColor: '#1C1C1A', color: '#EDE8E1',
  border: 'none', cursor: 'pointer', flex: 1, borderRadius: '8px',
};
const btnSecondary = {
  fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
  padding: '14px 28px', backgroundColor: '#E5DED5', color: '#1C1C1A',
  border: '1px solid #CEC8BF', cursor: 'pointer', flex: 1, borderRadius: '8px',
};
const btnDisabled = { ...btnPrimary, backgroundColor: '#CEC8BF', cursor: 'not-allowed' as const };

export default function ContractActions({ reservationId, contractStatus, emailStatus }: Props) {
  const [status, setStatus] = useState(contractStatus);
  const [mailStatus, setMailStatus] = useState(emailStatus);
  const [loading, setLoading] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const downloadContract = async () => {
    setLoading('generate');
    try {
      const res = await fetch(`/api/reservations/${reservationId}/generate-contract`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Erreur lors de la génération');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat-${reservationId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('GENERATED');
    } finally {
      setLoading(null);
    }
  };

  const sendEmail = async () => {
    setLoading('email');
    setEmailError(null);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMailStatus('SENT');
        setStatus('GENERATED');
      } else {
        setEmailError(data.error ?? "Erreur lors de l'envoi");
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Contrat</p>
      </div>
      <div style={{ padding: '28px 32px', display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>

        <button
          style={loading === 'generate' ? btnDisabled : btnPrimary}
          onClick={downloadContract}
          disabled={loading !== null}
        >
          {loading === 'generate'
            ? 'Génération...'
            : status === 'GENERATED'
              ? 'Retélécharger le PDF →'
              : 'Télécharger le contrat PDF →'}
        </button>

        {mailStatus === 'SENT' ? (
          <button style={btnSecondary} disabled>Email envoyé ✓</button>
        ) : (
          <button
            style={loading === 'email' ? btnDisabled : btnPrimary}
            onClick={sendEmail}
            disabled={loading !== null}
          >
            {loading === 'email' ? 'Envoi en cours...' : 'Envoyer par email →'}
          </button>
        )}
      </div>

      {emailError && (
        <div style={{ padding: '0 32px 20px' }}>
          <p style={{ fontSize: '12px', color: '#c0392b', margin: 0 }}>{emailError}</p>
        </div>
      )}

      {mailStatus === 'SENT' && (
        <div style={{ padding: '0 32px 20px' }}>
          <p style={{ fontSize: '12px', color: '#7A7570', margin: 0 }}>
            Le contrat a été envoyé au client par email avec le PDF en pièce jointe.
          </p>
        </div>
      )}
    </div>
  );
}
