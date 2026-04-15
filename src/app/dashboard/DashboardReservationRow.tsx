'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SIGNED_BG = '#D1EDD4';
const SIGNED_TEXT = '#2D6A31';
const PENDING_BG = '#FDECD0';
const PENDING_TEXT = '#C47822';

interface Props {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  checkIn: string;
  checkOut: string;
  contractStatus: string | null;
  isLast: boolean;
}

export default function DashboardReservationRow({
  id, clientFirstName, clientLastName, clientEmail,
  checkIn, checkOut, contractStatus, isLast,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Supprimer la réservation de ${clientFirstName} ${clientLastName} ?\n\nCette action est irréversible.`
    );
    if (!confirmed) return;
    setDeleting(true);
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Erreur lors de la suppression.');
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={() => router.push(`/dashboard/reservations/${id}`)}
      className="reservation-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 180px 40px',
        padding: '16px 32px',
        borderBottom: isLast ? 'none' : '1px solid #CEC8BF',
        backgroundColor: '#F7F4F0',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <p className="client-name" style={{ fontSize: '14px', color: '#1C1C1A', margin: 0 }}>
            {clientFirstName} {clientLastName}
          </p>
          <p style={{ fontSize: '12px', color: '#7A7570', margin: '2px 0 0' }}>{clientEmail}</p>
        </div>
        <span className="row-arrow">→</span>
      </div>
      <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(checkIn)}</span>
      <span style={{ fontSize: '13px', color: '#1C1C1A' }}>{fmt(checkOut)}</span>
      <span style={{
        fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
        padding: '4px 8px', whiteSpace: 'nowrap', borderRadius: '20px',
        textAlign: 'center', display: 'inline-block',
        backgroundColor: contractStatus === 'SIGNED' ? SIGNED_BG : contractStatus === 'GENERATED' ? PENDING_BG : '#EDE8E1',
        color: contractStatus === 'SIGNED' ? SIGNED_TEXT : contractStatus === 'GENERATED' ? PENDING_TEXT : '#7A7570',
        border: `1px solid ${contractStatus === 'SIGNED' ? SIGNED_TEXT : contractStatus === 'GENERATED' ? PENDING_TEXT : '#CEC8BF'}`,
      }}>
        {contractStatus === 'SIGNED' ? 'Signé ✓' : contractStatus === 'GENERATED' ? 'En attente de signature' : 'En attente'}
      </span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Supprimer"
        style={{
          background: 'none',
          border: 'none',
          cursor: deleting ? 'not-allowed' : 'pointer',
          color: deleting ? '#CEC8BF' : '#B04040',
          fontSize: '16px',
          padding: '4px',
          lineHeight: 1,
          justifySelf: 'center',
        }}
      >
        ✕
      </button>
    </div>
  );
}
