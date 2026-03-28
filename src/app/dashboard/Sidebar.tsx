"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/providers/ThemeProvider";
import { useClerk } from "@clerk/nextjs";

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/dashboard/etablissement', label: 'Mon établissement' },
  { href: '/dashboard/settings', label: 'Paramètres' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { signOut } = useClerk();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '200px',
      flexShrink: 0,
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '32px 24px 28px' }}>
        <span style={{
          fontSize: '10px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}>
          ContratGîte
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '9px 12px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '12px',
                letterSpacing: '0.02em',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                backgroundColor: active ? 'var(--bg-white)' : 'transparent',
                borderRadius: '6px',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.12s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggle}
          style={{
            display: 'block',
            width: '100%',
            padding: '0 0 14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '11px',
            letterSpacing: '0.05em',
            textAlign: 'left',
          }}
        >
          {dark ? '☀ Mode clair' : '☾ Mode nuit'}
        </button>

        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          style={{
            display: 'block',
            width: '100%',
            padding: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
