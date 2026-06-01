"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import type { TrialInfo } from "@/lib/trial";
import GiteSelector from "@/components/GiteSelector";
import {
  LayoutDashboard, CalendarDays, UtensilsCrossed, Building2,
  Archive, HelpCircle, Mail, Bug, Settings, LogOut, X, Lock,
} from "lucide-react";

export default function Sidebar({ pendingCount = 0, trialInfo, mobileOpen, onMobileClose, gites = [], activeGiteId = '', isAdmin = false, planActive = false, guesthouseMode = false, activeGuesthouseId = '' }: {
  pendingCount?: number;
  trialInfo?: TrialInfo | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  gites?: Array<{ id: string; name: string }>;
  activeGiteId?: string;
  isAdmin?: boolean;
  planActive?: boolean;
  guesthouseMode?: boolean;
  activeGuesthouseId?: string;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  // Compte Maison d'hôtes : la base pointe sur l'unique établissement (id requis pour les sous-routes).
  const base = guesthouseMode
    ? (activeGuesthouseId ? `/dashboard/maisons-hotes/${activeGuesthouseId}` : '/dashboard/maisons-hotes')
    : activeGiteId ? `/dashboard/${activeGiteId}` : '/dashboard';

  const active = (href: string) =>
    href === base
      ? pathname === base || pathname === '/dashboard' || pathname === '/dashboard/maisons-hotes'
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
          <X size={16} strokeWidth={1.5} />
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
            <span className="sb-icon"><LayoutDashboard size={18} strokeWidth={1.4} /></span>
            Tableau de bord
          </Link>

          <Link href={`${base}/reservations`} className={`sb-link${active(`${base}/reservations`) ? ' active' : ''}`}>
            <span className="sb-icon"><CalendarDays size={18} strokeWidth={1.4} /></span>
            {guesthouseMode ? 'Planning & Réservations' : 'Réservations'}
            {pendingCount > 0 && (
              <span className="sb-badge">{pendingCount}</span>
            )}
          </Link>

          {guesthouseMode && (
            <Link href={`${base}/restauration`} className={`sb-link${active(`${base}/restauration`) ? ' active' : ''}`}>
              <span className="sb-icon"><UtensilsCrossed size={18} strokeWidth={1.4} /></span>
              Restauration
            </Link>
          )}

          <Link href={`${base}/${guesthouseMode ? 'hebergement' : 'etablissement'}`} className={`sb-link${active(`${base}/${guesthouseMode ? 'hebergement' : 'etablissement'}`) ? ' active' : ''}`}>
            <span className="sb-icon"><Building2 size={18} strokeWidth={1.4} /></span>
            Mon hébergement
          </Link>
        </div>

        {!guesthouseMode && (
          <div className="sb-section">
            <div className="sb-section-title">Gestion</div>

            <Link href={`${base}/archives`} className={`sb-link${active(`${base}/archives`) ? ' active' : ''}`}>
              <span className="sb-icon"><Archive size={18} strokeWidth={1.4} /></span>
              Archives
            </Link>
          </div>
        )}

        <div className="sb-section">
          <div className="sb-section-title">Support</div>

          <Link href="/comment-ca-marche" className={`sb-link${active('/comment-ca-marche') ? ' active' : ''}`}>
            <span className="sb-icon"><HelpCircle size={18} strokeWidth={1.4} /></span>
            FAQ & Aide
          </Link>

          <Link href="/contact" className={`sb-link${active('/contact') ? ' active' : ''}`}>
            <span className="sb-icon"><Mail size={18} strokeWidth={1.4} /></span>
            Contacter le support
          </Link>

          <Link href="/contact?sujet=Signaler+un+bug" className="sb-link">
            <span className="sb-icon"><Bug size={18} strokeWidth={1.4} /></span>
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
              <Lock size={14} strokeWidth={1.3} className="sb-upgrade-lock" />
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
        {!guesthouseMode && (
          <Link href={`${base}/settings`} className={`sb-link${active(`${base}/settings`) ? ' active' : ''}`}>
            <span className="sb-icon"><Settings size={18} strokeWidth={1.4} /></span>
            Paramètres
          </Link>
        )}
        <button
          className="sb-link sb-signout-btn"
          onClick={() => signOut({ redirectUrl: '/' })}
          title="Se déconnecter"
        >
          <span className="sb-icon"><LogOut size={18} strokeWidth={1.4} /></span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
