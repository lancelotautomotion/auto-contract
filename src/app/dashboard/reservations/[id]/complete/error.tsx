"use client";

import Link from "next/link";

export default function CompleteError() {
  return (
    <div className="content" style={{ maxWidth: '820px' }}>
      <Link href="/dashboard/reservations" className="back-link">
        <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Retour aux réservations
      </Link>
      <div style={{
        marginTop: '24px', background: '#FEF3CD', border: '1px solid #F5C842',
        borderRadius: '12px', padding: '24px', fontSize: '14px', color: '#7B4F0A',
      }}>
        <strong>Une erreur est survenue lors du chargement de la demande.</strong>
        <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
          Veuillez <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7B4F0A', fontWeight: 700, textDecoration: 'underline', padding: 0 }}>recharger la page</button> ou revenir à la liste des réservations.
        </p>
      </div>
    </div>
  );
}
