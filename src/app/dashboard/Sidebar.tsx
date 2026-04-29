"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { TrialInfo } from "@/lib/trial";

export default function Sidebar({ pendingCount = 0, trialInfo, mobileOpen, onMobileClose }: {
  pendingCount?: number;
  trialInfo?: TrialInfo | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const active = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sb-logo">
        <Image
          src="/logotype_kordia.png"
          alt="Kordia"
          width={110}
          height={24}
          style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain' }}
        />
        <button className="sb-close-btn" onClick={onMobileClose} aria-label="Fermer le menu">
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">
          <div className="sb-section-title">Principal</div>

          <Link href="/dashboard" className={`sb-link${active('/dashboard') ? ' active' : ''}`}>
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

          <Link href="/dashboard/reservations" className={`sb-link${active('/dashboard/reservations') ? ' active' : ''}`}>
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

          <Link href="/dashboard/etablissement" className={`sb-link${active('/dashboard/etablissement') ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M3 14V8l6-5 6 5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 14z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 15.5v-4h4v4" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </span>
            Mon hébergement
          </Link>
        </div>

        <div className="sb-section">
          <div className="sb-section-title">Gestion</div>

          <Link href="/dashboard/archives" className={`sb-link${active('/dashboard/archives') ? ' active' : ''}`}>
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

        {/* Trial upgrade CTA in sidebar */}
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
      </nav>

      <div className="sb-bottom">
        <Link href="/dashboard/settings" className={`sb-link${active('/dashboard/settings') ? ' active' : ''}`}>
          <span className="sb-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
