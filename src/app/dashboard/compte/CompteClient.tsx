"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { User, CreditCard, FileText, CheckCircle, LogIn, ArrowRight } from "lucide-react";

type PlanStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED';

interface Props {
  fullName: string;
  email: string;
  initials: string;
  planStatus: PlanStatus;
  daysLeft: number | null;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
}

export default function CompteClient({ fullName, email, initials, planStatus, daysLeft, trialEndsAt, hasStripeCustomer }: Props) {
  const { signOut } = useClerk();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? "Impossible d'ouvrir le portail client.");
        setPortalLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPortalError("Erreur réseau. Réessayez.");
      setPortalLoading(false);
    }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const badge =
    planStatus === 'ACTIVE'
      ? { label: 'Actif', bg: 'var(--green-light)', fg: 'var(--green-dark)', dot: 'var(--green)' }
      : planStatus === 'EXPIRED'
        ? { label: 'Expiré', bg: 'var(--red-light)', fg: 'var(--red)', dot: 'var(--red)' }
        : { label: 'Période d\'essai', bg: 'var(--violet-light)', fg: 'var(--violet-dark)', dot: 'var(--violet)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* PROFIL */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <User size={14} strokeWidth={1.4} />
          Profil
        </div>
        <div className="fs-divider" />
        <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '20px 24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>{fullName}</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-soft)', wordBreak: 'break-word' }}>{email}</div>
          </div>
        </div>
      </div>

      {/* ABONNEMENT */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <CreditCard size={14} strokeWidth={1.4} />
          Abonnement & Facturation
        </div>
        <div className="fs-divider" />

        <div className="form-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em',
                color: badge.fg, background: badge.bg,
                padding: '5px 12px', borderRadius: '100px', marginBottom: '14px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                {badge.label}
              </div>

              {planStatus === 'ACTIVE' && (
                <>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    Plan Essentiel <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-soft)' }}>— à partir de 9,99 € HT / mois</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    Facturation mensuelle automatique. Gérez votre carte, vos factures et votre abonnement depuis le portail sécurisé Stripe.
                  </p>
                </>
              )}
              {planStatus === 'TRIAL' && (
                <>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {daysLeft !== null && daysLeft > 0
                      ? <>{daysLeft} jour{daysLeft > 1 ? 's' : ''} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-soft)' }}>restants sur votre essai gratuit</span></>
                      : 'Période d\'essai'}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    {trialEndsAt
                      ? <>Votre essai se termine le <strong style={{ color: 'var(--ink)' }}>{fmtDate(trialEndsAt)}</strong>. Passez à l&apos;abonnement pour continuer sans interruption.</>
                      : 'Accès complet pendant 30 jours. Passez à l\'abonnement pour continuer sans interruption.'}
                  </p>
                </>
              )}
              {planStatus === 'EXPIRED' && (
                <>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--red)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    Essai expiré
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
                    Votre période d&apos;essai est terminée. Souscrivez pour réactiver votre accès à Kordia.
                  </p>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
            {hasStripeCustomer ? (
              <>
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="btn btn-violet"
                  style={{ fontSize: '13px', padding: '11px 22px', borderRadius: '10px' }}
                >
                  {portalLoading ? 'Ouverture…' : 'Gérer mon abonnement'}
                  {!portalLoading && (
                    <ArrowRight size={14} strokeWidth={1.4} />
                  )}
                </button>
                {planStatus !== 'ACTIVE' && (
                  <Link href="/upgrade" className="btn btn-outline" style={{ fontSize: '13px', padding: '11px 22px', borderRadius: '10px' }}>
                    Souscrire
                  </Link>
                )}
              </>
            ) : (
              <Link href="/upgrade" className="btn btn-violet" style={{ fontSize: '13px', padding: '11px 22px', borderRadius: '10px' }}>
                Souscrire au plan Essentiel
                <ArrowRight size={14} strokeWidth={1.4} />
              </Link>
            )}
          </div>

          {portalError && (
            <p style={{ fontSize: '12px', color: 'var(--red)', margin: '12px 0 0', lineHeight: 1.5 }}>{portalError}</p>
          )}

          {hasStripeCustomer && (
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CreditCard size={16} strokeWidth={1.4} style={{ color: 'var(--violet)', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.4 }}>Changer de carte bancaire</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FileText size={16} strokeWidth={1.4} style={{ color: 'var(--violet)', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.4 }}>Télécharger les factures</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle size={16} strokeWidth={1.4} style={{ color: 'var(--violet)', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.4 }}>Annuler ou mettre à jour</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SESSION */}
      <div className="form-section" style={{ marginBottom: 0 }}>
        <div className="fs-title">
          <LogIn size={14} strokeWidth={1.4} />
          Session
        </div>
        <div className="fs-divider" />
        <div className="form-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>Se déconnecter</div>
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Terminer la session sur cet appareil</div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            className="btn btn-outline"
            style={{ fontSize: '13px', padding: '10px 18px', borderRadius: '10px' }}
          >
            Déconnexion
          </button>
        </div>
      </div>

    </div>
  );
}
