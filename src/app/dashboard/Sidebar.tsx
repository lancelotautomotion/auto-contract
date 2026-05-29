"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import type { TrialInfo } from "@/lib/trial";
import GiteSelector from "@/components/GiteSelector";

export default function Sidebar({ pendingCount = 0, trialInfo, mobileOpen, onMobileClose, gites = [], activeGiteId = '', isAdmin = false, planActive = false, showGuesthouse = false }: {
  pendingCount?: number;
  trialInfo?: TrialInfo | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  gites?: Array<{ id: string; name: string }>;
  activeGiteId?: string;
  isAdmin?: boolean;
  planActive?: boolean;
  showGuesthouse?: boolean;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const base = activeGiteId ? `/dashboard/${activeGiteId}` : '/dashboard';

  const active = (href: string) =>
    href === base
      ? pathname === base || pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sb-logo">
        <img
          src="/logotype_KORDIA.svg"
          alt="Kordia"
          style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
        <button className="sb-close-btn" onClick={onMobileClose} aria-label="Fermer le menu">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Gite selector */}
      {gites.length > 0 && activeGiteId && (
        <div className="sb-gite-selector">
          <GiteSelector gites={gites} activeGiteId={activeGiteId} isAdmin={isAdmin} planActive={planActive} />
        </div>
      )}

      <nav className="sb-nav">
        <div className="sb-section">
          <div className="sb-section-title">Principal</div>

          <Link href={base} className={`sb-link${active(base) ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </span>
            Tableau de bord
          </Link>

          <Link href={`${base}/reservations`} className={`sb-link${active(`${base}/reservations`) ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 7h14" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            Réservations
            {pendingCount > 0 && (
              <span className="sb-badge">{pendingCount}</span>
            )}
          </Link>

          <Link href={`${base}/etablissement`} className={`sb-link${active(`${base}/etablissement`) ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M3 14V8l6-5 6 5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 14z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 15.5v-4h4v4" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </span>
            Mon hébergement
          </Link>

          {showGuesthouse && (
            <Link href="/dashboard/maisons-hotes" className={`sb-link${active('/dashboard/maisons-hotes') ? ' active' : ''}`}>
              <span className="sb-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M2 15V7l7-5 7 5v8a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M6 15v-3h2v3M10 15v-3h2v3M6 8.5h2M10 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
              Maisons d&apos;hôtes
            </Link>
          )}
        </div>

        <div className="sb-section">
          <div className="sb-section-title">Gestion</div>

          <Link href={`${base}/archives`} className={`sb-link${active(`${base}/archives`) ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="3" y="5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M3 8l6 3.5L15 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Archives
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">Support</div>

          <Link href="/comment-ca-marche" className={`sb-link${active('/comment-ca-marche') ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L9 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="9" cy="13.5" r=".8" fill="currentColor"/>
              </svg>
            </span>
            FAQ & Aide
          </Link>

          <Link href="/contact" className={`sb-link${active('/contact') ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 7l7 4 7-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Contacter le support
          </Link>

          <Link href="/contact?sujet=Signaler+un+bug" className="sb-link">
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M9 2.5L2.5 14.5h13L9 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M9 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="9" cy="12.5" r=".8" fill="currentColor"/>
              </svg>
            </span>
            Signaler un bug
          </Link>
        </div>

        {trialInfo?.isTrial && !trialInfo.isExpired && (
          <div className="sb-trial-card">
            <div className="sb-trial-header">
              <span className="sb-trial-dot" />
              <span className="sb-trial-label">Essai gratuit</span>
            </div>
            <div className="sb-trial-days-text">
              <strong>{trialInfo.daysLeft <= 0 ? '0' : trialInfo.daysLeft}</strong> jours restants
            </div>
            <div className="sb-trial-bar">
              <div className="sb-trial-bar-fill" style={{ width: `${Math.min(100, ((trialInfo.daysLeft <= 0 ? 0 : trialInfo.daysLeft) / 30) * 100)}%` }} />
            </div>
            <Link href="/upgrade" className="sb-trial-link">
              Passer à Pro
            </Link>
          </div>
        )}

        {trialInfo?.isExpired && !isAdmin && (
          <div className="sb-upgrade-card">
            <div className="sb-upgrade-header">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="sb-upgrade-lock">
                <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="sb-upgrade-label">Essai terminé</span>
            </div>
            <p className="sb-upgrade-text">Souscrivez pour débloquer toutes les fonctionnalités.</p>
            <Link href="/upgrade" className="sb-upgrade-link">
              Voir les offres →
            </Link>
          </div>
        )}
      </nav>

      <div className="sb-bottom">
        <Link href={`${base}/settings`} className={`sb-link${active(`${base}/settings`) ? ' active' : ''}`}>
          <span className="sb-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          Paramètres
        </Link>
        <button
          className="sb-link sb-signout-btn"
          onClick={() => signOut({ redirectUrl: '/' })}
          title="Se déconnecter"
        >
          <span className="sb-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M7 4H4a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M12 12.5l3.5-3.5L12 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.5 9H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
