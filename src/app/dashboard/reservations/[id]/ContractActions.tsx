"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  reservationId: string;
  contractStatus: string | null;
  emailStatus: string | null;
  driveFileUrl: string | null;
  signedAt: Date | null;
  signedByName: string | null;
  depositReceived: boolean;
  createdAt: string;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function TlDot({ state }: { state: 'done' | 'current' | 'pending' }) {
  if (state === 'done') {
    return (
      <div className="tl-dot done">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 7l2.5 2.5L10 5" stroke="#4A7353" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div className="tl-dot current">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 4v3l2 1.5" stroke="#5B52B5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="tl-dot pending">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2" fill="#D4D4D0"/>
      </svg>
    </div>
  );
}

export default function ContractActions({
  reservationId,
  contractStatus,
  emailStatus,
  signedAt,
  signedByName,
  depositReceived: initialDepositReceived,
  createdAt,
}: Props) {
  const [status, setStatus] = useState(contractStatus);
  const [mailStatus, setMailStatus] = useState(emailStatus);
  const [loading, setLoading] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [signed, setSigned] = useState<{ at: Date; byName: string } | null>(
    signedAt ? { at: new Date(signedAt), byName: signedByName ?? '' } : null
  );
  const [depositReceived, setDepositReceived] = useState(initialDepositReceived);
  const [remindSent, setRemindSent] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/reservations/${reservationId}/contract-status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.contractStatus) setStatus(data.contractStatus);
        if (data.emailStatus) setMailStatus(data.emailStatus);
        if (data.signedAt && !signed) {
          setSigned({ at: new Date(data.signedAt), byName: data.signedByName ?? '' });
        }
        if (data.depositReceived) setDepositReceived(true);
      } catch { /* silently ignore */ }
    };

    pollRef.current = setInterval(poll, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [reservationId, signed]);

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
      if (res.ok) setMailStatus('SENT');
      else setEmailError(data.error ?? "Erreur lors de l'envoi");
    } finally {
      setLoading(null);
    }
  };

  const markDepositReceived = async () => {
    setLoading('deposit');
    setDepositError(null);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/mark-deposit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setDepositReceived(true);
      else setDepositError(data.error ?? "Erreur lors de la confirmation de l'acompte");
    } finally {
      setLoading(null);
    }
  };

  const isSigned = status === 'SIGNED' || signed !== null;
  const threeDaysAfterSign = signed ? new Date(signed.at.getTime() + 3 * 24 * 60 * 60 * 1000) : null;
  const canRemind = isSigned && !depositReceived && threeDaysAfterSign !== null && new Date() >= threeDaysAfterSign;

  const remindDeposit = async () => {
    setLoading('remind');
    try {
      const res = await fetch(`/api/reservations/${reservationId}/remind-deposit`, { method: 'POST' });
      if (res.ok) setRemindSent(true);
    } finally {
      setLoading(null);
    }
  };

  // ── Timeline step states ──
  const step0State: 'done' | 'current' | 'pending' = 'done';

  const step1State: 'done' | 'current' | 'pending' =
    (status === 'GENERATED' || status === 'SIGNED' || isSigned) ? 'done' :
    (status === 'GENERATING') ? 'current' : 'pending';

  const step2State: 'done' | 'current' | 'pending' =
    isSigned ? 'done' :
    (status === 'GENERATED' && mailStatus === 'SENT') ? 'current' : 'pending';

  const step3State: 'done' | 'current' | 'pending' =
    isSigned ? 'done' : 'pending';

  const step4State: 'done' | 'current' | 'pending' =
    depositReceived ? 'done' :
    (isSigned && !depositReceived) ? 'current' : 'pending';

  // ── Timeline date labels ──
  const step0Date = fmtDate(new Date(createdAt));

  const step1Date =
    step1State === 'done' ? 'PDF généré' :
    step1State === 'current' ? 'Génération en cours...' : '—';

  const step2Date =
    step2State === 'current' ? 'Lien de signature envoyé par email' :
    step2State === 'done' ? 'Email envoyé' : '—';

  const step3Date =
    step3State === 'done' && signed ? fmtDate(signed.at) : '—';

  const step4Date =
    step4State === 'done' ? 'Contrat signé envoyé au locataire' : '—';

  return (
    <>
      {/* Timeline card */}
      <div className="timeline-card">
        <div className="tc-header">
          <div className="tc-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Suivi du contrat
          </div>
        </div>
        <div className="timeline">
          <div className={`tl-item ${step0State}`}>
            <TlDot state={step0State} />
            <div className="tl-content">
              <div className="tl-label">Réservation créée</div>
              <div className="tl-date">{step0Date}</div>
            </div>
          </div>
          <div className={`tl-item ${step1State}`}>
            <TlDot state={step1State} />
            <div className="tl-content">
              <div className="tl-label">Contrat généré</div>
              <div className="tl-date">{step1Date}</div>
            </div>
          </div>
          <div className={`tl-item ${step2State}`}>
            <TlDot state={step2State} />
            <div className="tl-content">
              <div className="tl-label">En attente de signature</div>
              <div className="tl-date">{step2Date}</div>
            </div>
          </div>
          <div className={`tl-item ${step3State}`}>
            <TlDot state={step3State} />
            <div className="tl-content">
              <div className="tl-label">Signature du locataire</div>
              <div className="tl-date">{step3Date}</div>
            </div>
          </div>
          <div className={`tl-item ${step4State}`}>
            <TlDot state={step4State} />
            <div className="tl-content">
              <div className="tl-label">Archivage PDF</div>
              <div className="tl-date">{step4Date}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract card */}
      <div className="contract-card">
        <div className="cc-header">
          <div className="cc-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Contrat
          </div>
        </div>

        <div className="cc-actions">
          {/* PDF download card */}
          <button
            className="action-card pdf"
            onClick={downloadContract}
            disabled={loading !== null}
          >
            <div className="ac-icon g">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3h7l5 5v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="#4A7353" strokeWidth="1.4"/>
                <path d="M12 3v5h5" stroke="#4A7353" strokeWidth="1.4"/>
                <path d="M10 10v5M7.5 12.5L10 15l2.5-2.5" stroke="#4A7353" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="ac-label">
              {loading === 'generate' ? 'Génération...' : isSigned ? 'PDF signé' : 'Télécharger PDF'}
            </div>
            <div className="ac-desc">
              {isSigned ? 'Télécharger le contrat signé' : 'Générer et télécharger le contrat'}
            </div>
          </button>

          {/* Signature link card */}
          <button
            className="action-card sign"
            onClick={sendEmail}
            disabled={loading !== null}
          >
            <div className="ac-icon v">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#5B52B5" strokeWidth="1.4"/>
                <path d="M2 5l8 6 8-6" stroke="#5B52B5" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="ac-label">
              {loading === 'email' ? 'Envoi...' :
               mailStatus === 'SENT' && isSigned ? 'Lien envoyé' :
               mailStatus === 'SENT' ? 'Renvoyer le lien' : 'Envoyer le lien'}
            </div>
            <div className="ac-desc">
              {mailStatus === 'SENT' && isSigned ? 'Contrat déjà signé' :
               mailStatus === 'SENT' ? 'Lien de signature envoyé' : 'Envoyer le lien de signature par email'}
            </div>
          </button>
        </div>

        {/* Deposit block — visible when signed but deposit not confirmed */}
        {isSigned && !depositReceived && (
          <div style={{ margin: '0 24px 16px', padding: '14px 18px', background: 'var(--amber-light)', border: '1px solid rgba(255,189,46,.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--amber-dark)', margin: 0, lineHeight: 1.5 }}>
              En attente de réception de l&apos;acompte. Le contrat signé sera envoyé au locataire dès confirmation.
            </p>
            <button
              onClick={markDepositReceived}
              disabled={loading !== null}
              className="btn btn-green"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {loading === 'deposit' ? 'Envoi en cours...' : 'Acompte reçu →'}
            </button>
          </div>
        )}

        {/* Remind block — visible 3 days after signature if deposit not received */}
        {canRemind && (
          <div style={{ margin: depositReceived ? '0 24px 16px' : '0 24px 16px', padding: '14px 18px', background: 'var(--line-light)', border: '1px solid var(--line)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
              {remindSent
                ? 'Rappel envoyé au locataire.'
                : "Plus de 3 jours sans réception de l'acompte — vous pouvez relancer le locataire."}
            </p>
            {!remindSent && (
              <button
                onClick={remindDeposit}
                disabled={loading !== null}
                className="btn btn-outline"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {loading === 'remind' ? 'Envoi...' : 'Relancer →'}
              </button>
            )}
          </div>
        )}

        {/* Signed info */}
        {isSigned && signed && (
          <p style={{ fontSize: '12px', color: 'var(--ink-lighter)', fontStyle: 'italic', margin: '0 24px 16px' }}>
            Signé électroniquement le {signed.at.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} par <strong>{signed.byName}</strong>
          </p>
        )}

        {/* Errors */}
        {emailError && (
          <p style={{ fontSize: '12px', color: 'var(--red)', margin: '0 24px 16px' }}>{emailError}</p>
        )}
        {depositError && (
          <p style={{ fontSize: '12px', color: 'var(--red)', margin: '0 24px 16px' }}>{depositError}</p>
        )}
      </div>
    </>
  );
}
