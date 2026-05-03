"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import type { TrialInfo } from "@/lib/trial";

interface Props {
  children: React.ReactNode;
  pendingCount: number;
  trialInfo: TrialInfo | null;
  fontClass: string;
}

function LockIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
      <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export default function DashboardShell({ children, pendingCount, trialInfo, fontClass }: Props) {
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setOpen(false); }, [pathname]);

  const isExpired = trialInfo?.isExpired ?? false;

  return (
    <div className={`${fontClass} app`}>
      {open && (
        <div className="sb-overlay" onClick={() => setOpen(false)} aria-hidden="true"/>
      )}
      <Sidebar
        pendingCount={pendingCount}
        trialInfo={trialInfo}
        mobileOpen={open}
        onMobileClose={() => setOpen(false)}
      />
      <div className="main">
        <header className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <img
            src="/logotype_KORDIA.svg"
            alt="Kordia"
            style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
          <div style={{ width: 36 }}/>
        </header>

        {isExpired ? (
          <>
            {/* Bannière d'expiration */}
            <div className="expired-banner">
              <div className="expired-banner-icon">
                <LockIcon />
              </div>
              <div className="expired-banner-text">
                <strong>Votre période d&apos;essai est terminée.</strong>
                {' '}Souscrivez pour retrouver l&apos;accès aux fonctionnalités. Vos données sont conservées.
              </div>
              <button
                className="btn btn-violet expired-banner-cta"
                onClick={() => router.push('/upgrade')}
              >
                Voir les offres
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2.5 7h9m-4-3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Contenu grisé avec overlay interactif */}
            <div className="plan-locked-wrap">
              <div
                className="plan-locked-overlay"
                onMouseMove={e => setTooltip({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => router.push('/upgrade')}
                aria-hidden="true"
              />
              <div className="plan-locked-content" aria-hidden="true">
                {children}
              </div>
            </div>

            {/* Tooltip curseur */}
            {tooltip && (
              <div
                className="plan-locked-tooltip"
                style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
                aria-hidden="true"
              >
                <LockIcon />
                Fonction Premium
              </div>
            )}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
