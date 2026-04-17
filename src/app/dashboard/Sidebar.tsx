"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  const active = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <Image
          src="/logotype_prysme.png"
          alt="Prysme"
          width={88}
          height={22}
          style={{ filter: 'brightness(10)', objectFit: 'contain' }}
        />
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

          <Link href="/dashboard" className={`sb-link${active('/dashboard/reservations') ? ' active' : ''}`}>
            <span className="sb-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 7h14" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            Réservations
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
      </nav>

      <div className="sb-bottom">
        <Link href="/dashboard/settings" className={`sb-link${active('/dashboard/settings') ? ' active' : ''}`} style={{ marginBottom: '8px' }}>
          <span className="sb-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
          Paramètres
        </Link>

        <div className="sb-user">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.fullName ?? 'Utilisateur'}</div>
            <div className="sb-user-plan">Plan Essentiel</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
