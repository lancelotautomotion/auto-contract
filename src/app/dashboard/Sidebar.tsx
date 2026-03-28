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
      width: '220px',
      flexShrink: 0,
      backgroundColor: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '36px 28px 32px' }}>
        <span style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text)',
          fontWeight: 500,
        }}>
          ContratGîte
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 16px' }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '13px',
                color: active ? 'var(--text)' : 'var(--text-muted)',
                backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                borderRadius: '8px',
                fontWeight: active ? 500 : 400,
                transition: 'color 0.12s ease, background-color 0.12s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '24px 28px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggle}
          style={{
            display: 'block',
            width: '100%',
            padding: '0 0 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '12px',
            letterSpacing: '0.04em',
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
            fontSize: '12px',
            letterSpacing: '0.04em',
            textAlign: 'left',
          }}
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
