"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function TopbarSignOut() {
  const { signOut } = useClerk();

  return (
    <button
      className="topbar-btn"
      title="Se déconnecter"
      aria-label="Se déconnecter"
      onClick={() => signOut({ redirectUrl: "/" })}
      style={{ color: 'var(--ink-soft)' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#b91c1c')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
    >
      <LogOut size={16} strokeWidth={1.4} />
    </button>
  );
}
