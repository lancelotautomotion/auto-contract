"use client";

import { useClerk } from "@clerk/nextjs";

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
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M10.5 11l3-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.5 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
