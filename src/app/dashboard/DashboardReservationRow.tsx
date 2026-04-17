'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  checkIn, checkOut, contractStatus,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const initials = `${clientFirstName[0] ?? ''}${clientLastName[0] ?? ''}`.toUpperCase();
  const avClass = ['A','E','I','O','U','B','D','F','H','J','L','N','P','R'].includes(clientLastName[0]?.toUpperCase() ?? '') ? 'g' : 'v';

  const pillClass = contractStatus === 'SIGNED' ? 'pill-g' : contractStatus === 'GENERATED' ? 'pill-v' : 'pill-a';
  const pillLabel = contractStatus === 'SIGNED' ? 'Signé' : contractStatus === 'GENERATED' ? 'À signer' : 'En attente';

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
    <tr onClick={() => router.push(`/dashboard/reservations/${id}`)}>
      <td>
        <div className="client-cell">
          <div className={`client-av ${avClass}`}>{initials}</div>
          <div>
            <div className="client-name-primary">{clientFirstName} {clientLastName}</div>
            <div className="client-email-sub">{clientEmail}</div>
          </div>
        </div>
      </td>
      <td>{fmt(checkIn)}</td>
      <td>{fmt(checkOut)}</td>
      <td><span className={`pill ${pillClass}`}>{pillLabel}</span></td>
      <td>
        <button
          className="action-btn"
          onClick={handleDelete}
          disabled={deleting}
          title="Supprimer"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}
