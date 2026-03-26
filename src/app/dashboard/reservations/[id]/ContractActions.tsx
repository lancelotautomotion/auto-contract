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
  border: 'none', cursor: 'pointer', flex: 1,
};
const btnSecondary = {
  fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const,
  padding: '14px 28px', backgroundColor: '#E5DED5', color: '#1C1C1A',
  border: '1px solid #CEC8BF', cursor: 'pointer', flex: 1,
};
const btnDisabled = {
  ...btnPrimary, backgroundColor: '#CEC8BF', cursor: 'not-allowed' as const,
};

export default function ContractActions({ reservationId, contractStatus, emailStatus, driveFileUrl }: Props) {
  const [status, setStatus] = useState(contractStatus);
  const [mailStatus, setMailStatus] = useState(emailStatus);
  const [loading, setLoading] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState(driveFileUrl);

  const generateContract = async () => {
    setLoading('generate');
    try {
      const res = await fetch(`/api/reservations/${reservationId}/generate-contract`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { setStatus('GENERATING'); }
      else alert(data.error ?? 'Erreur lors de la génération');
    } finally { setLoading(null); }
  };

  const sendEmail = async () => {
    setLoading('email');
    try {
      const res = await fetch(`/api/reservations/${reservationId}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) { setMailStatus('SENDING'); }
      else alert(data.error ?? "Erreur lors de l'envoi");
    } finally { setLoading(null); }
  };

  return (
    <div style={{ border: '1px solid #CEC8BF', backgroundColor: '#F7F4F0' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid #CEC8BF', backgroundColor: '#E5DED5' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A7570', margin: 0 }}>Actions</p>
      </div>
      <div style={{ padding: '28px 32px', display: 'flex', gap: '16px', flexWrap: 'wrap' as const }}>

        {/* Générer */}
        {status === 'GENERATED' ? (
          <button style={btnSecondary} disabled>Contrat généré</button>
        ) : status === 'GENERATING' ? (
          <button style={btnDisabled} disabled>Génération en cours...</button>
        ) : (
          <button style={loading === 'generate' ? btnDisabled : btnPrimary} onClick={generateContract} disabled={loading !== null}>
            {loading === 'generate' ? 'Envoi à n8n...' : 'Générer le contrat →'}
          </button>
        )}

        {/* Envoyer email */}
        {mailStatus === 'SENT' ? (
          <button style={btnSecondary} disabled>Email envoyé</button>
        ) : mailStatus === 'SENDING' ? (
          <button style={btnDisabled} disabled>Envoi en cours...</button>
        ) : (
          <button
            style={status !== 'GENERATED' ? btnDisabled : (loading === 'email' ? btnDisabled : btnPrimary)}
            onClick={sendEmail}
            disabled={status !== 'GENERATED' || loading !== null}
          >
            {loading === 'email' ? 'Envoi...' : 'Envoyer par email →'}
          </button>
        )}

        {/* Lien Drive */}
        {fileUrl && (
          <a href={fileUrl} target="_blank" rel="noreferrer" style={{ ...btnSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Voir le PDF
          </a>
        )}
      </div>

      {status === 'GENERATING' && (
        <div style={{ padding: '0 32px 20px' }}>
          <p style={{ fontSize: '12px', color: '#7A7570', margin: 0 }}>
            Le contrat est en cours de génération par n8n. Rafraîchis la page dans quelques secondes.
          </p>
        </div>
      )}
    </div>
  );
}
