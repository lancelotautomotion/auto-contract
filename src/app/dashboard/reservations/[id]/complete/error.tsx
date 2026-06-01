"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CompleteError() {
  return (
    <div className="content" style={{ maxWidth: '820px' }}>
      <Link href="/dashboard/reservations" className="back-link">
        <ChevronLeft size={14} strokeWidth={1.4} />
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
