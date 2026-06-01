"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import type { TrialInfo } from "@/lib/trial";

interface Props {
  children: React.ReactNode;
  pendingCount: number;
  trialInfo: TrialInfo | null;
  fontClass?: string;
  gites?: Array<{ id: string; name: string }>;
  activeGiteId?: string;
  isAdmin?: boolean;
  planActive?: boolean;
  guesthouseMode?: boolean;
  activeGuesthouseId?: string;
}

function LockIcon() {
  return <Lock size={14} strokeWidth={1.4} />;
}

export default function DashboardShell({ children, pendingCount, trialInfo, fontClass, gites, activeGiteId, isAdmin, planActive, guesthouseMode, activeGuesthouseId }: Props) {
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setOpen(false); }, [pathname]);

  const isExpired = !isAdmin && (trialInfo?.isExpired ?? false);
  const isUnlockedPage = pathname.includes('/archives') || pathname.includes('/compte') || pathname.includes('/settings');

  return (
    <div className={`${fontClass ?? ''} app`}>
      {open && (
        <div className="sb-overlay" onClick={() => setOpen(false)} aria-hidden="true"/>
      )}
      <Sidebar
        pendingCount={pendingCount}
        trialInfo={trialInfo}
        mobileOpen={open}
        onMobileClose={() => setOpen(false)}
        gites={gites ?? []}
        activeGiteId={activeGiteId ?? ''}
        isAdmin={isAdmin}
        planActive={planActive}
        guesthouseMode={guesthouseMode}
        activeGuesthouseId={activeGuesthouseId ?? ''}
      />
      <div className="main">
        <header className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} strokeWidth={1.5} />
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
                <ArrowRight size={14} strokeWidth={1.4} />
              </button>
            </div>

            {isUnlockedPage ? (
              /* Archives et compte accessibles même après expiration */
              children
            ) : (
              <>
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
            )}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
