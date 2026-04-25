"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";
import type { TrialInfo } from "@/lib/trial";

interface Props {
  children: React.ReactNode;
  pendingCount: number;
  trialInfo: TrialInfo | null;
  fontClass: string;
}

export default function DashboardShell({ children, pendingCount, trialInfo, fontClass }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

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
          <Image
            src="/logotype_prysme.png"
            alt="Prysme"
            width={80}
            height={20}
            style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain', height: 18, width: 'auto' }}
          />
          <div style={{ width: 36 }}/>
        </header>
        {children}
      </div>
    </div>
  );
}
